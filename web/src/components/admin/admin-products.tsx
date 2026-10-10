"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Currency, type Schemas, browserApi } from "@/lib/api/client";
import { CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Product = Schemas["AdminProduct"];

export function AdminProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let live = true;
    browserApi.GET("/admin/products").then(({ data }) => live && setProducts(data ?? []));
    return () => {
      live = false;
    };
  }, []);

  if (!products) return <div className="h-96 animate-pulse rounded-sm bg-muted" />;
  const visible = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Find a product"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-11 w-full max-w-sm rounded-md border bg-card px-3 text-base"
      />
      <ul className="space-y-3">
        {visible.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </ul>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const [status, setStatus] = useState(product.status);
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(product.prices.map((p) => [p.currency, String(p.amount_minor / 100)])),
  );
  const [stock, setStock] = useState(() => Object.fromEntries(product.variants.map((v) => [v.id, String(v.stock)])));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const priceBody = CURRENCIES.filter((c) => prices[c.code] !== undefined).map((c) => ({
      currency: c.code as Currency,
      amount_minor: Math.round(Number(prices[c.code]) * 100),
    }));
    if (priceBody.some((p) => !Number.isFinite(p.amount_minor) || p.amount_minor <= 0)) {
      setSaving(false);
      toast.error("Prices must be numbers above zero.");
      return;
    }
    const results = await Promise.all([
      browserApi.PATCH("/admin/products/{id}", { params: { path: { id: product.id } }, body: { status, prices: priceBody } }),
      ...product.variants
        .filter((v) => String(v.stock) !== stock[v.id])
        .map((v) =>
          browserApi.PATCH("/admin/variants/{id}", { params: { path: { id: v.id } }, body: { stock: Number(stock[v.id]) } }),
        ),
    ]);
    setSaving(false);
    const failed = results.find((r) => r.error);
    if (failed?.error) toast.error(failed.error.error ?? "Couldn't save.");
    else toast.success(`${product.name} saved`);
  }

  return (
    <li className="rounded-sm border bg-card p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
          {product.image_url && <Image src={product.image_url} alt="" fill sizes="56px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-medium">{product.name}</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Status"
              className={cn(
                "h-8 rounded-full border px-2 text-xs",
                status === "active" ? "border-primary/40 text-primary" : "text-muted-foreground",
              )}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            /{product.slug} · {product.category}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <label key={v.id} className="flex items-center gap-1.5 rounded-sm border bg-background px-2 py-1 text-xs">
                <span className="w-8 font-medium">{v.size}</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={stock[v.id]}
                  onChange={(e) => setStock((s) => ({ ...s, [v.id]: e.target.value }))}
                  aria-label={`Stock for ${v.size}`}
                  className={cn("h-7 w-14 rounded border px-1.5 text-right tabular-nums", Number(stock[v.id]) <= 2 && "border-destructive/50 text-destructive")}
                />
              </label>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <label key={c.code} className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">{c.code}</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={prices[c.code] ?? ""}
                  onChange={(e) => setPrices((p) => ({ ...p, [c.code]: e.target.value }))}
                  aria-label={`Price in ${c.code}`}
                  className="h-8 w-24 rounded border bg-background px-2 text-right tabular-nums"
                />
              </label>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-10 shrink-0 rounded-full bg-primary px-5 text-sm text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </li>
  );
}
