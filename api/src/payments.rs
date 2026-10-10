//! Razorpay (INR) and Stripe (USD, GBP, AED) over their REST APIs. Neither ships an official
//! Rust SDK, so we call the endpoints directly and verify every signature ourselves.
//! Card details never reach this server: both providers host the payment step.

use anyhow::{Context, anyhow};
use hmac::{Hmac, KeyInit, Mac};
use serde::Deserialize;
use sha2::Sha256;
use uuid::Uuid;

use crate::models::Currency;

type HmacSha256 = Hmac<Sha256>;

/// Constant-time check of a hex-encoded HMAC-SHA256 signature.
pub fn verify_hmac_hex(secret: &str, message: &[u8], signature_hex: &str) -> bool {
    let Ok(sig) = hex::decode(signature_hex.trim()) else {
        return false;
    };
    let Ok(mut mac) = HmacSha256::new_from_slice(secret.as_bytes()) else {
        return false;
    };
    mac.update(message);
    mac.verify_slice(&sig).is_ok()
}

#[cfg(test)]
pub fn sign_hex(secret: &str, message: &[u8]) -> String {
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
    mac.update(message);
    hex::encode(mac.finalize().into_bytes())
}

// ---------------------------------------------------------------- Razorpay

pub struct RazorpayOrder {
    pub id: String,
}

pub async fn razorpay_create_order(
    http: &reqwest::Client,
    key_id: &str,
    key_secret: &str,
    amount_minor: i64,
    order_number: i64,
    order_id: Uuid,
) -> anyhow::Result<RazorpayOrder> {
    #[derive(Deserialize)]
    struct Resp {
        id: String,
    }
    let resp = http
        .post("https://api.razorpay.com/v1/orders")
        .basic_auth(key_id, Some(key_secret))
        .json(&serde_json::json!({
            "amount": amount_minor,
            "currency": "INR",
            "receipt": format!("HSK-{order_number}"),
            "notes": { "order_id": order_id.to_string() },
        }))
        .send()
        .await
        .context("razorpay request failed")?;
    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(anyhow!("razorpay create order failed: {status} {body}"));
    }
    let r: Resp = resp.json().await.context("razorpay response")?;
    Ok(RazorpayOrder { id: r.id })
}

/// Checkout.js handler signature: HMAC(key_secret, "{order_id}|{payment_id}").
pub fn razorpay_verify_payment(
    key_secret: &str,
    order_id: &str,
    payment_id: &str,
    signature: &str,
) -> bool {
    verify_hmac_hex(
        key_secret,
        format!("{order_id}|{payment_id}").as_bytes(),
        signature,
    )
}

/// Webhook signature: HMAC(webhook_secret, raw body) in `X-Razorpay-Signature`.
pub fn razorpay_verify_webhook(webhook_secret: &str, body: &[u8], signature: &str) -> bool {
    verify_hmac_hex(webhook_secret, body, signature)
}

// ---------------------------------------------------------------- Stripe

pub struct StripeLine {
    pub name: String,
    pub unit_amount_minor: i64,
    pub quantity: i32,
}

pub struct StripeSession {
    pub id: String,
    pub url: String,
}

pub struct StripeSessionRequest<'a> {
    pub currency: Currency,
    pub lines: &'a [StripeLine],
    pub email: &'a str,
    pub order_id: Uuid,
    pub success_url: &'a str,
    pub cancel_url: &'a str,
}

