use anyhow::Context;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub bind_addr: String,
    /// Public storefront URL, used for payment redirects and email links.
    pub site_url: String,
    /// Set cookies with `Secure` (true in production over HTTPS).
    pub secure_cookies: bool,
    pub payments: PaymentsConfig,
    pub email: EmailConfig,
    /// Shared with the storefront's /revalidate route. Unset disables revalidation calls.
    pub revalidate_secret: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PaymentsMode {
    /// Real provider calls (test or live keys).
    Providers,
    /// Local development: orders are marked paid immediately, no provider involved.
    Mock,
}

#[derive(Clone, Debug)]
pub struct PaymentsConfig {
    pub mode: PaymentsMode,
    pub razorpay_key_id: Option<String>,
    pub razorpay_key_secret: Option<String>,
    pub razorpay_webhook_secret: Option<String>,
    pub stripe_secret_key: Option<String>,
    pub stripe_webhook_secret: Option<String>,
}

#[derive(Clone, Debug)]
pub struct EmailConfig {
    pub resend_api_key: Option<String>,
    pub from: String,
}

fn opt(key: &str) -> Option<String> {
    std::env::var(key).ok().filter(|v| !v.trim().is_empty())
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let _ = dotenvy::dotenv();
        let mode = match opt("PAYMENTS_MODE").as_deref() {
            Some("mock") => PaymentsMode::Mock,
            Some("providers") | None => PaymentsMode::Providers,
            Some(other) => {
                anyhow::bail!("PAYMENTS_MODE must be `providers` or `mock`, got `{other}`")
            }
        };
        let site_url = opt("SITE_URL").unwrap_or_else(|| "http://localhost:3000".into());
        let secure_cookies = opt("SECURE_COOKIES").is_some_and(|v| v == "true");
        if mode == PaymentsMode::Mock && (secure_cookies || site_url.starts_with("https://")) {
            anyhow::bail!(
                "PAYMENTS_MODE=mock is for local development only; refusing to start with an https SITE_URL or SECURE_COOKIES=true"
            );
        }
        Ok(Self {
            database_url: std::env::var("DATABASE_URL").context("DATABASE_URL must be set")?,
            bind_addr: opt("BIND_ADDR").unwrap_or_else(|| "127.0.0.1:8080".into()),
            site_url,
            secure_cookies,
            payments: PaymentsConfig {
                mode,
                razorpay_key_id: opt("RAZORPAY_KEY_ID"),
                razorpay_key_secret: opt("RAZORPAY_KEY_SECRET"),
                razorpay_webhook_secret: opt("RAZORPAY_WEBHOOK_SECRET"),
                stripe_secret_key: opt("STRIPE_SECRET_KEY"),
                stripe_webhook_secret: opt("STRIPE_WEBHOOK_SECRET"),
            },
            revalidate_secret: opt("REVALIDATE_SECRET"),
            email: EmailConfig {
                resend_api_key: opt("RESEND_API_KEY"),
                from: opt("EMAIL_FROM").unwrap_or_else(|| "Haseki <orders@haseki.in>".into()),
            },
        })
    }
}
