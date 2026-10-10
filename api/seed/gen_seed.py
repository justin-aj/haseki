"""Generate api/seed/seed.sql for Haseki. Run: python3 -I gen_seed.py <out_path>"""
import sys

U = "https://images.unsplash.com/photo-{}?w=1200&h=1600&fit=crop&crop=entropy&q=80"
UL = "https://images.unsplash.com/photo-{}?w=1600&h=1067&fit=crop&crop=entropy&q=80"
IMG = {
    "A": ("1587538018365-2a1f8b544c08", "Woman in a red and white floral dress"),
    "B": ("1671881641527-0a1ee842e13e", "Woman in a red and gold sari"),
    "C": ("1706943262582-60f570e32b0a", "Woman in a sari posing outdoors"),
    "D": ("1706943262259-ffe65cb2bf70", "Woman in a white dress holding a bag"),
    "E": ("1628620835051-8f40f48c928d", "Woman in a black long-sleeve top by a wooden wall"),
    "F": ("1612595391900-29390866733a", "Woman in a red and white dress in a field"),
    "G": ("1618244965061-1d27b208d6e8", "Woman in a brown coat beside a black door"),
    "H": ("1657373307141-349a3393d4d9", "Woman standing on a balcony"),
    "I": ("1577155848406-b53ebd277c72", "Woman in front of a window"),
    "J": ("1722281763168-91ac74c0d965", "Woman in a red dress leaning on a wall"),
    "K": ("1722281762426-b4d88c31f9f8", "Woman in a red dress against a wall"),
    "L": ("1651828855101-38dba7f57245", "Woman in an orange dress"),
    "M": ("1627903893282-77403ec2637d", "Woman in a blue and white floral dress on a beach"),
    "N": ("1607189200597-4d0923ef98c6", "Woman in a white shirt with a green bag"),
    "O": ("1546784680-971022597abb", "Woman walking down a narrow lane"),
    "P": ("1679006831648-7c9ea12e5807", "Woman in a green sari with jewellery"),
    "Q": ("1618901185975-d59f7091bcfe", "Woman in a red dress sitting on a bench"),
    "R": ("1727430228383-aa1fb59db8bf", "Woman in a sari posing"),
    "S": ("1617627143750-d86bc21e42bb", "Woman in a pink and orange sari between trees"),
    "T": ("1610030469983-98e550d6193c", "Woman in a red and brown sari"),
    "U": ("1609748340041-f5d61e061ebc", "Woman in a green and white dress"),
    "V": ("1641699862936-be9f49b1c38d", "Woman in a purple and gold sari"),
    "W": ("1610030469668-8e9f641aaf27", "Woman in a dark dress beside a red wall"),
    "X": ("1678705730064-a7ecbab4b3fb", "Woman in a white and red sari"),
    "Y": ("1610189012906-4c0aa9b9781e", "Woman in a blue and yellow sari"),
    "Z": ("1662532577856-e8ee8b138a8b", "Woman in a red outfit against a blue sky"),
    "a1": ("1580478491436-fd6a937acc9e", "Woman in a red blazer sitting on stairs"),
    "a2": ("1613915617430-8ab0fd7c6baf", "Woman in a blazer and trousers"),
    "a3": ("1607997637503-d4d8dee871e4", "Woman in a white long-sleeve dress"),
    "a4": ("1659522761084-79196b64abe4", "Woman in a white dress"),
    "a5": ("1653152707179-125e4e184a0b", "Woman in a green dress"),
    "a6": ("1557022971-b3b7462cd090", "Woman wearing a red dress"),
    "a7": ("1571513800374-df1bbe650e56", "Woman holding a dried flower"),
    "a8": ("1619695739408-1cdba145c4b7", "Woman in a white and pink shirt on a wooden seat"),
}
RIVER = UL.format("1633145284780-c8fda4f11464")
STREET = UL.format("1684076021171-70cd12950f26")


def url(k):
    return U.format(IMG[k][0])


def q(s):
    return "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"


SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
# Per-market prices (not FX conversions). Minor units.
TIERS = {
    1299: (1299, 29, 24, 109),
    1499: (1499, 34, 27, 125),
    1799: (1799, 39, 32, 145),
    1899: (1899, 42, 34, 155),
    2199: (2199, 45, 37, 169),
    2299: (2299, 49, 39, 179),
    2499: (2499, 52, 42, 189),
    2799: (2799, 58, 46, 209),
    2999: (2999, 62, 49, 229),
    3299: (3299, 68, 54, 249),
    3499: (3499, 72, 57, 265),
    3799: (3799, 78, 62, 289),
    3999: (3999, 82, 65, 299),
    4499: (4499, 92, 74, 339),
}

DROPS = [
    ("the-scallop-study", 1, "The Scallop Study", "Soft edges, sharp lines.",
     "Our first drop starts with a single detail: the scallop. Worked into chiffon blouses, a sleeve top, a midi, a cropped jacket and two easy bottoms, it is the curve that softens a clean cut without ever turning it sweet.",
     url("F"), "2026-10-01"),
    ("the-stone-garden", 2, "The Stone Garden", "Printed georgettes, tiny stone interventions.",
     "Original botanical prints on fluid georgette, with small stones set where the light lands. The kind of detail you notice the second time you look.",
     url("U"), "2026-12-01"),
    ("colour-play", 3, "Colour Play", "Unexpected pairings, cleaner silhouettes.",
     "Colour does the talking here. Minimal embellishment, unexpected pairings, and silhouettes pared back so the shade is the statement.",
     url("L"), "2027-02-01"),
]

PILLARS = [
    ("the-wrap", "The Wrap", "Cut and silhouette, engineered for real proportions. Wraps, peplums, sculpted shirts.", url("J"), 1),
    ("the-scallop", "The Scallop", "Our signature edge, from Drop 01: The Scallop Study.", url("A"), 2),
    ("a-little-extra", "A Little Extra", "Stones, embroidery and drape for the evenings that ask for more.", url("B"), 3),
    ("a-little-something", "A Little Something", "Easy pieces and small treats. No occasion needed.", url("a7"), 4),
]

