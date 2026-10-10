"use client";

import { useState } from "react";
import type { ProductDetail } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-context";
import { PriceTag } from "./price-tag";
import { SizeGuide } from "./size-guide";

/** Size selection and add to bag. On mobile the action pins to the bottom of the screen. */
export function ProductPurchase({ product }: { product: ProductDetail }) {
  const [variantId, setVariantId] = useState<string | null>(
    product.variants.length === 1 ? product.variants[0].id : null,
  );
  const [nudge, setNudge] = useState(false);
  const [custom, setCustom] = useState(false);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const { add: addToCart, busy } = useCart();
  const variant = product.variants.find((v) => v.id === variantId);
  const soldOut = product.variants.every((v) => !v.in_stock);

  async function add() {
    if (!variant) {
      setNudge(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (custom) {
      const m = Object.fromEntries(
        Object.entries(measurements)
          .filter(([, v]) => v.trim() !== "")
          .map(([k, v]) => [k, Number(v)]),
      );
      if (Object.keys(m).length === 0) {
        setNudge(true);
        document.getElementById("custom-fit")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      await addToCart(variant.id, `${product.name}, custom fit`, m);
      return;
    }
    await addToCart(variant.id, `${product.name}, ${variant.size}`);
  }

  const label = soldOut ? "Sold out" : variant ? "Add to bag" : "Select a size";

  return (
    <div>
      {product.variants.length > 1 && (
        <fieldset id="size-picker" className="scroll-mt-32">
          <div className="mb-3 flex items-center justify-between">
            <legend className={cn("text-sm", nudge && !variant && "text-destructive")}>
              {variant ? `Size: ${variant.size}` : custom ? "Choose your closest size" : "Choose your size"}
            </legend>
            <SizeGuide />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.in_stock}
                aria-pressed={v.id === variantId}
                onClick={() => {
                  setVariantId(v.id);
                  setNudge(false);
                }}
                className={cn(
                  "h-12 rounded-sm border text-sm transition-colors",
                  v.id === variantId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-foreground/60",
                  !v.in_stock && "cursor-not-allowed text-muted-foreground line-through opacity-50",
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {product.custom_fit && (
        <CustomFit
          enabled={custom}
          onToggle={setCustom}
          values={measurements}
          onChange={(k, v) => setMeasurements((m) => ({ ...m, [k]: v }))}
          missing={nudge && custom}
        />
      )}

      <button
        type="button"
        onClick={add}
        disabled={soldOut || busy}
        className="mt-6 hidden h-14 w-full rounded-full bg-primary text-sm tracking-[0.08em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-50 lg:block"
      >
        {label}
      </button>

      {/* Mobile: sticky action bar, safe-area aware. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{product.name}</p>
            <PriceTag prices={product.prices} className="text-sm text-muted-foreground" />
          </div>
          <button
            type="button"
            onClick={add}
            disabled={soldOut || busy}
            className="h-12 shrink-0 rounded-full bg-primary px-6 text-sm text-primary-foreground disabled:opacity-50"
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}

const FIELDS = [
  { key: "height", label: "Height" },
  { key: "bust", label: "Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
] as const;

/** Phase 2 custom fit: cut from your closest size, adjusted to your measurements. */
function CustomFit({
  enabled,
  onToggle,
  values,
  onChange,
  missing,
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  missing: boolean;
}) {
  return (
    <div id="custom-fit" className="mt-6 scroll-mt-32 rounded-sm border bg-card p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 size-4 accent-[var(--forest)]"
        />
        <span>
          <span className="block text-sm font-medium">Make it to my measurements</span>
          <span className="block text-xs text-muted-foreground">
            Cut from your closest size, adjusted in our Kochi studio. Adds about a week. Custom pieces can be altered but
            not returned.
          </span>
        </span>
      </label>
      {enabled && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FIELDS.map((f) => (
            <label key={f.key} className="text-xs">
              <span className="mb-1 block text-muted-foreground">{f.label} (cm)</span>
              <input
                type="number"
                inputMode="decimal"
                min={45}
                max={220}
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                className={cn(
                  "h-11 w-full rounded-md border bg-background px-3 text-base tabular-nums",
                  missing && !Object.values(values).some((v) => v.trim()) && "border-destructive",
                )}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
