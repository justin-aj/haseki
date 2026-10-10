use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{get, post},
};
use axum_extra::extract::CookieJar;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    AppState,
    auth::CurrentUser,
    config::PaymentsMode,
    error::{AppError, AppResult},
    models::Currency,
    orders, payments,
    routes::{cart, forms::valid_email},
    shipping,
};

const RESERVATION_MINUTES: i32 = 30;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/checkout", post(start_checkout))
        .route("/checkout/razorpay/verify", post(verify_razorpay))
        .route("/orders/{id}", get(get_order))
}

#[derive(Deserialize, Serialize, ToSchema, Clone)]
pub struct Address {
    pub name: String,
    pub line1: String,
    #[serde(default)]
    pub line2: String,
    pub city: String,
    #[serde(default)]
    pub region: String,
    pub postal_code: String,
    /// ISO 3166-1 alpha-2.
    pub country: String,
    pub phone: String,
}

#[derive(Deserialize, ToSchema)]
pub struct CheckoutInput {
    pub email: String,
    pub currency: Currency,
    pub address: Address,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum Provider {
    Razorpay,
    Stripe,
    Mock,
}

#[derive(Serialize, ToSchema)]
pub struct RazorpayCheckout {
    pub key_id: String,
    pub razorpay_order_id: String,
    pub amount_minor: i64,
    pub currency: Currency,
}

#[derive(Serialize, ToSchema)]
pub struct CheckoutResponse {
    pub order_id: Uuid,
    pub order_number: i64,
    pub provider: Provider,
    /// Present for Razorpay: open Checkout.js with these values.
    pub razorpay: Option<RazorpayCheckout>,
    /// Present for Stripe and mock: send the browser here.
    pub redirect_url: Option<String>,
}

#[derive(Deserialize, ToSchema)]
pub struct RazorpayVerifyInput {
    pub razorpay_order_id: String,
    pub razorpay_payment_id: String,
    pub razorpay_signature: String,
}

#[derive(Serialize, ToSchema)]
pub struct VerifyResponse {
    pub order_id: Uuid,
}

#[derive(Serialize, ToSchema, sqlx::FromRow)]
pub struct OrderLine {
    pub product_name: String,
    pub size: String,
    pub quantity: i32,
    pub unit_price_minor: i64,
}

#[derive(Serialize, ToSchema)]
pub struct OrderSummary {
    pub number: i64,
    pub status: String,
    pub email_masked: String,
    pub currency: Currency,
    pub subtotal_minor: i64,
    pub shipping_minor: i64,
    pub total_minor: i64,
    pub ddp: bool,
    pub items: Vec<OrderLine>,
}

fn validate(input: &CheckoutInput) -> AppResult<()> {
    let a = &input.address;
    let required = [
        ("name", &a.name),
        ("address", &a.line1),
        ("city", &a.city),
        ("postal code", &a.postal_code),
        ("phone", &a.phone),
    ];
    for (label, v) in required {
        if v.trim().is_empty() || v.len() > 200 {
            return Err(AppError::BadRequest(format!("enter your {label}")));
        }
    }
    if !valid_email(&input.email) {
        return Err(AppError::BadRequest("enter a valid email".into()));
    }
    if a.country.trim().len() != 2 || !a.country.chars().all(|c| c.is_ascii_alphabetic()) {
        return Err(AppError::BadRequest("choose a country".into()));
    }
    Ok(())
}

fn mask_email(email: &str) -> String {
    match email.split_once('@') {
        Some((local, domain)) => {
            let first: String = local.chars().take(1).collect();
            format!("{first}•••@{domain}")
        }
        None => "•••".into(),
    }
}

#[utoipa::path(post, path = "/checkout", tag = "checkout", request_body = CheckoutInput,
    responses((status = 200, body = CheckoutResponse), (status = 400, body = crate::error::ErrorBody),
              (status = 503, body = crate::error::ErrorBody)))]
