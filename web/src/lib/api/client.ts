import createClient from "openapi-fetch";
import type { components, paths } from "./schema";

export type Schemas = components["schemas"];
export type ProductSummary = Schemas["ProductSummary"];
export type ProductDetail = Schemas["ProductDetail"];
export type Money = Schemas["Money"];
export type Currency = Schemas["Currency"];

/** Server-side client: talks to the Rust API directly. */
export const api = createClient<paths>({
  baseUrl: process.env.API_URL ?? "http://127.0.0.1:8080",
  // Caching is owned by `use cache` + tags in lib/data.ts; skip the separate fetch cache,
  // which otherwise survives across builds and serves stale catalog data.
  fetch: (request) => fetch(request, { cache: "no-store" }),
});

/** Browser client: goes through the Next.js /api rewrite. */
export const browserApi = createClient<paths>({ baseUrl: "/api" });