# slug, name, category, drop, tier, pillars, images, made_to_order, description, fit_notes, fabric, weight_g
P = [
    ("the-scallop-blouse", "The Scallop Blouse", "tops", 1, 2299, ["the-scallop", "a-little-extra"], ["E", "N"], False,
     "A sheer chiffon blouse finished with a hand-guided scallop at the hem and cuffs. Wear it tucked into the Fluid Trouser for work, or loose over a slip for dinner.",
     "Relaxed through the body, with a dropped shoulder. The scallop hem sits at the high hip, so it skims rather than clings. If you are between sizes, take the smaller.",
     "100% polyester chiffon, cotton-blend lining", 220),
    ("the-scallop-sleeve-top", "The Scallop Sleeve Top", "tops", 1, 1899, ["the-scallop", "a-little-something"], ["I", "O"], False,
     "A clean rayon top with a scalloped flutter sleeve. Simple enough for every day, with one detail people ask about.",
     "Fitted at the shoulder, easing through the waist. The sleeve ends just above the elbow and flatters fuller upper arms.",
     "100% rayon", 200),
    ("the-scallop-midi", "The Scallop Midi", "dresses", 1, 3299, ["the-scallop", "a-little-extra"], ["F", "a3"], False,
     "A georgette midi with a scalloped neckline and a fluid, bias-cut skirt that moves when you do.",
     "Princess seams shape the bust and waist without darts pulling. The skirt falls to mid-calf on a 165cm frame. True to size.",
     "Georgette, rayon lining", 380),
    ("the-cropped-scallop-jacket", "The Cropped Scallop Jacket", "jackets", 1, 3499, ["the-scallop", "a-little-extra"], ["a1", "a2"], False,
     "A structured cotton-blend jacket, cropped to the natural waist and edged with a tonal embroidered scallop.",
     "Boxy through the body and cropped to sit at the natural waist, so it balances high-rise trousers and full skirts. Size down for a closer fit.",
     "Cotton-linen blend, tonal embroidery", 450),
    ("the-fluid-trouser", "The Fluid Trouser", "bottoms", 1, 2499, ["the-scallop", "a-little-something"], ["G", "N"], False,
     "A high-rise wide-leg trouser in weighty rayon, with a scalloped side slit at the ankle.",
     "High rise with a flat front and an elasticated back waist. The leg falls straight from the hip. Inseam 78cm.",
     "Rayon twill", 380),
    ("the-scallop-skirt", "The Scallop Skirt", "bottoms", 1, 2299, ["the-scallop"], ["M", "A"], False,
     "An A-line georgette skirt with a scalloped hem, lined so it never turns sheer in the sun.",
     "Sits at the natural waist with a concealed side zip. The A-line flare starts at the hip. True to size.",
     "Georgette, rayon lining", 300),
    ("the-wrap", "The Wrap", "tops", 2, 2499, ["the-wrap"], ["J", "K"], False,
     "Our signature wrap top in printed georgette. A true wrap with an internal tie, so it holds its shape all day.",
     "The wrap crosses just below the bust and ties at the natural waist, so you set the fit. The neckline sits modestly with a hidden press stud.",
     "Printed georgette", 220),
    ("the-peplum", "The Peplum", "tops", 2, 2299, ["the-wrap"], ["W", "Q"], False,
     "A sculpted peplum top with a curved hem and a scatter of tiny stones at the neckline.",
     "Shaped through the bust and waist with princess seams. The peplum flares from just above the hip and flatters a defined or undefined waist.",
     "Georgette with crystal-stone detailing", 240),
    ("the-easy-dress-stone-garden", "The Easy Dress, Stone Garden", "dresses", 2, 2999, ["a-little-extra"], ["U", "a5"], False,
     "Our easiest dress in the Stone Garden print. Pull it on, add a belt or don't, and go.",
     "Relaxed shift shape with a gentle A-line. Falls just below the knee. Choose your usual size.",
     "Printed georgette, stone detailing", 340),
    ("stone-garden-co-ord", "Stone Garden Co-ord", "co-ords", 2, 3799, ["a-little-extra"], ["L", "Z"], False,
     "A two-piece set: a boxy shirt and a matching wide-leg trouser in the Stone Garden print. Office to evening without a change.",
     "Shirt is relaxed with a dropped shoulder. Trouser is high rise with an elasticated back. Sold as a set in one size.",
     "Printed georgette", 520),
    ("the-sculpted-shirt", "The Sculpted Shirt", "shirts", 2, 2199, ["the-wrap"], ["a4", "D"], False,
     "A crisp shirt with curved seams that follow the body, and a curved hem for wearing out.",
     "Darted at the back and shaped through the waist. Bust gape is designed out with a hidden placket button. True to size.",
     "Cotton poplin blend", 260),
    ("the-perfect-shirt", "The Perfect Shirt", "shirts", 3, 1499, ["a-little-something"], ["H", "a7"], False,
     "The shirt everyone needs, in a colour nobody expects. Clean, light and easy.",
     "Relaxed straight fit. Sleeves roll neatly to the elbow. Take your usual size for an easy fit, size down for tucking.",
     "Cotton-rayon blend", 240),
    ("colour-play-wrap-dress", "Colour Play Wrap Dress", "dresses", 3, 2799, ["the-wrap"], ["a6", "J"], False,
     "A wrap dress in an unexpected colour pairing, with a curved hem and fluttered sleeve.",
     "True wrap with an internal tie. Adjust the waist to suit you. Falls to mid-calf.",
     "Rayon crepe", 360),
    ("the-gracious-drape-saree", "The Gracious Drape Saree", "sarees", 2, 3999, ["a-little-extra"], ["S", "T"], False,
     "A ready-to-wear georgette saree with a scalloped border. Light enough for a long evening.",
     "Comes with an unstitched blouse piece. Order The Tailored Blouse for a made-to-measure fit.",
     "Georgette with embroidered border", 520),
    ("the-tailored-blouse", "The Tailored Blouse", "sarees", 3, 1799, ["a-little-something"], ["V", "X"], False,
     "A clean, sleeveless saree blouse, cut close and finished with a tonal scallop at the back.",
     "Close fit through the bust with side zip. Pair with any saree. Custom measurements available on request.",
     "Rayon silk blend", 150),
    ("the-occasion-saree", "The Occasion Saree", "sarees", 2, 4499, ["a-little-extra"], ["B", "R"], True,
     "Made to order. Georgette with stone work across the pallu, for weddings and the nights that follow.",
     "Made to order in 3 to 4 weeks. Blouse stitched to your measurements.",
     "Georgette, stone and thread work", 700),
]

