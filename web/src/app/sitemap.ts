import type { MetadataRoute } from "next";
import { getJournal, getPolicies, getProducts } from "@/lib/data";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, policies] = await Promise.all([getProducts(), getJournal(), getPolicies()]);
  const pages = ["", "/shop", "/about", "/lookbook", "/journal", "/contact", "/faq", "/testimonials", "/events"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...products.map((p) => ({ url: `${site.url}/shop/${p.slug}` })),
    ...posts.map((p) => ({ url: `${site.url}/journal/${p.slug}`, lastModified: p.published_at ?? undefined })),
    ...policies.map((p) => ({ url: `${site.url}/policies/${p.slug}` })),
  ];
}
