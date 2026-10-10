import type { Metadata } from "next";
import { Suspense } from "react";
import { getProduct, getProducts } from "@/lib/data";
import { ProductDetails } from "./product-details";

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

export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-8 sm:px-6 lg:px-10 lg:pt-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,1fr)] lg:gap-14">
        <div className="aspect-[3/4] animate-pulse rounded-sm bg-muted" />
        <div className="space-y-4">
          <div className="h-12 w-3/4 animate-pulse rounded-sm bg-muted" />
          <div className="h-6 w-1/4 animate-pulse rounded-sm bg-muted" />
          <div className="h-32 animate-pulse rounded-sm bg-muted" />
        </div>
      </div>
    </div>
  );
}