REVIEWS = [
    ("the-wrap", "Anjali, Kochi", 5, "Finally a wrap that stays put. I am 160cm and it hits exactly at my waist.", 160, "M", "M", "true"),
    ("the-wrap", "Rhea, Dubai", 4, "Beautiful print, arrived in 6 days. Size runs slightly roomy at the bust.", 168, "L", "M", "large"),
    ("the-scallop-midi", "Meera, Bangalore", 5, "The neckline is everything. People have asked where it's from every time.", 165, "S", "S", "true"),
    ("the-scallop-midi", "Sara, London", 5, "Fits like it was made for me. Ordered my usual size.", 172, "M", "M", "true"),
    ("the-peplum", "Neha, Ernakulam", 4, "Lovely shape. I'd size up if you have a fuller bust.", 158, "M", "M", "small"),
    ("the-scallop-blouse", "Divya, Kochi", 5, "So light for Kochi summers. The scallop hem is a dream.", 162, "S", "S", "true"),
    ("the-fluid-trouser", "Ammu, Thrissur", 5, "Perfect length on me without hemming. Moves beautifully.", 167, "M", "M", "true"),
]

FAQS = [
    ("Sizing", "How do I find my size?", "Every product page has a size guide with body measurements in centimetres and inches. Measure your bust, waist and hip, then match the largest measurement. Each product also has fit notes telling you where the seams sit."),
    ("Sizing", "What if I'm between sizes?", "Our fit notes tell you which way to go for each piece. As a rule, size down in wraps (the tie adjusts) and size up in close-fitting blouses."),
    ("Sizing", "Do you offer custom measurements?", "Selected pieces, including The Tailored Blouse and The Occasion Saree, can be made to your measurements. Custom fit for The Wrap and The Peplum is coming soon."),
    ("Shipping", "Do you ship worldwide?", "Yes. We ship across India and worldwide, including the Gulf, the UK, the US and Singapore. Shipping is calculated by weight and shown before you pay."),
    ("Shipping", "Do I pay customs or duties?", "International orders are currently shipped DDU, which means any duties or import taxes are paid by you on arrival. We show this clearly at checkout, so there are no surprises."),
    ("Shipping", "How long does delivery take?", "India: 3 to 6 working days. Gulf: 5 to 8. UK and Europe: 6 to 10. US and rest of world: 7 to 12."),
    ("Returns", "Can I return or exchange?", "Ready-to-wear pieces can be exchanged for another size or returned within 7 days of delivery, unworn with tags. Made-to-order and custom-measured pieces cannot be returned, but we will alter them if the fit is off."),
    ("Returns", "How do size exchanges work?", "Request an exchange from your account or our contact page. Within India, we collect the piece and send the new size free of charge."),
    ("Care", "How do I care for georgette and chiffon?", "Hand wash cold or dry clean. Do not wring. Dry flat in the shade and iron on low through a cloth, especially near stones and embroidery."),
    ("Care", "And rayon?", "Rayon softens with every wash. Machine wash cold on a gentle cycle inside out, and dry in the shade to keep colours bright."),
]

TESTIMONIALS = [
    ("Anjali", "Kochi", "I wore The Wrap to a work dinner and three people asked where it was from. It fits like it was cut for me.", "The Wrap"),
    ("Meera", "Bangalore", "I've never owned something this pretty that I can actually wear on a Tuesday.", "The Scallop Midi"),
    ("Rhea", "Dubai", "It made me stand up straighter. That's the only way I can describe it.", "The Peplum"),
    ("Sara", "London", "The detail is so considered. And it arrived faster than things I order locally.", "The Scallop Blouse"),
    ("Divya", "Ernakulam", "Light enough for a Kochi afternoon, special enough for the evening after.", "The Easy Dress"),
]

