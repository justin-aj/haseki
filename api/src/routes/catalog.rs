use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::get,
};
use serde::{Deserialize, Serialize};
use sqlx::{AssertSqlSafe, types::Json as SqlJson};
use utoipa::{IntoParams, ToSchema};
use uuid::Uuid;

use crate::{
    AppState,
    auth::RequireUser,
    error::{AppError, AppResult},
    models::{FitVerdict, Money},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/pillars", get(list_pillars))
        .route("/drops", get(list_drops))
        .route("/drops/{slug}", get(get_drop))
        .route("/products", get(list_products))
        .route("/products/{slug}", get(get_product))
        .route(
            "/products/{slug}/reviews",
            get(list_reviews).post(submit_review),
        )
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct Image {
    pub url: String,
    pub alt: String,
    pub width: i32,
    pub height: i32,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct Pillar {
    pub slug: String,
    pub name: String,
    pub description: String,
    pub image: Option<String>,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct Drop {
    pub slug: String,
    pub number: i32,
    pub name: String,
    pub tagline: String,
    pub story: String,
    pub hero_image: Option<String>,
    #[serde(with = "crate::models::iso_date::option")]
    #[schema(value_type = Option<String>, format = Date)]
    pub released_at: Option<time::Date>,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct ProductSummary {
    pub id: Uuid,
    pub slug: String,
    pub name: String,
    pub category: String,
    pub made_to_order: bool,
    /// Accepts custom measurements (height, bust, waist, hip in cm).
    pub custom_fit: bool,
    pub drop_slug: Option<String>,
    pub drop_name: Option<String>,
    #[schema(value_type = Vec<Money>)]
    pub prices: SqlJson<Vec<Money>>,
    pub in_stock: bool,
    pub pillars: Vec<String>,
    #[schema(value_type = Vec<Image>)]
    pub images: SqlJson<Vec<Image>>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct Variant {
    pub id: Uuid,
    pub sku: String,
    pub size: String,
    pub colour: String,
    pub in_stock: bool,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct ProductDetail {
    pub id: Uuid,
    pub slug: String,
    pub name: String,
    pub description: String,
    pub fit_notes: String,
    pub fabric: String,
    pub care: String,
    pub category: String,
    pub made_to_order: bool,
    /// Accepts custom measurements (height, bust, waist, hip in cm).
    pub custom_fit: bool,
    pub drop_slug: Option<String>,
    pub drop_name: Option<String>,
    #[schema(value_type = Vec<Money>)]
    pub prices: SqlJson<Vec<Money>>,
    pub pillars: Vec<String>,
    #[schema(value_type = Vec<Image>)]
    pub images: SqlJson<Vec<Image>>,
    #[schema(value_type = Vec<Variant>)]
    pub variants: SqlJson<Vec<Variant>>,
    pub review_count: i64,
    pub rating_avg: Option<f64>,
    pub fit_small: i64,
    pub fit_true: i64,
    pub fit_large: i64,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct Review {
    pub id: Uuid,
    pub author: String,
    pub rating: i16,
    pub body: String,
    pub height_cm: Option<i16>,
    pub usual_size: Option<String>,
    pub size_bought: Option<String>,
    pub fit: Option<FitVerdict>,
    #[serde(with = "time::serde::rfc3339")]
    #[schema(value_type = String, format = DateTime)]
    pub created_at: time::OffsetDateTime,
}

#[derive(Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ProductQuery {
    pub pillar: Option<String>,
    pub category: Option<String>,
    #[serde(rename = "drop")]
    #[param(rename = "drop")]
    pub drop_slug: Option<String>,
}

#[utoipa::path(get, path = "/pillars", tag = "catalog", responses((status = 200, body = Vec<Pillar>)))]
pub async fn list_pillars(State(s): State<AppState>) -> AppResult<Json<Vec<Pillar>>> {
    let rows = sqlx::query_as::<_, Pillar>(
        "SELECT slug, name, description, image FROM pillars ORDER BY position",
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

const DROP_COLS: &str = "slug, number, name, tagline, story, hero_image, released_at";

#[utoipa::path(get, path = "/drops", tag = "catalog", responses((status = 200, body = Vec<Drop>)))]
pub async fn list_drops(State(s): State<AppState>) -> AppResult<Json<Vec<Drop>>> {
    let rows = sqlx::query_as::<_, Drop>(AssertSqlSafe(format!(
        "SELECT {DROP_COLS} FROM drops ORDER BY number"
    )))
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[utoipa::path(get, path = "/drops/{slug}", tag = "catalog",
    params(("slug" = String, Path)),
    responses((status = 200, body = Drop), (status = 404)))]
pub async fn get_drop(
    State(s): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<Drop>> {
    sqlx::query_as::<_, Drop>(AssertSqlSafe(format!(
        "SELECT {DROP_COLS} FROM drops WHERE slug = $1"
    )))
    .bind(slug)
    .fetch_optional(&s.db)
    .await?
    .map(Json)
    .ok_or(AppError::NotFound)
}

/// Columns shared by list and detail queries. All market prices are returned so pages can be
/// prerendered once and the visitor's currency picked on the client.
const PRODUCT_BASE: &str = r#"
    p.id, p.slug, p.name, p.category, p.made_to_order, p.custom_fit,
    d.slug AS drop_slug, d.name AS drop_name,
    COALESCE((
        SELECT json_agg(json_build_object('currency', pr.currency, 'amount_minor', pr.amount_minor)
                        ORDER BY pr.currency)
        FROM prices pr WHERE pr.product_id = p.id
    ), '[]'::json) AS prices,
    COALESCE((
        SELECT array_agg(pl.slug ORDER BY pl.position)
        FROM product_pillars pp JOIN pillars pl ON pl.id = pp.pillar_id
        WHERE pp.product_id = p.id
    ), '{}') AS pillars,
    COALESCE((
        SELECT json_agg(json_build_object('url', i.url, 'alt', i.alt, 'width', i.width, 'height', i.height)
                        ORDER BY i.position)
        FROM product_images i WHERE i.product_id = p.id
    ), '[]'::json) AS images
"#;

#[utoipa::path(get, path = "/products", tag = "catalog", params(ProductQuery),
    responses((status = 200, body = Vec<ProductSummary>)))]
pub async fn list_products(
    State(s): State<AppState>,
    Query(q): Query<ProductQuery>,
) -> AppResult<Json<Vec<ProductSummary>>> {
    let sql = format!(
        r#"
        SELECT {PRODUCT_BASE},
            EXISTS (SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.stock > 0) AS in_stock
        FROM products p
        LEFT JOIN drops d ON d.id = p.drop_id
        WHERE p.status = 'active'
          AND ($1::text IS NULL OR EXISTS (
                SELECT 1 FROM product_pillars pp JOIN pillars pl ON pl.id = pp.pillar_id
                WHERE pp.product_id = p.id AND pl.slug = $1))
          AND ($2::text IS NULL OR p.category = $2)
          AND ($3::text IS NULL OR d.slug = $3)
        ORDER BY d.number NULLS LAST, p.created_at, p.name
        "#
    );
    let rows = sqlx::query_as::<_, ProductSummary>(AssertSqlSafe(sql))
        .bind(q.pillar)
        .bind(q.category)
        .bind(q.drop_slug)
        .fetch_all(&s.db)
        .await?;
    Ok(Json(rows))
}

#[utoipa::path(get, path = "/products/{slug}", tag = "catalog",
    params(("slug" = String, Path)),
    responses((status = 200, body = ProductDetail), (status = 404)))]
pub async fn get_product(
    State(s): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<ProductDetail>> {
    let sql = format!(
        r#"
        SELECT {PRODUCT_BASE},
            p.description, p.fit_notes, p.fabric, p.care,
            COALESCE((
                SELECT json_agg(json_build_object('id', v.id, 'sku', v.sku, 'size', v.size,
                                                  'colour', v.colour, 'in_stock', v.stock > 0)
                                ORDER BY v.position)
                FROM variants v WHERE v.product_id = p.id
            ), '[]'::json) AS variants,
            r.review_count, r.rating_avg, r.fit_small, r.fit_true, r.fit_large
        FROM products p
        LEFT JOIN drops d ON d.id = p.drop_id
        CROSS JOIN LATERAL (
            SELECT count(*) AS review_count,
                   avg(rating)::float8 AS rating_avg,
                   count(*) FILTER (WHERE fit = 'small') AS fit_small,
                   count(*) FILTER (WHERE fit = 'true') AS fit_true,
                   count(*) FILTER (WHERE fit = 'large') AS fit_large
            FROM reviews WHERE product_id = p.id AND approved
        ) r
        WHERE p.status = 'active' AND p.slug = $1
        "#
    );
    sqlx::query_as::<_, ProductDetail>(AssertSqlSafe(sql))
        .bind(slug)
        .fetch_optional(&s.db)
        .await?
        .map(Json)
        .ok_or(AppError::NotFound)
}

#[utoipa::path(get, path = "/products/{slug}/reviews", tag = "catalog",
    params(("slug" = String, Path)),
    responses((status = 200, body = Vec<Review>)))]
pub async fn list_reviews(
    State(s): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<Vec<Review>>> {
    let rows = sqlx::query_as::<_, Review>(
        r#"
        SELECT r.id, r.author, r.rating, r.body, r.height_cm, r.usual_size, r.size_bought, r.fit, r.created_at
        FROM reviews r JOIN products p ON p.id = r.product_id
        WHERE p.slug = $1 AND r.approved
        ORDER BY r.created_at DESC
        LIMIT 50
        "#,
    )
    .bind(slug)
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[derive(Deserialize, ToSchema)]
pub struct ReviewInput {
    pub rating: i16,
    pub body: String,
    pub height_cm: Option<i16>,
    pub usual_size: Option<String>,
    pub size_bought: Option<String>,
    pub fit: Option<FitVerdict>,
}

/// Signed-in customers only; reviews appear after the team approves them.
#[utoipa::path(post, path = "/products/{slug}/reviews", tag = "catalog", params(("slug" = String, Path)),
    request_body = ReviewInput,
    responses((status = 204), (status = 400, body = crate::error::ErrorBody), (status = 401)))]
pub async fn submit_review(
    State(s): State<AppState>,
    RequireUser(user): RequireUser,
    Path(slug): Path<String>,
    Json(input): Json<ReviewInput>,
) -> AppResult<axum::http::StatusCode> {
    if !(1..=5).contains(&input.rating) {
        return Err(AppError::BadRequest("rating must be 1 to 5".into()));
    }
    let body = input.body.trim();
    if body.len() < 10 || body.len() > 2000 {
        return Err(AppError::BadRequest(
            "tell us a little more (10 to 2000 characters)".into(),
        ));
    }
    if input.height_cm.is_some_and(|h| !(120..=220).contains(&h)) {
        return Err(AppError::BadRequest(
            "height should be in centimetres".into(),
        ));
    }
    let author = user
        .name
        .split_whitespace()
        .next()
        .unwrap_or("Customer")
        .to_owned();
    let inserted = sqlx::query(
        r#"INSERT INTO reviews (product_id, customer_id, author, rating, body, height_cm, usual_size, size_bought, fit)
           SELECT p.id, $2, $3, $4, $5, $6, $7, $8, $9 FROM products p WHERE p.slug = $1 AND p.status = 'active'"#,
    )
    .bind(&slug)
    .bind(user.id)
    .bind(author)
    .bind(input.rating)
    .bind(body)
    .bind(input.height_cm)
    .bind(input.usual_size.as_deref().map(str::trim))
    .bind(input.size_bought.as_deref().map(str::trim))
    .bind(input.fit)
    .execute(&s.db)
    .await?;
    if inserted.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(axum::http::StatusCode::NO_CONTENT)
}
