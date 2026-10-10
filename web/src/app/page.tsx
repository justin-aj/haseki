import Image from "next/image";
import Link from "next/link";
import { ProductRail } from "@/components/commerce/product-rail";
import { Container, Eyebrow, SectionHeading } from "@/components/content/section";
import { type StoryPanel, StickyStory } from "@/components/content/sticky-story";
import { getDrops, getPillars, getProducts, getTestimonials } from "@/lib/data";

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&h=1500&fit=crop&crop=entropy&q=80`;

// Brand doc §4: the four design pillars that every piece is built from.
const pillarsStory: StoryPanel[] = [
  {
    kicker: "The cut",
    title: "Engineered for real proportions.",
    body: "Wraps you set yourself, peplums that flare from the right place, princess seams instead of darts that pull. Every product page tells you exactly where each seam sits.",
    image: IMG("1722281763168-91ac74c0d965"),
    alt: "Woman in a red wrap dress leaning on a wall",
  },
  {
    kicker: "The print",
    title: "Designed, never stock.",
    body: "Original botanical and abstract prints, drawn for us and kept tonal, so the garment reads as considered rather than loud.",
    image: IMG("1609748340041-f5d61e061ebc"),
    alt: "Woman in a green and white printed dress",
  },
  {
    kicker: "The detail",
    title: "The thing people ask about.",
    body: "Scalloped embroidery, tiny stones set where the light lands, delicate trims and buttons. Indian surface craft on a contemporary cut.",
    image: IMG("1612595391900-29390866733a"),
    alt: "Woman in a scalloped red and white dress",
  },
  {
    kicker: "The fabric",
    title: "Made for real Indian summers.",
    body: "Georgette for movement, chiffon for lightness, rayon for everyday ease, cotton blends for structure. Fabrics that breathe in Kochi and travel anywhere.",
    image: IMG("1607997637503-d4d8dee871e4"),
    alt: "Woman in a light white long-sleeve dress",
  },
];

export default async function HomePage() {
  const [drops, pillars, products, testimonials] = await Promise.all([
    getDrops(),
    getPillars(),
    getProducts(),
    getTestimonials(),
  ]);
  const current = drops[0];
  const dropProducts = products.filter((p) => p.drop_slug === current?.slug);
  const signature = products.filter((p) => p.pillars.includes("the-wrap"));

  return (
    <>
      {/* Hero: mood, not catalogue. No entry animation, so LCP is the image itself. */}
      <section className="relative isolate h-[calc(100svh-var(--header-h)-2.25rem)] min-h-[34rem] overflow-hidden bg-primary text-primary-foreground">
        {current?.hero_image && (
          <Image
            src={current.hero_image}
            alt={`${current.name}, Drop 0${current.number} campaign`}
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            className="-z-10 object-cover object-[50%_30%]"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <Container className="flex h-full flex-col justify-end pb-12 sm:pb-16 lg:pb-20">
          <p className="mb-4 text-xs tracking-[0.2em] uppercase text-white/85">
            Drop 0{current?.number} · {current?.name}
          </p>
          <h1 className="max-w-3xl text-[2.6rem] leading-[1.02] text-balance text-white sm:text-6xl lg:text-[5.5rem]">
            Contemporary clothes for women who like a little more.
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/shop?drop=${current?.slug}`}
              className="inline-flex h-12 items-center rounded-full bg-white px-7 text-sm tracking-wide text-foreground transition-colors hover:bg-cream"
            >
              Shop the drop
            </Link>
            <Link
              href="/lookbook"
              className="inline-flex h-12 items-center rounded-full border border-white/60 px-7 text-sm tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              See the lookbook
            </Link>
          </div>
        </Container>
      </section>

      {/* Mood-led entry points (brand doc §9.1). */}
      <Container className="py-20 lg:py-28">
        <SectionHeading eyebrow="Shop by mood" title="Start with how you want to feel." />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {pillars.map((p) => (
            <Link key={p.slug} href={`/shop?pillar=${p.slug}`} className="group reveal block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                {p.image && (
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 23vw, 46vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out [@media(hover:hover)]:group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <p className="absolute right-3 bottom-3 left-3 font-heading text-xl text-white sm:text-2xl">{p.name}</p>
              </div>
              <p className="mt-3 hidden text-sm text-muted-foreground sm:block">{p.description}</p>
            </Link>
          ))}
        </div>
      </Container>

      {/* Current drop */}
      {current && (
        <section className="bg-card py-20 lg:py-28">
          <Container>
            <div className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-2 lg:gap-16">
              <div className="reveal">
                <Eyebrow className="mb-3">Drop 0{current.number}</Eyebrow>
                <h2 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">{current.name}</h2>
                <p className="mt-3 font-heading text-xl text-gold-ink italic">{current.tagline}</p>
              </div>
              <p className="reveal self-end text-lg text-pretty text-muted-foreground">{current.story}</p>
            </div>
            <ProductRail products={dropProducts} />
          </Container>
        </section>
      )}

      {/* Signature moment: pinned pillar story */}
      <Container className="py-20 lg:py-28">
        <SectionHeading eyebrow="What makes a Haseki piece" title="Better cuts. Brighter ideas. Beautiful details." />
        <StickyStory panels={pillarsStory} />
      </Container>

      {/* Signature silhouettes */}
      <Container className="pb-20 lg:pb-28">
        <SectionHeading eyebrow="The Wrap" title="Our signature silhouettes" href="/shop?pillar=the-wrap" />
        <ProductRail products={signature} morph={false} />
      </Container>

      {/* Testimonials: fit and feeling, not generic praise (brand doc §9). */}
      <section className="bg-secondary py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="In your words" title="How it made you feel." href="/testimonials" linkLabel="More stories" />
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
            {testimonials.slice(0, 3).map((t) => (
              <figure key={t.id} className="w-[82vw] shrink-0 snap-start rounded-sm bg-background p-8 sm:w-[60vw] lg:w-auto">
                <blockquote className="font-heading text-2xl leading-snug text-pretty">“{t.quote}”</blockquote>
                <figcaption className="mt-6 text-sm text-muted-foreground">
                  {t.author}, {t.location} · <span className="text-foreground">{t.product}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* Name story */}
      <Container className="py-20 text-center lg:py-32">
        <Eyebrow className="mb-6">Why Haseki</Eyebrow>
        <p className="reveal mx-auto max-w-4xl font-heading text-3xl leading-snug text-balance sm:text-4xl lg:text-5xl">
          In the Ottoman court, <em>Haseki</em> meant the chosen one. Elevated, quietly powerful, never loud. We
          think clothes should feel the same.
        </p>
        <Link
          href="/about"
          className="mt-10 inline-block border-b border-foreground/40 pb-0.5 text-xs tracking-[0.14em] uppercase hover:border-gold hover:text-gold"
        >
          Our story
        </Link>
      </Container>
    </>
  );
}
