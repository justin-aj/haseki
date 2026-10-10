import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/content/section";
import { NewsletterForm } from "@/components/content/newsletter-form";
import { getEvents } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pop-ups",
  description: "Haseki pop-ups: Kochi first, then Bangalore, Mumbai, Dubai and London.",
};

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <>
      <PageHeader
        eyebrow="Pop-ups"
        title="Come and try it on."
        intro="We're starting in Kochi and travelling to the cities that love us most. Get measured, try the full drop, and meet the team."
      />
      <Container className="max-w-4xl">
        <ol className="relative border-l border-border pl-8 sm:pl-12">
          {events.map((e) => {
            const confirmed = e.status === "confirmed";
            return (
              <li key={e.id} className="reveal relative pb-14 last:pb-0">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-2 -left-[calc(2rem+5px)] size-2.5 rounded-full sm:-left-[calc(3rem+5px)]",
                    confirmed ? "bg-gold ring-4 ring-gold/20" : "bg-border",
                  )}
                />
                <p className={cn("text-xs tracking-[0.16em] uppercase", confirmed ? "text-gold-ink" : "text-muted-foreground")}>
                  {confirmed && e.starts_on
                    ? `${formatShortDate(e.starts_on)}${e.ends_on ? ` to ${formatShortDate(e.ends_on)}` : ""}`
                    : "Coming"}
                </p>
                <h2 className="mt-2 text-3xl sm:text-4xl">{e.city}</h2>
                {e.venue && <p className="mt-1 text-muted-foreground">{e.venue}</p>}
                <p className="mt-3 max-w-xl">{e.note}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-20 rounded-sm bg-card p-8 sm:p-10">
          <p className="font-heading text-2xl">Want us in your city?</p>
          <p className="mt-2 text-muted-foreground">Join the list and we&apos;ll tell you first when a pop-up is confirmed.</p>
          <NewsletterForm className="mt-6" />
        </div>
      </Container>
    </>
  );
}
