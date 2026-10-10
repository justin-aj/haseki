-- Phase 2 (brand doc §7): selected silhouettes accept height, bust, waist and hip at checkout.
ALTER TABLE products ADD COLUMN custom_fit BOOLEAN NOT NULL DEFAULT false;
