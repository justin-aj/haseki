import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "./api/client";

// Catalog and content change only when an admin edits them, which revalidates by tag.
// The hourly lifetime is a safety net, not the main freshness mechanism.

function unwrap<T>(result: { data?: T; error?: unknown; response: Response }, what: string): T {
  if (result.data === undefined) {
    throw new Error(`API ${what} failed: ${result.response.status}`);
  }
  return result.data;
}

export async function getPillars() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return unwrap(await api.GET("/pillars"), "pillars");
}

export async function getDrops() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return unwrap(await api.GET("/drops"), "drops");
}

export async function getProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return unwrap(await api.GET("/products", {}), "products");
}

/** Returns null for unknown slugs so the page can call notFound(). */
export async function getProduct(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${slug}`);
  const res = await api.GET("/products/{slug}", { params: { path: { slug } } });
  if (res.response.status === 404) return null;
  return unwrap(res, `product ${slug}`);
}

export async function getReviews(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("reviews", `reviews:${slug}`);
  return unwrap(await api.GET("/products/{slug}/reviews", { params: { path: { slug } } }), "reviews");
}

export async function getTestimonials() {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  return unwrap(await api.GET("/testimonials"), "testimonials");
}

export async function getJournal() {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  return unwrap(await api.GET("/journal"), "journal");
}

export async function getJournalPost(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  const res = await api.GET("/journal/{slug}", { params: { path: { slug } } });
  if (res.response.status === 404) return null;
  return unwrap(res, `journal ${slug}`);
}

export async function getLookbook() {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  return unwrap(await api.GET("/lookbook"), "lookbook");
}

export async function getEvents() {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  return unwrap(await api.GET("/events"), "events");
}

export async function getFaqs() {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  return unwrap(await api.GET("/faqs"), "faqs");
}

export async function getPolicies() {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  return unwrap(await api.GET("/policies"), "policies");
}

export async function getPolicy(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  const res = await api.GET("/policies/{slug}", { params: { path: { slug } } });
  if (res.response.status === 404) return null;
  return unwrap(res, `policy ${slug}`);
}

export async function getShippingZones() {
  "use cache";
  cacheLife("hours");
  cacheTag("content");
  return unwrap(await api.GET("/shipping/zones"), "shipping zones");
}
