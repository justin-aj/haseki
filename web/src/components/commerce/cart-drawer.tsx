"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatMoney } from "@/lib/currency";
import { useCart } from "./cart-context";
import { CartLines } from "./cart-lines";

export function CartDrawer() {
  const { cart, open, setOpen } = useCart();
  const close = () => setOpen(false);
  const empty = !cart || cart.items.length === 0;
  const blocked = cart?.items.some((l) => l.quantity > l.available);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="font-heading text-xl">Your bag{cart && cart.item_count > 0 && ` (${cart.item_count})`}</SheetTitle>
          <SheetDescription className="sr-only">Items in your bag</SheetDescription>
        </SheetHeader>
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-heading text-2xl">Your bag is empty.</p>
            <p className="text-muted-foreground">Start with how you want to feel.</p>
            <Link href="/shop" onClick={close} className="mt-2 inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm text-primary-foreground">
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6">
              <CartLines cart={cart} onNavigate={close} compact />
            </div>
            <div className="border-t px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex justify-between text-base">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatMoney({ currency: cart.currency, amount_minor: cart.subtotal_minor })}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Shipping is calculated by weight at checkout.</p>
              <Link
                href="/checkout"
                onClick={close}
                aria-disabled={blocked}
                className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-primary text-sm tracking-[0.08em] text-primary-foreground uppercase aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                Checkout
              </Link>
              <Link href="/cart" onClick={close} className="mt-3 block text-center text-sm underline underline-offset-4">
                View bag
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
