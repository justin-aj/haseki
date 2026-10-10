export const site = {
  name: "Haseki",
  tagline: "Contemporary clothes for women who like a little more.",
  description:
    "Better cuts. Brighter ideas. Beautiful details. Made in Kochi for real bodies and real summers, shipped worldwide.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@haseki.in",
  phone: "+91 98470 00000",
  whatsapp: "https://wa.me/919847000000",
  address: "Panampilly Nagar, Ernakulam, Kochi, Kerala 682036",
  instagram: "https://instagram.com/labelhaseki",
};

/** Mood-led primary navigation (brand doc §9.1). Categories sit underneath as filters. */
export const pillarNav = [
  { slug: "the-wrap", label: "The Wrap" },
  { slug: "the-scallop", label: "The Scallop" },
  { slug: "a-little-extra", label: "A Little Extra" },
  { slug: "a-little-something", label: "A Little Something" },
] as const;

export const categories = [
  { slug: "tops", label: "Tops" },
  { slug: "shirts", label: "Shirts" },
  { slug: "dresses", label: "Dresses" },
  { slug: "bottoms", label: "Skirts & trousers" },
  { slug: "jackets", label: "Jackets" },
  { slug: "co-ords", label: "Co-ords" },
  { slug: "sarees", label: "Sarees & blouses" },
] as const;

export const storyNav = [
  { href: "/lookbook", label: "Lookbook" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Pop-ups" },
] as const;

export const footerNav = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Shop all" },
      ...pillarNav.map((p) => ({ href: `/shop?pillar=${p.slug}`, label: p.label })),
    ],
  },
  {
    title: "Haseki",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/lookbook", label: "Lookbook" },
      { href: "/journal", label: "Journal" },
      { href: "/testimonials", label: "In your words" },
      { href: "/events", label: "Pop-ups" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ & sizing" },
      { href: "/contact", label: "Contact" },
      { href: "/policies/shipping", label: "Shipping" },
      { href: "/policies/returns", label: "Returns & exchanges" },
      { href: "/policies/privacy", label: "Privacy" },
      { href: "/policies/terms", label: "Terms" },
    ],
  },
] as const;

export function categoryLabel(slug: string) {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}

export function pillarLabel(slug: string) {
  return pillarNav.find((p) => p.slug === slug)?.label ?? slug;
}