pub async fn start_checkout(
    State(s): State<AppState>,
    CurrentUser(user): CurrentUser,
    jar: CookieJar,
    Json(input): Json<CheckoutInput>,
) -> AppResult<Json<CheckoutResponse>> {
    validate(&input)?;
    let pay = &s.config.payments;
    let mock = pay.mode == PaymentsMode::Mock;
    let configured = match input.currency {
        Currency::INR => pay.razorpay_key_id.is_some() && pay.razorpay_key_secret.is_some(),
        _ => pay.stripe_secret_key.is_some(),
    };
    if !mock && !configured {
        return Err(AppError::Unavailable(
            "payments are not configured yet".into(),
        ));
    }

    let mut tx = s.db.begin().await?;
    let cart_id = cart::cart_id(&mut *tx, &jar)
        .await?
        .ok_or(AppError::BadRequest("your bag is empty".into()))?;
    // A retry replaces any hold from an earlier unfinished checkout of this bag.
    sqlx::query(
        "DELETE FROM stock_reservations WHERE order_id IN (SELECT id FROM orders WHERE cart_id = $1 AND status = 'pending')",
    )
    .bind(cart_id)
    .execute(&mut *tx)
    .await?;
    // Lock the variants so concurrent checkouts can't both take the last unit.
    sqlx::query("SELECT 1 FROM variants WHERE id IN (SELECT variant_id FROM cart_items WHERE cart_id = $1) FOR UPDATE")
        .bind(cart_id)
        .execute(&mut *tx)
        .await?;
    let bag = cart::load_cart(&mut *tx, Some(cart_id), input.currency).await?;
    if bag.items.is_empty() {
        return Err(AppError::BadRequest("your bag is empty".into()));
    }
    for line in &bag.items {
        let wanted: i64 = bag
            .items
            .iter()
            .filter(|l| l.variant_id == line.variant_id)
            .map(|l| l.quantity as i64)
            .sum();
        if wanted > line.available {
            return Err(AppError::BadRequest(format!(
                "{} in {} has only {} left. Update your bag to continue.",
                line.product_name, line.size, line.available
            )));
        }
    }

    let quote = shipping::quote(
        &mut *tx,
        &input.address.country,
        bag.weight_g.max(1),
        input.currency,
    )
    .await?;
    let mut address = input.address.clone();
    address.country = address.country.trim().to_ascii_uppercase();
    let total = bag.subtotal_minor + quote.amount_minor;

    let (order_id, number): (Uuid, i64) = sqlx::query_as(
        r#"INSERT INTO orders (cart_id, email, currency, subtotal_minor, shipping_minor, total_minor, ddp, shipping_address, customer_id)
           VALUES ($1, lower($2), $3, $4, $5, $6, false, $7, $8) RETURNING id, number"#,
    )
    .bind(cart_id)
    .bind(input.email.trim())
    .bind(input.currency)
    .bind(bag.subtotal_minor)
    .bind(quote.amount_minor)
    .bind(total)
    .bind(sqlx::types::Json(&address))
    .bind(user.map(|u| u.id))
    .fetch_one(&mut *tx)
    .await?;
    for l in &bag.items {
        sqlx::query(
            r#"INSERT INTO order_items (order_id, variant_id, product_name, sku, size, unit_price_minor, quantity, measurements)
               SELECT $1, v.id, $3, v.sku, v.size, $4, $5, $6 FROM variants v WHERE v.id = $2"#,
        )
        .bind(order_id)
        .bind(l.variant_id)
        .bind(&l.product_name)
        .bind(l.unit_price_minor)
        .bind(l.quantity)
        .bind(&l.measurements)
        .execute(&mut *tx)
        .await?;
        sqlx::query(
            "INSERT INTO stock_reservations (variant_id, order_id, quantity, expires_at) VALUES ($1, $2, $3, now() + make_interval(mins => $4))",
        )
        .bind(l.variant_id)
        .bind(order_id)
        .bind(l.quantity)
        .bind(RESERVATION_MINUTES)
        .execute(&mut *tx)
        .await?;
    }
    sqlx::query("UPDATE carts SET currency = $2, updated_at = now() WHERE id = $1")
        .bind(cart_id)
        .bind(input.currency)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;

    let success_url = format!("{}/checkout/success?order={order_id}", s.config.site_url);

    if mock {
        orders::mark_paid(&s, order_id, Some("mock")).await?;
        return Ok(Json(CheckoutResponse {
            order_id,
            order_number: number,
            provider: Provider::Mock,
            razorpay: None,
            redirect_url: Some(success_url),
        }));
    }

    let result = if input.currency == Currency::INR {
        let key_id = pay.razorpay_key_id.clone().unwrap_or_default();
        let secret = pay.razorpay_key_secret.clone().unwrap_or_default();
        payments::razorpay_create_order(&s.http, &key_id, &secret, total, number, order_id)
            .await
            .map(|o| {
                (
                    o.id.clone(),
                    Some(RazorpayCheckout {
                        key_id,
                        razorpay_order_id: o.id,
                        amount_minor: total,
                        currency: Currency::INR,
                    }),
                    None,
                )
            })
    } else {
        let mut lines: Vec<payments::StripeLine> = bag
            .items
            .iter()
            .map(|l| payments::StripeLine {
                name: format!("{} ({})", l.product_name, l.size),
                unit_amount_minor: l.unit_price_minor,
                quantity: l.quantity,
            })
            .collect();
        lines.push(payments::StripeLine {
            name: format!("Shipping to {}", quote.zone_name),
            unit_amount_minor: quote.amount_minor,
            quantity: 1,
        });
        let cancel_url = format!("{}/checkout?cancelled=1", s.config.site_url);
        payments::stripe_create_session(
            &s.http,
            pay.stripe_secret_key.as_deref().unwrap_or_default(),
            payments::StripeSessionRequest {
                currency: input.currency,
                lines: &lines,
                email: input.email.trim(),
                order_id,
                success_url: &success_url,
                cancel_url: &cancel_url,
            },
        )
        .await
        .map(|sess| (sess.id, None, Some(sess.url)))
    };

    let (provider_order_id, razorpay, redirect_url) = match result {
        Ok(v) => v,
        Err(e) => {
            tracing::error!(error = %e, order = number, "payment provider error");
            sqlx::query("DELETE FROM stock_reservations WHERE order_id = $1")
                .bind(order_id)
                .execute(&s.db)
                .await?;
            sqlx::query("UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = $1")
                .bind(order_id)
                .execute(&s.db)
                .await?;
            return Err(AppError::Unavailable(
                "we couldn't reach the payment provider. Please try again.".into(),
            ));
        }
    };
    let provider = if razorpay.is_some() {
        Provider::Razorpay
    } else {
        Provider::Stripe
    };
    sqlx::query(
        "INSERT INTO payments (order_id, provider, provider_order_id, amount_minor, currency) VALUES ($1, $2::payment_provider, $3, $4, $5)",
    )
    .bind(order_id)
    .bind(if razorpay.is_some() { "razorpay" } else { "stripe" })
    .bind(&provider_order_id)
    .bind(total)
    .bind(input.currency)
    .execute(&s.db)
    .await?;

    Ok(Json(CheckoutResponse {
        order_id,
        order_number: number,
        provider,
        razorpay,
        redirect_url,
    }))
}

