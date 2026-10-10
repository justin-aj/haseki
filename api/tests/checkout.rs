//! End-to-end cart and checkout against a throwaway Postgres database (`#[sqlx::test]`).
//! Requires DATABASE_URL pointing at a server where the user can create databases.

use std::sync::Arc;

use axum::{
    Router,
    body::Body,
    http::{Request, StatusCode, header},
};
use haseki_api::{
    AppState, app,
    config::{Config, EmailConfig, PaymentsConfig, PaymentsMode},
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use sqlx::{AssertSqlSafe, PgPool};
use tower::ServiceExt;

fn state(db: PgPool) -> AppState {
    AppState {
        db,
        config: Arc::new(Config {
            database_url: String::new(),
            bind_addr: String::new(),
            site_url: "http://localhost:3000".into(),
            secure_cookies: false,
            payments: PaymentsConfig {
                mode: PaymentsMode::Mock,
                razorpay_key_id: None,
                razorpay_key_secret: None,
                razorpay_webhook_secret: None,
                stripe_secret_key: None,
                stripe_webhook_secret: None,
            },
            email: EmailConfig {
                resend_api_key: None,
                from: "test@haseki.in".into(),
            },
            revalidate_secret: None,
        }),
        http: reqwest::Client::new(),
        login_limiter: Default::default(),
    }
}

async fn seeded(db: &PgPool) {
    sqlx::raw_sql(AssertSqlSafe(include_str!("../seed/seed.sql")))
        .execute(db)
        .await
        .unwrap();
}

async fn call(
    app: &Router,
    method: &str,
    uri: &str,
    cookie: Option<&str>,
    body: Option<Value>,
) -> (StatusCode, Option<String>, Value) {
    let mut req = Request::builder().method(method).uri(uri);
    if let Some(c) = cookie {
        req = req.header(header::COOKIE, c);
    }
    let req = match body {
        Some(b) => req
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(b.to_string())),
        None => req.body(Body::empty()),
    }
    .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    let status = res.status();
    let set_cookie = res
        .headers()
        .get(header::SET_COOKIE)
        .and_then(|v| v.to_str().ok())
        .map(|v| v.split(';').next().unwrap().to_owned());
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    let json = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, set_cookie, json)
}

async fn variant(db: &PgPool, slug: &str, size: &str) -> (String, i32) {
    let (id, stock): (uuid::Uuid, i32) = sqlx::query_as(
        "SELECT v.id, v.stock FROM variants v JOIN products p ON p.id = v.product_id WHERE p.slug = $1 AND v.size = $2",
    )
    .bind(slug)
    .bind(size)
    .fetch_one(db)
    .await
    .unwrap();
    (id.to_string(), stock)
}

fn address(country: &str) -> Value {
    json!({ "name": "Anjali Menon", "line1": "12 Rose Street", "city": "Kochi", "postal_code": "682036",
            "country": country, "phone": "+919800000000" })
}

