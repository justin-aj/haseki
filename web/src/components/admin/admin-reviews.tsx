"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Schemas, browserApi } from "@/lib/api/client";
import { formatShortDate } from "@/lib/format";

export function AdminReviews() {
  const [reviews, setReviews] = useState<Schemas["AdminReview"][] | null>(null);

  useEffect(() => {
    let live = true;
    browserApi.GET("/admin/reviews").then(({ data }) => live && setReviews(data ?? []));
    return () => {
      live = false;
    };
  }, []);

  async function approve(id: string) {
    const { error } = await browserApi.POST("/admin/reviews/{id}/approve", { params: { path: { id } } });
    if (error) return toast.error("Couldn't approve.");
    setReviews((rs) => rs?.map((r) => (r.id === id ? { ...r, approved: true } : r)) ?? null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    const { error } = await browserApi.DELETE("/admin/reviews/{id}", { params: { path: { id } } });
    if (error) return toast.error("Couldn't delete.");
    setReviews((rs) => rs?.filter((r) => r.id !== id) ?? null);
  }

  if (!reviews) return <div className="h-64 animate-pulse rounded-sm bg-muted" />;
  if (reviews.length === 0) return <p className="rounded-sm bg-card p-8 text-center text-muted-foreground">No reviews yet.</p>;

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-sm border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="tracking-widest text-gold-ink">{"★".repeat(r.rating)}</span> {r.author} on{" "}
              <Link href={`/shop/${r.product_slug}`} className="underline underline-offset-4">
                {r.product_name}
              </Link>{" "}
              <span className="text-muted-foreground">· {formatShortDate(r.created_at)}</span>
            </p>
            <div className="flex gap-2">
              {r.approved ? (
                <span className="text-xs text-muted-foreground">Published</span>
              ) : (
                <button type="button" onClick={() => approve(r.id)} className="h-9 rounded-full bg-primary px-4 text-sm text-primary-foreground">
                  Approve
                </button>
              )}
              <button type="button" onClick={() => remove(r.id)} className="h-9 rounded-full border px-4 text-sm text-destructive">
                Delete
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm">{r.body}</p>
        </li>
      ))}
    </ul>
  );
}
