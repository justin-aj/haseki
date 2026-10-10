"use client";

import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { Schemas } from "@/lib/api/client";
import { categories, storyNav } from "@/lib/site";

/** Desktop navigation. Radix handles hover intent, focus and keyboard. */
export function MegaMenu({ pillars }: { pillars: Schemas["Pillar"][] }) {
  return (
    <NavigationMenu viewport={false} className="hidden lg:flex">
      <NavigationMenuList className="gap-0 xl:gap-1">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-[0.8rem] tracking-[0.12em] uppercase hover:bg-transparent data-[state=open]:bg-transparent">
            Shop
          </NavigationMenuTrigger>
          <NavigationMenuContent className="!w-[min(56rem,90vw)] p-6">
            <div className="grid grid-cols-[1fr_1fr_2fr] gap-8">
              <div>
                <p className="mb-3 text-xs tracking-[0.14em] text-muted-foreground uppercase">By mood</p>
                <ul className="space-y-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/shop" className="font-heading text-lg">
                        Shop all
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  {pillars.map((p) => (
                    <li key={p.slug}>
                      <NavigationMenuLink asChild>
                        <Link href={`/shop?pillar=${p.slug}`} className="font-heading text-lg">
                          {p.name}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-xs tracking-[0.14em] text-muted-foreground uppercase">By piece</p>
                <ul className="space-y-1.5 text-sm">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <NavigationMenuLink asChild>
                        <Link href={`/shop?category=${c.slug}`}>{c.label}</Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {pillars.slice(0, 2).map((p) => (
                  <NavigationMenuLink asChild key={p.slug}>
                    <Link href={`/shop?pillar=${p.slug}`} className="group block !p-0">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            sizes="220px"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                        )}
                      </div>
                      <p className="mt-2 text-sm">{p.name}</p>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {pillars.slice(0, 2).map((p) => (
          <NavigationMenuItem key={p.slug} className="hidden xl:block">
            <NavigationMenuLink asChild className="text-[0.8rem] tracking-[0.12em] whitespace-nowrap uppercase">
              <Link href={`/shop?pillar=${p.slug}`}>{p.name}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        {storyNav.slice(0, 2).map((l) => (
          <NavigationMenuItem key={l.href}>
            <NavigationMenuLink asChild className="text-[0.8rem] tracking-[0.12em] whitespace-nowrap uppercase">
              <Link href={l.href}>{l.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
