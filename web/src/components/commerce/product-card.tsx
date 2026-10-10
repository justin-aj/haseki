import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { ProductSummary } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { PriceTag } from "./price-tag";

export const productImageTransition = (slug: string) => `product-${slug}`;

type Props = {
  product: ProductSummary;
  /** Card image morphs into the product page hero. Names must be unique per page. */
  morph?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  morph = true,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw",
  priority = false,
  className,
}: Props) {
  const [front, back] = product.images;
  const frontImage = front && (
    <Image
      src={front.url}
      alt={front.alt}
      fill
      sizes={sizes}
      preload={priority}
      className="object-cover"
    />
  );

  return (
    <Link href={`/shop/${product.slug}`} className={cn("group block", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
        {morph ? (
          <ViewTransition name={productImageTransition(product.slug)} share="morph" default="none">
            <div className="absolute inset-0">{frontImage}</div>
          </ViewTransition>
        ) : (
          frontImage
        )}
        {back && (
          // Second angle on hover, only on devices that can hover.
          <Image
            src={back.url}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-500 ease-out [@media(hover:hover)]:group-hover:opacity-100"
          />
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {product.made_to_order && <Tag>Made to order</Tag>}
          {!product.in_stock && <Tag>Sold out</Tag>}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h3 className="font-sans text-[0.95rem] leading-snug tracking-normal">{product.name}</h3>
        <PriceTag prices={product.prices} className="shrink-0 text-[0.95rem] text-muted-foreground" />
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-background/90 px-2.5 py-1 text-[0.68rem] tracking-[0.08em] uppercase backdrop-blur">
      {children}
    </span>
  );
}
