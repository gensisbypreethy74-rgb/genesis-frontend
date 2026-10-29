import type { MetadataRoute } from "next";
import { API_V1 } from "../lib/api";
import { SITE_URL } from "../lib/contact";

// Rebuilt at most hourly, so new pieces reach crawlers without a deploy.
export const revalidate = 3600;

/** Public, linked pages. Account, bag and checkout flows are left out (see robots.ts). */
const STATIC_ROUTES = [
  "/",
  "/products",
  "/the-edit",
  "/the-edit/within",
  "/the-edit/beyond",
  "/the-edit/genesis-man",
  "/the-edit/archive",
  "/story",
  "/size-guide",
  "/shipping-information",
  "/returns-exchanges",
  "/shipping-policy",
  "/refund-cancellation",
  "/terms-and-conditions",
  "/privacy-policy",
];

/** Every listed piece. An unreachable API just means a sitemap without them. */
async function productEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_V1}/products`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json?.data)) return [];
    return (json.data as { _id: string; updatedAt?: string }[]).map((p) => ({
      url: `${SITE_URL}/products/${p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` })),
    ...(await productEntries()),
  ];
}
