//! Resets catalog and content tables to the development seed in `seed/seed.sql`.
//! Dev only: the TRUNCATE ... CASCADE also clears carts and order items.

use haseki_api::config::Config;
use sqlx::{AssertSqlSafe, postgres::PgPoolOptions};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config = Config::from_env()?;
    let db = PgPoolOptions::new()
        .max_connections(1)
        .connect(&config.database_url)
        .await?;
    sqlx::migrate!().run(&db).await?;
    sqlx::raw_sql(AssertSqlSafe(include_str!("../../seed/seed.sql")))
        .execute(&db)
        .await?;
    println!("seeded");
    Ok(())
}