#[utoipa::path(post, path = "/checkout/razorpay/verify", tag = "checkout", request_body = RazorpayVerifyInput,
    responses((status = 200, body = VerifyResponse), (status = 400, body = crate::error::ErrorBody)))]
pub async fn verify_razorpay(
    State(s): State<AppState>,
    Json(input): Json<RazorpayVerifyInput>,
) -> AppResult<Json<VerifyResponse>> {
    let secret = s
        .config
        .payments
        .razorpay_key_secret
        .as_deref()
        .ok_or(AppError::Unavailable("payments are not configured".into()))?;
    if !payments::razorpay_verify_payment(
        secret,
        &input.razorpay_order_id,
        &input.razorpay_payment_id,
        &input.razorpay_signature,
    ) {
        return Err(AppError::BadRequest("payment could not be verified".into()));
    }
    let order_id: Uuid = sqlx::query_scalar(
        "SELECT order_id FROM payments WHERE provider = 'razorpay' AND provider_order_id = $1",
    )
    .bind(&input.razorpay_order_id)
    .fetch_optional(&s.db)
    .await?
    .ok_or(AppError::NotFound)?;
    // A valid handler signature can arrive while the payment is only authorized, so this
    // records the payment id but never marks the order paid. The `payment.captured` webhook
    // does that; the success page polls until it lands.
    sqlx::query(
        "UPDATE payments SET provider_payment_id = $2, status = 'authorized', updated_at = now() WHERE provider = 'razorpay' AND provider_order_id = $1 AND status = 'created'",
    )
    .bind(&input.razorpay_order_id)
    .bind(&input.razorpay_payment_id)
    .execute(&s.db)
    .await?;
    Ok(Json(VerifyResponse { order_id }))
}

#[utoipa::path(get, path = "/orders/{id}", tag = "checkout", params(("id" = Uuid, Path)),
    responses((status = 200, body = OrderSummary), (status = 404)))]
pub async fn get_order(
    State(s): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<OrderSummary>> {
    #[derive(sqlx::FromRow)]
    struct Row {
        number: i64,
        status: String,
        email: String,
        currency: Currency,
        subtotal_minor: i64,
        shipping_minor: i64,
        total_minor: i64,
        ddp: bool,
    }
    let o = sqlx::query_as::<_, Row>(
        "SELECT number, status::text AS status, email, currency, subtotal_minor, shipping_minor, total_minor, ddp FROM orders WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&s.db)
    .await?
    .ok_or(AppError::NotFound)?;
    let items = sqlx::query_as::<_, OrderLine>(
        "SELECT product_name, size, quantity, unit_price_minor FROM order_items WHERE order_id = $1",
    )
    .bind(id)
    .fetch_all(&s.db)
    .await?;
    Ok(Json(OrderSummary {
        number: o.number,
        status: o.status,
        email_masked: mask_email(&o.email),
        currency: o.currency,
        subtotal_minor: o.subtotal_minor,
        shipping_minor: o.shipping_minor,
        total_minor: o.total_minor,
        ddp: o.ddp,
        items,
    }))
}
