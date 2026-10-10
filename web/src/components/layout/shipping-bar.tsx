import Link from "next/link";
import { CurrencySwitcher } from "./currency-switcher";

export function ShippingBar() {
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
