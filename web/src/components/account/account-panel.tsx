"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Schemas, browserApi } from "@/lib/api/client";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/use-session";

const statusLabel: Record<string, string> = {
  paid: "Confirmed",
  fulfilled: "Being prepared",
  shipped: "Shipped",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function AccountPanel() {
  const { user, setUser, signOut } = useSession();
  const router = useRouter();
  const next = useSearchParams().get("next");

  if (user === undefined) return <div className="h-72 animate-pulse rounded-sm bg-muted" />;

  if (!user) {
    const onSignedIn = (u: Schemas["User"] | null | undefined) => {
      setUser(u ?? null);
      // Only follow same-site relative paths.
      if (next?.startsWith("/") && !next.startsWith("//")) router.push(next);
    };
    return (
      <div className="mx-auto max-w-md">
        <Tabs defaultValue="signin">
          <TabsList className="mb-8 w-full">
            <TabsTrigger value="signin" className="flex-1">
              Sign in
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Create account
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <AuthForm mode="signin" onDone={onSignedIn} />
          </TabsContent>
          <TabsContent value="register">
            <AuthForm mode="register" onDone={onSignedIn} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Signed in</p>
          <p className="mt-1 font-heading text-3xl">Hello, {user.name.split(" ")[0]}.</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {user.is_admin && (
            <Link href="/admin" className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm text-primary-foreground">
              Open admin
            </Link>
          )}
          <button type="button" onClick={signOut} className="inline-flex h-11 items-center rounded-full border px-6 text-sm">
            Sign out
          </button>
        </div>
      </div>
      <OrderHistory />
    </div>
  );
}

function AuthForm({ mode, onDone }: { mode: "signin" | "register"; onDone: (u: Schemas["User"] | null | undefined) => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "");
    const password = String(f.get("password") ?? "");
    setBusy(true);
    setError("");
    const res =
      mode === "signin"
        ? await browserApi.POST("/auth/login", { body: { email, password } })
        : await browserApi.POST("/auth/register", { body: { email, password, name: String(f.get("name") ?? "") } });
    setBusy(false);
    if (res.error || !res.data) {
      setError(res.error?.error ?? "Something went wrong. Try again.");
      return;
    }
    onDone(res.data.user);
  }

  const field = "h-12 bg-card text-base";
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {mode === "register" && (
        <div className="space-y-2">
          <Label htmlFor={`${mode}-name`}>Name</Label>
          <Input id={`${mode}-name`} name="name" required autoComplete="name" className={field} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input id={`${mode}-email`} name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input
          id={`${mode}-password`}
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 10 : undefined}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className={field}
        />
        {mode === "register" && <p className="text-xs text-muted-foreground">At least 10 characters.</p>}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm text-primary-foreground disabled:opacity-60"
      >
        {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      {mode === "register" && (
        <p className="text-center text-xs text-muted-foreground">Orders you place while signed in appear in your account.</p>
      )}
    </form>
  );
}

function OrderHistory() {
  const [orders, setOrders] = useState<Schemas["MyOrder"][] | null>(null);
  useEffect(() => {
    let live = true;
    browserApi.GET("/account/orders").then(({ data }) => live && setOrders(data ?? []));
    return () => {
      live = false;
    };
  }, []);

  if (!orders) return <div className="mt-8 h-40 animate-pulse rounded-sm bg-muted" />;
  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-heading text-2xl">No orders yet.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm underline underline-offset-4">
          Start shopping
        </Link>
      </div>
    );
  }
  return (
    <ul className="divide-y">
      {orders.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <Link href={`/checkout/success?order=${o.id}`} className="font-medium underline-offset-4 hover:underline">
              HSK-{o.number}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDate(o.created_at)} · {o.item_count} {o.item_count === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <div className="text-right">
            <p className="tabular-nums">{formatMoney({ currency: o.currency, amount_minor: o.total_minor })}</p>
            <p className="text-sm text-muted-foreground">
              {statusLabel[o.status] ?? o.status}
              {o.tracking_number && ` · Tracking ${o.tracking_number}`}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
