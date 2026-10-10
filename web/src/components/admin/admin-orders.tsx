"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type Schemas, browserApi } from "@/lib/api/client";
import { formatMoney } from "@/lib/currency";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./admin-shell";

const filters = [
  { value: "to_ship", label: "To ship" },
  { value: "", label: "All" },
  { value: "shipped", label: "Shipped" },
  { value: "pending", label: "Abandoned" },
  { value: "refunded", label: "Refunded" },
];

export function AdminOrders({ initialFilter = "to_ship", showFilters = true }: { initialFilter?: string; showFilters?: boolean }) {
  const [filter, setFilter] = useState(initialFilter);
  const [orders, setOrders] = useState<Schemas["AdminOrderRow"][] | null>(null);

  useEffect(() => {
    let live = true;
    browserApi
      .GET("/admin/orders", { params: { query: filter ? { status: filter } : {} } })
      .then(({ data }) => live && setOrders(data ?? []));
    return () => {
      live = false;
    };
  }, [filter]);

  return (
    <div>
      {showFilters && (
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                setOrders(null);
                setFilter(f.value);
              }}
              aria-pressed={filter === f.value}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-sm",
                filter === f.value ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground/50",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      {!orders ? (
        <div className="h-48 animate-pulse rounded-sm bg-muted" />
      ) : orders.length === 0 ? (
        <p className="rounded-sm bg-card p-8 text-center text-muted-foreground">No orders here.</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border bg-card">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Ship to</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">
                      HSK-{o.number}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(o.created_at)} · {o.item_count} pcs
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {o.name}
                    <p className="text-xs text-muted-foreground">{o.email}</p>
                  </td>
                  <td className="px-4 py-3">{o.country}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatMoney({ currency: o.currency, amount_minor: o.total_minor })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
