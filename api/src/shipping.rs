//! Weight-based shipping by zone (brand doc §9.2: shown before checkout, never a surprise).

use serde::Serialize;
use sqlx::PgExecutor;
use utoipa::ToSchema;

use crate::{error::AppResult, models::Currency};

#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct ShippingQuote {
    pub zone_code: String,
    pub zone_name: String,
    pub eta: String,
    pub currency: Currency,
    pub amount_minor: i64,
    /// International shipments are DDU: duties are paid by the customer on arrival.
    pub duties_on_delivery: bool,
}

/// Picks the zone listing `country` (falling back to ROW) and the cheapest rate band that
/// covers `weight_g`. Heavier parcels use the top band.
pub async fn quote<'e>(
    db: impl PgExecutor<'e>,
    country: &str,
    weight_g: i64,
    currency: Currency,
) -> AppResult<ShippingQuote> {
    let country = country.trim().to_ascii_uppercase();
    let row: (String, String, String, i64) = sqlx::query_as(
        r#"
        WITH zone AS (
            SELECT code, name, eta FROM shipping_zones
            WHERE $1::char(2) = ANY(countries)
            UNION ALL
            SELECT code, name, eta FROM shipping_zones WHERE code = 'ROW'
            LIMIT 1
        )
        SELECT z.code, z.name, z.eta, r.amount_minor
        FROM zone z
        JOIN shipping_rates r ON r.zone_code = z.code AND r.currency = $3
        ORDER BY (r.max_weight_g >= $2) DESC, r.max_weight_g * CASE WHEN r.max_weight_g >= $2 THEN 1 ELSE -1 END
        LIMIT 1
        "#,
    )
    .bind(&country)
    .bind(weight_g)
    .bind(currency)
    .fetch_one(db)
    .await?;

    Ok(ShippingQuote {
        duties_on_delivery: row.0 != "IN",
        zone_code: row.0,
        zone_name: row.1,
        eta: row.2,
        currency,
        amount_minor: row.3,
    })
}
