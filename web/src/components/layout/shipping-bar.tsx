import Link from "next/link";
import { CurrencySwitcher } from "./currency-switcher";

// Set on preview deployments, where the API runs with mock payments.
const preview = process.env.NEXT_PUBLIC_PREVIEW === "true";

export function ShippingBar() {
  return (
    <>
      {preview && (
        <p className="bg-gold px-4 py-1.5 text-center text-xs text-foreground">
          Preview site. Payments are not connected, so no order is charged or shipped.
        </p>
      )}
      <ShippingStrip />
    </>
  );
}

function ShippingStrip() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-9 max-w-[90rem] items-center justify-between gap-4 px-4 text-xs tracking-wide sm:px-6 lg:px-10">
        <Link href="/policies/shipping" className="truncate hover:underline">
          Made in Kochi · Shipping worldwide
          <span className="hidden sm:inline"> · Free size exchanges in India</span>
        </Link>
        <CurrencySwitcher className="shrink-0" />
      </div>
    </div>
  );
}
