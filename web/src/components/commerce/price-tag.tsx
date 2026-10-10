import type { Money } from "@/lib/api/client";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";

/** Renders every market price; CSS keyed on html[data-currency] shows the visitor's one. */
export function PriceTag({ prices, className }: { prices: Money[]; className?: string }) {
  return (
    <span className={cn("tabular-nums", className)}>
      {prices.map((p) => (
        <span key={p.currency} data-cur={p.currency}>
          {formatMoney(p)}
        </span>
      ))}
    </span>
  );
}
