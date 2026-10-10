//! Transactional email through Resend's REST API. Without an API key, emails are logged.

use crate::{config::EmailConfig, models::Money};

pub struct OrderEmail {
    pub to: String,
    pub order_number: i64,
    pub lines: Vec<(String, String, i32)>,
    pub total: Money,
    pub order_url: String,
}

fn escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn money(m: &Money) -> String {
    format!("{:?} {:.2}", m.currency, m.amount_minor as f64 / 100.0)
}

pub async fn send_order_confirmation(cfg: &EmailConfig, http: &reqwest::Client, email: OrderEmail) {
    let rows: String = email
        .lines
        .iter()
        .map(|(name, size, qty)| format!("<li>{} ({}) × {}</li>", escape(name), escape(size), qty))
        .collect();
    let html = format!(
        r#"<div style="font-family:Georgia,serif;color:#1f2420;max-width:520px">
<h1 style="font-weight:normal">Thank you. Order HSK-{n} is confirmed.</h1>
<p>We're preparing your pieces in Kochi. You'll get another email with tracking when it ships.</p>
<ul>{rows}</ul>
<p><strong>Total: {total}</strong></p>
<p><a href="{url}" style="color:#2b4a35">View your order</a></p>
<p style="color:#5f645c">Haseki · Made in Kochi · Shipping worldwide</p></div>"#,
        n = email.order_number,
        total = money(&email.total),
        url = escape(&email.order_url),
    );
    let subject = format!("Your Haseki order HSK-{}", email.order_number);

    let Some(key) = &cfg.resend_api_key else {
        tracing::info!(to = %email.to, %subject, "email not sent (RESEND_API_KEY unset)");
        return;
    };
    let result = http
        .post("https://api.resend.com/emails")
        .bearer_auth(key)
        .json(&serde_json::json!({ "from": cfg.from, "to": [email.to], "subject": subject, "html": html }))
        .send()
        .await;
    match result {
        Ok(r) if r.status().is_success() => {
            tracing::info!(order = email.order_number, "confirmation email sent")
        }
        Ok(r) => tracing::error!(status = %r.status(), "resend rejected email"),
        Err(e) => tracing::error!(error = %e, "resend request failed"),
    }
}
