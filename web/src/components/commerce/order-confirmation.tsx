"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { type Schemas, browserApi } from "@/lib/api/client";
import { formatMoney } from "@/lib/currency";
import { useCart } from "./cart-context";

type Order = Schemas["OrderSummary"];

/** Polls briefly while the payment webhook lands, then shows the confirmed order. */
export function OrderConfirmation() {
  const id = useSearchParams().get("order");
  const { refresh } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      const { data, response } = await browserApi.GET("/orders/{id}", { params: { path: { id } } });
      if (response.status === 404) return setMissing(true);
      if (data) setOrder(data);
      if (data?.status === "pending" && ++tries < 10) timer = setTimeout(load, 2000);
      else void refresh();
    };
    void load();
    return () => clearTimeout(timer);
  }, [id, refresh]);

  if (!id || missing) {
    return (
      <div className="text-center">
        <h1 className="text-4xl">We couldn&apos;t find that order.</h1>
        <p className="mt-4 text-muted-foreground">
          Check your confirmation email, or{" "}
          <Link href="/contact" className="underline underline-offset-4">
            contact us
          </Link>
          .
        </p>
      </div>
    );
  }
  if (!order) return <div className="h-64 animate-pulse rounded-sm bg-muted" aria-label="Loading your order" />;

  const paid = ["paid", "fulfilled", "shipped"].includes(order.status);
  const headline =
    order.status === "refunded"
      ? "This order was refunded."
      : order.status === "cancelled"
        ? "This order was cancelled."
        : order.status === "shipped"
          ? "Your order has shipped."
          : paid
            ? "Thank you. It's on its way."
            : "Confirming your payment…";
  const m = (amount_minor: number) => formatMoney({ currency: order.currency, amount_minor });
  return (
    <div>
      <p className="text-xs tracking-[0.18em] text-gold-ink uppercase">Order HSK-{order.number}</p>
      <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
        {headline}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground" aria-live="polite">
        {paid
          ? `We've sent a confirmation to ${order.email_masked}. Your pieces are being prepared in Kochi.`
          : order.status === "pending"
            ? "This usually takes a few seconds. You can keep this page open."
            : "Questions? Contact us and we'll help."}
      </p>
      <ul className="mt-10 divide-y border-y">
        {order.items.map((l, i) => (
          <li key={i} className="flex justify-between gap-4 py-4 text-sm">
            <span>
              {l.product_name} <span className="text-muted-foreground">· {l.size} · Qty {l.quantity}</span>
            </span>
            <span className="tabular-nums">{m(l.unit_price_minor * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{m(order.subtotal_minor)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd className="tabular-nums">{m(order.shipping_minor)}</dd>
        </div>
        <div className="flex justify-between pt-2 text-base font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{m(order.total_minor)}</dd>
        </div>
      </dl>
      <Link href="/shop" className="mt-12 inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm text-primary-foreground">
        Keep browsing
      </Link>
    </div>
  );
}
