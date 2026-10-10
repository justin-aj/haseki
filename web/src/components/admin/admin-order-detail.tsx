"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { type Schemas, browserApi } from "@/lib/api/client";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "./admin-shell";

type Order = Schemas["AdminOrder"];

const actions: Record<string, { to: string; label: string; needsTracking?: boolean }[]> = {
  pending: [{ to: "cancelled", label: "Cancel abandoned checkout" }],
  paid: [
    { to: "fulfilled", label: "Mark as being prepared" },
    { to: "shipped", label: "Mark shipped", needsTracking: true },
    { to: "refunded", label: "Record refund" },
  ],
  fulfilled: [
    { to: "shipped", label: "Mark shipped", needsTracking: true },
    { to: "refunded", label: "Record refund" },
  ],
  shipped: [{ to: "refunded", label: "Record refund" }],
};

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await browserApi.GET("/admin/orders/{id}", { params: { path: { id } } });
    return data ?? null;
  }, [id]);

  useEffect(() => {
    let live = true;
    load().then((o) => live && setOrder(o));
    return () => {
      live = false;
    };
  }, [load]);

  async function move(to: string, needsTracking?: boolean) {
    if (to === "refunded" && !confirm("Record this order as refunded? Issue the refund in the Razorpay or Stripe dashboard first.")) {
      return;
    }
    setBusy(true);
    const { error } = await browserApi.POST("/admin/orders/{id}/status", {
      params: { path: { id } },
      body: { status: to, tracking_number: needsTracking ? tracking : null },
    });
    setBusy(false);
    if (error) {
      toast.error(error.error ?? "Couldn't update the order.");
      return;
    }
    toast.success(`Order marked ${to}`);
    setOrder(await load());
  }

  if (!order) return <div className="h-96 animate-pulse rounded-sm bg-muted" />;
  const a = order.shipping_address as Record<string, string>;
  const m = (amount_minor: number) => formatMoney({ currency: order.currency, amount_minor });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">
          ← Orders
        </Link>
        <h2 className="text-3xl">HSK-{order.number}</h2>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border bg-card p-5">
          <h3 className="mb-3 font-sans text-sm font-medium tracking-normal">Ship to</h3>
          <address className="text-sm leading-relaxed not-italic">
            {a.name}
            <br />
            {a.line1}
            {a.line2 && (
              <>
                <br />
                {a.line2}
              </>
            )}
            <br />
            {[a.city, a.region, a.postal_code].filter(Boolean).join(", ")}
            <br />
            {a.country}
            <br />
            {a.phone} · {order.email}
          </address>
          {order.tracking_number && <p className="mt-3 text-sm">Tracking: {order.tracking_number}</p>}
        </section>

        <section className="rounded-sm border bg-card p-5">
          <h3 className="mb-3 font-sans text-sm font-medium tracking-normal">Actions</h3>
          {(actions[order.status] ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No further actions.</p>
          ) : (
            <div className="space-y-3">
              {actions[order.status]?.some((x) => x.needsTracking) && (
                <Input
                  placeholder="Tracking number"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  className="h-11 bg-background"
                />
              )}
              <div className="flex flex-wrap gap-2">
                {actions[order.status]?.map((x) => (
                  <button
                    key={x.to}
                    type="button"
                    disabled={busy || (x.needsTracking && !tracking.trim())}
                    onClick={() => move(x.to, x.needsTracking)}
                    className={
                      x.to === "refunded" || x.to === "cancelled"
                        ? "h-10 rounded-full border border-destructive/40 px-4 text-sm text-destructive disabled:opacity-50"
                        : "h-10 rounded-full bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
                    }
                  >
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-5 border-t pt-4 text-xs text-muted-foreground">
            {order.payments.length === 0
              ? "No provider payment (mock or abandoned)."
              : order.payments.map((p) => (
                  <p key={p.provider_order_id}>
                    {p.provider} · {p.status} · {p.provider_payment_id ?? p.provider_order_id}
                  </p>
                ))}
          </div>
        </section>
      </div>

      <section className="overflow-x-auto rounded-sm border bg-card">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-3 font-normal">Piece</th>
              <th className="px-4 py-3 font-normal">SKU</th>
              <th className="px-4 py-3 font-normal">Qty</th>
              <th className="px-4 py-3 text-right font-normal">Line</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((l, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="px-4 py-3">
                  {l.product_name} · {l.size}
                  {l.measurements && (
                    <p className="text-xs text-gold-ink">
                      {Object.entries(l.measurements as Record<string, number>)
                        .map(([k, v]) => `${k} ${v}cm`)
                        .join(" · ")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{l.sku}</td>
                <td className="px-4 py-3">{l.quantity}</td>
                <td className="px-4 py-3 text-right tabular-nums">{m(l.unit_price_minor * l.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-right">
            <tr>
              <td colSpan={3} className="px-4 pt-3 text-muted-foreground">Subtotal</td>
              <td className="px-4 pt-3 tabular-nums">{m(order.subtotal_minor)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 text-muted-foreground">Shipping</td>
              <td className="px-4 tabular-nums">{m(order.shipping_minor)}</td>
            </tr>
            <tr className="font-medium">
              <td colSpan={3} className="px-4 pb-3">Total</td>
              <td className="px-4 pb-3 tabular-nums">{m(order.total_minor)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