EVENTS = [
    ("Kochi", "Panampilly Nagar pop-up", "2026-11-14", "2026-11-16", "confirmed", "Our first pop-up. Try the full Scallop Study and get measured for custom fit."),
    ("Bangalore", "Indiranagar", None, None, "planned", "Early 2027."),
    ("Mumbai", "Bandra", None, None, "planned", "Spring 2027."),
    ("Dubai", "Alserkal Avenue", None, None, "planned", "Late 2027."),
    ("London", "TBC", None, None, "planned", "2028."),
]

POLICIES = [
    ("shipping", "Shipping", """## Domestic shipping (India)

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
"""),
    ("returns", "Returns & exchanges", """## Ready-to-wear

- Exchange or return within **7 days** of delivery.
- Pieces must be unworn, unwashed and have tags attached.
- Size exchanges within India are free. We collect and redeliver.
- International returns are shipped back at your cost. Refunds are made to the original payment method within 7 working days of receipt.

## Made-to-order and custom measurements

These pieces are made for you and cannot be returned. If the fit is not right, contact us within 7 days and we will alter it.
"""),
    ("privacy", "Privacy", """We collect only what we need to fulfil your order and, if you opt in, to send you news about new drops.

- We never sell your data.
- Payments are processed by Razorpay and Stripe. We never see or store your card details.
- You can ask us to delete your account and data at any time.
"""),
    ("terms", "Terms", """By placing an order you agree to these terms.

- Prices are shown in your selected currency and include applicable Indian taxes. International duties are not included.
- We may cancel an order if a piece is out of stock, and will refund you in full.
- Product colours may vary slightly between screens.
"""),
]

JOURNAL = [
    ("caring-for-georgette-chiffon-rayon", "Caring for georgette, chiffon and rayon", "Three fabrics, three ways to keep them looking new.", "Care", url("C"), "2026-10-02",
     """Fluid fabrics are why our pieces move the way they do. They also need a little care.

## Georgette

Hand wash cold, or dry clean anything with stones or embroidery. Never wring. Roll in a towel to remove water, then dry flat in the shade.

## Chiffon

Chiffon is fine and light. Wash it in a mesh bag on a delicate cycle, or by hand. Iron on the lowest setting through a cotton cloth.

## Rayon

Rayon gets softer with every wash. Wash inside out on cold, and dry in the shade so colours stay bright.
"""),
    ("designed-around-how-you-want-to-feel", "Designed around how you want to feel", "Why we start with the body, not the trend.", "Fit", url("a3"), "2026-10-05",
     """Most clothes are designed around a single idea of a body. We start somewhere else: with how you want to feel when you wear them.

That means princess seams instead of darts that pull, wraps that you adjust, and hems that sit where they flatter. Every product page tells you exactly where each seam lands, so you can buy with confidence from anywhere in the world.
"""),
    ("why-haseki", "Why Haseki?", "The story behind our name.", "Story", RIVER, "2026-10-08",
     """In the Ottoman court, *Haseki* was the title given to the sultan's most favoured consort: the chosen one. The most famous was Hürrem Sultan, who rose to become one of the most powerful women of her age.

It is a word that sits at the crossroads of East and West, which is exactly where our clothes sit: Indian surface craft, carried on global silhouettes, made in Kochi for women everywhere.
"""),
]

LOOKBOOK = [  # key, drop, caption, landscape
    ("a3", 1, "The Scallop Midi, Fort Kochi", False),
    ("F", 1, "Late light, Mattancherry", False),
    ("E", 1, "The Scallop Blouse", False),
    (None, 1, "Backwaters, Alleppey", True),
    ("a1", 1, "The Cropped Scallop Jacket", False),
    ("U", 2, "The Easy Dress, Stone Garden", False),
    ("J", 2, "The Wrap", False),
    ("S", 2, "The Gracious Drape Saree", False),
    ("L", 3, "Colour Play", False),
    ("H", 3, "The Perfect Shirt", False),
]

