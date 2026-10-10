import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/content/contact-form";
import { Container, PageHeader } from "@/components/content/section";
import { getShippingZones } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Haseki in Ernakulam. We ship worldwide.",
};

export default async function ContactPage() {
  const zones = await getShippingZones();
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We're in Kochi. We ship everywhere."
        intro="Questions about fit, an order, or a custom piece? Write to us, or message us on WhatsApp."
      />
      <Container className="grid gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
        <div className="space-y-10">
          <dl className="space-y-6">
            <div>
              <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Studio</dt>
              <dd className="mt-1.5 text-lg">{site.address}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Email</dt>
              <dd className="mt-1.5 text-lg">
                <a href={`mailto:${site.email}`} className="underline decoration-gold underline-offset-4">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Phone & WhatsApp</dt>
              <dd className="mt-1.5 text-lg">
                <a href={site.whatsapp} className="underline decoration-gold underline-offset-4">
                  {site.phone}
                </a>
                <span className="block text-sm text-muted-foreground">Mon to Sat, 10am to 7pm IST</span>
              </dd>
            </div>
          </dl>

          <div className="rounded-sm bg-card p-6">
            <p className="font-heading text-xl">We ship worldwide</p>
            <ul className="mt-4 divide-y text-sm">
              {zones.map((z) => (
                <li key={z.code} className="flex justify-between gap-4 py-2.5">
                  <span>{z.name}</span>
                  <span className="text-muted-foreground">{z.eta}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              International orders ship duties unpaid.{" "}
              <Link href="/policies/shipping" className="underline underline-offset-4">
                Shipping details
              </Link>
            </p>
          </div>
        </div>
        <ContactForm />
      </Container>
    </>
  );
}
