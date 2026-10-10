import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/commerce/product-grid";
import { ShopBrowser } from "@/components/commerce/shop-browser";
import { Container, PageHeader } from "@/components/content/section";
import { getDrops, getPillars, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop",
  description: "Wraps, scallops and a little extra. Shop Haseki by mood, piece or drop. Shipping worldwide.",
};

export default async function ShopPage() {
  const [products, pillars, drops] = await Promise.all([getProducts(), getPillars(), getDrops()]);
  return (
    <>
      <PageHeader eyebrow="Shop" title="Clothes for how you want to feel." />
      <Container>
        {/* The fallback is the full prerendered catalog, so crawlers and slow devices see products immediately. */}
        <Suspense fallback={<ProductGrid products={products} />}>
          <ShopBrowser products={products} pillars={pillars} drops={drops} />
        </Suspense>
      </Container>
    </>
  );
}
