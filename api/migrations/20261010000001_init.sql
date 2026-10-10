-- Haseki initial schema. Money is stored as integer minor units (paise, cents, pence, fils).

CREATE TYPE currency AS ENUM ('INR', 'USD', 'GBP', 'AED');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'fulfilled', 'shipped', 'cancelled', 'refunded');
CREATE TYPE payment_provider AS ENUM ('razorpay', 'stripe');
CREATE TYPE customer_role AS ENUM ('customer', 'admin');
CREATE TYPE fit_verdict AS ENUM ('small', 'true', 'large');

-- Catalog ---------------------------------------------------------------

CREATE TABLE drops (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    number      INT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    tagline     TEXT NOT NULL DEFAULT '',
    story       TEXT NOT NULL DEFAULT '',
    hero_image  TEXT,
    released_at DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pillars (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    image       TEXT,
    position    INT NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    fit_notes   TEXT NOT NULL DEFAULT '',
    fabric      TEXT NOT NULL DEFAULT '',
    care        TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL,
    drop_id     UUID REFERENCES drops(id) ON DELETE SET NULL,
    status      product_status NOT NULL DEFAULT 'draft',
    made_to_order BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_status_idx ON products(status);
CREATE INDEX products_category_idx ON products(category);

CREATE TABLE product_pillars (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    pillar_id  UUID NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, pillar_id)
);

CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    alt        TEXT NOT NULL DEFAULT '',
    width      INT NOT NULL,
    height     INT NOT NULL,
    position   INT NOT NULL DEFAULT 0
);
CREATE INDEX product_images_product_idx ON product_images(product_id, position);

CREATE TABLE variants (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku        TEXT NOT NULL UNIQUE,
    size       TEXT NOT NULL,
    colour     TEXT NOT NULL DEFAULT '',
    stock      INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    weight_g   INT NOT NULL DEFAULT 300,
    position   INT NOT NULL DEFAULT 0
);
CREATE INDEX variants_product_idx ON variants(product_id);

CREATE TABLE prices (
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    currency     currency NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
    PRIMARY KEY (product_id, currency)
);

-- Customers -------------------------------------------------------------

CREATE TABLE customers (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL DEFAULT '',
    password_hash TEXT,
    role          customer_role NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    token_hash  TEXT PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sessions_customer_idx ON sessions(customer_id);

CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    line1       TEXT NOT NULL,
    line2       TEXT NOT NULL DEFAULT '',
    city        TEXT NOT NULL,
    region      TEXT NOT NULL DEFAULT '',
    postal_code TEXT NOT NULL,
    country     CHAR(2) NOT NULL,
    phone       TEXT NOT NULL DEFAULT '',
    is_default  BOOLEAN NOT NULL DEFAULT false
);

-- Cart ------------------------------------------------------------------

CREATE TABLE carts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash  TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    currency    currency NOT NULL DEFAULT 'INR',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id      UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id   UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
    quantity     INT NOT NULL CHECK (quantity > 0),
    measurements JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX cart_items_cart_idx ON cart_items(cart_id);

-- Orders ----------------------------------------------------------------

CREATE SEQUENCE order_number_seq START 1001;

CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number            BIGINT NOT NULL UNIQUE DEFAULT nextval('order_number_seq'),
    customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
    cart_id           UUID REFERENCES carts(id) ON DELETE SET NULL,
    email             TEXT NOT NULL,
    currency          currency NOT NULL,
    subtotal_minor    BIGINT NOT NULL,
    shipping_minor    BIGINT NOT NULL,
    total_minor       BIGINT NOT NULL,
    status            order_status NOT NULL DEFAULT 'pending',
    ddp               BOOLEAN NOT NULL DEFAULT false,
    shipping_address  JSONB NOT NULL,
    tracking_number   TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at           TIMESTAMPTZ,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_idx ON orders(customer_id);
CREATE INDEX orders_status_idx ON orders(status);

CREATE TABLE order_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id       UUID REFERENCES variants(id) ON DELETE SET NULL,
    product_name     TEXT NOT NULL,
    sku              TEXT NOT NULL,
    size             TEXT NOT NULL,
    unit_price_minor BIGINT NOT NULL,
    quantity         INT NOT NULL CHECK (quantity > 0),
    measurements     JSONB
);
CREATE INDEX order_items_order_idx ON order_items(order_id);

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider            payment_provider NOT NULL,
    provider_order_id   TEXT NOT NULL UNIQUE,
    provider_payment_id TEXT,
    status              TEXT NOT NULL DEFAULT 'created',
    amount_minor        BIGINT NOT NULL,
    currency            currency NOT NULL,
    raw                 JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE webhook_events (
    provider    payment_provider NOT NULL,
    event_id    TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (provider, event_id)
);

CREATE TABLE stock_reservations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
    order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    quantity   INT NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX stock_reservations_variant_idx ON stock_reservations(variant_id);
CREATE INDEX stock_reservations_expiry_idx ON stock_reservations(expires_at);

-- Shipping --------------------------------------------------------------

CREATE TABLE shipping_zones (
    code      TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    countries CHAR(2)[] NOT NULL DEFAULT '{}',
    eta       TEXT NOT NULL DEFAULT ''
);

CREATE TABLE shipping_rates (
    zone_code    TEXT NOT NULL REFERENCES shipping_zones(code) ON DELETE CASCADE,
    max_weight_g INT NOT NULL,
    currency     currency NOT NULL,
    amount_minor BIGINT NOT NULL,
    PRIMARY KEY (zone_code, max_weight_g, currency)
);

-- Reviews ---------------------------------------------------------------

CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    author      TEXT NOT NULL,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body        TEXT NOT NULL,
    height_cm   SMALLINT,
    usual_size  TEXT,
    size_bought TEXT,
    fit         fit_verdict,
    approved    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_idx ON reviews(product_id) WHERE approved;

-- Content ---------------------------------------------------------------

CREATE TABLE journal_posts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    excerpt      TEXT NOT NULL DEFAULT '',
    body_md      TEXT NOT NULL,
    cover_image  TEXT,
    tag          TEXT NOT NULL DEFAULT '',
    published_at TIMESTAMPTZ
);

CREATE TABLE lookbook_images (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drop_id  UUID REFERENCES drops(id) ON DELETE SET NULL,
    url      TEXT NOT NULL,
    alt      TEXT NOT NULL DEFAULT '',
    width    INT NOT NULL,
    height   INT NOT NULL,
    caption  TEXT NOT NULL DEFAULT '',
    position INT NOT NULL DEFAULT 0
);

CREATE TABLE events (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city       TEXT NOT NULL,
    venue      TEXT NOT NULL DEFAULT '',
    starts_on  DATE,
    ends_on    DATE,
    status     TEXT NOT NULL DEFAULT 'planned',
    note       TEXT NOT NULL DEFAULT '',
    position   INT NOT NULL DEFAULT 0
);

CREATE TABLE faqs (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section  TEXT NOT NULL,
    question TEXT NOT NULL,
    answer   TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0
);

CREATE TABLE testimonials (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author   TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    quote    TEXT NOT NULL,
    product  TEXT NOT NULL DEFAULT '',
    position INT NOT NULL DEFAULT 0
);

CREATE TABLE policies (
    slug       TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    body_md    TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE newsletter_subscribers (
    email      TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contact_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
