"use client";

import { ShoppingBagIcon } from "lucide-react";
import { useCart } from "@/components/commerce/cart-context";

export function BagButton() {
  const { cart, setOpen } = useCart();
  const count = cart?.item_count ?? 0;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={count ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag"}
      className="relative inline-flex size-11 items-center justify-center"
    >
      <ShoppingBagIcon className="size-5" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute top-1.5 right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.62rem] leading-4 text-white tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}
