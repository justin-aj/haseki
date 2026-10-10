use haseki_api::{ApiDoc, AppState, app, config::Config};
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::EnvFilter;
use utoipa::OpenApi;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // `haseki-api openapi` prints the spec for type generation without needing a database.
    if std::env::args().nth(1).as_deref() == Some("openapi") {
        println!("{}", ApiDoc::openapi().to_pretty_json()?);
        return Ok(());
    }

    let config = Config::from_env()?;

    // `haseki-api create-admin <email> <name>` with ADMIN_PASSWORD in the environment.
    // Admins are only ever created offline, never through a public endpoint.
    if std::env::args().nth(1).as_deref() == Some("create-admin") {
        let args: Vec<String> = std::env::args().skip(2).collect();
        let [email, name] = args.as_slice() else {
            anyhow::bail!("usage: ADMIN_PASSWORD=... haseki-api create-admin <email> <name>");
        };
        let password =
            std::env::var("ADMIN_PASSWORD").map_err(|_| anyhow::anyhow!("set ADMIN_PASSWORD"))?;
        if password.chars().count() < 12 {
            anyhow::bail!("admin password must be at least 12 characters");
        }
        let db = PgPoolOptions::new()
            .max_connections(1)
            .connect(&config.database_url)
            .await?;
        sqlx::migrate!().run(&db).await?;
        sqlx::query(
            r#"INSERT INTO customers (email, name, password_hash, role) VALUES (lower($1), $2, $3, 'admin')
               ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', name = EXCLUDED.name"#,
        )
        .bind(email)
        .bind(name)
        .bind(haseki_api::auth::hash_password(&password)?)
        .execute(&db)
        .await?;
        println!("admin ready: {email}");
        return Ok(());
    }
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "haseki_api=info,tower_http=info".into()),
        )
        .init();

    let db = PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await?;
    sqlx::migrate!().run(&db).await?;
    haseki_api::orders::spawn_reservation_sweeper(db.clone());
    if config.payments.mode == haseki_api::config::PaymentsMode::Mock {
        tracing::warn!("PAYMENTS_MODE=mock: orders are marked paid without a payment provider");
    }

    let listener = tokio::net::TcpListener::bind(&config.bind_addr).await?;
    tracing::info!("listening on {}", config.bind_addr);
    let state = AppState {
        db,
        config: std::sync::Arc::new(config),
        login_limiter: Default::default(),
        http: reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(15))
            .build()?,
    };
    axum::serve(listener, app(state))
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await?;
    Ok(())
}
