"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type StoryPanel = { kicker: string; title: string; body: string; image: string; alt: string };

/**
 * Pinned image with text panels scrolling past (desktop). The active panel crossfades the
 * image using opacity only. On mobile each panel stacks with its own image.
 */
export function StickyStory({ panels }: { panels: StoryPanel[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-16">
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+2rem)] aspect-[4/5] overflow-hidden rounded-sm bg-muted">
          {panels.map((p, i) => (
            <Image
              key={p.image}
              src={p.image}
              alt={p.alt}
              fill
              sizes="45vw"
              className={cn(
                "object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none",
                i === active ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
        </div>
      </div>
      <div>
        {panels.map((p, i) => (
          <div
            key={p.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className="flex flex-col justify-center py-10 lg:min-h-[80svh] lg:py-0"
          >
            <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-sm bg-muted lg:hidden">
              <Image src={p.image} alt={p.alt} fill sizes="92vw" className="object-cover" />
            </div>
            <p className="mb-3 text-xs tracking-[0.18em] text-gold-ink uppercase">{p.kicker}</p>
            <h3
              className={cn(
                "text-3xl leading-tight text-balance transition-opacity duration-500 sm:text-4xl lg:text-5xl",
                "lg:opacity-40",
                i === active && "lg:opacity-100",
              )}
            >
              {p.title}
            </h3>
            <p className="mt-4 max-w-md text-lg text-pretty text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
