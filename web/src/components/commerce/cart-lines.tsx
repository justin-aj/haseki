"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { type Cart, useCart } from "./cart-context";

export function CartLines({ cart, onNavigate, compact = false }: { cart: Cart; onNavigate?: () => void; compact?: boolean }) {
  const { setQuantity, remove, busy } = useCart();
  return (
    <ul className="divide-y">
      {cart.items.map((line) => {
        const short = line.quantity > line.available;
        return (
          <li key={line.id} className="flex gap-4 py-5">
            <Link
              href={`/shop/${line.product_slug}`}
              onClick={onNavigate}
              className={cn("relative aspect-[3/4] shrink-0 overflow-hidden rounded-sm bg-muted", compact ? "w-20" : "w-24 sm:w-28")}
            >
              {line.image_url && (
                <Image src={line.image_url} alt={line.image_alt ?? ""} fill sizes="112px" className="object-cover" />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/shop/${line.product_slug}`} onClick={onNavigate} className="line-clamp-2 block leading-snug">
                    {line.product_name}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">Size {line.size}</p>
                  {line.measurements && <p className="text-xs text-gold-ink">Custom measurements</p>}
                </div>
                <p className="shrink-0 text-sm tabular-nums">
                  {formatMoney({ currency: cart.currency, amount_minor: line.line_total_minor })}
                </p>
              </div>
              {short && (
                <p className="mt-1 text-xs text-destructive">
                  {line.available === 0 ? "Sold out. Remove to continue." : `Only ${line.available} left.`}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center rounded-full border">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={busy || line.quantity <= 1}
                    onClick={() => setQuantity(line.id, line.quantity - 1)}
                    className="inline-flex size-9 items-center justify-center disabled:opacity-40"
                  >
                    <MinusIcon className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={busy || line.quantity >= Math.min(10, line.available)}
                    onClick={() => setQuantity(line.id, line.quantity + 1)}
                    className="inline-flex size-9 items-center justify-center disabled:opacity-40"
                  >
                    <PlusIcon className="size-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(line.id)}
                  className="h-9 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
