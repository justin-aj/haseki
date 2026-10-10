use axum::{
    Json, Router,
    extract::{Path, State},
    routing::get,
};
use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    AppState,
    error::{AppError, AppResult},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/journal", get(list_journal))
        .route("/journal/{slug}", get(get_journal))
        .route("/lookbook", get(list_lookbook))
        .route("/events", get(list_events))
        .route("/faqs", get(list_faqs))
        .route("/testimonials", get(list_testimonials))
        .route("/policies", get(list_policies))
        .route("/policies/{slug}", get(get_policy))
        .route("/shipping/zones", get(list_shipping_zones))
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct JournalSummary {
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub cover_image: Option<String>,
    pub tag: String,
    #[serde(with = "time::serde::rfc3339::option")]
    #[schema(value_type = Option<String>, format = DateTime)]
    pub published_at: Option<time::OffsetDateTime>,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct JournalPost {
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub body_md: String,
    pub cover_image: Option<String>,
    pub tag: String,
    #[serde(with = "time::serde::rfc3339::option")]
    #[schema(value_type = Option<String>, format = DateTime)]
    pub published_at: Option<time::OffsetDateTime>,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct LookbookImage {
    pub id: Uuid,
    pub drop_slug: Option<String>,
    pub drop_name: Option<String>,
    pub url: String,
    pub alt: String,
    pub width: i32,
    pub height: i32,
    pub caption: String,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct Event {
    pub id: Uuid,
    pub city: String,
    pub venue: String,
    #[serde(with = "crate::models::iso_date::option")]
    #[schema(value_type = Option<String>, format = Date)]
    pub starts_on: Option<time::Date>,
    #[serde(with = "crate::models::iso_date::option")]
    #[schema(value_type = Option<String>, format = Date)]
    pub ends_on: Option<time::Date>,
    pub status: String,
    pub note: String,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct Faq {
    pub id: Uuid,
    pub section: String,
    pub question: String,
    pub answer: String,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct Testimonial {
    pub id: Uuid,
    pub author: String,
    pub location: String,
    pub quote: String,
    pub product: String,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct PolicySummary {
    pub slug: String,
    pub title: String,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct Policy {
    pub slug: String,
    pub title: String,
    pub body_md: String,
    #[serde(with = "time::serde::rfc3339")]
    #[schema(value_type = String, format = DateTime)]
    pub updated_at: time::OffsetDateTime,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct ShippingZone {
    pub code: String,
    pub name: String,
    pub countries: Vec<String>,
    pub eta: String,
}

#[utoipa::path(get, path = "/journal", tag = "content", responses((status = 200, body = Vec<JournalSummary>)))]
pub async fn list_journal(State(s): State<AppState>) -> AppResult<Json<Vec<JournalSummary>>> {
    let rows = sqlx::query_as::<_, JournalSummary>(
        r#"SELECT slug, title, excerpt, cover_image, tag, published_at FROM journal_posts
           WHERE published_at <= now() ORDER BY published_at DESC"#,
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[utoipa::path(get, path = "/journal/{slug}", tag = "content",
    params(("slug" = String, Path)),
    responses((status = 200, body = JournalPost), (status = 404)))]
pub async fn get_journal(
    State(s): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<JournalPost>> {
    sqlx::query_as::<_, JournalPost>(
        r#"SELECT slug, title, excerpt, body_md, cover_image, tag, published_at FROM journal_posts
           WHERE slug = $1 AND published_at <= now()"#,
    )
    .bind(slug)
    .fetch_optional(&s.db)
    .await?
    .map(Json)
    .ok_or(AppError::NotFound)
}

#[utoipa::path(get, path = "/lookbook", tag = "content", responses((status = 200, body = Vec<LookbookImage>)))]
pub async fn list_lookbook(State(s): State<AppState>) -> AppResult<Json<Vec<LookbookImage>>> {
    let rows = sqlx::query_as::<_, LookbookImage>(
        r#"SELECT l.id, d.slug AS drop_slug, d.name AS drop_name, l.url, l.alt, l.width, l.height, l.caption
           FROM lookbook_images l LEFT JOIN drops d ON d.id = l.drop_id
           ORDER BY d.number NULLS LAST, l.position"#,
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[utoipa::path(get, path = "/events", tag = "content", responses((status = 200, body = Vec<Event>)))]
pub async fn list_events(State(s): State<AppState>) -> AppResult<Json<Vec<Event>>> {
    let rows = sqlx::query_as::<_, Event>(
        "SELECT id, city, venue, starts_on, ends_on, status, note FROM events ORDER BY position",
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[utoipa::path(get, path = "/faqs", tag = "content", responses((status = 200, body = Vec<Faq>)))]
pub async fn list_faqs(State(s): State<AppState>) -> AppResult<Json<Vec<Faq>>> {
    let rows = sqlx::query_as::<_, Faq>(
        "SELECT id, section, question, answer FROM faqs ORDER BY section, position",
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[utoipa::path(get, path = "/testimonials", tag = "content", responses((status = 200, body = Vec<Testimonial>)))]
pub async fn list_testimonials(State(s): State<AppState>) -> AppResult<Json<Vec<Testimonial>>> {
    let rows = sqlx::query_as::<_, Testimonial>(
        "SELECT id, author, location, quote, product FROM testimonials ORDER BY position",
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}

#[utoipa::path(get, path = "/policies", tag = "content", responses((status = 200, body = Vec<PolicySummary>)))]
pub async fn list_policies(State(s): State<AppState>) -> AppResult<Json<Vec<PolicySummary>>> {
    let rows =
        sqlx::query_as::<_, PolicySummary>("SELECT slug, title FROM policies ORDER BY title")
            .fetch_all(&s.db)
            .await?;
    Ok(Json(rows))
}

#[utoipa::path(get, path = "/policies/{slug}", tag = "content",
    params(("slug" = String, Path)),
    responses((status = 200, body = Policy), (status = 404)))]
pub async fn get_policy(
    State(s): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<Policy>> {
    sqlx::query_as::<_, Policy>(
        "SELECT slug, title, body_md, updated_at FROM policies WHERE slug = $1",
    )
    .bind(slug)
    .fetch_optional(&s.db)
    .await?
    .map(Json)
    .ok_or(AppError::NotFound)
}

#[utoipa::path(get, path = "/shipping/zones", tag = "content", responses((status = 200, body = Vec<ShippingZone>)))]
pub async fn list_shipping_zones(State(s): State<AppState>) -> AppResult<Json<Vec<ShippingZone>>> {
    let rows = sqlx::query_as::<_, ShippingZone>(
        "SELECT code, name, countries::text[] AS countries, eta FROM shipping_zones ORDER BY code",
    )
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}
