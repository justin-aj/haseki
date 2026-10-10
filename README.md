# Haseki

Storefront and back office for Haseki, a women's fashion label from Kochi that ships worldwide.
Strategy and sitemap come from `Haseki Brand Strategy.docx`. Competitor notes are in `references/`.

```
web/   Next.js 16.4 storefront and /admin dashboard (React 19.3, Tailwind v4, shadcn/ui)
api/   Rust API: Axum 0.8, SQLx 0.9, PostgreSQL 17
docker-compose.yml   Local Postgres on port 5433
```

## Run it locally

Prerequisites: Docker, Rust 1.96+, Node 22+.

```sh
docker compose up -d                         # Postgres

cd api
cp .env.example .env                         # set PAYMENTS_MODE=mock for local testing without keys
cargo run --bin seed                         # migrations + sample catalog (resets catalog tables)
ADMIN_PASSWORD='choose-a-long-password' cargo run -- create-admin you@example.com "Your Name"
cargo run                                    # API on http://127.0.0.1:8080

cd ../web
cp .env.example .env.local                   # set REVALIDATE_SECRET to the same value as api/.env
npm install
npm run dev                                  # http://localhost:3000
```

`npm run build` prerenders pages from the API, so the API must be running during the build.

## How it fits together

- **Data:** Server Components fetch the API directly and cache results with `use cache` and tags (`web/src/lib/data.ts`).
- **Browser calls:** go through the `/api/*` rewrite, so the cart and session cookies stay first-party.
- **Revalidation:** after admin edits and sales, the API calls `POST /revalidate` on the storefront to refresh affected pages.
- **Types:** come from the API's OpenAPI spec. After changing an API route, regenerate them:
  ```sh
  cd api && cargo run -q -- openapi > openapi.json
  cd ../web && npx openapi-typescript ../api/openapi.json -o src/lib/api/schema.d.ts
  ```
- **Prices:** each market (INR, USD, GBP, AED) has its own stored price, not an FX conversion. Pages render all four, and a small script that runs before paint shows the visitor's market. Pages stay fully static with no flash.
- **Payments:** INR goes through Razorpay (UPI, cards, netbanking). USD, GBP and AED go through Stripe Checkout. Webhooks are the source of truth for "paid", with signatures verified and retries made harmless. Card details never reach our servers.
- **Stock:** checkout holds stock for 30 minutes. A shopper's own hold never blocks their retry. Paid orders decrement stock and revalidate the product page.
- **Motion:** three signature moments only:
  - the product card image morphing into the product page (React `<ViewTransition>`)
  - the pinned pillar story on the home page
  - the frosted sticky header

  Reveals are CSS scroll-driven animations with no JS. Everything respects reduced motion.

## Tests

```sh
cd api && cargo test            # 13 tests: unit + Postgres integration (needs docker compose up)
cd api && cargo clippy --all-targets -- -D warnings
cd web && npm run lint && npx tsc --noEmit && npm run build
```

The integration tests cover:
- cart merging and per-market prices
- shipping zones
- mock checkout
- stock reservations, including a shopper's own hold
- Stripe webhook signature checks and replays
- accounts and admin access control
- order status transitions
- custom-fit validation

## Before launch

**Payments are verified only in mock mode.** Razorpay order creation, Checkout.js, Stripe Checkout sessions and both webhooks have not run against the real providers yet. Their signature logic is unit tested. To finish:
1. Add Razorpay and Stripe **test** keys to `api/.env`. Set `PAYMENTS_MODE=providers`.
2. Point the webhooks at `https://<api-host>/webhooks/razorpay` and `/webhooks/stripe`. For Stripe, subscribe to `checkout.session.completed`. For Razorpay, subscribe to `payment.captured`.
3. In the Razorpay dashboard, turn on **automatic payment capture**. Orders are marked paid only by the `payment.captured` webhook, never by the browser handler, so an authorized-but-uncaptured payment would leave the order pending.
4. Place test orders in INR (Razorpay test UPI) and USD (Stripe card `4242 4242 4242 4242`). Confirm each order turns paid in `/admin`.

Also before launch:
- **Photography:** every image is an Unsplash placeholder showing other people's clothes. Replace them all with real Haseki shoots.
- **Email:** add `RESEND_API_KEY` and a verified sending domain. Until then, emails are only logged.
- **Duties:** international orders are DDU (customer pays duties on delivery). Confirm this, or switch to DDP.
- **Config:** set `SECURE_COOKIES=true` and an https `SITE_URL`. The API refuses to start in mock mode under these settings.
- **Hosting:** run the API (Fly.io, Railway or a VPS) behind HTTPS on the same parent domain as the storefront. Use managed Postgres with backups, and Vercel or similar for `web/`.

Not built yet:
- search
- wishlist
- email verification and password reset
- refunds via the provider APIs (record them in admin after refunding in the dashboard)
- a content editor for journal, lookbook and FAQ (content is in Postgres; edit via SQL or the seed for now)
- image uploads (use an S3-compatible bucket such as Cloudflare R2)