ZONES = [
    ("IN", "India", ["IN"], "3 to 6 working days"),
    ("GCC", "Gulf", ["AE", "SA", "QA", "OM", "KW", "BH"], "5 to 8 working days"),
    ("UK", "United Kingdom", ["GB"], "6 to 10 working days"),
    ("EU", "Europe", ["DE", "FR", "IE", "NL", "IT", "ES", "BE", "AT", "PT", "SE", "DK", "FI"], "6 to 10 working days"),
    ("US", "United States", ["US"], "7 to 12 working days"),
    ("ROW", "Rest of world", [], "7 to 12 working days"),
]
# zone -> [(max_weight_g, INR, USD, GBP, AED)] in major units
RATES = {
    "IN": [(1000, 99, 2, 2, 8), (2000, 149, 3, 3, 12), (5000, 249, 5, 4, 20)],
    "GCC": [(1000, 1499, 18, 14, 65), (2000, 2299, 27, 22, 99), (5000, 3999, 48, 38, 175)],
    "UK": [(1000, 1799, 22, 17, 80), (2000, 2699, 32, 25, 118), (5000, 4499, 54, 42, 198)],
    "EU": [(1000, 1999, 24, 19, 88), (2000, 2999, 36, 28, 132), (5000, 4999, 60, 47, 220)],
    "US": [(1000, 2199, 26, 21, 96), (2000, 3299, 39, 31, 144), (5000, 5499, 65, 51, 240)],
    "ROW": [(1000, 2299, 28, 22, 102), (2000, 3499, 42, 33, 154), (5000, 5999, 70, 55, 258)],
}

out = ["-- Generated seed data for local development. Placeholder images from Unsplash; replace before launch.",
       "BEGIN;",
       "TRUNCATE drops, pillars, products, shipping_zones, journal_posts, lookbook_images, events, faqs, testimonials, policies RESTART IDENTITY CASCADE;"]

for slug, n, name, tag, story, hero, rel in DROPS:
    out.append(f"INSERT INTO drops (slug, number, name, tagline, story, hero_image, released_at) VALUES ({q(slug)}, {n}, {q(name)}, {q(tag)}, {q(story)}, {q(hero)}, {q(rel)});")
for slug, name, desc, img, pos in PILLARS:
    out.append(f"INSERT INTO pillars (slug, name, description, image, position) VALUES ({q(slug)}, {q(name)}, {q(desc)}, {q(img)}, {pos});")

drop_slug = {d[1]: d[0] for d in DROPS}
for i, (slug, name, cat, drop, tier, pillars, imgs, mto, desc, fit, fabric, w) in enumerate(P):
    out.append(
        f"INSERT INTO products (slug, name, description, fit_notes, fabric, care, category, drop_id, status, made_to_order, created_at) VALUES "
        f"({q(slug)}, {q(name)}, {q(desc)}, {q(fit)}, {q(fabric)}, {q('See our care guide. Hand wash cold or dry clean.')}, {q(cat)}, "
        f"(SELECT id FROM drops WHERE slug = {q(drop_slug[drop])}), 'active', {str(mto).lower()}, now() + interval '{i} seconds');")
    pid = f"(SELECT id FROM products WHERE slug = {q(slug)})"
    for p in pillars:
        out.append(f"INSERT INTO product_pillars (product_id, pillar_id) VALUES ({pid}, (SELECT id FROM pillars WHERE slug = {q(p)}));")
    for pos, k in enumerate(imgs):
        out.append(f"INSERT INTO product_images (product_id, url, alt, width, height, position) VALUES ({pid}, {q(url(k))}, {q(IMG[k][1])}, 1200, 1600, {pos});")
    inr, usd, gbp, aed = TIERS[tier]
    for cur, amt in (("INR", inr), ("USD", usd), ("GBP", gbp), ("AED", aed)):
        out.append(f"INSERT INTO prices (product_id, currency, amount_minor) VALUES ({pid}, '{cur}', {amt * 100});")
    sizes = ["One size"] if cat == "co-ords" or cat == "sarees" and "saree" in slug else SIZES
    sku_base = "HSK-" + "".join(part[0] for part in slug.split("-")).upper() + f"{i + 1:02d}"
    for pos, size in enumerate(sizes):
        stock = 0 if (size == "XXL" and i % 4 == 0) else (5 + (i * 7 + pos * 3) % 11)
        sku = f"{sku_base}-{size.replace(' ', '').upper()}"
        out.append(f"INSERT INTO variants (product_id, sku, size, colour, stock, weight_g, position) VALUES ({pid}, {q(sku)}, {q(size)}, '', {stock}, {w}, {pos});")

