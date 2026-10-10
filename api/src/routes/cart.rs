use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::{get, patch, post},
};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use serde::{Deserialize, Serialize};
use sqlx::{AssertSqlSafe, PgExecutor};
use utoipa::{IntoParams, ToSchema};
use uuid::Uuid;

use crate::{
    AppState,
    error::{AppError, AppResult},
    models::Currency,
    shipping::{self, ShippingQuote},
    token,
};

pub const CART_COOKIE: &str = "hsk_cart";
const MAX_QTY: i32 = 10;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/cart", get(get_cart))
        .route("/cart/items", post(add_item))
        .route("/cart/items/{id}", patch(update_item).delete(remove_item))
        .route("/cart/shipping", get(shipping_quote))
}

#[derive(Serialize, ToSchema, sqlx::FromRow, Clone)]
pub struct CartLine {
    pub id: Uuid,
    pub variant_id: Uuid,
    pub product_slug: String,
    pub product_name: String,
    pub size: String,
    pub image_url: Option<String>,
    pub image_alt: Option<String>,
    pub unit_price_minor: i64,
    pub quantity: i32,
    pub line_total_minor: i64,
    /// Units that can still be bought (stock minus other shoppers' active reservations).
    pub available: i64,
    pub weight_g: i32,
    #[schema(value_type = Option<std::collections::HashMap<String, f64>>)]
    pub measurements: Option<serde_json::Value>,
}

#[derive(Serialize, ToSchema)]
pub struct Cart {
    pub currency: Currency,
    pub items: Vec<CartLine>,
    pub item_count: i64,
    pub subtotal_minor: i64,
    pub weight_g: i64,
}

#[derive(Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct CartQuery {
    pub currency: Option<Currency>,
}

#[derive(Deserialize, ToSchema)]
pub struct AddItemInput {
    pub variant_id: Uuid,
    pub quantity: Option<i32>,
    pub currency: Option<Currency>,
    /// Custom fit inputs (height, bust, waist, hip in cm) for made-to-measure pieces.
    #[schema(value_type = Option<std::collections::HashMap<String, f64>>)]
    pub measurements: Option<serde_json::Value>,
}

#[derive(Deserialize, ToSchema)]
pub struct UpdateItemInput {
    pub quantity: i32,
    pub currency: Option<Currency>,
}

#[derive(Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ShippingQuery {
    pub currency: Option<Currency>,
    /// ISO 3166-1 alpha-2 country code.
    pub country: String,
}

/// SQL for units of `{v}` a shopper can still buy: stock minus active holds by *other* carts.
/// A cart's own hold (an unfinished checkout) never blocks it. `cart_param` may bind NULL.
pub fn available_expr(v: &str, cart_param: &str) -> String {
    format!(
        "GREATEST({v}.stock - COALESCE((SELECT sum(r.quantity) FROM stock_reservations r \
         JOIN orders o ON o.id = r.order_id \
         WHERE r.variant_id = {v}.id AND r.expires_at > now() \
         AND ({cart_param}::uuid IS NULL OR o.cart_id IS DISTINCT FROM {cart_param}::uuid)), 0), 0)::int8"
    )
}

/// Custom fit inputs: centimetres, only these keys, within human ranges.
pub fn validate_measurements(m: &serde_json::Value) -> Result<(), String> {
    const RANGES: [(&str, f64, f64); 4] = [
        ("height", 120.0, 220.0),
        ("bust", 60.0, 170.0),
        ("waist", 45.0, 160.0),
        ("hip", 65.0, 180.0),
    ];
    let obj = m.as_object().ok_or("measurements must be an object")?;
    if obj.is_empty() {
        return Err("add at least one measurement".into());
    }
    for (k, v) in obj {
        let Some((_, lo, hi)) = RANGES.iter().find(|(name, _, _)| name == k) else {
            return Err(format!("unknown measurement `{k}`"));
        };
        let n = v.as_f64().ok_or(format!("{k} must be a number"))?;
        if !(*lo..=*hi).contains(&n) {
            return Err(format!("{k} should be between {lo} and {hi} cm"));
        }
    }
    Ok(())
}

/// Looks up the cart for the request's cookie, if any.
pub async fn cart_id<'e>(db: impl PgExecutor<'e>, jar: &CookieJar) -> AppResult<Option<Uuid>> {
    let Some(raw) = jar.get(CART_COOKIE).map(|c| c.value().to_owned()) else {
        return Ok(None);
    };
    let id = sqlx::query_scalar("SELECT id FROM carts WHERE token_hash = $1")
        .bind(token::hash(&raw))
        .fetch_optional(db)
        .await?;
    Ok(id)
}

