"use client";

import { LockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Schemas, browserApi } from "@/lib/api/client";
import { countryOptions, defaultCountry } from "@/lib/countries";
import { formatMoney } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";
import { useCart } from "./cart-context";

type Quote = Schemas["ShippingQuote"];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const currency = useCurrency();
  const { cart, refresh } = useCart();
  const countries = useMemo(() => countryOptions(), []);
  const [country, setCountry] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState(params.get("cancelled") ? "Payment was cancelled. Your bag is still here." : "");
  const [submitting, setSubmitting] = useState(false);

  const destination = country ?? defaultCountry(currency);

  useEffect(() => {
    let live = true;
    browserApi
      .GET("/cart/shipping", { params: { query: { country: destination, currency } } })
      .then(({ data }) => live && setQuote(data ?? null));
    return () => {
      live = false;
    };
  }, [destination, currency, cart?.weight_g]);

  if (!cart) {
    return <div className="h-96 animate-pulse rounded-sm bg-muted" aria-label="Loading your bag" />;
  }
  if (cart.items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-heading text-3xl">Your bag is empty.</p>
        <Link href="/shop" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm text-primary-foreground">
          Shop the collection
        </Link>
      </div>
    );
  }

  const shipping = quote?.currency === cart.currency ? quote.amount_minor : null;
  const total = cart.subtotal_minor + (shipping ?? 0);
  const m = (amount_minor: number) => formatMoney({ currency: cart.currency, amount_minor });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    setSubmitting(true);
    setError("");
    const { data, error } = await browserApi.POST("/checkout", {
      body: {
        email: get("email"),
        currency,
        address: {
          name: get("name"),
          line1: get("line1"),
          line2: get("line2"),
          city: get("city"),
          region: get("region"),
          postal_code: get("postal_code"),
          country: destination,
          phone: get("phone"),
        },
      },
    });
    if (error || !data) {
      setSubmitting(false);
      setError(error?.error ?? "Something went wrong. Please try again.");
      await refresh();
      return;
    }
    if (data.redirect_url) {
      // Stripe Checkout or local mock payments.
      window.location.assign(data.redirect_url);
      return;
    }
    if (data.razorpay) {
      const rz = data.razorpay;
      if (!(await loadRazorpay()) || !window.Razorpay) {
        setSubmitting(false);
        setError("Couldn't load the payment window. Check your connection and try again.");
        return;
      }
      const checkout = new window.Razorpay({
        key: rz.key_id,
        order_id: rz.razorpay_order_id,
        amount: rz.amount_minor,
        currency: rz.currency,
        name: "Haseki",
        description: `Order HSK-${data.order_number}`,
        prefill: { name: get("name"), email: get("email"), contact: get("phone") },
        theme: { color: "#2b4a35" },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verified = await browserApi.POST("/checkout/razorpay/verify", { body: resp });
          // The webhook confirms the order either way; the success page shows its live status.
          router.push(`/checkout/success?order=${verified.data?.order_id ?? data.order_id}`);
        },
        modal: { ondismiss: () => setSubmitting(false) },
      });
      checkout.open();
    }
  }

  const field = "h-12 bg-card text-base";
  return (
    <form onSubmit={onSubmit} className="grid gap-12 lg:grid-cols-[1fr_26rem] lg:gap-16">
      <div className="space-y-10">
        <fieldset className="space-y-4">
          <legend className="mb-4 font-heading text-2xl">Contact</legend>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className={field} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (for delivery updates)</Label>
            <Input id="phone" name="phone" type="tel" required autoComplete="tel" className={field} />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-4 font-heading text-2xl">Delivery</legend>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              name="country"
              value={destination}
              onChange={(e) => setCountry(e.target.value)}
              autoComplete="country"
              className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required autoComplete="name" className={field} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="line1">Address</Label>
            <Input id="line1" name="line1" required autoComplete="address-line1" className={field} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="line2">Apartment, building (optional)</Label>
            <Input id="line2" name="line2" autoComplete="address-line2" className={field} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required autoComplete="address-level2" className={field} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">State / region</Label>
              <Input id="region" name="region" autoComplete="address-level1" className={field} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">PIN / postal code</Label>
              <Input id="postal_code" name="postal_code" required autoComplete="postal-code" className={field} />
            </div>
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
        <div className="rounded-sm bg-card p-6">
          <h2 className="font-heading text-2xl">Order summary</h2>
          <ul className="mt-4 divide-y">
            {cart.items.map((l) => (
              <li key={l.id} className="flex gap-3 py-3">
                <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
                  {l.image_url && <Image src={l.image_url} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate">{l.product_name}</p>
                  <p className="text-muted-foreground">
                    {l.size} · Qty {l.quantity}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{m(l.line_total_minor)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{m(cart.subtotal_minor)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>
                Shipping{quote && <span className="text-muted-foreground"> · {quote.zone_name}, {quote.eta}</span>}
              </dt>
              <dd className="tabular-nums">{shipping === null ? "…" : m(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{m(total)}</dd>
            </div>
          </dl>
          {quote?.duties_on_delivery && (
            <p className="mt-3 rounded-sm bg-secondary p-3 text-xs text-muted-foreground">
              International orders ship duties unpaid. Any import duties or taxes are charged by your local customs on
              delivery.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || shipping === null}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm tracking-[0.08em] text-primary-foreground uppercase disabled:opacity-60"
          >
            <LockIcon className="size-4" strokeWidth={1.75} />
            {submitting ? "Opening payment…" : `Pay ${m(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {currency === "INR" ? "UPI, cards and netbanking via Razorpay." : "Cards, Apple Pay and Google Pay via Stripe."} We never
            see your card details.
          </p>
        </div>
      </aside>
    </form>
  );
}
