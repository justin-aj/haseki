import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/content/section";
import { getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "In your words",
  description: "How Haseki fits, and how it made our customers feel.",
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHeader eyebrow="In your words" title="How it made you feel." intro="Fit and feeling, in our customers' own words." />
      <Container>
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="reveal mb-6 break-inside-avoid rounded-sm bg-card p-8">
              <blockquote className="font-heading text-2xl leading-snug text-pretty">“{t.quote}”</blockquote>
              <figcaption className="mt-6 text-sm text-muted-foreground">
                {t.author}, {t.location}
                {t.product && <span className="block text-foreground">Wearing {t.product}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-12 text-center text-muted-foreground">
          Bought a Haseki piece?{" "}
          <Link href="/contact" className="text-foreground underline underline-offset-4">
            Tell us how it fits
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
