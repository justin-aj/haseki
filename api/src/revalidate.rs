//! Tells the Next.js storefront to refresh cached pages after catalog or stock changes.
//! Fire-and-forget: a failed call only means pages refresh on their hourly lifetime instead.

use crate::AppState;

pub fn tags(state: &AppState, tags: Vec<String>) {
    let Some(secret) = state.config.revalidate_secret.clone() else {
        return;
    };
    if tags.is_empty() {
        return;
    }
    let url = format!("{}/revalidate", state.config.site_url);
    let http = state.http.clone();
    tokio::spawn(async move {
        let res = http
            .post(&url)
            .header("x-revalidate-secret", secret)
            .json(&serde_json::json!({ "tags": tags }))
            .send()
            .await;
        match res {
            Ok(r) if r.status().is_success() => tracing::debug!(?tags, "storefront revalidated"),
            Ok(r) => tracing::warn!(status = %r.status(), "storefront revalidation rejected"),
            Err(e) => tracing::warn!(error = %e, "storefront revalidation failed"),
        }
    });
}
