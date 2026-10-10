use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    routing::{get, post},
};
use axum_extra::extract::CookieJar;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::{
    AppState,
    auth::{self, CurrentUser, RequireUser, User},
    error::{AppError, AppResult},
    models::Currency,
    routes::forms::valid_email,
    token,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/logout", post(logout))
        .route("/auth/me", get(me))
        .route("/account/orders", get(my_orders))
}

#[derive(Deserialize, ToSchema)]
pub struct RegisterInput {
    pub email: String,
    pub name: String,
    pub password: String,
}

#[derive(Deserialize, ToSchema)]
pub struct LoginInput {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, ToSchema)]
pub struct Me {
    pub user: Option<User>,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct MyOrder {
    pub id: uuid::Uuid,
    pub number: i64,
    pub status: String,
    pub currency: Currency,
    pub total_minor: i64,
    pub item_count: i64,
    pub tracking_number: Option<String>,
    #[serde(with = "time::serde::rfc3339")]
    #[schema(value_type = String, format = DateTime)]
    pub created_at: time::OffsetDateTime,
}

const MIN_PASSWORD: usize = 10;

#[utoipa::path(post, path = "/auth/register", tag = "auth", request_body = RegisterInput,
    responses((status = 200, body = Me), (status = 400, body = crate::error::ErrorBody)))]
pub async fn register(
    State(s): State<AppState>,
    jar: CookieJar,
    Json(input): Json<RegisterInput>,
) -> AppResult<(CookieJar, Json<Me>)> {
    let email = input.email.trim().to_lowercase();
    if !valid_email(&email) {
        return Err(AppError::BadRequest("enter a valid email".into()));
    }
    if input.name.trim().is_empty() || input.name.len() > 200 {
        return Err(AppError::BadRequest("enter your name".into()));
    }
    if input.password.chars().count() < MIN_PASSWORD || input.password.len() > 256 {
        return Err(AppError::BadRequest(format!(
            "use at least {MIN_PASSWORD} characters for your password"
        )));
    }
    let hash = auth::hash_password_async(input.password.clone()).await?;
    // Guest checkouts create no customer row, so an existing row means a real account.
    let id: Option<uuid::Uuid> = sqlx::query_scalar(
        r#"INSERT INTO customers (email, name, password_hash) VALUES ($1, $2, $3)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name
             WHERE customers.password_hash IS NULL
           RETURNING id"#,
    )
    .bind(&email)
    .bind(input.name.trim())
    .bind(hash)
    .fetch_optional(&s.db)
    .await?;
    let Some(id) = id else {
        return Err(AppError::BadRequest(
            "an account with this email already exists. Sign in instead.".into(),
        ));
    };
    let cookie = auth::start_session(&s, id).await?;
    let user = auth::user_from_jar(&s, &CookieJar::new().add(cookie.clone())).await?;
    Ok((jar.add(cookie), Json(Me { user })))
}

#[utoipa::path(post, path = "/auth/login", tag = "auth", request_body = LoginInput,
    responses((status = 200, body = Me), (status = 400, body = crate::error::ErrorBody)))]
pub async fn login(
    State(s): State<AppState>,
    jar: CookieJar,
    Json(input): Json<LoginInput>,
) -> AppResult<(CookieJar, Json<Me>)> {
    let email = input.email.trim().to_lowercase();
    if s.login_limiter.blocked(&email) {
        return Err(AppError::BadRequest(
            "too many attempts. Wait 15 minutes and try again.".into(),
        ));
    }
    let row: Option<(uuid::Uuid, Option<String>)> =
        sqlx::query_as("SELECT id, password_hash FROM customers WHERE email = lower($1)")
            .bind(input.email.trim())
            .fetch_optional(&s.db)
            .await?;
    // Same message and similar work for unknown email vs wrong password.
    let ok = match &row {
        Some((_, Some(hash))) => {
            auth::verify_password_async(input.password.clone(), hash.clone()).await
        }
        _ => {
            let _ = auth::hash_password_async(input.password.clone()).await;
            false
        }
    };
    let Some((id, _)) = row.filter(|_| ok) else {
        s.login_limiter.record_failure(&email);
        return Err(AppError::BadRequest(
            "email or password is incorrect".into(),
        ));
    };
    s.login_limiter.clear(&email);
    let cookie = auth::start_session(&s, id).await?;
    let user = auth::user_from_jar(&s, &CookieJar::new().add(cookie.clone())).await?;
    Ok((jar.add(cookie), Json(Me { user })))
}

#[utoipa::path(post, path = "/auth/logout", tag = "auth", responses((status = 204)))]
pub async fn logout(
    State(s): State<AppState>,
    jar: CookieJar,
) -> AppResult<(CookieJar, StatusCode)> {
    if let Some(c) = jar.get(auth::SESSION_COOKIE) {
        sqlx::query("DELETE FROM sessions WHERE token_hash = $1")
            .bind(token::hash(c.value()))
            .execute(&s.db)
            .await?;
    }
    let expired =
        auth::session_cookie(String::new(), s.config.secure_cookies, time::Duration::ZERO);
    Ok((jar.add(expired), StatusCode::NO_CONTENT))
}

#[utoipa::path(get, path = "/auth/me", tag = "auth", responses((status = 200, body = Me)))]
pub async fn me(CurrentUser(user): CurrentUser) -> Json<Me> {
    Json(Me { user })
}

#[utoipa::path(get, path = "/account/orders", tag = "auth", responses((status = 200, body = Vec<MyOrder>), (status = 401)))]
pub async fn my_orders(
    State(s): State<AppState>,
    RequireUser(user): RequireUser,
) -> AppResult<Json<Vec<MyOrder>>> {
    // Only orders placed while signed in. Matching guest orders by email would let anyone who
    // registers with someone else's address read their orders, since emails aren't verified yet.
    let rows = sqlx::query_as::<_, MyOrder>(
        r#"SELECT o.id, o.number, o.status::text AS status, o.currency, o.total_minor,
                  (SELECT coalesce(sum(quantity), 0) FROM order_items WHERE order_id = o.id)::int8 AS item_count,
                  o.tracking_number, o.created_at
           FROM orders o WHERE o.customer_id = $1 AND o.status <> 'pending'
           ORDER BY o.created_at DESC"#,
    )
    .bind(user.id)
    .fetch_all(&s.db)
    .await?;
    Ok(Json(rows))
}
