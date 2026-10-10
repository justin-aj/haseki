import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/content/section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getFaqs } from "@/lib/data";
import { sizeChart } from "@/lib/size-guide";

export const metadata: Metadata = {
  title: "FAQ & sizing",
  description: "Sizing, international shipping, customs, returns and fabric care at Haseki.",
};

const ORDER = ["Sizing", "Shipping", "Returns", "Care"];

export default async function FaqPage() {
  const faqs = await getFaqs();
  const sections = ORDER.map((s) => ({ name: s, items: faqs.filter((f) => f.section === s) })).filter(
    (s) => s.items.length > 0,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHeader eyebrow="Help" title="Questions, answered." intro="Fit is our promise, so we start with sizing." />
      <Container className="grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-20">
        <nav aria-label="FAQ sections" className="hidden lg:block">
          <ul className="sticky top-[calc(var(--header-h)+2rem)] space-y-3 text-sm">
            {sections.map((s) => (
              <li key={s.name}>
                <a href={`#${s.name.toLowerCase()}`} className="hover:text-gold">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 space-y-16">
          {sections.map((s) => (
            <section key={s.name} id={s.name.toLowerCase()} className="scroll-mt-28">
              <h2 className="mb-4 text-3xl">{s.name}</h2>
              <Accordion type="multiple" className="border-t">
                {s.items.map((f) => (
                  <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger className="py-5 text-left text-base">{f.question}</AccordionTrigger>
                    <AccordionContent className="max-w-2xl text-base text-muted-foreground">{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {s.name === "Sizing" && (
                <div className="mt-8 overflow-x-auto rounded-sm bg-card p-5">
                  <p className="mb-3 font-heading text-xl">Body measurements (cm)</p>
                  <table className="w-full min-w-[28rem] text-sm tabular-nums">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        {["Size", "Bust", "Waist", "Hip", "UK", "US"].map((h) => (
                          <th key={h} className="py-2 pr-3 font-normal">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.map((r) => (
                        <tr key={r.size} className="border-b last:border-0">
                          <td className="py-2 pr-3 font-medium">{r.size}</td>
                          <td className="py-2 pr-3">{r.bust}</td>
                          <td className="py-2 pr-3">{r.waist}</td>
                          <td className="py-2 pr-3">{r.hip}</td>
                          <td className="py-2 pr-3">{r.uk}</td>
                          <td className="py-2">{r.us}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
          <p className="text-muted-foreground">
            Still unsure?{" "}
            <Link href="/contact" className="text-foreground underline underline-offset-4">
              Ask us about fit
            </Link>
            . We reply within a day.
          </p>
        </div>
      </Container>
    </>
  );
}
