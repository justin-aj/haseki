use axum::{Json, Router, extract::State, http::StatusCode, routing::post};
use serde::Deserialize;
use utoipa::ToSchema;

use crate::{
    AppState,
    error::{AppError, AppResult},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/newsletter", post(subscribe))
        .route("/contact", post(contact))
}

#[derive(Deserialize, ToSchema)]
pub struct NewsletterInput {
    pub email: String,
}

#[derive(Deserialize, ToSchema)]
pub struct ContactInput {
    pub name: String,
    pub email: String,
    pub message: String,
}

/// Minimal shape check; real verification happens via the confirmation email.
pub fn valid_email(email: &str) -> bool {
    let email = email.trim();
    email.len() <= 254
        && email.split_once('@').is_some_and(|(local, domain)| {
            !local.is_empty() && domain.contains('.') && !domain.starts_with('.')
        })
}

#[utoipa::path(post, path = "/newsletter", tag = "forms", request_body = NewsletterInput,
    responses((status = 204), (status = 400, body = crate::error::ErrorBody)))]
pub async fn subscribe(
    State(s): State<AppState>,
    Json(input): Json<NewsletterInput>,
) -> AppResult<StatusCode> {
    if !valid_email(&input.email) {
        return Err(AppError::BadRequest("enter a valid email".into()));
    }
    sqlx::query(
        "INSERT INTO newsletter_subscribers (email) VALUES (lower($1)) ON CONFLICT DO NOTHING",
    )
    .bind(input.email.trim())
    .execute(&s.db)
    .await?;
    Ok(StatusCode::NO_CONTENT)
}

#[utoipa::path(post, path = "/contact", tag = "forms", request_body = ContactInput,
    responses((status = 204), (status = 400, body = crate::error::ErrorBody)))]
pub async fn contact(
    State(s): State<AppState>,
    Json(input): Json<ContactInput>,
) -> AppResult<StatusCode> {
    let name = input.name.trim();
    let message = input.message.trim();
    if name.is_empty() || name.len() > 200 {
        return Err(AppError::BadRequest("enter your name".into()));
    }
    if !valid_email(&input.email) {
        return Err(AppError::BadRequest("enter a valid email".into()));
    }
    if message.is_empty() || message.len() > 5000 {
        return Err(AppError::BadRequest(
            "message must be 1 to 5000 characters".into(),
        ));
    }
    sqlx::query("INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)")
        .bind(name)
        .bind(input.email.trim())
        .bind(message)
        .execute(&s.db)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
    use super::valid_email;

    #[test]
    fn email_shape() {
        assert!(valid_email("caroline@haseki.in"));
        assert!(!valid_email("no-at-sign"));
        assert!(!valid_email("@haseki.in"));
        assert!(!valid_email("a@nodot"));
    }
}
