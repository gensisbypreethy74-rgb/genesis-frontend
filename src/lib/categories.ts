import axios from "axios";

/**
 * Categories, as the storefront consumes them.
 *
 * One module so every surface that lists categories reads the same data and
 * builds the same links. Before this, the home page rendered a hardcoded list
 * of four "life modes" that existed nowhere in the database — so a category
 * added in the studio could never appear on the site.
 */

export interface StoreCategory {
  /** Slug used in `/products?category=…`. */
  id: string;
  name: string;
  /** Stored reference; pass through `cldOptimize` before rendering. */
  image: string;
}

/** Backend origin, tolerating a NEXT_PUBLIC_API_URL that includes `/api`. */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api\/?$/,
  ""
);

/**
 * Lowercase; collapse spaces, ampersands and slashes to single hyphens.
 *
 * The products page filters on this exact form, so anything that links to
 * `?category=` must slugify identically — hence one shared implementation
 * rather than a copy per page.
 */
export const slugify = (s?: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[\s&/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

interface ApiCategory {
  name?: string;
  image?: string;
  status?: string;
}

/**
 * Every ACTIVE category, in the order the API returns them.
 *
 * Only ACTIVE ones are published: setting a category to INACTIVE in the studio
 * is how you take it off the site, and deleting it removes it here on the next
 * load. Throws on failure so callers can decide what to show.
 */
export async function fetchActiveCategories(): Promise<StoreCategory[]> {
  const res = await axios.get(`${API_ORIGIN}/api/v1/categories`);
  if (!res.data?.success || !Array.isArray(res.data.data)) return [];

  return (res.data.data as ApiCategory[])
    .filter((c) => c.status === "ACTIVE" && c.name)
    .map((c) => ({
      id: slugify(c.name),
      name: c.name as string,
      image: c.image || "",
    }));
}
