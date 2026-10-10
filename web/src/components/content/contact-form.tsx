"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { browserApi } from "@/lib/api/client";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    const { error } = await browserApi.POST("/contact", {
      body: {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        message: String(form.get("message") ?? ""),
      },
    });
    if (error) {
      setState("error");
      setError(error.error ?? "Something went wrong. Try again, or message us on WhatsApp.");
    } else {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-sm bg-card p-8">
        <p className="font-heading text-2xl">Thank you.</p>
        <p className="mt-2 text-muted-foreground">We reply within one working day, usually sooner.</p>
      </div>
    );
  }

  const field = "h-12 bg-card text-base";
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" className={field} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" className={field} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea id="message" name="message" required rows={6} className="bg-card text-base" />
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex h-12 items-center rounded-full bg-primary px-8 text-sm text-primary-foreground disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
