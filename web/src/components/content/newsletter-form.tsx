"use client";

import { useState } from "react";
import { browserApi } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setState("sending");
    const { error } = await browserApi.POST("/newsletter", { body: { email } });
    if (error) {
      setState("error");
      setMessage(error.error ?? "Something went wrong. Try again.");
    } else {
      setState("done");
      setMessage("You're on the list. First look at every drop.");
    }
  }

  const dark = tone === "dark";
  return (
    <form onSubmit={onSubmit} className={cn("w-full max-w-md", className)} noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex items-center border-b transition-colors focus-within:border-gold",
          dark ? "border-primary-foreground/40" : "border-foreground/30",
        )}
      >
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          disabled={state === "sending" || state === "done"}
          className={cn(
            "h-12 min-w-0 flex-1 bg-transparent text-base outline-none",
            dark ? "placeholder:text-primary-foreground/70" : "placeholder:text-muted-foreground",
          )}
        />
        <button
          type="submit"
          disabled={state === "sending" || state === "done"}
          className="h-12 shrink-0 pl-4 text-xs tracking-[0.14em] uppercase disabled:opacity-60"
        >
          {state === "sending" ? "Joining…" : "Join"}
        </button>
      </div>
      <p role="status" aria-live="polite" className={cn("mt-2 min-h-5 text-sm", state === "error" && "text-destructive")}>
        {message}
      </p>
    </form>
  );
}