fn cart_cookie(value: String, secure: bool) -> Cookie<'static> {
    Cookie::build((CART_COOKIE, value))
        .path("/")
        .http_only(true)
        .secure(secure)
        .same_site(SameSite::Lax)
        .max_age(time::Duration::days(60))
        .build()
}

pub async fn load_cart<'e>(
    db: impl PgExecutor<'e>,
    cart_id: Option<Uuid>,
    currency: Currency,
) -> AppResult<Cart> {
    let items = match cart_id {
        None => vec![],
        Some(id) => {
            sqlx::query_as::<_, CartLine>(AssertSqlSafe(format!(
                r#"
                SELECT ci.id, ci.variant_id, p.slug AS product_slug, p.name AS product_name, v.size,
                       img.url AS image_url, img.alt AS image_alt,
                       pr.amount_minor AS unit_price_minor, ci.quantity,
                       pr.amount_minor * ci.quantity AS line_total_minor,
                       {avail} AS available,
                       v.weight_g, ci.measurements
                FROM cart_items ci
                JOIN variants v ON v.id = ci.variant_id
                JOIN products p ON p.id = v.product_id
                JOIN prices pr ON pr.product_id = p.id AND pr.currency = $2
                LEFT JOIN LATERAL (
                    SELECT url, alt FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1
                ) img ON true
                WHERE ci.cart_id = $1
                ORDER BY ci.created_at
                "#,
                avail = available_expr("v", "$1"),
            )))
            .bind(id)
            .bind(currency)
            .fetch_all(db)
            .await?
        }
    };
    Ok(Cart {
        currency,
        item_count: items.iter().map(|i| i.quantity as i64).sum(),
        subtotal_minor: items.iter().map(|i| i.line_total_minor).sum(),
        weight_g: items
            .iter()
            .map(|i| i.weight_g as i64 * i.quantity as i64)
            .sum(),
        items,
    })
}

#[utoipa::path(get, path = "/cart", tag = "cart", params(CartQuery), responses((status = 200, body = Cart)))]
pub async fn get_cart(
    State(s): State<AppState>,
    jar: CookieJar,
    Query(q): Query<CartQuery>,
) -> AppResult<Json<Cart>> {
    let id = cart_id(&s.db, &jar).await?;
    Ok(Json(
        load_cart(&s.db, id, q.currency.unwrap_or_default()).await?,
    ))
}

#[utoipa::path(post, path = "/cart/items", tag = "cart", request_body = AddItemInput,
    responses((status = 200, body = Cart), (status = 400, body = crate::error::ErrorBody)))]
pub async fn add_item(
    State(s): State<AppState>,
    jar: CookieJar,
    Json(input): Json<AddItemInput>,
) -> AppResult<(CookieJar, Json<Cart>)> {
    let qty = input.quantity.unwrap_or(1);
    if !(1..=MAX_QTY).contains(&qty) {
        return Err(AppError::BadRequest(format!(
            "quantity must be 1 to {MAX_QTY}"
        )));
    }
    if let Some(m) = &input.measurements {
        validate_measurements(m).map_err(AppError::BadRequest)?;
    }
    let mut tx = s.db.begin().await?;
    let existing_cart = cart_id(&mut *tx, &jar).await?;

    let available: Option<i64> = sqlx::query_scalar(AssertSqlSafe(format!(
        r#"SELECT {avail} FROM variants v JOIN products p ON p.id = v.product_id
           WHERE v.id = $1 AND p.status = 'active' AND ($3 = false OR p.custom_fit)"#,
        avail = available_expr("v", "$2"),
    )))
    .bind(input.variant_id)
    .bind(existing_cart)
    .bind(input.measurements.is_some())
    .fetch_optional(&mut *tx)
    .await?;
    let Some(available) = available else {
        return Err(AppError::BadRequest(
            "this piece is no longer available".into(),
        ));
    };

    let (cart, jar) = match existing_cart {
        Some(id) => (id, jar),
        None => {
            let raw = token::generate();
            let id: Uuid =
                sqlx::query_scalar("INSERT INTO carts (token_hash) VALUES ($1) RETURNING id")
                    .bind(token::hash(&raw))
                    .fetch_one(&mut *tx)
                    .await?;
            (id, jar.add(cart_cookie(raw, s.config.secure_cookies)))
        }
    };

    // Plain lines merge by variant; custom-measured lines are always their own line.
    let existing: Option<(Uuid, i32)> = if input.measurements.is_none() {
        sqlx::query_as("SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2 AND measurements IS NULL")
            .bind(cart)
            .bind(input.variant_id)
            .fetch_optional(&mut *tx)
            .await?
    } else {
        None
    };
    let new_qty = existing.map_or(qty, |(_, q)| q + qty);
    if new_qty as i64 > available {
        return Err(AppError::BadRequest(if available == 0 {
            "sorry, this size just sold out".into()
        } else {
            format!("only {available} left in this size")
        }));
    }
    if new_qty > MAX_QTY {
        return Err(AppError::BadRequest(format!(
            "you can add up to {MAX_QTY} of one piece"
        )));
    }
    match existing {
        Some((line, _)) => {
            sqlx::query("UPDATE cart_items SET quantity = $2 WHERE id = $1")
                .bind(line)
                .bind(new_qty)
                .execute(&mut *tx)
                .await?;
        }
        None => {
            sqlx::query("INSERT INTO cart_items (cart_id, variant_id, quantity, measurements) VALUES ($1, $2, $3, $4)")
                .bind(cart)
                .bind(input.variant_id)
                .bind(qty)
                .bind(&input.measurements)
                .execute(&mut *tx)
                .await?;
        }
    }
    sqlx::query("UPDATE carts SET updated_at = now() WHERE id = $1")
        .bind(cart)
        .execute(&mut *tx)
        .await?;
    let body = load_cart(&mut *tx, Some(cart), input.currency.unwrap_or_default()).await?;
    tx.commit().await?;
    Ok((jar, Json(body)))
}

