"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductSummary } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

/**
 * Horizontal rail using native scroll-snap: momentum on every platform.
 * Touch users swipe; mouse users get prev/next arrows (hidden on touch-only devices).
 */
export function ProductRail({ products, morph = true }: { products: ProductSummary[]; morph?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  function page(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  }

  const arrow =
    "absolute top-[38%] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-foreground/10 backdrop-blur transition-opacity hover:bg-background disabled:pointer-events-none disabled:opacity-0 [@media(hover:hover)]:flex";

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-10 lg:scroll-px-10 lg:gap-6 lg:px-10"
      >
        {products.map((p) => (
          <ProductCard
            key={p.slug}
            product={p}
            morph={morph}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 36vw, 62vw"
            className="w-[62vw] shrink-0 snap-start sm:w-[36vw] lg:w-[calc((100%-4.5rem)/4)]"
          />
        ))}
      </div>
      <button type="button" aria-label="Previous pieces" disabled={edges.start} onClick={() => page(-1)} className={cn(arrow, "-left-2 lg:-left-5")}>
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" aria-label="Next pieces" disabled={edges.end} onClick={() => page(1)} className={cn(arrow, "-right-2 lg:-right-5")}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
