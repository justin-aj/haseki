"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ProductSummary, Schemas } from "@/lib/api/client";
import { categories } from "@/lib/site";
import { useCurrency } from "@/lib/use-currency";
import { cn } from "@/lib/utils";
import { ProductGrid } from "./product-grid";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
] as const;

/** Filters run on the client over the prerendered catalog; the URL stays shareable. */
export function ShopBrowser({
  products,
  pillars,
  drops,
}: {
  products: ProductSummary[];
  pillars: Schemas["Pillar"][];
  drops: Schemas["Drop"][];
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const currency = useCurrency();

  const pillar = params.get("pillar");
  const category = params.get("category");
  const drop = params.get("drop");
  const sort = params.get("sort") ?? "featured";
  const inStock = params.get("in_stock") === "1";

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    // Native history integrates with useSearchParams without a server round trip.
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  const visible = useMemo(() => {
    const price = (p: ProductSummary) => p.prices.find((m) => m.currency === currency)?.amount_minor ?? 0;
    const list = products.filter(
      (p) =>
        (!pillar || p.pillars.includes(pillar)) &&
        (!category || p.category === category) &&
        (!drop || p.drop_slug === drop) &&
        (!inStock || p.in_stock),
    );
    if (sort === "price-asc") list.sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") list.sort((a, b) => price(b) - price(a));
    return list;
  }, [products, pillar, category, drop, inStock, sort, currency]);

  const activePillar = pillars.find((p) => p.slug === pillar);
  const activeDrop = drops.find((d) => d.slug === drop);
  const filterCount = [category, inStock ? "1" : null, drop].filter(Boolean).length;

  const filters = (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-xs tracking-[0.14em] text-muted-foreground uppercase">Piece</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={!category} onClick={() => update("category", null)}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip key={c.slug} active={category === c.slug} onClick={() => update("category", c.slug)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-xs tracking-[0.14em] text-muted-foreground uppercase">Drop</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={!drop} onClick={() => update("drop", null)}>
            All
          </Chip>
          {drops.map((d) => (
            <Chip key={d.slug} active={drop === d.slug} onClick={() => update("drop", d.slug)}>
              {d.name}
            </Chip>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-3">
        <Checkbox id="in-stock" checked={inStock} onCheckedChange={(v) => update("in_stock", v ? "1" : null)} />
        <Label htmlFor="in-stock" className="font-normal">
          In stock only
        </Label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mood chips: primary navigation of the shop. */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip size="lg" active={!pillar} onClick={() => update("pillar", null)}>
          Everything
        </Chip>
        {pillars.map((p) => (
          <Chip key={p.slug} size="lg" active={pillar === p.slug} onClick={() => update("pillar", p.slug)}>
            {p.name}
          </Chip>
        ))}
      </div>
      {activePillar && <p className="mt-4 max-w-xl text-muted-foreground">{activePillar.description}</p>}
      {activeDrop && !activePillar && <p className="mt-4 max-w-xl text-muted-foreground">{activeDrop.tagline}</p>}

      <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)]">{filters}</div>
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4 text-sm">
            <p className="text-muted-foreground">
              {visible.length} {visible.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger className="inline-flex h-10 items-center gap-2 lg:hidden">
                  <SlidersHorizontalIcon className="size-4" strokeWidth={1.5} />
                  Filter{filterCount > 0 && ` (${filterCount})`}
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto rounded-t-xl bg-background px-5 pb-10">
                  <SheetHeader className="px-0">
                    <SheetTitle className="font-heading text-xl">Filter</SheetTitle>
                  </SheetHeader>
                  {filters}
                </SheetContent>
              </Sheet>
              <label className="flex items-center gap-2">
                <span className="sr-only sm:not-sr-only sm:text-muted-foreground">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => update("sort", e.target.value === "featured" ? null : e.target.value)}
                  className="h-10 cursor-pointer bg-transparent outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {visible.length > 0 ? (
            <ProductGrid products={visible} />
          ) : (
            <div className="py-24 text-center">
              <p className="font-heading text-2xl">Nothing here yet.</p>
              <button
                onClick={() => window.history.replaceState(null, "", pathname)}
                className="mt-4 text-sm underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Chip({
  active,
  size = "md",
  className,
  ...props
}: React.ComponentProps<"button"> & { active: boolean; size?: "md" | "lg" }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border transition-colors",
        size === "lg" ? "h-11 px-5 text-sm" : "h-9 px-3.5 text-[0.82rem]",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent hover:border-foreground/50",
        className,
      )}
      {...props}
    />
  );
}
