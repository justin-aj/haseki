"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Schemas, browserApi } from "@/lib/api/client";
import { useCurrency } from "@/lib/use-currency";

export type Cart = Schemas["Cart"];

type CartContextValue = {
  cart: Cart | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  busy: boolean;
  add: (variantId: string, label: string, measurements?: Record<string, number>) => Promise<boolean>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

/** Cart lives in the Rust API behind an HttpOnly cookie; this keeps a client copy for the UI. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const currency = useCurrency();
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await browserApi.GET("/cart", { params: { query: { currency } } });
    if (data) setCart(data);
  }, [currency]);

  // Load on mount and whenever the visitor switches market.
  useEffect(() => {
    let live = true;
    browserApi.GET("/cart", { params: { query: { currency } } }).then(({ data }) => {
      if (live && data) setCart(data);
    });
    return () => {
      live = false;
    };
  }, [currency]);

  const add = useCallback<CartContextValue["add"]>(
    async (variantId, label, measurements) => {
      setBusy(true);
      try {
        const { data, error } = await browserApi.POST("/cart/items", {
          body: { variant_id: variantId, quantity: 1, currency, measurements },
        });
        if (error || !data) {
          toast.error(error?.error ?? "Couldn't add that. Try again.");
          return false;
        }
        setCart(data);
        // Opening the drawer is the confirmation; announce it for screen readers too.
        setOpen(true);
        toast.success(`${label} added to your bag`, { duration: 1500, className: "sr-only" });
        return true;
      } finally {
        setBusy(false);
      }
    },
    [currency],
  );

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    async (lineId, quantity) => {
      setBusy(true);
      try {
        const { data, error } = await browserApi.PATCH("/cart/items/{id}", {
          params: { path: { id: lineId } },
          body: { quantity, currency },
        });
        if (error) toast.error(error.error ?? "Couldn't update quantity.");
        if (data) setCart(data);
      } finally {
        setBusy(false);
      }
    },
    [currency],
  );

  const remove = useCallback<CartContextValue["remove"]>(
    async (lineId) => {
      setBusy(true);
      try {
        const { data } = await browserApi.DELETE("/cart/items/{id}", {
          params: { path: { id: lineId }, query: { currency } },
        });
        if (data) setCart(data);
      } finally {
        setBusy(false);
      }
    },
    [currency],
  );

  const value = useMemo(
    () => ({ cart, open, setOpen, busy, add, setQuantity, remove, refresh }),
    [cart, open, busy, add, setQuantity, remove, refresh],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
