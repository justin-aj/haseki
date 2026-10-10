pub mod auth;
pub mod config;
pub mod email;
pub mod error;
pub mod models;
pub mod orders;
pub mod payments;
pub mod revalidate;
pub mod routes;
pub mod shipping;
pub mod token;

use std::sync::Arc;

use axum::{Json, Router, routing::get};
use sqlx::PgPool;
use tower_http::{compression::CompressionLayer, trace::TraceLayer};
use utoipa::OpenApi;

use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Arc<Config>,
    pub http: reqwest::Client,
    pub login_limiter: Arc<auth::LoginLimiter>,
}

#[derive(OpenApi)]
#[openapi(
    info(title = "Haseki API", version = "0.1.0"),
    paths(
        routes::catalog::list_pillars,
        routes::catalog::list_drops,
        routes::catalog::get_drop,
        routes::catalog::list_products,
        routes::catalog::get_product,
        routes::catalog::list_reviews,
        routes::content::list_journal,
        routes::content::get_journal,
        routes::content::list_lookbook,
        routes::content::list_events,
        routes::content::list_faqs,
        routes::content::list_testimonials,
        routes::content::list_policies,
        routes::content::get_policy,
        routes::content::list_shipping_zones,
        routes::forms::subscribe,
        routes::forms::contact,
        routes::cart::get_cart,
        routes::cart::add_item,
        routes::cart::update_item,
        routes::cart::remove_item,
        routes::cart::shipping_quote,
        routes::checkout::start_checkout,
        routes::checkout::verify_razorpay,
        routes::checkout::get_order,
        routes::catalog::submit_review,
        routes::auth::register,
        routes::auth::login,
        routes::auth::logout,
        routes::auth::me,
        routes::auth::my_orders,
        routes::admin::stats,
        routes::admin::list_orders,
        routes::admin::get_order,
        routes::admin::set_order_status,
        routes::admin::list_products,
        routes::admin::update_product,
        routes::admin::update_variant,
        routes::admin::list_reviews,
        routes::admin::approve_review,
        routes::admin::delete_review,
    ),
    components(schemas(error::ErrorBody, models::Money))
)]
pub struct ApiDoc;

pub fn app(state: AppState) -> Router {
    Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/openapi.json", get(|| async { Json(ApiDoc::openapi()) }))
        .merge(routes::catalog::router())
        .merge(routes::content::router())
        .merge(routes::forms::router())
        .merge(routes::cart::router())
        .merge(routes::checkout::router())
        .merge(routes::webhooks::router())
        .merge(routes::auth::router())
        .merge(routes::admin::router())
        .with_state(state)
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
}
