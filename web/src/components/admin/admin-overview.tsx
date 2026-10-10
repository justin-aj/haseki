"use client";

import { useEffect, useState } from "react";
import { type Schemas, browserApi } from "@/lib/api/client";
import { formatMoney } from "@/lib/currency";
import { AdminOrders } from "./admin-orders";

export function AdminOverview() {
  const [stats, setStats] = useState<Schemas["Stats"] | null>(null);
  useEffect(() => {
    let live = true;
    browserApi.GET("/admin/stats").then(({ data }) => live && setStats(data ?? null));
    return () => {
      live = false;
    };
  }, []);

  const tiles = stats
    ? [
        { label: "To ship", value: String(stats.orders_to_ship) },
        { label: "Orders, 30 days", value: String(stats.orders_last_30_days) },
        {
          label: "Revenue, 30 days",
          value: stats.revenue_last_30_days.length ? stats.revenue_last_30_days.map(formatMoney).join(" · ") : "—",
        },
        { label: "Low stock sizes", value: String(stats.low_stock_variants) },
        { label: "Reviews to approve", value: String(stats.reviews_pending) },
      ]
    : [];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats
          ? tiles.map((t) => (
              <div key={t.label} className="rounded-sm border bg-card p-4">
                <p className="text-xs text-muted-foreground">{t.label}</p>
                <p className="mt-2 font-heading text-2xl tabular-nums">{t.value}</p>
              </div>
            ))
          : Array.from({ length: 5 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-sm bg-muted" />)}
      </div>
      <section>
        <h2 className="mb-4 text-2xl">Orders to ship</h2>
        <AdminOrders initialFilter="to_ship" showFilters={false} />
      </section>
    </div>
  );
}
