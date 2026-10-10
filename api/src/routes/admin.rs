//! Back office for the Haseki team. Every handler takes `RequireAdmin`, so access is enforced
//! here in the API; the storefront's redirects are only a convenience.

use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{get, patch, post},
};
use serde::{Deserialize, Serialize};
use sqlx::types::Json as SqlJson;
use utoipa::{IntoParams, ToSchema};
use uuid::Uuid;

use crate::{
    AppState,
    auth::RequireAdmin,
    error::{AppError, AppResult},
    models::{Currency, Money},
    revalidate,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/admin/stats", get(stats))
        .route("/admin/orders", get(list_orders))
        .route("/admin/orders/{id}", get(get_order))
        .route("/admin/orders/{id}/status", post(set_order_status))
        .route("/admin/products", get(list_products))
        .route("/admin/products/{id}", patch(update_product))
        .route("/admin/variants/{id}", patch(update_variant))
        .route("/admin/reviews", get(list_reviews))
        .route("/admin/reviews/{id}/approve", post(approve_review))
        .route("/admin/reviews/{id}", axum::routing::delete(delete_review))
}

// ------------------------------------------------------------------ stats

#[derive(Serialize, ToSchema)]
pub struct Stats {
    pub orders_to_ship: i64,
    pub orders_last_30_days: i64,
    #[schema(value_type = Vec<Money>)]
    pub revenue_last_30_days: Vec<Money>,
    pub low_stock_variants: i64,
    pub reviews_pending: i64,
}

#[utoipa::path(operation_id = "admin_stats", get, path = "/admin/stats", tag = "admin", responses((status = 200, body = Stats), (status = 401), (status = 403)))]
pub async fn stats(State(s): State<AppState>, _: RequireAdmin) -> AppResult<Json<Stats>> {
    let (orders_to_ship, orders_last_30_days, low_stock_variants, reviews_pending): (i64, i64, i64, i64) = sqlx::query_as(
        r#"SELECT
             (SELECT count(*) FROM orders WHERE status IN ('paid', 'fulfilled')),
             (SELECT count(*) FROM orders WHERE status NOT IN ('pending', 'cancelled') AND created_at > now() - interval '30 days'),
             (SELECT count(*) FROM variants v JOIN products p ON p.id = v.product_id WHERE p.status = 'active' AND v.stock <= 2),
             (SELECT count(*) FROM reviews WHERE NOT approved)"#,
    )
    .fetch_one(&s.db)
    .await?;
    let revenue: Vec<(Currency, i64)> = sqlx::query_as(
        r#"SELECT currency, sum(total_minor)::int8 FROM orders
           WHERE status IN ('paid', 'fulfilled', 'shipped') AND created_at > now() - interval '30 days'
           GROUP BY currency ORDER BY currency"#,
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(Stats {
        orders_to_ship,
        orders_last_30_days,
        revenue_last_30_days: revenue
            .into_iter()
            .map(|(currency, amount_minor)| Money {
                currency,
                amount_minor,
            })
            .collect(),
        low_stock_variants,
        reviews_pending,
    }))
}

// ------------------------------------------------------------------ orders

