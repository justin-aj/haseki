import { SearchIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { getPillars } from "@/lib/data";
import { BagButton } from "./bag-button";
import { Logo } from "./logo";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";

const iconBtn = "inline-flex size-11 items-center justify-center";

/** Frosted sticky header, anchored during view transitions. */
export async function SiteHeader() {
  const pillars = await getPillars();
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/70"
    >
      <div className="mx-auto grid h-[var(--header-h)] max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10">
        <div className="flex items-center">
          <MobileNav pillars={pillars} />
          <MegaMenu pillars={pillars} />
        </div>
        <Logo />
        <div className="-mr-2 flex items-center justify-end">
          <Link href="/shop" aria-label="Search the shop" className={iconBtn}>
            <SearchIcon className="size-5" strokeWidth={1.5} />
          </Link>
          <Link href="/account" aria-label="Account" className={`${iconBtn} hidden sm:inline-flex`}>
            <UserIcon className="size-5" strokeWidth={1.5} />
          </Link>
          <BagButton />
        </div>
      </div>
    </header>
  );
}
