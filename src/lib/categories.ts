import { MOMENT_CATEGORY } from "./product";
import { API_V1 } from "./api";

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

/**
 * Lowercase; collapse spaces, ampersands and slashes to single hyphens.
 *
 * The products page filters on this exact form, so anything that links to
 * `?category=` must slugify identically — hence one shared implementation
 * rather than a copy per page.
 */
/**
 * Every category the studio can file a piece under that is NOT a Category-model
 * doc (lowercased): the four fixed THE EDIT sections, plus The Moment.
 *
 * Any code that gates products to *active* categories must let these through, or
 * a piece filed under one becomes unreachable — which is exactly how pieces filed
 * under The Moment started 404ing on their detail page. Add to this list whenever
 * a new fixed option joins the admin's Category dropdown.
 */
export const FIXED_CATEGORIES = [
  "within",
  "beyond",
  "genesis men",
  "archive",
  MOMENT_CATEGORY.toLowerCase(),
];

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
 * load. Throws on failure so callers can decide what to show. Server renders
 * share a one-minute cache; in the browser this is a plain request.
 */
export async function fetchActiveCategories(): Promise<StoreCategory[]> {
  const res = await fetch(`${API_V1}/categories`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Categories request failed (${res.status})`);
  const json = await res.json();
  if (!json?.success || !Array.isArray(json.data)) return [];

  return (json.data as ApiCategory[])
    .filter((c) => c.status === "ACTIVE" && c.name)
    .map((c) => ({
      id: slugify(c.name),
      name: c.name as string,
      image: c.image || "",
    }));
}

/** The Edit section's editable header copy. */
export interface CategorySectionCopy {
  eyebrow: string;
  heading: string;
  shopLabel: string;
  shopHref: string;
}

/** Fetch the studio's copy for The Edit header. null on failure. */
export async function fetchCategorySection(): Promise<CategorySectionCopy | null> {
  try {
    const res = await fetch(`${API_V1}/category-section`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