#[utoipa::path(patch, path = "/cart/items/{id}", tag = "cart", params(("id" = Uuid, Path)),
    request_body = UpdateItemInput,
    responses((status = 200, body = Cart), (status = 400, body = crate::error::ErrorBody), (status = 404)))]
pub async fn update_item(
    State(s): State<AppState>,
    jar: CookieJar,
    Path(line): Path<Uuid>,
    Json(input): Json<UpdateItemInput>,
) -> AppResult<Json<Cart>> {
    if !(1..=MAX_QTY).contains(&input.quantity) {
        return Err(AppError::BadRequest(format!(
            "quantity must be 1 to {MAX_QTY}"
        )));
    }
    let cart = cart_id(&s.db, &jar).await?.ok_or(AppError::NotFound)?;
    let available: Option<i64> = sqlx::query_scalar(AssertSqlSafe(format!(
        r#"SELECT {avail} FROM cart_items ci JOIN variants v ON v.id = ci.variant_id
           WHERE ci.id = $1 AND ci.cart_id = $2"#,
        avail = available_expr("v", "$2"),
    )))
    .bind(line)
    .bind(cart)
    .fetch_optional(&s.db)
    .await?;
    let available = available.ok_or(AppError::NotFound)?;
    if input.quantity as i64 > available {
        return Err(AppError::BadRequest(format!(
            "only {available} left in this size"
        )));
    }
    sqlx::query("UPDATE cart_items SET quantity = $3 WHERE id = $1 AND cart_id = $2")
        .bind(line)
        .bind(cart)
        .bind(input.quantity)
        .execute(&s.db)
        .await?;
    Ok(Json(
        load_cart(&s.db, Some(cart), input.currency.unwrap_or_default()).await?,
    ))
}

#[utoipa::path(delete, path = "/cart/items/{id}", tag = "cart", params(("id" = Uuid, Path), CartQuery),
    responses((status = 200, body = Cart)))]
pub async fn remove_item(
    State(s): State<AppState>,
    jar: CookieJar,
    Path(line): Path<Uuid>,
    Query(q): Query<CartQuery>,
) -> AppResult<Json<Cart>> {
    let cart = cart_id(&s.db, &jar).await?;
    if let Some(cart) = cart {
        sqlx::query("DELETE FROM cart_items WHERE id = $1 AND cart_id = $2")
            .bind(line)
            .bind(cart)
            .execute(&s.db)
            .await?;
    }
    Ok(Json(
        load_cart(&s.db, cart, q.currency.unwrap_or_default()).await?,
    ))
}

#[utoipa::path(get, path = "/cart/shipping", tag = "cart", params(ShippingQuery),
    responses((status = 200, body = ShippingQuote)))]
pub async fn shipping_quote(
    State(s): State<AppState>,
    jar: CookieJar,
    Query(q): Query<ShippingQuery>,
) -> AppResult<Json<ShippingQuote>> {
    if q.country.trim().len() != 2 {
        return Err(AppError::BadRequest(
            "country must be a 2-letter code".into(),
        ));
    }
    let currency = q.currency.unwrap_or_default();
    let id = cart_id(&s.db, &jar).await?;
    let cart = load_cart(&s.db, id, currency).await?;
    Ok(Json(
        shipping::quote(&s.db, &q.country, cart.weight_g.max(1), currency).await?,
    ))
}
