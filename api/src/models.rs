//! Shared enums mirroring the Postgres types in `migrations/`.

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize, sqlx::Type, ToSchema,
)]
#[sqlx(type_name = "currency")]
pub enum Currency {
    #[default]
    INR,
    USD,
    GBP,
    AED,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, ToSchema)]
#[sqlx(type_name = "fit_verdict", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum FitVerdict {
    Small,
    True,
    Large,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct Money {
    pub currency: Currency,
    pub amount_minor: i64,
}

// ISO 8601 calendar date (`2026-11-14`) for `time::Date` fields; the default serde form is a tuple.
time::serde::format_description!(pub iso_date, Date, "[year]-[month]-[day]");
