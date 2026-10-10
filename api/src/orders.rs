//! Order state transitions shared by checkout, payment verification and webhooks.

use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    AppState,
    email::{self, OrderEmail},
    error::AppResult,
    models::{Currency, Money},
    revalidate,
};

/// Marks a pending order paid. Idempotent: returns false if it was already processed.
/// Decrements stock, releases reservations, empties the cart, then sends the confirmation email.
pub async fn mark_paid(
    state: &AppState,
    order_id: Uuid,
    provider_payment_id: Option<&str>,
) -> AppResult<bool> {
    let mut tx = state.db.begin().await?;
    let row: Option<(Option<Uuid>, String, i64, Currency, i64)> = sqlx::query_as(
        r#"UPDATE orders SET status = 'paid', paid_at = now(), updated_at = now()
           WHERE id = $1 AND status = 'pending'
           RETURNING cart_id, email, number, currency, total_minor"#,
    )
    .bind(order_id)
    .fetch_optional(&mut *tx)
    .await?;
    let Some((cart_id, to, number, currency, total)) = row else {
        return Ok(false);
    };

    // Aggregate per variant: custom-measured lines can repeat a variant.
    let oversold: Vec<(String,)> = sqlx::query_as(
        r#"WITH sold AS (
               SELECT variant_id, sum(quantity)::int AS qty FROM order_items
               WHERE order_id = $1 AND variant_id IS NOT NULL GROUP BY variant_id
           ), before AS (
               SELECT v.id, v.sku, v.stock, s.qty FROM variants v JOIN sold s ON s.variant_id = v.id FOR UPDATE OF v
           ), upd AS (
               UPDATE variants v SET stock = GREATEST(v.stock - b.qty, 0) FROM before b WHERE v.id = b.id
           )
           SELECT sku FROM before WHERE stock < qty"#,
    )
    .bind(order_id)
    .fetch_all(&mut *tx)
    .await?;
    for (sku,) in &oversold {
        tracing::warn!(
            order = number,
            sku,
            "paid order exceeded stock; needs manual follow-up"
        );
    }

    sqlx::query("DELETE FROM stock_reservations WHERE order_id = $1")
        .bind(order_id)
        .execute(&mut *tx)
        .await?;
    if let Some(cart) = cart_id {
        sqlx::query("DELETE FROM cart_items WHERE cart_id = $1")
            .bind(cart)
            .execute(&mut *tx)
            .await?;
    }
    sqlx::query(
        "UPDATE payments SET status = 'captured', provider_payment_id = COALESCE($2, provider_payment_id), updated_at = now() WHERE order_id = $1",
    )
    .bind(order_id)
    .bind(provider_payment_id)
    .execute(&mut *tx)
    .await?;
    tx.commit().await?;

    tracing::info!(order = number, "order paid");
    // Stock changed: refresh those product pages so sold-out sizes show correctly.
    let slugs: Vec<String> = sqlx::query_scalar(
        "SELECT DISTINCT p.slug FROM order_items oi JOIN variants v ON v.id = oi.variant_id JOIN products p ON p.id = v.product_id WHERE oi.order_id = $1",
    )
    .bind(order_id)
    .fetch_all(&state.db)
    .await?;
    let mut tags: Vec<String> = slugs.into_iter().map(|s| format!("product:{s}")).collect();
    tags.push("catalog".into());
    revalidate::tags(state, tags);
    let lines: Vec<(String, String, i32)> =
        sqlx::query_as("SELECT product_name, size, quantity FROM order_items WHERE order_id = $1")
            .bind(order_id)
            .fetch_all(&state.db)
            .await?;
    let mail = OrderEmail {
        to,
        order_number: number,
        lines,
        total: Money {
            currency,
            amount_minor: total,
        },
        order_url: format!(
            "{}/checkout/success?order={order_id}",
            state.config.site_url
        ),
    };
    let (cfg, http) = (state.config.email.clone(), state.http.clone());
    tokio::spawn(async move { email::send_order_confirmation(&cfg, &http, mail).await });
    Ok(true)
}

/// Releases stock held by abandoned checkouts. Orders stay `pending` so a late payment still lands.
pub fn spawn_reservation_sweeper(db: PgPool) {
    tokio::spawn(async move {
        let mut tick = tokio::time::interval(std::time::Duration::from_secs(300));
        loop {
            tick.tick().await;
            match sqlx::query("DELETE FROM stock_reservations WHERE expires_at < now()")
                .execute(&db)
                .await
            {
                Ok(r) if r.rows_affected() > 0 => tracing::info!(
                    released = r.rows_affected(),
                    "expired reservations released"
                ),
                Ok(_) => {}
                Err(e) => tracing::error!(error = %e, "reservation sweep failed"),
            }
        }
    });
}