for slug, author, rating, body, h, usual, bought, fit in REVIEWS:
    out.append(f"INSERT INTO reviews (product_id, author, rating, body, height_cm, usual_size, size_bought, fit, approved) VALUES "
               f"((SELECT id FROM products WHERE slug = {q(slug)}), {q(author)}, {rating}, {q(body)}, {h}, {q(usual)}, {q(bought)}, '{fit}', true);")

for pos, (sec, ques, ans) in enumerate(FAQS):
    out.append(f"INSERT INTO faqs (section, question, answer, position) VALUES ({q(sec)}, {q(ques)}, {q(ans)}, {pos});")
for pos, (a, loc, quote, prod) in enumerate(TESTIMONIALS):
    out.append(f"INSERT INTO testimonials (author, location, quote, product, position) VALUES ({q(a)}, {q(loc)}, {q(quote)}, {q(prod)}, {pos});")
for pos, (city, venue, s, e, st, note) in enumerate(EVENTS):
    out.append(f"INSERT INTO events (city, venue, starts_on, ends_on, status, note, position) VALUES ({q(city)}, {q(venue)}, {q(s)}, {q(e)}, {q(st)}, {q(note)}, {pos});")
for slug, title, body in POLICIES:
    out.append(f"INSERT INTO policies (slug, title, body_md) VALUES ({q(slug)}, {q(title)}, {q(body)});")
for slug, title, ex, tag, cover, date, body in JOURNAL:
    out.append(f"INSERT INTO journal_posts (slug, title, excerpt, body_md, cover_image, tag, published_at) VALUES ({q(slug)}, {q(title)}, {q(ex)}, {q(body)}, {q(cover)}, {q(tag)}, {q(date + ' 09:00:00+05:30')});")
for pos, (k, drop, cap, land) in enumerate(LOOKBOOK):
    if k is None:
        u, alt, w, h = RIVER, "Boat on the Kerala backwaters between palm trees", 1600, 1067
    else:
        u, alt, w, h = url(k), IMG[k][1], 1200, 1600
    out.append(f"INSERT INTO lookbook_images (drop_id, url, alt, width, height, caption, position) VALUES ((SELECT id FROM drops WHERE number = {drop}), {q(u)}, {q(alt)}, {w}, {h}, {q(cap)}, {pos});")

for code, name, countries, eta in ZONES:
    arr = "ARRAY[" + ",".join(q(c) for c in countries) + "]::char(2)[]" if countries else "'{}'"
    out.append(f"INSERT INTO shipping_zones (code, name, countries, eta) VALUES ({q(code)}, {q(name)}, {arr}, {q(eta)});")
    for mw, inr, usd, gbp, aed in RATES[code]:
        for cur, amt in (("INR", inr), ("USD", usd), ("GBP", gbp), ("AED", aed)):
            out.append(f"INSERT INTO shipping_rates (zone_code, max_weight_g, currency, amount_minor) VALUES ({q(code)}, {mw}, '{cur}', {amt * 100});")

# Phase 2 custom fit on the signature silhouettes and made-to-measure pieces.
out.append("UPDATE products SET custom_fit = true WHERE slug IN ('the-wrap', 'the-peplum', 'the-tailored-blouse', 'the-occasion-saree');")
out.append("COMMIT;")
open(sys.argv[1], "w").write("\n".join(out) + "\n")
print(len(out), "statements")
