//! Payment webhooks: the source of truth for "paid". Signatures are verified over the raw body,
//! and each provider event id is recorded once so retries are harmless.

use axum::{
    Router,
    body::Bytes,
    extract::State,
    http::{HeaderMap, StatusCode},
    routing::post,
};
use serde_json::Value;
use uuid::Uuid;

use crate::{AppState, error::AppResult, orders, payments};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/webhooks/razorpay", post(razorpay))
        .route("/webhooks/stripe", post(stripe))
}

async fn already_processed(s: &AppState, provider: &str, event_id: &str) -> AppResult<bool> {
    Ok(sqlx::query_scalar(
        "SELECT EXISTS (SELECT 1 FROM webhook_events WHERE provider = $1::payment_provider AND event_id = $2)",
    )
    .bind(provider)
    .bind(event_id)
    .fetch_one(&s.db)
    .await?)
}

/// Recorded only after the event was handled, so a failed attempt is retried by the provider.
/// Concurrent duplicates are safe because `mark_paid` is idempotent.
async fn record_processed(s: &AppState, provider: &str, event_id: &str) -> AppResult<()> {
    sqlx::query("INSERT INTO webhook_events (provider, event_id) VALUES ($1::payment_provider, $2) ON CONFLICT DO NOTHING")
        .bind(provider)
        .bind(event_id)
        .execute(&s.db)
        .await?;
    Ok(())
}

fn header<'a>(h: &'a HeaderMap, name: &str) -> Option<&'a str> {
    h.get(name).and_then(|v| v.to_str().ok())
}

pub async fn razorpay(
    State(s): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> AppResult<StatusCode> {
    let Some(secret) = s.config.payments.razorpay_webhook_secret.as_deref() else {
        return Ok(StatusCode::SERVICE_UNAVAILABLE);
    };
    let Some(sig) = header(&headers, "x-razorpay-signature") else {
        return Ok(StatusCode::BAD_REQUEST);
    };
    if !payments::razorpay_verify_webhook(secret, &body, sig) {
        tracing::warn!("razorpay webhook with bad signature");
        return Ok(StatusCode::BAD_REQUEST);
    }
    let event: Value = serde_json::from_slice(&body).map_err(anyhow::Error::from)?;
    let event_id = header(&headers, "x-razorpay-event-id")
        .unwrap_or_default()
        .to_owned();
    if !event_id.is_empty() && already_processed(&s, "razorpay", &event_id).await? {
        return Ok(StatusCode::OK);
    }

    if matches!(
        event["event"].as_str(),
        Some("payment.captured" | "order.paid")
    ) {
        let payment = &event["payload"]["payment"]["entity"];
        let (Some(rzp_order), Some(payment_id), Some(amount)) = (
            payment["order_id"].as_str(),
            payment["id"].as_str(),
            payment["amount"].as_i64(),
        ) else {
            return Ok(StatusCode::OK);
        };
        let row: Option<(Uuid, i64)> =
            sqlx::query_as("SELECT order_id, amount_minor FROM payments WHERE provider = 'razorpay' AND provider_order_id = $1")
                .bind(rzp_order)
                .fetch_optional(&s.db)
                .await?;
        match row {
            Some((order_id, expected)) if expected == amount => {
                orders::mark_paid(&s, order_id, Some(payment_id)).await?;
            }
            Some((_, expected)) => tracing::error!(
                rzp_order,
                expected,
                amount,
                "razorpay amount mismatch; not marking paid"
            ),
            None => tracing::warn!(rzp_order, "razorpay webhook for unknown order"),
        }
    }
    if !event_id.is_empty() {
        record_processed(&s, "razorpay", &event_id).await?;
    }
    Ok(StatusCode::OK)
}

pub async fn stripe(
    State(s): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> AppResult<StatusCode> {
    let Some(secret) = s.config.payments.stripe_webhook_secret.as_deref() else {
        return Ok(StatusCode::SERVICE_UNAVAILABLE);
    };
    let Some(sig) = header(&headers, "stripe-signature") else {
        return Ok(StatusCode::BAD_REQUEST);
    };
    let now = time::OffsetDateTime::now_utc().unix_timestamp();
    if !payments::stripe_verify_webhook(secret, &body, sig, now) {
        tracing::warn!("stripe webhook with bad signature");
        return Ok(StatusCode::BAD_REQUEST);
    }
    let event: Value = serde_json::from_slice(&body).map_err(anyhow::Error::from)?;
    let Some(event_id) = event["id"].as_str() else {
        return Ok(StatusCode::BAD_REQUEST);
    };
    if already_processed(&s, "stripe", event_id).await? {
        return Ok(StatusCode::OK);
    }

    if event["type"] == "checkout.session.completed"
        || event["type"] == "checkout.session.async_payment_succeeded"
    {
        let session = &event["data"]["object"];
        if session["payment_status"] != "paid" {
            return Ok(StatusCode::OK);
        }
        let Some(session_id) = session["id"].as_str() else {
            return Ok(StatusCode::OK);
        };
        let row: Option<(Uuid, i64)> =
            sqlx::query_as("SELECT order_id, amount_minor FROM payments WHERE provider = 'stripe' AND provider_order_id = $1")
                .bind(session_id)
                .fetch_optional(&s.db)
                .await?;
        let amount = session["amount_total"].as_i64().unwrap_or(-1);
        match row {
            Some((order_id, expected)) if expected == amount => {
                orders::mark_paid(&s, order_id, session["payment_intent"].as_str()).await?;
            }
            Some((_, expected)) => tracing::error!(
                session_id,
                expected,
                amount,
                "stripe amount mismatch; not marking paid"
            ),
            None => tracing::warn!(session_id, "stripe webhook for unknown session"),
        }
    }
    record_processed(&s, "stripe", event_id).await?;
    Ok(StatusCode::OK)
}
