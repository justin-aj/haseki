"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/currency";
import { useCart } from "./cart-context";
import { CartLines } from "./cart-lines";

export function CartPageContent() {
  const { cart } = useCart();
  if (!cart) return <div className="h-64 animate-pulse rounded-sm bg-muted" aria-label="Loading your bag" />;
  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-heading text-3xl">Your bag is empty.</p>
        <Link href="/shop" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm text-primary-foreground">
          Shop the collection
        </Link>
      </div>
    );
  }
  const blocked = cart.items.some((l) => l.quantity > l.available);
  return (
    <div>
      <div className="border-t">
        <CartLines cart={cart} />
      </div>
      <div className="mt-6 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg">
            Subtotal{" "}
            <span className="tabular-nums">{formatMoney({ currency: cart.currency, amount_minor: cart.subtotal_minor })}</span>
          </p>
          <p className="text-sm text-muted-foreground">Shipping calculated by weight at checkout.</p>
        </div>
        <Link
          href="/checkout"
          aria-disabled={blocked}
          className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-sm tracking-[0.08em] text-primary-foreground uppercase aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
