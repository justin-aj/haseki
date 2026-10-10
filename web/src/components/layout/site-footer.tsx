import Link from "next/link";
import { NewsletterForm } from "@/components/content/newsletter-form";
import { footerNav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[90rem] px-4 pt-16 pb-10 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <p className="font-heading text-3xl leading-tight text-balance sm:text-4xl">
              First look at every drop.
            </p>
            <p className="mt-3 max-w-sm text-sm text-primary-foreground/75">
              New pieces, pop-up dates and the occasional story. No noise.
            </p>
            <NewsletterForm tone="dark" className="mt-6" />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-xs tracking-[0.14em] text-primary-foreground/75 uppercase">{col.title}</p>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="hover:text-gold">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Label Haseki · {site.address}</p>
          <div className="flex gap-5">
            <a href={site.instagram} className="hover:text-gold">
              Instagram
            </a>
            <a href={site.whatsapp} className="hover:text-gold">
              WhatsApp
            </a>
            <a href={`mailto:${site.email}`} className="hover:text-gold">
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
