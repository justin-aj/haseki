import type { ProductDetail, Schemas } from "@/lib/api/client";

const fitLabel = { small: "Runs small", true: "True to size", large: "Runs large" } as const;

/** Reviews lead with fit data (height, usual size, size bought): the brand's core promise. */
export function FitReviews({ product, reviews }: { product: ProductDetail; reviews: Schemas["Review"][] }) {
  const total = product.fit_small + product.fit_true + product.fit_large;
  const bars = [
    { key: "small", n: product.fit_small },
    { key: "true", n: product.fit_true },
    { key: "large", n: product.fit_large },
  ] as const;

  return (
    <section aria-labelledby="reviews-heading" className="grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
      <div>
        <h2 id="reviews-heading" className="text-3xl sm:text-4xl">
          How it fits
        </h2>
        {product.review_count > 0 ? (
          <>
            <p className="mt-3 text-muted-foreground">
              {product.rating_avg?.toFixed(1)} out of 5 · {product.review_count}{" "}
              {product.review_count === 1 ? "review" : "reviews"}
            </p>
            {total > 0 && (
              <ul className="mt-6 space-y-3 text-sm" aria-label="Fit from reviews">
                {bars.map((b) => (
                  <li key={b.key}>
                    <div className="mb-1 flex justify-between">
                      <span>{fitLabel[b.key]}</span>
                      <span className="text-muted-foreground tabular-nums">{Math.round((b.n / total) * 100)}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <div className="h-full bg-gold" style={{ width: `${(b.n / total) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="mt-3 text-muted-foreground">No reviews yet. Tell us how yours fits after it arrives.</p>
        )}
      </div>
      <ul className="divide-y">
        {reviews.map((r) => (
          <li key={r.id} className="py-6 first:pt-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span aria-label={`${r.rating} out of 5`} className="tracking-widest text-gold-ink">
                {"★".repeat(r.rating)}
                <span className="text-border">{"★".repeat(5 - r.rating)}</span>
              </span>
              <span className="font-medium">{r.author}</span>
            </div>
            <p className="mt-3 text-pretty">{r.body}</p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {r.height_cm && <span>Height {r.height_cm}cm</span>}
              {r.usual_size && <span>Usually {r.usual_size}</span>}
              {r.size_bought && <span>Bought {r.size_bought}</span>}
              {r.fit && <span className="text-foreground">{fitLabel[r.fit]}</span>}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