pub async fn stripe_create_session(
    http: &reqwest::Client,
    secret_key: &str,
    req: StripeSessionRequest<'_>,
) -> anyhow::Result<StripeSession> {
    let StripeSessionRequest {
        currency,
        lines,
        email,
        order_id,
        success_url,
        cancel_url,
    } = req;
    #[derive(Deserialize)]
    struct Resp {
        id: String,
        url: String,
    }
    let cur = format!("{currency:?}").to_lowercase();
    let mut form: Vec<(String, String)> = vec![
        ("mode".into(), "payment".into()),
        ("success_url".into(), success_url.into()),
        ("cancel_url".into(), cancel_url.into()),
        ("customer_email".into(), email.into()),
        ("client_reference_id".into(), order_id.to_string()),
        ("metadata[order_id]".into(), order_id.to_string()),
        (
            "payment_intent_data[metadata][order_id]".into(),
            order_id.to_string(),
        ),
    ];
    for (i, l) in lines.iter().enumerate() {
        form.push((format!("line_items[{i}][quantity]"), l.quantity.to_string()));
        form.push((
            format!("line_items[{i}][price_data][currency]"),
            cur.clone(),
        ));
        form.push((
            format!("line_items[{i}][price_data][unit_amount]"),
            l.unit_amount_minor.to_string(),
        ));
        form.push((
            format!("line_items[{i}][price_data][product_data][name]"),
            l.name.clone(),
        ));
    }
    let resp = http
        .post("https://api.stripe.com/v1/checkout/sessions")
        .bearer_auth(secret_key)
        .form(&form)
        .send()
        .await
        .context("stripe request failed")?;
    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(anyhow!("stripe create session failed: {status} {body}"));
    }
    let r: Resp = resp.json().await.context("stripe response")?;
    Ok(StripeSession {
        id: r.id,
        url: r.url,
    })
}

/// Verifies `Stripe-Signature: t=...,v1=...` over "{t}.{body}", with a 5 minute tolerance.
pub fn stripe_verify_webhook(
    webhook_secret: &str,
    body: &[u8],
    header: &str,
    now_unix: i64,
) -> bool {
    let mut timestamp = None;
    let mut sigs = Vec::new();
    for part in header.split(',') {
        match part.trim().split_once('=') {
            Some(("t", v)) => timestamp = v.parse::<i64>().ok(),
            Some(("v1", v)) => sigs.push(v),
            _ => {}
        }
    }
    let Some(t) = timestamp else { return false };
    if (now_unix - t).abs() > 300 {
        return false;
    }
    let mut signed = format!("{t}.").into_bytes();
    signed.extend_from_slice(body);
    sigs.iter()
        .any(|s| verify_hmac_hex(webhook_secret, &signed, s))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn razorpay_payment_signature() {
        let sig = sign_hex("secret", b"order_1|pay_1");
        assert!(razorpay_verify_payment("secret", "order_1", "pay_1", &sig));
        assert!(!razorpay_verify_payment("secret", "order_1", "pay_2", &sig));
        assert!(!razorpay_verify_payment("other", "order_1", "pay_1", &sig));
        assert!(!razorpay_verify_payment(
            "secret", "order_1", "pay_1", "not-hex"
        ));
    }

    #[test]
    fn razorpay_webhook_signature() {
        let body = br#"{"event":"payment.captured"}"#;
        let sig = sign_hex("whsec", body);
        assert!(razorpay_verify_webhook("whsec", body, &sig));
        assert!(!razorpay_verify_webhook("whsec", b"{}", &sig));
    }

    #[test]
    fn stripe_webhook_signature() {
        let body = br#"{"id":"evt_1"}"#;
        let t = 1_800_000_000;
        let sig = sign_hex(
            "whsec_test",
            format!("{t}.{}", std::str::from_utf8(body).unwrap()).as_bytes(),
        );
        let header = format!("t={t},v1=deadbeef,v1={sig}");
        assert!(stripe_verify_webhook("whsec_test", body, &header, t + 10));
        // Replayed outside the tolerance window.
        assert!(!stripe_verify_webhook("whsec_test", body, &header, t + 301));
        // Tampered body.
        assert!(!stripe_verify_webhook("whsec_test", b"{}", &header, t));
        assert!(!stripe_verify_webhook("whsec_test", body, "v1=abc", t));
    }
}
