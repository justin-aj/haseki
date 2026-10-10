import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/content/section";
import { getPolicies, getPolicy } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const policies = await getPolicies();
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  return policy ? { title: policy.title } : {};
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const [policy, all] = await Promise.all([getPolicy(slug), getPolicies()]);
  if (!policy) notFound();

  return (
    <Container className="grid gap-10 pt-12 sm:pt-16 lg:grid-cols-[14rem_1fr] lg:gap-20 lg:pt-24">
      <nav aria-label="Policies" className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <ul className="flex gap-2 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:flex-col lg:gap-3">
          {all.map((p) => (
            <li key={p.slug} className="shrink-0">
              <Link
                href={`/policies/${p.slug}`}
                aria-current={p.slug === slug ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm lg:h-auto lg:rounded-none lg:border-0 lg:px-0",
                  p.slug === slug ? "border-primary bg-primary text-primary-foreground lg:bg-transparent lg:text-gold" : "hover:text-gold",
                )}
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <article className="min-w-0 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{policy.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated {formatDate(policy.updated_at)}</p>
        <div className="prose-haseki mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(policy.body_md) }} />
      </article>
    </Container>
  );
}
