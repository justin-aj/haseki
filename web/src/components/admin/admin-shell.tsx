"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products & stock" },
  { href: "/admin/reviews", label: "Reviews" },
];

/** Shows admin UI only to admins. The API rejects non-admin calls regardless. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const pathname = usePathname();

  if (user === undefined) return <div className="h-96 animate-pulse rounded-sm bg-muted" />;
  if (!user?.is_admin) {
    return (
      <div className="py-24 text-center">
        <p className="font-heading text-3xl">This area is for the Haseki team.</p>
        <Link href="/account?next=/admin" className="mt-6 inline-block text-sm underline underline-offset-4">
          Sign in with an admin account
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[13rem_1fr] lg:gap-12">
      <nav aria-label="Admin" className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
        <ul className="flex gap-2 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:flex-col lg:gap-1">
          {nav.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <li key={n.href} className="shrink-0">
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center rounded-full px-4 text-sm lg:rounded-sm",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export const statusStyles: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  paid: "bg-gold/15 text-[#7a5c22]",
  fulfilled: "bg-blue-100 text-blue-900",
  shipped: "bg-primary/10 text-primary",
  cancelled: "bg-muted text-muted-foreground line-through",
  refunded: "bg-red-100 text-red-900",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs capitalize", statusStyles[status])}>{status}</span>
  );
}
