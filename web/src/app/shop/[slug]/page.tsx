import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { FitReviews } from "@/components/commerce/fit-reviews";
import { PriceTag } from "@/components/commerce/price-tag";
import { productImageTransition } from "@/components/commerce/product-card";
import { ProductPurchase } from "@/components/commerce/product-purchase";
import { ProductRail } from "@/components/commerce/product-rail";
import { ReviewForm } from "@/components/commerce/review-form";
import { Container, SectionHeading } from "@/components/content/section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getProduct, getProducts, getReviews } from "@/lib/data";
import { categoryLabel, pillarLabel, site } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = product.images[0];
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: image ? [image.url] : [] },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const [product, reviews, all] = await Promise.all([getProduct(slug), getReviews(slug), getProducts()]);
  if (!product) notFound();

  const [hero, ...rest] = product.images;
  const related = all
    .filter((p) => p.slug !== product.slug && p.pillars.some((x) => product.pillars.includes(x)))
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: site.name },
    material: product.fabric,
    offers: product.prices.map((p) => ({
      "@type": "Offer",
      price: (p.amount_minor / 100).toFixed(2),
      priceCurrency: p.currency,
      availability: product.variants.some((v) => v.in_stock)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${site.url}/shop/${product.slug}`,
    })),
    ...(product.review_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating_avg?.toFixed(1),
        reviewCount: product.review_count,
      },
    }),
  };

  return (
    <div className="pb-28 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Container className="pt-4 lg:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
          <Link href="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-foreground">
            {categoryLabel(product.category)}
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,1fr)] lg:gap-14">
          {/* Gallery: swipe on mobile, stacked grid on desktop. */}
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:-mx-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible">
            {hero && (
              <div className="relative aspect-[3/4] w-full shrink-0 snap-center bg-muted lg:col-span-2 lg:rounded-sm">
                <ViewTransition name={productImageTransition(product.slug)} share="morph" default="none">
                  <div className="absolute inset-0 overflow-hidden lg:rounded-sm">
                    <Image
                      src={hero.url}
                      alt={hero.alt}
                      fill
                      preload
                      fetchPriority="high"
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </ViewTransition>
              </div>
            )}
            {rest.map((img) => (
              <div
                key={img.url}
                className="relative aspect-[3/4] w-full shrink-0 snap-center overflow-hidden bg-muted lg:rounded-sm"
              >
                <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 27vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            {product.drop_name && (
              <p className="mb-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">{product.drop_name}</p>
            )}
            <h1 className="text-4xl leading-tight sm:text-5xl">{product.name}</h1>
            <PriceTag prices={product.prices} className="mt-3 block text-xl" />
            <p className="mt-1 text-xs text-muted-foreground">
              Inclusive of Indian taxes. International duties, if any, are paid on delivery.
            </p>

            <p className="mt-6 text-pretty text-foreground/85">{product.description}</p>

            <div className="mt-6 rounded-sm border-l-2 border-gold bg-card px-4 py-3 text-sm">
              <p className="mb-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">Fit notes</p>
              <p className="text-pretty">{product.fit_notes}</p>
            </div>

            {product.made_to_order && (
              <p className="mt-4 text-sm text-gold-ink">Made to order. Ships in 3 to 4 weeks.</p>
            )}

            <div className="mt-8">
              <ProductPurchase product={product} />
            </div>

            <ul className="mt-6 space-y-1.5 text-sm text-muted-foreground">
              <li>Free size exchange within India, 7 days from delivery.</li>
              <li>Ships worldwide. Shipping is calculated by weight at checkout.</li>
            </ul>

            <h2 className="sr-only">Details</h2>
            <Accordion type="multiple" className="mt-8 border-t">
              <AccordionItem value="fabric">
                <AccordionTrigger className="py-4 text-sm">Fabric & care</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>{product.fabric}</p>
                  <p className="mt-2">{product.care}</p>
                  <Link href="/journal/caring-for-georgette-chiffon-rayon" className="mt-2 inline-block underline underline-offset-4">
                    Read our care guide
                  </Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="py-4 text-sm">Shipping & returns</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>
                    India: 3 to 6 working days. Gulf: 5 to 8. UK, Europe: 6 to 10. US and rest of world: 7 to 12.
                  </p>
                  <p className="mt-2">
                    {product.made_to_order
                      ? "Made-to-order pieces cannot be returned, but we will alter them if the fit is off."
                      : "Exchange or return within 7 days, unworn with tags."}{" "}
                    <Link href="/policies/returns" className="underline underline-offset-4">
                      Full policy
                    </Link>
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="pillars">
                <AccordionTrigger className="py-4 text-sm">Part of</AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-2 text-sm">
                  {product.pillars.map((p) => (
                    <Link key={p} href={`/shop?pillar=${p}`} className="rounded-full border px-3 py-1.5 hover:border-foreground/60">
                      {pillarLabel(p)}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </Container>

      <Container className="mt-24 lg:mt-32">
        <FitReviews product={product} reviews={reviews} />
        <div className="mt-10 lg:ml-[calc(20rem+4rem)]">
          <ReviewForm slug={product.slug} />
        </div>
      </Container>

      {related.length > 0 && (
        <Container className="mt-24 lg:mt-32">
          <SectionHeading title="You might also like" />
          <ProductRail products={related} morph={false} />
        </Container>
      )}
    </div>
  );
}
