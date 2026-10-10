//! Password hashing (Argon2id) and cookie sessions. Session tokens are opaque and only their
//! SHA-256 hash is stored, so a database leak doesn't expose live sessions.

use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use axum::{
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    AppState,
    error::{AppError, AppResult},
    token,
};

pub const SESSION_COOKIE: &str = "hsk_session";
const SESSION_DAYS: i64 = 30;

/// Argon2 is deliberately slow; run it off the async workers so sign-ins don't stall other requests.
pub async fn hash_password_async(password: String) -> anyhow::Result<String> {
    tokio::task::spawn_blocking(move || hash_password(&password)).await?
}

pub async fn verify_password_async(password: String, hash: String) -> bool {
    tokio::task::spawn_blocking(move || verify_password(&password, &hash))
        .await
        .unwrap_or(false)
}

pub fn hash_password(password: &str) -> anyhow::Result<String> {
    Argon2::default()
        .hash_password(password.as_bytes())
        .map(|h| h.to_string())
        .map_err(|e| anyhow::anyhow!("hash failed: {e}"))
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    Argon2::default()
        .verify_password(password.as_bytes(), hash)
        .is_ok()
}

#[derive(Debug, Clone, Serialize, ToSchema, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub is_admin: bool,
}

/// Creates a session and returns the cookie to set.
pub async fn start_session(state: &AppState, customer_id: Uuid) -> AppResult<Cookie<'static>> {
    let raw = token::generate();
    sqlx::query("INSERT INTO sessions (token_hash, customer_id, expires_at) VALUES ($1, $2, now() + make_interval(days => $3))")
        .bind(token::hash(&raw))
        .bind(customer_id)
        .bind(SESSION_DAYS as i32)
        .execute(&state.db)
        .await?;
    Ok(session_cookie(
        raw,
        state.config.secure_cookies,
        time::Duration::days(SESSION_DAYS),
    ))
}

pub fn session_cookie(value: String, secure: bool, max_age: time::Duration) -> Cookie<'static> {
    Cookie::build((SESSION_COOKIE, value))
        .path("/")
        .http_only(true)
        .secure(secure)
        .same_site(SameSite::Lax)
        .max_age(max_age)
        .build()
}

pub async fn user_from_jar(state: &AppState, jar: &CookieJar) -> AppResult<Option<User>> {
    let Some(raw) = jar.get(SESSION_COOKIE).map(|c| c.value().to_owned()) else {
        return Ok(None);
    };
    let user = sqlx::query_as::<_, User>(
        r#"SELECT c.id, c.email, c.name, c.role = 'admin' AS is_admin
           FROM sessions s JOIN customers c ON c.id = s.customer_id
           WHERE s.token_hash = $1 AND s.expires_at > now()"#,
    )
    .bind(token::hash(&raw))
    .fetch_optional(&state.db)
    .await?;
    Ok(user)
}

/// The signed-in customer, if any.
pub struct CurrentUser(pub Option<User>);

impl<S> FromRequestParts<S> for CurrentUser
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        let jar = CookieJar::from_headers(&parts.headers);
        Ok(CurrentUser(user_from_jar(&state, &jar).await?))
    }
}

/// Rejects with 401 unless signed in.
pub struct RequireUser(pub User);

impl<S> FromRequestParts<S> for RequireUser
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let CurrentUser(user) = CurrentUser::from_request_parts(parts, state).await?;
        user.map(RequireUser).ok_or(AppError::Unauthorized)
    }
}

/// Rejects with 401/403 unless signed in as an admin. Every /admin route takes this.
pub struct RequireAdmin(pub User);

impl<S> FromRequestParts<S> for RequireAdmin
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let RequireUser(user) = RequireUser::from_request_parts(parts, state).await?;
        if user.is_admin {
            Ok(RequireAdmin(user))
        } else {
            Err(AppError::Forbidden)
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn password_roundtrip() {
        let h = super::hash_password("correct horse battery").unwrap();
        assert!(h.starts_with("$argon2id$"));
        assert!(super::verify_password("correct horse battery", &h));
        assert!(!super::verify_password("wrong", &h));
        assert!(!super::verify_password("x", "not-a-hash"));
    }
}

/// Per-email cap on failed sign-ins (in memory, per API instance).
#[derive(Default)]
pub struct LoginLimiter {
    failures: std::sync::Mutex<std::collections::HashMap<String, (u32, std::time::Instant)>>,
}

impl LoginLimiter {
    const MAX_FAILURES: u32 = 10;
    const WINDOW: std::time::Duration = std::time::Duration::from_secs(15 * 60);

    pub fn blocked(&self, email: &str) -> bool {
        let map = self.failures.lock().unwrap_or_else(|e| e.into_inner());
        map.get(email)
            .is_some_and(|(n, since)| *n >= Self::MAX_FAILURES && since.elapsed() < Self::WINDOW)
    }

    pub fn record_failure(&self, email: &str) {
        let mut map = self.failures.lock().unwrap_or_else(|e| e.into_inner());
        if map.len() > 10_000 {
            map.retain(|_, (_, since)| since.elapsed() < Self::WINDOW);
        }
        let entry = map
            .entry(email.to_owned())
            .or_insert((0, std::time::Instant::now()));
        if entry.1.elapsed() >= Self::WINDOW {
            *entry = (0, std::time::Instant::now());
        }
        entry.0 += 1;
    }

    pub fn clear(&self, email: &str) {
        self.failures
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .remove(email);
    }
}
