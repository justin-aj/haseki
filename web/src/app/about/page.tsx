import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/content/section";

export const metadata: Metadata = {
  title: "Our story",
  description: "Haseki: Indian surface craft on global silhouettes, designed in Kochi around how you want your body to feel.",
};

const IMG = (id: string, w = 1200, h = 1500) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=entropy&q=80`;

const beliefs = [
  { title: "Fit first", body: "We design around real proportions, not a single idea of an Indian body. Every seam is placed on purpose, and we tell you where." },
  { title: "Craft, carried lightly", body: "Scallops, stones and tonal prints, worked into silhouettes you would wear to work, to dinner, or for no reason at all." },
  { title: "Fabrics for real summers", body: "Georgette, chiffon, rayon and cotton blends. Light enough for a Kochi afternoon, considered enough for anywhere." },
  { title: "Price, the pleasant surprise", body: "Design-led pieces, mostly between ₹1,500 and ₹3,500. We never lead with price. It should land after you have already fallen for the piece." },
];

// Mission, vision and personality from sections 2.1–2.3 of the brand strategy.
const visionKeywords = ["Flexible", "Spacious", "Elite", "Gracious", "Attention-seeking"];

const personality = [
  { title: "Charismatic, not loud", body: "The garment should make people ask where it's from, not shout for attention on its own." },
  { title: "Elegant with tension", body: "Soft fabric against a sharper silhouette. A romantic print against minimal construction. Delicate stones against a clean cut." },
  { title: "Playful and relatable", body: "Quirky, a little cheeky, but grounded in real bodies and real Kochi streets rather than a studio backdrop." },
];

export default function AboutPage() {
  return (
    <>
      <Container className="grid gap-10 pt-12 pb-20 sm:pt-16 lg:grid-cols-2 lg:items-end lg:gap-16 lg:pt-24">
        <div>
          <Eyebrow className="mb-3">Our story</Eyebrow>
          <h1 className="text-5xl leading-[1.02] text-balance sm:text-6xl lg:text-7xl">The chosen one.</h1>
        </div>
        <p className="text-lg text-pretty text-muted-foreground">
          In the Ottoman court, <em>Haseki</em> was the title held by the sultan&apos;s most favoured consort, most
          famously Hürrem Sultan. It meant favourite, beloved, chosen. A word from the crossroads of East and West,
          elevated and quietly powerful. That is the feeling we design for.
        </p>
      </Container>

      <div className="relative aspect-[16/10] max-h-[80svh] w-full overflow-hidden bg-muted sm:aspect-[16/7]">
        <Image
          src={IMG("1633145284780-c8fda4f11464", 2000, 1000)}
          alt="Boat on the Kerala backwaters between palm trees"
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:py-28">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
          <Image
            src={IMG("1607997637503-d4d8dee871e4")}
            alt="Woman in a white long-sleeve dress"
            fill
            sizes="(min-width: 1024px) 40vw, 92vw"
            className="object-cover"
          />
        </div>
        <div className="self-center">
          <Eyebrow className="mb-3">Caroline&apos;s philosophy</Eyebrow>
          <p className="reveal font-heading text-3xl leading-snug text-balance sm:text-4xl">
            “I design around how you want your body to feel, not around a trend or a single body type.”
          </p>
          <p className="mt-6 text-lg text-pretty text-muted-foreground">
            Haseki began in Ernakulam with a simple frustration. Interesting clothes meant poor fabric. Good fabric meant
            a designer price. Good fit meant something visually boring. We set out to resolve all three at once, inside
            one clear point of view: the fit discipline of global womenswear, the surface richness of Indian craft, and
            a price you can say yes to.
          </p>
        </div>
      </Container>

      <section aria-labelledby="mission-vision" className="border-t py-20 lg:py-28">
        <Container>
          <h2 id="mission-vision" className="sr-only">
            Mission and vision
          </h2>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="reveal">
              <Eyebrow className="mb-4">Our mission</Eyebrow>
              <p className="font-heading text-2xl leading-snug text-pretty sm:text-3xl">
                To design clothes around how a woman wants her body to feel in them, engineering fit for real
                proportions rather than a single &ldquo;Indian body&rdquo; archetype, and to make design-led,
                craft-detailed fashion genuinely attainable.
              </p>
            </div>
            <div className="reveal">
              <Eyebrow className="mb-4">Our vision</Eyebrow>
              <p className="font-heading text-2xl leading-snug text-pretty sm:text-3xl">
                Contemporary clothes for women who like a little more. Better cuts. Brighter ideas. Beautiful details.
                Made for real bodies and real Indian summers.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Vision keywords">
                {visionKeywords.map((k) => (
                  <li key={k} className="rounded-full border border-gold/50 px-3.5 py-1.5 text-sm text-gold-ink">
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <dl className="mt-16 grid gap-10 border-t pt-10 sm:grid-cols-3">
            {personality.map((p) => (
              <div key={p.title} className="reveal">
                <dt className="font-heading text-xl">{p.title}</dt>
                <dd className="mt-2 text-muted-foreground">{p.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-primary py-20 text-primary-foreground lg:py-28">
        <Container>
          <Eyebrow className="mb-3 text-primary-foreground/60">East meets West</Eyebrow>
          <h2 className="max-w-3xl text-4xl leading-tight text-balance sm:text-5xl">What we believe</h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {beliefs.map((b, i) => (
              <div key={b.title} className="reveal border-t border-primary-foreground/20 pt-6">
                <p className="font-heading text-sm text-primary-foreground/70">0{i + 1}</p>
                <h3 className="mt-3 text-2xl">{b.title}</h3>
                <p className="mt-3 text-primary-foreground/75">{b.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-20 text-center lg:py-28">
        <p className="mx-auto max-w-2xl font-heading text-3xl leading-snug text-balance sm:text-4xl">
          Made in Kochi. Worn everywhere.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm text-primary-foreground">
            Shop the collection
          </Link>
          <Link href="/events" className="inline-flex h-12 items-center rounded-full border border-foreground/30 px-7 text-sm">
            Visit a pop-up
          </Link>
        </div>
      </Container>
    </>
  );
}
