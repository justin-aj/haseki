-- Generated seed data for local development. Placeholder images from Unsplash; replace before launch.
BEGIN;
TRUNCATE drops, pillars, products, shipping_zones, journal_posts, lookbook_images, events, faqs, testimonials, policies RESTART IDENTITY CASCADE;
INSERT INTO drops (slug, number, name, tagline, story, hero_image, released_at) VALUES ('the-scallop-study', 1, 'The Scallop Study', 'Soft edges, sharp lines.', 'Our first drop starts with a single detail: the scallop. Worked into chiffon blouses, a sleeve top, a midi, a cropped jacket and two easy bottoms, it is the curve that softens a clean cut without ever turning it sweet.', 'https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?w=2400&h=1350&fit=crop&crop=entropy&q=80', '2026-10-01');
INSERT INTO drops (slug, number, name, tagline, story, hero_image, released_at) VALUES ('the-stone-garden', 2, 'The Stone Garden', 'Printed georgettes, tiny stone interventions.', 'Original botanical prints on fluid georgette, with small stones set where the light lands. The kind of detail you notice the second time you look.', 'https://images.unsplash.com/photo-1609748340041-f5d61e061ebc?w=1200&h=1600&fit=crop&crop=entropy&q=80', '2026-12-01');
INSERT INTO drops (slug, number, name, tagline, story, hero_image, released_at) VALUES ('colour-play', 3, 'Colour Play', 'Unexpected pairings, cleaner silhouettes.', 'Colour does the talking here. Minimal embellishment, unexpected pairings, and silhouettes pared back so the shade is the statement.', 'https://images.unsplash.com/photo-1651828855101-38dba7f57245?w=1200&h=1600&fit=crop&crop=entropy&q=80', '2027-02-01');
INSERT INTO pillars (slug, name, description, image, position) VALUES ('the-wrap', 'The Wrap', 'Cut and silhouette, engineered for real proportions. Wraps, peplums, sculpted shirts.', 'https://images.unsplash.com/photo-1722281763168-91ac74c0d965?w=1200&h=1600&fit=crop&crop=entropy&q=80', 1);
INSERT INTO pillars (slug, name, description, image, position) VALUES ('the-scallop', 'The Scallop', 'Our signature edge, from Drop 01: The Scallop Study.', 'https://images.unsplash.com/photo-1587538018365-2a1f8b544c08?w=1200&h=1600&fit=crop&crop=entropy&q=80', 2);
INSERT INTO pillars (slug, name, description, image, position) VALUES ('a-little-extra', 'A Little Extra', 'Stones, embroidery and drape for the evenings that ask for more.', 'https://images.unsplash.com/photo-1671881641527-0a1ee842e13e?w=1200&h=1600&fit=crop&crop=entropy&q=80', 3);
INSERT INTO pillars (slug, name, description, image, position) VALUES ('a-little-something', 'A Little Something', 'Easy pieces and small treats. No occasion needed.', 'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=1200&h=1600&fit=crop&crop=entropy&q=80', 4);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-scallop-blouse', 'The Scallop Blouse', 'A sheer chiffon blouse finished with a hand-guided scallop at the hem and cuffs. Wear it tucked into the Fluid Trouser for work, or loose over a slip for dinner.', 'Relaxed through the body, with a dropped shoulder. The scallop hem sits at the high hip, so it skims rather than clings. If you are between sizes, take the smaller.', '100% polyester chiffon, cotton-blend lining', 'See our care guide. Hand wash cold or dry clean.', 'tops', (SELECT id FROM drops WHERE slug = 'the-scallop-study'), 'active', false, now() + interval '0 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), (SELECT id FROM pillars WHERE slug = 'the-scallop'));
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), (SELECT id FROM pillars WHERE slug = 'a-little-extra'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'https://images.unsplash.com/photo-1628620835051-8f40f48c928d?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a black long-sleeve top by a wooden wall', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'https://images.unsplash.com/photo-1607189200597-4d0923ef98c6?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a white shirt with a green bag', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'INR', 229900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'USD', 4900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'GBP', 3900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'AED', 17900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'HSK-TSB01-XS', 'XS', '', 5, 220, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'HSK-TSB01-S', 'S', '', 8, 220, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'HSK-TSB01-M', 'M', '', 11, 220, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'HSK-TSB01-L', 'L', '', 14, 220, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'HSK-TSB01-XL', 'XL', '', 6, 220, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'HSK-TSB01-XXL', 'XXL', '', 0, 220, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-scallop-sleeve-top', 'The Scallop Sleeve Top', 'A clean rayon top with a scalloped flutter sleeve. Simple enough for every day, with one detail people ask about.', 'Fitted at the shoulder, easing through the waist. The sleeve ends just above the elbow and flatters fuller upper arms.', '100% rayon', 'See our care guide. Hand wash cold or dry clean.', 'tops', (SELECT id FROM drops WHERE slug = 'the-scallop-study'), 'active', false, now() + interval '1 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), (SELECT id FROM pillars WHERE slug = 'the-scallop'));
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), (SELECT id FROM pillars WHERE slug = 'a-little-something'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'https://images.unsplash.com/photo-1577155848406-b53ebd277c72?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in front of a window', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'https://images.unsplash.com/photo-1546784680-971022597abb?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman walking down a narrow lane', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'INR', 189900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'USD', 4200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'GBP', 3400);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'AED', 15500);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'HSK-TSST02-XS', 'XS', '', 12, 200, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'HSK-TSST02-S', 'S', '', 15, 200, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'HSK-TSST02-M', 'M', '', 7, 200, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'HSK-TSST02-L', 'L', '', 10, 200, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'HSK-TSST02-XL', 'XL', '', 13, 200, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-sleeve-top'), 'HSK-TSST02-XXL', 'XXL', '', 5, 200, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-scallop-midi', 'The Scallop Midi', 'A georgette midi with a scalloped neckline and a fluid, bias-cut skirt that moves when you do.', 'Princess seams shape the bust and waist without darts pulling. The skirt falls to mid-calf on a 165cm frame. True to size.', 'Georgette, rayon lining', 'See our care guide. Hand wash cold or dry clean.', 'dresses', (SELECT id FROM drops WHERE slug = 'the-scallop-study'), 'active', false, now() + interval '2 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), (SELECT id FROM pillars WHERE slug = 'the-scallop'));
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), (SELECT id FROM pillars WHERE slug = 'a-little-extra'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'https://images.unsplash.com/photo-1612595391900-29390866733a?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red and white dress in a field', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'https://images.unsplash.com/photo-1607997637503-d4d8dee871e4?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a white long-sleeve dress', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'INR', 329900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'USD', 6800);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'GBP', 5400);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'AED', 24900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'HSK-TSM03-XS', 'XS', '', 8, 380, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'HSK-TSM03-S', 'S', '', 11, 380, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'HSK-TSM03-M', 'M', '', 14, 380, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'HSK-TSM03-L', 'L', '', 6, 380, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'HSK-TSM03-XL', 'XL', '', 9, 380, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'HSK-TSM03-XXL', 'XXL', '', 12, 380, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-cropped-scallop-jacket', 'The Cropped Scallop Jacket', 'A structured cotton-blend jacket, cropped to the natural waist and edged with a tonal embroidered scallop.', 'Boxy through the body and cropped to sit at the natural waist, so it balances high-rise trousers and full skirts. Size down for a closer fit.', 'Cotton-linen blend, tonal embroidery', 'See our care guide. Hand wash cold or dry clean.', 'jackets', (SELECT id FROM drops WHERE slug = 'the-scallop-study'), 'active', false, now() + interval '3 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), (SELECT id FROM pillars WHERE slug = 'the-scallop'));
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), (SELECT id FROM pillars WHERE slug = 'a-little-extra'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'https://images.unsplash.com/photo-1580478491436-fd6a937acc9e?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red blazer sitting on stairs', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a blazer and trousers', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'INR', 349900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'USD', 7200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'GBP', 5700);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'AED', 26500);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'HSK-TCSJ04-XS', 'XS', '', 15, 450, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'HSK-TCSJ04-S', 'S', '', 7, 450, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'HSK-TCSJ04-M', 'M', '', 10, 450, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'HSK-TCSJ04-L', 'L', '', 13, 450, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'HSK-TCSJ04-XL', 'XL', '', 5, 450, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-cropped-scallop-jacket'), 'HSK-TCSJ04-XXL', 'XXL', '', 8, 450, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-fluid-trouser', 'The Fluid Trouser', 'A high-rise wide-leg trouser in weighty rayon, with a scalloped side slit at the ankle.', 'High rise with a flat front and an elasticated back waist. The leg falls straight from the hip. Inseam 78cm.', 'Rayon twill', 'See our care guide. Hand wash cold or dry clean.', 'bottoms', (SELECT id FROM drops WHERE slug = 'the-scallop-study'), 'active', false, now() + interval '4 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), (SELECT id FROM pillars WHERE slug = 'the-scallop'));
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), (SELECT id FROM pillars WHERE slug = 'a-little-something'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'https://images.unsplash.com/photo-1618244965061-1d27b208d6e8?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a brown coat beside a black door', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'https://images.unsplash.com/photo-1607189200597-4d0923ef98c6?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a white shirt with a green bag', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'INR', 249900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'USD', 5200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'GBP', 4200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'AED', 18900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'HSK-TFT05-XS', 'XS', '', 11, 380, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'HSK-TFT05-S', 'S', '', 14, 380, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'HSK-TFT05-M', 'M', '', 6, 380, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'HSK-TFT05-L', 'L', '', 9, 380, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'HSK-TFT05-XL', 'XL', '', 12, 380, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'HSK-TFT05-XXL', 'XXL', '', 0, 380, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-scallop-skirt', 'The Scallop Skirt', 'An A-line georgette skirt with a scalloped hem, lined so it never turns sheer in the sun.', 'Sits at the natural waist with a concealed side zip. The A-line flare starts at the hip. True to size.', 'Georgette, rayon lining', 'See our care guide. Hand wash cold or dry clean.', 'bottoms', (SELECT id FROM drops WHERE slug = 'the-scallop-study'), 'active', false, now() + interval '5 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), (SELECT id FROM pillars WHERE slug = 'the-scallop'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'https://images.unsplash.com/photo-1627903893282-77403ec2637d?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a blue and white floral dress on a beach', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'https://images.unsplash.com/photo-1587538018365-2a1f8b544c08?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red and white floral dress', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'INR', 229900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'USD', 4900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'GBP', 3900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'AED', 17900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'HSK-TSS06-XS', 'XS', '', 7, 300, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'HSK-TSS06-S', 'S', '', 10, 300, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'HSK-TSS06-M', 'M', '', 13, 300, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'HSK-TSS06-L', 'L', '', 5, 300, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'HSK-TSS06-XL', 'XL', '', 8, 300, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-skirt'), 'HSK-TSS06-XXL', 'XXL', '', 11, 300, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-wrap', 'The Wrap', 'Our signature wrap top in printed georgette. A true wrap with an internal tie, so it holds its shape all day.', 'The wrap crosses just below the bust and ties at the natural waist, so you set the fit. The neckline sits modestly with a hidden press stud.', 'Printed georgette', 'See our care guide. Hand wash cold or dry clean.', 'tops', (SELECT id FROM drops WHERE slug = 'the-stone-garden'), 'active', false, now() + interval '6 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), (SELECT id FROM pillars WHERE slug = 'the-wrap'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'https://images.unsplash.com/photo-1722281763168-91ac74c0d965?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red dress leaning on a wall', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'https://images.unsplash.com/photo-1722281762426-b4d88c31f9f8?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red dress against a wall', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'INR', 249900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'USD', 5200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'GBP', 4200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'AED', 18900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'HSK-TW07-XS', 'XS', '', 14, 220, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'HSK-TW07-S', 'S', '', 6, 220, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'HSK-TW07-M', 'M', '', 9, 220, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'HSK-TW07-L', 'L', '', 12, 220, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'HSK-TW07-XL', 'XL', '', 15, 220, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'HSK-TW07-XXL', 'XXL', '', 7, 220, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-peplum', 'The Peplum', 'A sculpted peplum top with a curved hem and a scatter of tiny stones at the neckline.', 'Shaped through the bust and waist with princess seams. The peplum flares from just above the hip and flatters a defined or undefined waist.', 'Georgette with crystal-stone detailing', 'See our care guide. Hand wash cold or dry clean.', 'tops', (SELECT id FROM drops WHERE slug = 'the-stone-garden'), 'active', false, now() + interval '7 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), (SELECT id FROM pillars WHERE slug = 'the-wrap'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'https://images.unsplash.com/photo-1610030469668-8e9f641aaf27?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a dark dress beside a red wall', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red dress sitting on a bench', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'INR', 229900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'USD', 4900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'GBP', 3900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'AED', 17900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'HSK-TP08-XS', 'XS', '', 10, 240, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'HSK-TP08-S', 'S', '', 13, 240, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'HSK-TP08-M', 'M', '', 5, 240, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'HSK-TP08-L', 'L', '', 8, 240, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'HSK-TP08-XL', 'XL', '', 11, 240, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'HSK-TP08-XXL', 'XXL', '', 14, 240, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-easy-dress-stone-garden', 'The Easy Dress, Stone Garden', 'Our easiest dress in the Stone Garden print. Pull it on, add a belt or don''t, and go.', 'Relaxed shift shape with a gentle A-line. Falls just below the knee. Choose your usual size.', 'Printed georgette, stone detailing', 'See our care guide. Hand wash cold or dry clean.', 'dresses', (SELECT id FROM drops WHERE slug = 'the-stone-garden'), 'active', false, now() + interval '8 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), (SELECT id FROM pillars WHERE slug = 'a-little-extra'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'https://images.unsplash.com/photo-1609748340041-f5d61e061ebc?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a green and white dress', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'https://images.unsplash.com/photo-1653152707179-125e4e184a0b?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a green dress', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'INR', 299900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'USD', 6200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'GBP', 4900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'AED', 22900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'HSK-TEDSG09-XS', 'XS', '', 6, 340, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'HSK-TEDSG09-S', 'S', '', 9, 340, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'HSK-TEDSG09-M', 'M', '', 12, 340, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'HSK-TEDSG09-L', 'L', '', 15, 340, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'HSK-TEDSG09-XL', 'XL', '', 7, 340, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-easy-dress-stone-garden'), 'HSK-TEDSG09-XXL', 'XXL', '', 0, 340, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('stone-garden-co-ord', 'Stone Garden Co-ord', 'A two-piece set: a boxy shirt and a matching wide-leg trouser in the Stone Garden print. Office to evening without a change.', 'Shirt is relaxed with a dropped shoulder. Trouser is high rise with an elasticated back. Sold as a set in one size.', 'Printed georgette', 'See our care guide. Hand wash cold or dry clean.', 'co-ords', (SELECT id FROM drops WHERE slug = 'the-stone-garden'), 'active', false, now() + interval '9 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'stone-garden-co-ord'), (SELECT id FROM pillars WHERE slug = 'a-little-extra'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'stone-garden-co-ord'), 'https://images.unsplash.com/photo-1651828855101-38dba7f57245?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in an orange dress', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'stone-garden-co-ord'), 'https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red outfit against a blue sky', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'stone-garden-co-ord'), 'INR', 379900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'stone-garden-co-ord'), 'USD', 7800);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'stone-garden-co-ord'), 'GBP', 6200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'stone-garden-co-ord'), 'AED', 28900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'stone-garden-co-ord'), 'HSK-SGCO10-ONESIZE', 'One size', '', 13, 520, 0);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-sculpted-shirt', 'The Sculpted Shirt', 'A crisp shirt with curved seams that follow the body, and a curved hem for wearing out.', 'Darted at the back and shaped through the waist. Bust gape is designed out with a hidden placket button. True to size.', 'Cotton poplin blend', 'See our care guide. Hand wash cold or dry clean.', 'shirts', (SELECT id FROM drops WHERE slug = 'the-stone-garden'), 'active', false, now() + interval '10 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), (SELECT id FROM pillars WHERE slug = 'the-wrap'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a white dress', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'https://images.unsplash.com/photo-1706943262259-ffe65cb2bf70?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a white dress holding a bag', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'INR', 219900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'USD', 4500);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'GBP', 3700);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'AED', 16900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'HSK-TSS11-XS', 'XS', '', 9, 260, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'HSK-TSS11-S', 'S', '', 12, 260, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'HSK-TSS11-M', 'M', '', 15, 260, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'HSK-TSS11-L', 'L', '', 7, 260, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'HSK-TSS11-XL', 'XL', '', 10, 260, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-sculpted-shirt'), 'HSK-TSS11-XXL', 'XXL', '', 13, 260, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-perfect-shirt', 'The Perfect Shirt', 'The shirt everyone needs, in a colour nobody expects. Clean, light and easy.', 'Relaxed straight fit. Sleeves roll neatly to the elbow. Take your usual size for an easy fit, size down for tucking.', 'Cotton-rayon blend', 'See our care guide. Hand wash cold or dry clean.', 'shirts', (SELECT id FROM drops WHERE slug = 'colour-play'), 'active', false, now() + interval '11 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), (SELECT id FROM pillars WHERE slug = 'a-little-something'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'https://images.unsplash.com/photo-1657373307141-349a3393d4d9?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman standing on a balcony', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman holding a dried flower', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'INR', 149900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'USD', 3400);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'GBP', 2700);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'AED', 12500);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'HSK-TPS12-XS', 'XS', '', 5, 240, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'HSK-TPS12-S', 'S', '', 8, 240, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'HSK-TPS12-M', 'M', '', 11, 240, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'HSK-TPS12-L', 'L', '', 14, 240, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'HSK-TPS12-XL', 'XL', '', 6, 240, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-perfect-shirt'), 'HSK-TPS12-XXL', 'XXL', '', 9, 240, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('colour-play-wrap-dress', 'Colour Play Wrap Dress', 'A wrap dress in an unexpected colour pairing, with a curved hem and fluttered sleeve.', 'True wrap with an internal tie. Adjust the waist to suit you. Falls to mid-calf.', 'Rayon crepe', 'See our care guide. Hand wash cold or dry clean.', 'dresses', (SELECT id FROM drops WHERE slug = 'colour-play'), 'active', false, now() + interval '12 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), (SELECT id FROM pillars WHERE slug = 'the-wrap'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'https://images.unsplash.com/photo-1557022971-b3b7462cd090?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman wearing a red dress', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'https://images.unsplash.com/photo-1722281763168-91ac74c0d965?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red dress leaning on a wall', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'INR', 279900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'USD', 5800);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'GBP', 4600);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'AED', 20900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'HSK-CPWD13-XS', 'XS', '', 12, 360, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'HSK-CPWD13-S', 'S', '', 15, 360, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'HSK-CPWD13-M', 'M', '', 7, 360, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'HSK-CPWD13-L', 'L', '', 10, 360, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'HSK-CPWD13-XL', 'XL', '', 13, 360, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'colour-play-wrap-dress'), 'HSK-CPWD13-XXL', 'XXL', '', 0, 360, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-gracious-drape-saree', 'The Gracious Drape Saree', 'A ready-to-wear georgette saree with a scalloped border. Light enough for a long evening.', 'Comes with an unstitched blouse piece. Order The Tailored Blouse for a made-to-measure fit.', 'Georgette with embroidered border', 'See our care guide. Hand wash cold or dry clean.', 'sarees', (SELECT id FROM drops WHERE slug = 'the-stone-garden'), 'active', false, now() + interval '13 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-gracious-drape-saree'), (SELECT id FROM pillars WHERE slug = 'a-little-extra'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-gracious-drape-saree'), 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a pink and orange sari between trees', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-gracious-drape-saree'), 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red and brown sari', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-gracious-drape-saree'), 'INR', 399900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-gracious-drape-saree'), 'USD', 8200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-gracious-drape-saree'), 'GBP', 6500);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-gracious-drape-saree'), 'AED', 29900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-gracious-drape-saree'), 'HSK-TGDS14-ONESIZE', 'One size', '', 8, 520, 0);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-tailored-blouse', 'The Tailored Blouse', 'A clean, sleeveless saree blouse, cut close and finished with a tonal scallop at the back.', 'Close fit through the bust with side zip. Pair with any saree. Custom measurements available on request.', 'Rayon silk blend', 'See our care guide. Hand wash cold or dry clean.', 'sarees', (SELECT id FROM drops WHERE slug = 'colour-play'), 'active', false, now() + interval '14 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), (SELECT id FROM pillars WHERE slug = 'a-little-something'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a purple and gold sari', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'https://images.unsplash.com/photo-1678705730064-a7ecbab4b3fb?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a white and red sari', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'INR', 179900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'USD', 3900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'GBP', 3200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'AED', 14500);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'HSK-TTB15-XS', 'XS', '', 15, 150, 0);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'HSK-TTB15-S', 'S', '', 7, 150, 1);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'HSK-TTB15-M', 'M', '', 10, 150, 2);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'HSK-TTB15-L', 'L', '', 13, 150, 3);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'HSK-TTB15-XL', 'XL', '', 5, 150, 4);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-tailored-blouse'), 'HSK-TTB15-XXL', 'XXL', '', 8, 150, 5);
INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES ('the-occasion-saree', 'The Occasion Saree', 'Made to order. Georgette with stone work across the pallu, for weddings and the nights that follow.', 'Made to order in 3 to 4 weeks. Blouse stitched to your measurements.', 'Georgette, stone and thread work', 'See our care guide. Hand wash cold or dry clean.', 'sarees', (SELECT id FROM drops WHERE slug = 'the-stone-garden'), 'active', true, now() + interval '15 seconds');
INSERT INTO product_pillars (product_id, pillar_id) VALUES ((SELECT id FROM products WHERE slug = 'the-occasion-saree'), (SELECT id FROM pillars WHERE slug = 'a-little-extra'));
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-occasion-saree'), 'https://images.unsplash.com/photo-1671881641527-0a1ee842e13e?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red and gold sari', 1200, 1600, 0);
INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ((SELECT id FROM products WHERE slug = 'the-occasion-saree'), 'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a sari posing', 1200, 1600, 1);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-occasion-saree'), 'INR', 449900);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-occasion-saree'), 'USD', 9200);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-occasion-saree'), 'GBP', 7400);
INSERT INTO prices (product_id, currency, amount_minor) VALUES ((SELECT id FROM products WHERE slug = 'the-occasion-saree'), 'AED', 33900);
INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ((SELECT id FROM products WHERE slug = 'the-occasion-saree'), 'HSK-TOS16-ONESIZE', 'One size', '', 11, 700, 0);
INSERT INTO reviews (product_id, author, rating, body, height_cm, usual_size, size_bought, fit, approved) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'Anjali, Kochi', 5, 'Finally a wrap that stays put. I am 160cm and it hits exactly at my waist.', 160, 'M', 'M', 'true', true);
INSERT INTO reviews (product_id, author, rating, body, height_cm, usual_size, size_bought, fit, approved) VALUES ((SELECT id FROM products WHERE slug = 'the-wrap'), 'Rhea, Dubai', 4, 'Beautiful print, arrived in 6 days. Size runs slightly roomy at the bust.', 168, 'L', 'M', 'large', true);
INSERT INTO reviews (product_id, author, rating, body, height_cm, usual_size, size_bought, fit, approved) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'Meera, Bangalore', 5, 'The neckline is everything. People have asked where it''s from every time.', 165, 'S', 'S', 'true', true);
INSERT INTO reviews (product_id, author, rating, body, height_cm, usual_size, size_bought, fit, approved) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-midi'), 'Sara, London', 5, 'Fits like it was made for me. Ordered my usual size.', 172, 'M', 'M', 'true', true);
INSERT INTO reviews (product_id, author, rating, body, height_cm, usual_size, size_bought, fit, approved) VALUES ((SELECT id FROM products WHERE slug = 'the-peplum'), 'Neha, Ernakulam', 4, 'Lovely shape. I''d size up if you have a fuller bust.', 158, 'M', 'M', 'small', true);
INSERT INTO reviews (product_id, author, rating, body, height_cm, usual_size, size_bought, fit, approved) VALUES ((SELECT id FROM products WHERE slug = 'the-scallop-blouse'), 'Divya, Kochi', 5, 'So light for Kochi summers. The scallop hem is a dream.', 162, 'S', 'S', 'true', true);
INSERT INTO reviews (product_id, author, rating, body, height_cm, usual_size, size_bought, fit, approved) VALUES ((SELECT id FROM products WHERE slug = 'the-fluid-trouser'), 'Ammu, Thrissur', 5, 'Perfect length on me without hemming. Moves beautifully.', 167, 'M', 'M', 'true', true);
INSERT INTO faqs (section, question, answer, position) VALUES ('Sizing', 'How do I find my size?', 'Every product page has a size guide with body measurements in centimetres and inches. Measure your bust, waist and hip, then match the largest measurement. Each product also has fit notes telling you where the seams sit.', 0);
INSERT INTO faqs (section, question, answer, position) VALUES ('Sizing', 'What if I''m between sizes?', 'Our fit notes tell you which way to go for each piece. As a rule, size down in wraps (the tie adjusts) and size up in close-fitting blouses.', 1);
INSERT INTO faqs (section, question, answer, position) VALUES ('Sizing', 'Do you offer custom measurements?', 'Selected pieces, including The Tailored Blouse and The Occasion Saree, can be made to your measurements. Custom fit for The Wrap and The Peplum is coming soon.', 2);
INSERT INTO faqs (section, question, answer, position) VALUES ('Shipping', 'Do you ship worldwide?', 'Yes. We ship across India and worldwide, including the Gulf, the UK, the US and Singapore. Shipping is calculated by weight and shown before you pay.', 3);
INSERT INTO faqs (section, question, answer, position) VALUES ('Shipping', 'Do I pay customs or duties?', 'International orders are currently shipped DDU, which means any duties or import taxes are paid by you on arrival. We show this clearly at checkout, so there are no surprises.', 4);
INSERT INTO faqs (section, question, answer, position) VALUES ('Shipping', 'How long does delivery take?', 'India: 3 to 6 working days. Gulf: 5 to 8. UK and Europe: 6 to 10. US and rest of world: 7 to 12.', 5);
INSERT INTO faqs (section, question, answer, position) VALUES ('Returns', 'Can I return or exchange?', 'Ready-to-wear pieces can be exchanged for another size or returned within 7 days of delivery, unworn with tags. Made-to-order and custom-measured pieces cannot be returned, but we will alter them if the fit is off.', 6);
INSERT INTO faqs (section, question, answer, position) VALUES ('Returns', 'How do size exchanges work?', 'Request an exchange from your account or our contact page. Within India, we collect the piece and send the new size free of charge.', 7);
INSERT INTO faqs (section, question, answer, position) VALUES ('Care', 'How do I care for georgette and chiffon?', 'Hand wash cold or dry clean. Do not wring. Dry flat in the shade and iron on low through a cloth, especially near stones and embroidery.', 8);
INSERT INTO faqs (section, question, answer, position) VALUES ('Care', 'And rayon?', 'Rayon softens with every wash. Machine wash cold on a gentle cycle inside out, and dry in the shade to keep colours bright.', 9);
INSERT INTO testimonials (author, location, quote, product, position) VALUES ('Anjali', 'Kochi', 'I wore The Wrap to a work dinner and three people asked where it was from. It fits like it was cut for me.', 'The Wrap', 0);
INSERT INTO testimonials (author, location, quote, product, position) VALUES ('Meera', 'Bangalore', 'I''ve never owned something this pretty that I can actually wear on a Tuesday.', 'The Scallop Midi', 1);
INSERT INTO testimonials (author, location, quote, product, position) VALUES ('Rhea', 'Dubai', 'It made me stand up straighter. That''s the only way I can describe it.', 'The Peplum', 2);
INSERT INTO testimonials (author, location, quote, product, position) VALUES ('Sara', 'London', 'The detail is so considered. And it arrived faster than things I order locally.', 'The Scallop Blouse', 3);
INSERT INTO testimonials (author, location, quote, product, position) VALUES ('Divya', 'Ernakulam', 'Light enough for a Kochi afternoon, special enough for the evening after.', 'The Easy Dress', 4);
INSERT INTO events (city, venue, starts_on, ends_on, status, note, position) VALUES ('Kochi', 'Panampilly Nagar pop-up', '2026-11-14', '2026-11-16', 'confirmed', 'Our first pop-up. Try the full Scallop Study and get measured for custom fit.', 0);
INSERT INTO events (city, venue, starts_on, ends_on, status, note, position) VALUES ('Bangalore', 'Indiranagar', NULL, NULL, 'planned', 'Early 2027.', 1);
INSERT INTO events (city, venue, starts_on, ends_on, status, note, position) VALUES ('Mumbai', 'Bandra', NULL, NULL, 'planned', 'Spring 2027.', 2);
INSERT INTO events (city, venue, starts_on, ends_on, status, note, position) VALUES ('Dubai', 'Alserkal Avenue', NULL, NULL, 'planned', 'Late 2027.', 3);
INSERT INTO events (city, venue, starts_on, ends_on, status, note, position) VALUES ('London', 'TBC', NULL, NULL, 'planned', '2028.', 4);
INSERT INTO policies (slug, title, body_md) VALUES ('shipping', 'Shipping', '## Domestic shipping (India)

- Delivery in 3 to 6 working days.
- Rates are calculated by weight and shown at checkout.

## International shipping

- We ship to the Gulf, the UK, Europe, the US, Singapore and most other countries.
- Rates are calculated by weight and shown before you pay.
- **Duties and taxes:** international orders ship DDU. Any import duties or taxes are charged by your local customs on arrival and paid by you.

| Region | Estimated delivery |
| --- | --- |
| India | 3 to 6 working days |
| Gulf (UAE, Saudi Arabia, Qatar, Oman, Kuwait, Bahrain) | 5 to 8 working days |
| UK and Europe | 6 to 10 working days |
| US and rest of world | 7 to 12 working days |
');
INSERT INTO policies (slug, title, body_md) VALUES ('returns', 'Returns & exchanges', '## Ready-to-wear

- Exchange or return within **7 days** of delivery.
- Pieces must be unworn, unwashed and have tags attached.
- Size exchanges within India are free. We collect and redeliver.
- International returns are shipped back at your cost. Refunds are made to the original payment method within 7 working days of receipt.

## Made-to-order and custom measurements

These pieces are made for you and cannot be returned. If the fit is not right, contact us within 7 days and we will alter it.
');
INSERT INTO policies (slug, title, body_md) VALUES ('privacy', 'Privacy', 'We collect only what we need to fulfil your order and, if you opt in, to send you news about new drops.

- We never sell your data.
- Payments are processed by Razorpay and Stripe. We never see or store your card details.
- You can ask us to delete your account and data at any time.
');
INSERT INTO policies (slug, title, body_md) VALUES ('terms', 'Terms', 'By placing an order you agree to these terms.

- Prices are shown in your selected currency and include applicable Indian taxes. International duties are not included.
- We may cancel an order if a piece is out of stock, and will refund you in full.
- Product colours may vary slightly between screens.
');
INSERT INTO journal_posts (slug, title, excerpt, body_md, cover_image, tag, published_at) VALUES ('caring-for-georgette-chiffon-rayon', 'Caring for georgette, chiffon and rayon', 'Three fabrics, three ways to keep them looking new.', 'Fluid fabrics are why our pieces move the way they do. They also need a little care.

## Georgette

Hand wash cold, or dry clean anything with stones or embroidery. Never wring. Roll in a towel to remove water, then dry flat in the shade.

## Chiffon

Chiffon is fine and light. Wash it in a mesh bag on a delicate cycle, or by hand. Iron on the lowest setting through a cotton cloth.

## Rayon

Rayon gets softer with every wash. Wash inside out on cold, and dry in the shade so colours stay bright.
', 'https://images.unsplash.com/photo-1706943262582-60f570e32b0a?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Care', '2026-10-02 09:00:00+05:30');
INSERT INTO journal_posts (slug, title, excerpt, body_md, cover_image, tag, published_at) VALUES ('designed-around-how-you-want-to-feel', 'Designed around how you want to feel', 'Why we start with the body, not the trend.', 'Most clothes are designed around a single idea of a body. We start somewhere else: with how you want to feel when you wear them.

That means princess seams instead of darts that pull, wraps that you adjust, and hems that sit where they flatter. Every product page tells you exactly where each seam lands, so you can buy with confidence from anywhere in the world.
', 'https://images.unsplash.com/photo-1607997637503-d4d8dee871e4?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Fit', '2026-10-05 09:00:00+05:30');
INSERT INTO journal_posts (slug, title, excerpt, body_md, cover_image, tag, published_at) VALUES ('why-haseki', 'Why Haseki?', 'The story behind our name.', 'In the Ottoman court, *Haseki* was the title given to the sultan''s most favoured consort: the chosen one. The most famous was Hürrem Sultan, who rose to become one of the most powerful women of her age.

It is a word that sits at the crossroads of East and West, which is exactly where our clothes sit: Indian surface craft, carried on global silhouettes, made in Kochi for women everywhere.
', 'https://images.unsplash.com/photo-1633145284780-c8fda4f11464?w=1600&h=1067&fit=crop&crop=entropy&q=80', 'Story', '2026-10-08 09:00:00+05:30');
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 1), 'https://images.unsplash.com/photo-1607997637503-d4d8dee871e4?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a white long-sleeve dress', 1200, 1600, 'The Scallop Midi, Fort Kochi', 0);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 1), 'https://images.unsplash.com/photo-1612595391900-29390866733a?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red and white dress in a field', 1200, 1600, 'Late light, Mattancherry', 1);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 1), 'https://images.unsplash.com/photo-1628620835051-8f40f48c928d?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a black long-sleeve top by a wooden wall', 1200, 1600, 'The Scallop Blouse', 2);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 1), 'https://images.unsplash.com/photo-1633145284780-c8fda4f11464?w=1600&h=1067&fit=crop&crop=entropy&q=80', 'Boat on the Kerala backwaters between palm trees', 1600, 1067, 'Backwaters, Alleppey', 3);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 1), 'https://images.unsplash.com/photo-1580478491436-fd6a937acc9e?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red blazer sitting on stairs', 1200, 1600, 'The Cropped Scallop Jacket', 4);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 2), 'https://images.unsplash.com/photo-1609748340041-f5d61e061ebc?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a green and white dress', 1200, 1600, 'The Easy Dress, Stone Garden', 5);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 2), 'https://images.unsplash.com/photo-1722281763168-91ac74c0d965?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a red dress leaning on a wall', 1200, 1600, 'The Wrap', 6);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 2), 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in a pink and orange sari between trees', 1200, 1600, 'The Gracious Drape Saree', 7);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 3), 'https://images.unsplash.com/photo-1651828855101-38dba7f57245?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman in an orange dress', 1200, 1600, 'Colour Play', 8);
INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = 3), 'https://images.unsplash.com/photo-1657373307141-349a3393d4d9?w=1200&h=1600&fit=crop&crop=entropy&q=80', 'Woman standing on a balcony', 1200, 1600, 'The Perfect Shirt', 9);
INSERT INTO shipping_zones (code, name, countries, eta) VALUES ('IN', 'India', ARRAY['IN']::char(2)[], '3 to 6 working days');
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 1000, 'INR', 9900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 1000, 'USD', 200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 1000, 'GBP', 200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 1000, 'AED', 800);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 2000, 'INR', 14900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 2000, 'USD', 300);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 2000, 'GBP', 300);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 2000, 'AED', 1200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 5000, 'INR', 24900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 5000, 'USD', 500);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 5000, 'GBP', 400);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('IN', 5000, 'AED', 2000);
INSERT INTO shipping_zones (code, name, countries, eta) VALUES ('GCC', 'Gulf', ARRAY['AE','SA','QA','OM','KW','BH']::char(2)[], '5 to 8 working days');
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 1000, 'INR', 149900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 1000, 'USD', 1800);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 1000, 'GBP', 1400);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 1000, 'AED', 6500);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 2000, 'INR', 229900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 2000, 'USD', 2700);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 2000, 'GBP', 2200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 2000, 'AED', 9900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 5000, 'INR', 399900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 5000, 'USD', 4800);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 5000, 'GBP', 3800);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('GCC', 5000, 'AED', 17500);
INSERT INTO shipping_zones (code, name, countries, eta) VALUES ('UK', 'United Kingdom', ARRAY['GB']::char(2)[], '6 to 10 working days');
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 1000, 'INR', 179900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 1000, 'USD', 2200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 1000, 'GBP', 1700);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 1000, 'AED', 8000);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 2000, 'INR', 269900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 2000, 'USD', 3200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 2000, 'GBP', 2500);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 2000, 'AED', 11800);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 5000, 'INR', 449900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 5000, 'USD', 5400);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 5000, 'GBP', 4200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('UK', 5000, 'AED', 19800);
INSERT INTO shipping_zones (code, name, countries, eta) VALUES ('EU', 'Europe', ARRAY['DE','FR','IE','NL','IT','ES','BE','AT','PT','SE','DK','FI']::char(2)[], '6 to 10 working days');
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 1000, 'INR', 199900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 1000, 'USD', 2400);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 1000, 'GBP', 1900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 1000, 'AED', 8800);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 2000, 'INR', 299900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 2000, 'USD', 3600);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 2000, 'GBP', 2800);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 2000, 'AED', 13200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 5000, 'INR', 499900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 5000, 'USD', 6000);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 5000, 'GBP', 4700);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('EU', 5000, 'AED', 22000);
INSERT INTO shipping_zones (code, name, countries, eta) VALUES ('US', 'United States', ARRAY['US']::char(2)[], '7 to 12 working days');
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 1000, 'INR', 219900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 1000, 'USD', 2600);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 1000, 'GBP', 2100);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 1000, 'AED', 9600);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 2000, 'INR', 329900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 2000, 'USD', 3900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 2000, 'GBP', 3100);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 2000, 'AED', 14400);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 5000, 'INR', 549900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 5000, 'USD', 6500);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 5000, 'GBP', 5100);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('US', 5000, 'AED', 24000);
INSERT INTO shipping_zones (code, name, countries, eta) VALUES ('ROW', 'Rest of world', '{}', '7 to 12 working days');
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 1000, 'INR', 229900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 1000, 'USD', 2800);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 1000, 'GBP', 2200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 1000, 'AED', 10200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 2000, 'INR', 349900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 2000, 'USD', 4200);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 2000, 'GBP', 3300);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 2000, 'AED', 15400);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 5000, 'INR', 599900);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 5000, 'USD', 7000);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 5000, 'GBP', 5500);
INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ('ROW', 5000, 'AED', 25800);
UPDATE products SET custom_fit = true WHERE slug IN ('the-wrap', 'the-peplum', 'the-tailored-blouse', 'the-occasion-saree');
COMMIT;