#[derive(Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct OrderFilter {
    /// `to_ship` (paid or fulfilled), or an exact status. Omit for everything except abandoned checkouts.
    pub status: Option<String>,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct AdminOrderRow {
    pub id: Uuid,
    pub number: i64,
    pub status: String,
    pub email: String,
    pub name: Option<String>,
    pub country: Option<String>,
    pub currency: Currency,
    pub total_minor: i64,
    pub item_count: i64,
    #[serde(with = "time::serde::rfc3339")]
    #[schema(value_type = String, format = DateTime)]
    pub created_at: time::OffsetDateTime,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct AdminOrderItem {
    pub product_name: String,
    pub sku: String,
    pub size: String,
    pub quantity: i32,
    pub unit_price_minor: i64,
    #[schema(value_type = Option<Object>)]
    pub measurements: Option<serde_json::Value>,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct AdminPayment {
    pub provider: String,
    pub status: String,
    pub provider_order_id: String,
    pub provider_payment_id: Option<String>,
}

#[derive(Serialize, ToSchema)]
pub struct AdminOrder {
    pub id: Uuid,
    pub number: i64,
    pub status: String,
    pub email: String,
    pub currency: Currency,
    pub subtotal_minor: i64,
    pub shipping_minor: i64,
    pub total_minor: i64,
    pub tracking_number: Option<String>,
    #[schema(value_type = Object)]
    pub shipping_address: serde_json::Value,
    pub items: Vec<AdminOrderItem>,
    pub payments: Vec<AdminPayment>,
    #[serde(with = "time::serde::rfc3339")]
    #[schema(value_type = String, format = DateTime)]
    pub created_at: time::OffsetDateTime,
}

#[derive(Deserialize, ToSchema)]
pub struct StatusInput {
    /// `fulfilled`, `shipped`, `cancelled` or `refunded`.
    pub status: String,
    pub tracking_number: Option<String>,
}

#[utoipa::path(operation_id = "admin_list_orders", get, path = "/admin/orders", tag = "admin", params(OrderFilter), responses((status = 200, body = Vec<AdminOrderRow>)))]
pub async fn list_orders(
    State(s): State<AppState>,
    _: RequireAdmin,
    Query(f): Query<OrderFilter>,
) -> AppResult<Json<Vec<AdminOrderRow>>> {
    let rows = sqlx::query_as::<_, AdminOrderRow>(
        r#"SELECT o.id, o.number, o.status::text AS status, o.email,
                  o.shipping_address->>'name' AS name, o.shipping_address->>'country' AS country,
                  o.currency, o.total_minor,
                  (SELECT coalesce(sum(quantity), 0) FROM order_items WHERE order_id = o.id)::int8 AS item_count,
                  o.created_at
           FROM orders o
           WHERE CASE
               WHEN $1::text IS NULL THEN o.status <> 'pending'
               WHEN $1 = 'to_ship' THEN o.status IN ('paid', 'fulfilled')
               ELSE o.status::text = $1
           END
           ORDER BY o.created_at DESC LIMIT 200"#,
    )
    .bind(f.status)
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[utoipa::path(operation_id = "admin_get_order", get, path = "/admin/orders/{id}", tag = "admin", params(("id" = Uuid, Path)), responses((status = 200, body = AdminOrder), (status = 404)))]
pub async fn get_order(
    State(s): State<AppState>,
    _: RequireAdmin,
    Path(id): Path<Uuid>,
) -> AppResult<Json<AdminOrder>> {
    #[derive(sqlx::FromRow)]
    struct Row {
        number: i64,
        status: String,
        email: String,
        currency: Currency,
        subtotal_minor: i64,
        shipping_minor: i64,
        total_minor: i64,
        tracking_number: Option<String>,
        shipping_address: serde_json::Value,
        created_at: time::OffsetDateTime,
    }
    let o = sqlx::query_as::<_, Row>(
        r#"SELECT number, status::text AS status, email, currency, subtotal_minor, shipping_minor, total_minor,
                  tracking_number, shipping_address, created_at FROM orders WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(&s.db)
    .await?
    .ok_or(AppError::NotFound)?;
    let items = sqlx::query_as::<_, AdminOrderItem>(
        "SELECT product_name, sku, size, quantity, unit_price_minor, measurements FROM order_items WHERE order_id = $1",
    )
    .bind(id)
    .fetch_all(&s.db)
    .await?;
    let payments = sqlx::query_as::<_, AdminPayment>(
        "SELECT provider::text AS provider, status, provider_order_id, provider_payment_id FROM payments WHERE order_id = $1 ORDER BY created_at",
    )
    .bind(id)
    .fetch_all(&s.db)
    .await?;
    Ok(Json(AdminOrder {
        id,
        number: o.number,
        status: o.status,
        email: o.email,
        currency: o.currency,
        subtotal_minor: o.subtotal_minor,
        shipping_minor: o.shipping_minor,
        total_minor: o.total_minor,
        tracking_number: o.tracking_number,
        shipping_address: o.shipping_address,
        items,
        payments,
        created_at: o.created_at,
    }))
}

/// Allowed moves. Refunds are issued in the Razorpay or Stripe dashboard, then recorded here.
fn transition_allowed(from: &str, to: &str) -> bool {
    matches!(
        (from, to),
        ("paid", "fulfilled")
            | ("paid", "shipped")
            | ("fulfilled", "shipped")
            | ("pending", "cancelled")
            | ("paid" | "fulfilled" | "shipped", "refunded")
    )
}

#[utoipa::path(operation_id = "admin_set_order_status", post, path = "/admin/orders/{id}/status", tag = "admin", params(("id" = Uuid, Path)), request_body = StatusInput,
    responses((status = 204), (status = 400, body = crate::error::ErrorBody)))]
pub async fn set_order_status(
    State(s): State<AppState>,
    RequireAdmin(admin): RequireAdmin,
    Path(id): Path<Uuid>,
    Json(input): Json<StatusInput>,
) -> AppResult<StatusCode> {
    let current: String = sqlx::query_scalar("SELECT status::text FROM orders WHERE id = $1")
        .bind(id)
        .fetch_optional(&s.db)
        .await?
        .ok_or(AppError::NotFound)?;
    if !transition_allowed(&current, &input.status) {
        return Err(AppError::BadRequest(format!(
            "can't move an order from {current} to {}",
            input.status
        )));
    }
    let tracking = input
        .tracking_number
        .as_deref()
        .map(str::trim)
        .filter(|t| !t.is_empty());
    if input.status == "shipped" && tracking.is_none() {
        return Err(AppError::BadRequest(
            "add a tracking number to mark as shipped".into(),
        ));
    }
    sqlx::query(
        "UPDATE orders SET status = $2::order_status, tracking_number = COALESCE($3, tracking_number), updated_at = now() WHERE id = $1",
    )
    .bind(id)
    .bind(&input.status)
    .bind(tracking)
    .execute(&s.db)
    .await?;
    if input.status == "cancelled" {
        sqlx::query("DELETE FROM stock_reservations WHERE order_id = $1")
            .bind(id)
            .execute(&s.db)
            .await?;
    }
    tracing::info!(admin = %admin.email, order = %id, from = %current, to = %input.status, "order status changed");
    Ok(StatusCode::NO_CONTENT)
}

// ------------------------------------------------------------------ products

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct AdminVariant {
    pub id: Uuid,
    pub sku: String,
    pub size: String,
    pub stock: i32,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct AdminProduct {
    pub id: Uuid,
    pub slug: String,
    pub name: String,
    pub status: String,
    pub category: String,
    pub description: String,
    pub fit_notes: String,
    pub image_url: Option<String>,
    #[schema(value_type = Vec<Money>)]
    pub prices: SqlJson<Vec<Money>>,
    #[schema(value_type = Vec<AdminVariant>)]
    pub variants: SqlJson<Vec<AdminVariant>>,
}

#[derive(Deserialize, ToSchema)]
pub struct ProductUpdate {
    pub name: Option<String>,
    pub description: Option<String>,
    pub fit_notes: Option<String>,
    /// `draft`, `active` or `archived`.
    pub status: Option<String>,
    pub prices: Option<Vec<Money>>,
}

#[derive(Deserialize, ToSchema)]
pub struct VariantUpdate {
    pub stock: i32,
}

#[utoipa::path(operation_id = "admin_list_products", get, path = "/admin/products", tag = "admin", responses((status = 200, body = Vec<AdminProduct>)))]
pub async fn list_products(
    State(s): State<AppState>,
    _: RequireAdmin,
) -> AppResult<Json<Vec<AdminProduct>>> {
    let rows = sqlx::query_as::<_, AdminProduct>(
        r#"SELECT p.id, p.slug, p.name, p.status::text AS status, p.category, p.description, p.fit_notes,
                  (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) AS image_url,
                  COALESCE((SELECT json_agg(json_build_object('currency', currency, 'amount_minor', amount_minor) ORDER BY currency)
                            FROM prices WHERE product_id = p.id), '[]'::json) AS prices,
                  COALESCE((SELECT json_agg(json_build_object('id', id, 'sku', sku, 'size', size, 'stock', stock) ORDER BY position)
                            FROM variants WHERE product_id = p.id), '[]'::json) AS variants
           FROM products p ORDER BY p.created_at"#,
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[utoipa::path(operation_id = "admin_update_product", patch, path = "/admin/products/{id}", tag = "admin", params(("id" = Uuid, Path)), request_body = ProductUpdate,
    responses((status = 204), (status = 400, body = crate::error::ErrorBody)))]
pub async fn update_product(
    State(s): State<AppState>,
    _: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(input): Json<ProductUpdate>,
) -> AppResult<StatusCode> {
    if let Some(st) = &input.status
        && !matches!(st.as_str(), "draft" | "active" | "archived")
    {
        return Err(AppError::BadRequest(
            "status must be draft, active or archived".into(),
        ));
    }
    if input.name.as_deref().is_some_and(|n| n.trim().is_empty()) {
        return Err(AppError::BadRequest("name can't be empty".into()));
    }
    let mut tx = s.db.begin().await?;
    let slug: String = sqlx::query_scalar(
        r#"UPDATE products SET
             name = COALESCE($2, name), description = COALESCE($3, description),
             fit_notes = COALESCE($4, fit_notes), status = COALESCE($5::product_status, status), updated_at = now()
           WHERE id = $1 RETURNING slug"#,
    )
    .bind(id)
    .bind(input.name.as_deref().map(str::trim))
    .bind(&input.description)
    .bind(&input.fit_notes)
    .bind(&input.status)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or(AppError::NotFound)?;
    for p in input.prices.iter().flatten() {
        if p.amount_minor <= 0 {
            return Err(AppError::BadRequest("prices must be above zero".into()));
        }
        sqlx::query(
            "INSERT INTO prices (product_id, currency, amount_minor) VALUES ($1, $2, $3) ON CONFLICT (product_id, currency) DO UPDATE SET amount_minor = EXCLUDED.amount_minor",
        )
        .bind(id)
        .bind(p.currency)
        .bind(p.amount_minor)
        .execute(&mut *tx)
        .await?;
    }
    tx.commit().await?;
    revalidate::tags(&s, vec!["catalog".into(), format!("product:{slug}")]);
    Ok(StatusCode::NO_CONTENT)
}

#[utoipa::path(operation_id = "admin_update_variant", patch, path = "/admin/variants/{id}", tag = "admin", params(("id" = Uuid, Path)), request_body = VariantUpdate,
    responses((status = 204), (status = 400, body = crate::error::ErrorBody)))]
pub async fn update_variant(
    State(s): State<AppState>,
    _: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(input): Json<VariantUpdate>,
) -> AppResult<StatusCode> {
    if !(0..=100_000).contains(&input.stock) {
        return Err(AppError::BadRequest("stock must be 0 or more".into()));
    }
    let slug: String = sqlx::query_scalar(
        "UPDATE variants v SET stock = $2 FROM products p WHERE v.id = $1 AND p.id = v.product_id RETURNING p.slug",
    )
    .bind(id)
    .bind(input.stock)
    .fetch_optional(&s.db)
    .await?
    .ok_or(AppError::NotFound)?;
    revalidate::tags(&s, vec!["catalog".into(), format!("product:{slug}")]);
    Ok(StatusCode::NO_CONTENT)
}

// ------------------------------------------------------------------ reviews

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct AdminReview {
    pub id: Uuid,
    pub product_name: String,
    pub product_slug: String,
    pub author: String,
    pub rating: i16,
    pub body: String,
    pub approved: bool,
    #[serde(with = "time::serde::rfc3339")]
    #[schema(value_type = String, format = DateTime)]
    pub created_at: time::OffsetDateTime,
}

#[utoipa::path(operation_id = "admin_list_reviews", get, path = "/admin/reviews", tag = "admin", responses((status = 200, body = Vec<AdminReview>)))]
pub async fn list_reviews(
    State(s): State<AppState>,
    _: RequireAdmin,
) -> AppResult<Json<Vec<AdminReview>>> {
    let rows = sqlx::query_as::<_, AdminReview>(
        r#"SELECT r.id, p.name AS product_name, p.slug AS product_slug, r.author, r.rating, r.body, r.approved, r.created_at
           FROM reviews r JOIN products p ON p.id = r.product_id
           ORDER BY r.approved, r.created_at DESC LIMIT 200"#,
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

async fn review_slug(s: &AppState, id: Uuid) -> AppResult<String> {
    sqlx::query_scalar(
        "SELECT p.slug FROM reviews r JOIN products p ON p.id = r.product_id WHERE r.id = $1",
    )
    .bind(id)
    .fetch_optional(&s.db)
    .await?
    .ok_or(AppError::NotFound)
}

#[utoipa::path(operation_id = "admin_approve_review", post, path = "/admin/reviews/{id}/approve", tag = "admin", params(("id" = Uuid, Path)), responses((status = 204)))]
pub async fn approve_review(
    State(s): State<AppState>,
    _: RequireAdmin,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {
    let slug = review_slug(&s, id).await?;
    sqlx::query("UPDATE reviews SET approved = true WHERE id = $1")
        .bind(id)
        .execute(&s.db)
        .await?;
    revalidate::tags(
        &s,
        vec![format!("product:{slug}"), format!("reviews:{slug}")],
    );
    Ok(StatusCode::NO_CONTENT)
}

#[utoipa::path(operation_id = "admin_delete_review", delete, path = "/admin/reviews/{id}", tag = "admin", params(("id" = Uuid, Path)), responses((status = 204)))]
pub async fn delete_review(
    State(s): State<AppState>,
    _: RequireAdmin,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {
    let slug = review_slug(&s, id).await?;
    sqlx::query("DELETE FROM reviews WHERE id = $1")
        .bind(id)
        .execute(&s.db)
        .await?;
    revalidate::tags(
        &s,
        vec![format!("product:{slug}"), format!("reviews:{slug}")],
    );
    Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
    use super::transition_allowed;

    #[test]
    fn order_transitions() {
        assert!(transition_allowed("paid", "shipped"));
        assert!(transition_allowed("fulfilled", "shipped"));
        assert!(transition_allowed("shipped", "refunded"));
        assert!(!transition_allowed("pending", "shipped"));
        assert!(!transition_allowed("shipped", "paid"));
        assert!(!transition_allowed("refunded", "shipped"));
    }
}