#[sqlx::test]
async fn cart_and_mock_checkout(db: PgPool) {
    seeded(&db).await;
    let app = app(state(db.clone()));
    let (variant_id, stock_before) = variant(&db, "the-wrap", "M").await;

    // Empty cart without a cookie.
    let (status, _, cart) = call(&app, "GET", "/cart", None, None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(cart["item_count"], 0);

    // Adding creates the cart and sets the cookie; repeated adds merge.
    let (status, cookie, cart) = call(
        &app,
        "POST",
        "/cart/items",
        None,
        Some(json!({ "variant_id": variant_id, "currency": "INR" })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{cart}");
    let cookie = cookie.expect("cart cookie");
    assert!(cookie.starts_with("hsk_cart="));
    let (_, _, cart) = call(
        &app,
        "POST",
        "/cart/items",
        Some(&cookie),
        Some(json!({ "variant_id": variant_id, "quantity": 1 })),
    )
    .await;
    assert_eq!(cart["items"].as_array().unwrap().len(), 1);
    assert_eq!(cart["item_count"], 2);
    assert_eq!(cart["subtotal_minor"], 2 * 249_900);

    // Prices follow the requested market.
    let (_, _, gbp) = call(&app, "GET", "/cart?currency=GBP", Some(&cookie), None).await;
    assert_eq!(gbp["subtotal_minor"], 2 * 4_200);

    // Can't add more than stock.
    let (status, _, err) = call(
        &app,
        "POST",
        "/cart/items",
        Some(&cookie),
        Some(json!({ "variant_id": variant_id, "quantity": 10 })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST, "{err}");

    // Shipping: India zone, INR rate for ≤1kg (2 × 220g).
    let (status, _, quote) = call(
        &app,
        "GET",
        "/cart/shipping?country=IN&currency=INR",
        Some(&cookie),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{quote}");
    assert_eq!(quote["zone_code"], "IN");
    assert_eq!(quote["amount_minor"], 9_900);
    assert_eq!(quote["duties_on_delivery"], false);
    let (_, _, intl) = call(
        &app,
        "GET",
        "/cart/shipping?country=AE&currency=AED",
        Some(&cookie),
        None,
    )
    .await;
    assert_eq!(intl["zone_code"], "GCC");
    assert_eq!(intl["duties_on_delivery"], true);
    let (_, _, row) = call(
        &app,
        "GET",
        "/cart/shipping?country=BR&currency=USD",
        Some(&cookie),
        None,
    )
    .await;
    assert_eq!(row["zone_code"], "ROW");

    // Validation.
    let (status, _, _) = call(
        &app,
        "POST",
        "/checkout",
        Some(&cookie),
        Some(json!({ "email": "nope", "currency": "INR", "address": address("IN") })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);

    // Mock checkout marks the order paid, decrements stock and empties the bag.
    let (status, _, res) = call(
        &app,
        "POST",
        "/checkout",
        Some(&cookie),
        Some(json!({ "email": "Anjali@Example.com", "currency": "INR", "address": address("in") })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{res}");
    assert_eq!(res["provider"], "mock");
    let order_id = res["order_id"].as_str().unwrap().to_owned();

    let (_, stock_after) = variant(&db, "the-wrap", "M").await;
    assert_eq!(stock_after, stock_before - 2);
    let (_, _, cart) = call(&app, "GET", "/cart", Some(&cookie), None).await;
    assert_eq!(cart["item_count"], 0);
    let held: i64 = sqlx::query_scalar("SELECT count(*) FROM stock_reservations")
        .fetch_one(&db)
        .await
        .unwrap();
    assert_eq!(held, 0);

    let (status, _, order) = call(&app, "GET", &format!("/orders/{order_id}"), None, None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(order["status"], "paid");
    assert_eq!(order["total_minor"], 2 * 249_900 + 9_900);
    assert_eq!(order["email_masked"], "a•••@example.com");

    // Paying twice is a no-op.
    let again = haseki_api::orders::mark_paid(&state(db.clone()), order_id.parse().unwrap(), None)
        .await
        .unwrap();
    assert!(!again);
    let (_, stock_final) = variant(&db, "the-wrap", "M").await;
    assert_eq!(stock_final, stock_after);

    // Checking out an empty bag fails.
    let (status, _, _) = call(
        &app,
        "POST",
        "/checkout",
        Some(&cookie),
        Some(json!({ "email": "a@example.com", "currency": "INR", "address": address("IN") })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[sqlx::test]
async fn reservations_block_other_shoppers(db: PgPool) {
    seeded(&db).await;
    // Leave exactly one unit.
    let (variant_id, _) = variant(&db, "the-peplum", "S").await;
    sqlx::query("UPDATE variants SET stock = 1 WHERE id = $1::uuid")
        .bind(&variant_id)
        .execute(&db)
        .await
        .unwrap();

    // Real-provider mode without keys: checkout refuses before touching stock.
    let mut st = state(db.clone());
    Arc::get_mut(&mut st.config).unwrap().payments.mode = PaymentsMode::Providers;
    let strict = app(st);
    let (_, a, _) = call(
        &strict,
        "POST",
        "/cart/items",
        None,
        Some(json!({ "variant_id": variant_id })),
    )
    .await;
    let a = a.unwrap();
    let (status, _, _) = call(
        &strict,
        "POST",
        "/checkout",
        Some(&a),
        Some(json!({ "email": "a@example.com", "currency": "INR", "address": address("IN") })),
    )
    .await;
    assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE);

    // Simulate shopper A holding the last unit mid-payment.
    let order: uuid::Uuid = sqlx::query_scalar(
        "INSERT INTO orders (email, currency, subtotal_minor, shipping_minor, total_minor, shipping_address) VALUES ('a@example.com', 'INR', 1, 0, 1, '{}') RETURNING id",
    )
    .fetch_one(&db)
    .await
    .unwrap();
    sqlx::query("INSERT INTO stock_reservations (variant_id, order_id, quantity, expires_at) VALUES ($1::uuid, $2, 1, now() + interval '30 minutes')")
        .bind(&variant_id)
        .bind(order)
        .execute(&db)
        .await
        .unwrap();

    // Shopper B can't add it.
    let app = app(state(db.clone()));
    let (status, _, err) = call(
        &app,
        "POST",
        "/cart/items",
        None,
        Some(json!({ "variant_id": variant_id })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert!(err["error"].as_str().unwrap().contains("sold out"));

    // Once the hold expires, it's available again.
    sqlx::query("UPDATE stock_reservations SET expires_at = now() - interval '1 minute'")
        .execute(&db)
        .await
        .unwrap();
    let (status, _, _) = call(
        &app,
        "POST",
        "/cart/items",
        None,
        Some(json!({ "variant_id": variant_id })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}

fn stripe_signature(secret: &str, t: i64, body: &str) -> String {
    use hmac::{Hmac, KeyInit, Mac};
    let mut mac = Hmac::<sha2::Sha256>::new_from_slice(secret.as_bytes()).unwrap();
    mac.update(format!("{t}.{body}").as_bytes());
    format!("t={t},v1={}", hex::encode(mac.finalize().into_bytes()))
}

#[sqlx::test]
async fn stripe_webhook_marks_paid_once(db: PgPool) {
    seeded(&db).await;
    let (variant_id, stock_before) = variant(&db, "the-wrap", "S").await;
    let order: uuid::Uuid = sqlx::query_scalar(
        "INSERT INTO orders (email, currency, subtotal_minor, shipping_minor, total_minor, shipping_address) VALUES ('b@example.com', 'USD', 5200, 2600, 7800, '{}') RETURNING id",
    )
    .fetch_one(&db)
    .await
    .unwrap();
    sqlx::query("INSERT INTO order_items (order_id, variant_id, product_name, sku, size, unit_price_minor, quantity) SELECT $1, id, 'The Wrap', sku, size, 5200, 1 FROM variants WHERE id = $2::uuid")
        .bind(order).bind(&variant_id).execute(&db).await.unwrap();
    sqlx::query("INSERT INTO payments (order_id, provider, provider_order_id, amount_minor, currency) VALUES ($1, 'stripe', 'cs_test_1', 7800, 'USD')")
        .bind(order).execute(&db).await.unwrap();

    let mut st = state(db.clone());
    {
        let cfg = Arc::get_mut(&mut st.config).unwrap();
        cfg.payments.mode = PaymentsMode::Providers;
        cfg.payments.stripe_webhook_secret = Some("whsec_test".into());
    }
    let app = app(st);
    let body = json!({ "id": "evt_1", "type": "checkout.session.completed",
        "data": { "object": { "id": "cs_test_1", "payment_status": "paid", "amount_total": 7800, "payment_intent": "pi_1" } } })
        .to_string();
    let send = |sig: String| {
        let app = app.clone();
        let body = body.clone();
        async move {
            app.oneshot(
                Request::post("/webhooks/stripe")
                    .header("stripe-signature", sig)
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap()
            .status()
        }
    };
    let now = time::OffsetDateTime::now_utc().unix_timestamp();

    // A forged signature is rejected and changes nothing.
    assert_eq!(
        send(stripe_signature("wrong", now, &body)).await,
        StatusCode::BAD_REQUEST
    );
    let status: String = sqlx::query_scalar("SELECT status::text FROM orders WHERE id = $1")
        .bind(order)
        .fetch_one(&db)
        .await
        .unwrap();
    assert_eq!(status, "pending");

    assert_eq!(
        send(stripe_signature("whsec_test", now, &body)).await,
        StatusCode::OK
    );
    let status: String = sqlx::query_scalar("SELECT status::text FROM orders WHERE id = $1")
        .bind(order)
        .fetch_one(&db)
        .await
        .unwrap();
    assert_eq!(status, "paid");
    let (_, stock_after) = variant(&db, "the-wrap", "S").await;
    assert_eq!(stock_after, stock_before - 1);

    // Provider retry of the same event: acknowledged, no second decrement.
    assert_eq!(
        send(stripe_signature("whsec_test", now, &body)).await,
        StatusCode::OK
    );
    let (_, stock_final) = variant(&db, "the-wrap", "S").await;
    assert_eq!(stock_final, stock_after);
}

#[sqlx::test]
async fn own_checkout_hold_does_not_block_shopper(db: PgPool) {
    seeded(&db).await;
    let (variant_id, _) = variant(&db, "the-peplum", "M").await;
    sqlx::query("UPDATE variants SET stock = 1 WHERE id = $1::uuid")
        .bind(&variant_id)
        .execute(&db)
        .await
        .unwrap();
    let app = app(state(db.clone()));
    let (_, cookie, _) = call(
        &app,
        "POST",
        "/cart/items",
        None,
        Some(json!({ "variant_id": variant_id })),
    )
    .await;
    let cookie = cookie.unwrap();
    let token = cookie.trim_start_matches("hsk_cart=");
    let cart: uuid::Uuid = sqlx::query_scalar("SELECT id FROM carts WHERE token_hash = $1")
        .bind(haseki_api::token::hash(token))
        .fetch_one(&db)
        .await
        .unwrap();

    // This shopper started checkout (their order holds the last unit), then cancelled payment.
    let order: uuid::Uuid = sqlx::query_scalar(
        "INSERT INTO orders (cart_id, email, currency, subtotal_minor, shipping_minor, total_minor, shipping_address) VALUES ($1, 'a@example.com', 'INR', 1, 0, 1, '{}') RETURNING id",
    )
    .bind(cart).fetch_one(&db).await.unwrap();
    sqlx::query("INSERT INTO stock_reservations (variant_id, order_id, quantity, expires_at) VALUES ($1::uuid, $2, 1, now() + interval '30 minutes')")
        .bind(&variant_id).bind(order).execute(&db).await.unwrap();

    let (_, _, bag) = call(&app, "GET", "/cart", Some(&cookie), None).await;
    assert_eq!(
        bag["items"][0]["available"], 1,
        "own hold must not count against the shopper"
    );
    // Another shopper still sees it as held.
    let (status, _, _) = call(
        &app,
        "POST",
        "/cart/items",
        None,
        Some(json!({ "variant_id": variant_id })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    // And the original shopper can check out again.
    let (status, _, res) = call(
        &app,
        "POST",
        "/checkout",
        Some(&cookie),
        Some(json!({ "email": "a@example.com", "currency": "INR", "address": address("IN") })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{res}");
}

#[sqlx::test]
async fn accounts_and_admin_access(db: PgPool) {
    seeded(&db).await;
    let app = app(state(db.clone()));

    // Register signs in and sets an HttpOnly session cookie.
    let (status, cookie, me) = call(
        &app,
        "POST",
        "/auth/register",
        None,
        Some(json!({ "email": "Meera@Example.com", "name": "Meera Nair", "password": "short" })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST, "{me}");
    let (status, cookie2, me) = call(&app, "POST", "/auth/register", cookie.as_deref(),
        Some(json!({ "email": "Meera@Example.com", "name": "Meera Nair", "password": "a long enough password" }))).await;
    assert_eq!(status, StatusCode::OK, "{me}");
    assert_eq!(me["user"]["email"], "meera@example.com");
    assert_eq!(me["user"]["is_admin"], false);
    let session = cookie2.expect("session cookie");
    assert!(session.starts_with("hsk_session="));

    // Duplicate registration can't take over the account.
    let (status, _, _) = call(&app, "POST", "/auth/register", None,
        Some(json!({ "email": "meera@example.com", "name": "Someone", "password": "another long password" }))).await;
    assert_eq!(status, StatusCode::BAD_REQUEST);

    // Login: wrong password and unknown email look identical.
    let (s1, _, e1) = call(
        &app,
        "POST",
        "/auth/login",
        None,
        Some(json!({ "email": "meera@example.com", "password": "nope nope nope" })),
    )
    .await;
    let (s2, _, e2) = call(
        &app,
        "POST",
        "/auth/login",
        None,
        Some(json!({ "email": "ghost@example.com", "password": "nope nope nope" })),
    )
    .await;
    assert_eq!((s1, s2), (StatusCode::BAD_REQUEST, StatusCode::BAD_REQUEST));
    assert_eq!(e1, e2);
    let (status, _, _) = call(
        &app,
        "POST",
        "/auth/login",
        None,
        Some(json!({ "email": "MEERA@example.com", "password": "a long enough password" })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    // Admin routes: 401 signed out, 403 for customers.
    let (status, _, _) = call(&app, "GET", "/admin/orders", None, None).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    let (status, _, _) = call(&app, "GET", "/admin/orders", Some(&session), None).await;
    assert_eq!(status, StatusCode::FORBIDDEN);

    // Signed-in checkout links the order to the account.
    let (variant_id, _) = variant(&db, "the-perfect-shirt", "S").await;
    let (_, cart_cookie, _) = call(
        &app,
        "POST",
        "/cart/items",
        Some(&session),
        Some(json!({ "variant_id": variant_id })),
    )
    .await;
    let both = format!("{session}; {}", cart_cookie.unwrap());
    let (status, _, res) = call(
        &app,
        "POST",
        "/checkout",
        Some(&both),
        Some(json!({ "email": "meera@example.com", "currency": "INR", "address": address("IN") })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{res}");
    let order_id = res["order_id"].as_str().unwrap().to_owned();
    let (_, _, mine) = call(&app, "GET", "/account/orders", Some(&session), None).await;
    assert_eq!(mine.as_array().unwrap().len(), 1);

    // Promote to admin and manage the order.
    sqlx::query("UPDATE customers SET role = 'admin' WHERE email = 'meera@example.com'")
        .execute(&db)
        .await
        .unwrap();
    let (status, _, list) = call(
        &app,
        "GET",
        "/admin/orders?status=to_ship",
        Some(&session),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(list.as_array().unwrap().len(), 1);
    let uri = format!("/admin/orders/{order_id}/status");
    let (status, _, _) = call(
        &app,
        "POST",
        &uri,
        Some(&session),
        Some(json!({ "status": "shipped" })),
    )
    .await;
    assert_eq!(
        status,
        StatusCode::BAD_REQUEST,
        "shipping needs a tracking number"
    );
    let (status, _, _) = call(
        &app,
        "POST",
        &uri,
        Some(&session),
        Some(json!({ "status": "shipped", "tracking_number": "EE123456789IN" })),
    )
    .await;
    assert_eq!(status, StatusCode::NO_CONTENT);
    let (status, _, _) = call(
        &app,
        "POST",
        &uri,
        Some(&session),
        Some(json!({ "status": "paid" })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);

    // Stock edits.
    let (status, _, _) = call(
        &app,
        "PATCH",
        &format!("/admin/variants/{variant_id}"),
        Some(&session),
        Some(json!({ "stock": 7 })),
    )
    .await;
    assert_eq!(status, StatusCode::NO_CONTENT);
    assert_eq!(variant(&db, "the-perfect-shirt", "S").await.1, 7);

    // Logout revokes the session server-side.
    let (status, _, _) = call(&app, "POST", "/auth/logout", Some(&session), None).await;
    assert_eq!(status, StatusCode::NO_CONTENT);
    let (_, _, me) = call(&app, "GET", "/auth/me", Some(&session), None).await;
    assert!(me["user"].is_null());
}

#[sqlx::test]
async fn custom_fit_measurements(db: PgPool) {
    seeded(&db).await;
    let app = app(state(db.clone()));
    let (wrap, _) = variant(&db, "the-wrap", "M").await;
    let (midi, _) = variant(&db, "the-scallop-midi", "M").await;
    let m = json!({ "height": 162, "bust": 90, "waist": 72, "hip": 98 });

    let (status, cookie, cart) = call(
        &app,
        "POST",
        "/cart/items",
        None,
        Some(json!({ "variant_id": wrap, "measurements": m })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{cart}");
    assert_eq!(cart["items"][0]["measurements"]["waist"], 72);
    // A second custom line for the same size stays separate from a plain one.
    let cookie = cookie.unwrap();
    let (_, _, cart) = call(
        &app,
        "POST",
        "/cart/items",
        Some(&cookie),
        Some(json!({ "variant_id": wrap })),
    )
    .await;
    assert_eq!(cart["items"].as_array().unwrap().len(), 2);

    // Out-of-range, unknown keys, or products without custom fit are rejected.
    for bad in [json!({ "waist": 10 }), json!({ "shoe": 38 }), json!({})] {
        let (status, _, _) = call(
            &app,
            "POST",
            "/cart/items",
            None,
            Some(json!({ "variant_id": wrap, "measurements": bad })),
        )
        .await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
    }
    let (status, _, _) = call(
        &app,
        "POST",
        "/cart/items",
        None,
        Some(json!({ "variant_id": midi, "measurements": m })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}
