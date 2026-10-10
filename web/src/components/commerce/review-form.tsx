"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { browserApi } from "@/lib/api/client";
import { useSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/** Fit-first review: height, usual size and size bought matter more than stars. */
export function ReviewForm({ slug }: { slug: string }) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [fit, setFit] = useState<"small" | "true" | "large">("true");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  if (state === "done") {
    return <p className="rounded-sm bg-card p-5 text-sm">Thank you. Your review will appear once our team has read it.</p>;
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-full border px-6 text-sm hover:border-foreground/60">
        Tell us how it fits
      </button>
    );
  }
  if (user === null) {
    return (
      <p className="text-sm">
        <Link href={`/account?next=/shop/${slug}`} className="underline underline-offset-4">
          Sign in
        </Link>{" "}
        to review a piece you&apos;ve bought.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const height = Number(f.get("height"));
    setState("sending");
    setError("");
    const { error } = await browserApi.POST("/products/{slug}/reviews", {
      params: { path: { slug } },
      body: {
        rating,
        fit,
        body: String(f.get("body") ?? ""),
        height_cm: height > 0 ? height : null,
        usual_size: String(f.get("usual_size") ?? "") || null,
        size_bought: String(f.get("size_bought") ?? "") || null,
      },
    });
    if (error) {
      setState("idle");
      setError(error.error ?? "Couldn't send your review.");
    } else {
      setState("done");
    }
  }

  const select = "h-11 w-full rounded-md border border-input bg-card px-3 text-base";
  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5 rounded-sm bg-card p-5 sm:p-6">
      <fieldset>
        <legend className="mb-2 text-sm">Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              className={cn("size-10 text-2xl", n <= rating ? "text-gold-ink" : "text-border")}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm">How does it fit?</legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["small", "Runs small"],
              ["true", "True to size"],
              ["large", "Runs large"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={fit === v}
              onClick={() => setFit(v)}
              className={cn(
                "h-11 rounded-sm border text-sm",
                fit === v ? "border-primary bg-primary text-primary-foreground" : "bg-background",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input id="height" name="height" type="number" min={120} max={220} inputMode="numeric" className="h-11 bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usual_size">Usual size</Label>
          <select id="usual_size" name="usual_size" className={select}>
            <option value="">—</option>
            {SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size_bought">Size bought</Label>
          <select id="size_bought" name="size_bought" className={select}>
            <option value="">—</option>
            {SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">How did it make you feel?</Label>
        <Textarea id="body" name="body" required minLength={10} rows={4} className="bg-background text-base" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending" || user === undefined}
        className="h-11 rounded-full bg-primary px-6 text-sm text-primary-foreground disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send review"}
      </button>
    </form>
  );
}
