"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Schemas } from "@/lib/api/client";
import { categories, storyNav } from "@/lib/site";
import { CurrencySwitcher } from "./currency-switcher";

export function MobileNav({ pillars }: { pillars: Schemas["Pillar"][] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="-ml-2 inline-flex size-11 items-center justify-center lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon className="size-5" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 overflow-y-auto bg-background p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="font-heading text-xl tracking-[0.32em] uppercase">Haseki</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-6 py-6">
          <Link href="/shop" onClick={close} className="py-2.5 font-heading text-2xl">
            Shop all
          </Link>
          {pillars.map((p) => (
            <Link
              key={p.slug}
              href={`/shop?pillar=${p.slug}`}
              onClick={close}
              className="py-2.5 font-heading text-2xl"
            >
              {p.name}
            </Link>
          ))}
          <p className="mt-8 mb-2 text-xs tracking-[0.14em] text-muted-foreground uppercase">By piece</p>
          <div className="grid grid-cols-2 gap-x-4">
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={close} className="py-2.5 text-[0.95rem]">
                {c.label}
              </Link>
            ))}
          </div>
          <p className="mt-8 mb-2 text-xs tracking-[0.14em] text-muted-foreground uppercase">Haseki</p>
          {storyNav.map((l) => (
            <Link key={l.href} href={l.href} onClick={close} className="py-2.5 text-[0.95rem]">
              {l.label}
            </Link>
          ))}
          <Link href="/faq" onClick={close} className="py-2.5 text-[0.95rem]">
            FAQ & sizing
          </Link>
          <Link href="/contact" onClick={close} className="py-2.5 text-[0.95rem]">
            Contact
          </Link>
          <div className="mt-8 flex items-center justify-between border-t pt-6 text-sm">
            <span className="text-muted-foreground">Currency</span>
            <CurrencySwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
