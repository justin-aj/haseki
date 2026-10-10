import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/content/section";
import { getJournal, getJournalPost } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";

export async function generateStaticParams() {
  const posts = await getJournal();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", images: post.cover_image ? [post.cover_image] : [] },
  };
}

export default async function JournalPostPage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) notFound();

  return (
    <article>
      <Container className="max-w-3xl pt-12 pb-10 text-center sm:pt-16 lg:pt-24">
        <Link href="/journal" className="text-xs tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground">
          Journal
        </Link>
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="text-xs tracking-[0.16em] text-gold-ink uppercase">{post.tag}</span>
        <h1 className="mt-5 text-4xl leading-[1.08] text-balance sm:text-5xl lg:text-6xl">{post.title}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>
        {post.published_at && <p className="mt-4 text-sm text-muted-foreground">{formatDate(post.published_at)}</p>}
      </Container>
      {post.cover_image && (
        <Container className="max-w-5xl">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted">
            <Image src={post.cover_image} alt="" fill preload sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
          </div>
        </Container>
      )}
      <Container className="max-w-2xl py-12 lg:py-16">
        <div className="prose-haseki" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body_md) }} />
        <div className="mt-16 border-t pt-8">
          <Link href="/shop" className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm text-primary-foreground">
            Shop the collection
          </Link>
        </div>
      </Container>
    </article>
  );
}
