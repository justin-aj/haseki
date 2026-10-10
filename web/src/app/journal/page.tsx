import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, PageHeader } from "@/components/content/section";
import { getJournal } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Journal",
  description: "Style notes, fabric care and the thinking behind Haseki's fit.",
};

export default async function JournalPage() {
  const posts = await getJournal();
  const [lead, ...rest] = posts;
  return (
    <>
      <PageHeader eyebrow="Journal" title="Notes on fit, fabric and feeling." />
      <Container>
        {lead && (
          <Link href={`/journal/${lead.slug}`} className="group grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted">
              {lead.cover_image && (
                <Image
                  src={lead.cover_image}
                  alt=""
                  fill
                  preload
                  sizes="(min-width: 1024px) 45vw, 92vw"
                  className="object-cover transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.02]"
                />
              )}
            </div>
            <div>
              <p className="text-xs tracking-[0.16em] text-gold-ink uppercase">{lead.tag}</p>
              <h2 className="mt-3 text-3xl leading-tight text-balance sm:text-4xl lg:text-5xl">{lead.title}</h2>
              <p className="mt-4 text-lg text-muted-foreground">{lead.excerpt}</p>
              {lead.published_at && <p className="mt-4 text-sm text-muted-foreground">{formatDate(lead.published_at)}</p>}
            </div>
          </Link>
        )}
        <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.slug} href={`/journal/${p.slug}`} className="group reveal block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted">
                {p.cover_image && (
                  <Image
                    src={p.cover_image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                    className="object-cover transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.02]"
                  />
                )}
              </div>
              <p className="mt-4 text-xs tracking-[0.16em] text-gold-ink uppercase">{p.tag}</p>
              <h3 className="mt-2 text-2xl leading-snug">{p.title}</h3>
              <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
