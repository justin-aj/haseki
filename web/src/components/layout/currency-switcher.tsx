"use client";

import type { Currency } from "@/lib/api/client";
import { CURRENCIES } from "@/lib/currency";
import { setCurrency, useCurrency } from "@/lib/use-currency";
import { cn } from "@/lib/utils";

/** Native select: smallest JS, best mobile UX (OS picker). */
export function CurrencySwitcher({ className }: { className?: string }) {
  const currency = useCurrency();
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="cursor-pointer appearance-none bg-transparent pr-4 text-xs tracking-wide uppercase outline-none focus-visible:underline"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-0 text-[0.6rem]">
        ▾
      </span>
    </label>
  );
}
