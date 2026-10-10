"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Schemas } from "@/lib/api/client";

type Img = Schemas["LookbookImage"];

/** Masonry via CSS columns. Known width/height on every image means zero layout shift. */
export function LookbookGrid({ images }: { images: Img[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? null : images[index];
  const step = (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length));

  return (
    <>
      <div className="columns-2 gap-3 sm:gap-4 lg:columns-3 lg:gap-6">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group mb-3 block w-full break-inside-avoid text-left sm:mb-4 lg:mb-6"
          >
            <div className="overflow-hidden rounded-sm bg-muted">
              <Image
                src={img.url}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1024px) 30vw, 46vw"
                className="h-auto w-full transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.02]"
              />
            </div>
            {img.caption && <p className="mt-2 text-sm text-muted-foreground">{img.caption}</p>}
          </button>
        ))}
      </div>

      <Dialog open={current !== null} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent
          className="max-w-[min(64rem,94vw)] border-0 bg-background p-3 sm:p-4"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
        >
          {current && (
            <>
              <DialogTitle className="sr-only">{current.caption || current.alt}</DialogTitle>
              <div className="relative h-[75svh] w-full">
                <Image src={current.url} alt={current.alt} fill sizes="94vw" className="object-contain" />
              </div>
              <div className="flex items-center justify-between gap-4 px-1">
                <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="inline-flex size-11 items-center justify-center">
                  <ChevronLeftIcon className="size-5" />
                </button>
                <p className="text-center text-sm">
                  {current.caption}
                  {current.drop_name && <span className="text-muted-foreground"> · {current.drop_name}</span>}
                </p>
                <button type="button" onClick={() => step(1)} aria-label="Next image" className="inline-flex size-11 items-center justify-center">
                  <ChevronRightIcon className="size-5" />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
