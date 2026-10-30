import { API_V1 } from "./api";

/**
 * Homepage banners, as the storefront consumes them.
 *
 * The hero used to hardcode `/images/image.png`, so nothing uploaded in the
 * studio — desktop or mobile — ever reached the site.
 */

export interface StoreBanner {
  id: string;
  /** Wide crop, shown from `md` up. */
  image: string;
  /** Tall crop for phones. Null when the studio hasn't supplied one. */
  mobileImage: string | null;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Same shape check the product gallery uses: only refs that can resolve. */
function isUsableImageRef(url?: string | null): boolean {
  if (!url) return false;
  const s = url.trim();
  if (!s) return false;
  if (s.startsWith("/")) return true;
  return /^https?:\/\/.+/i.test(s);
}

interface ApiBanner {
  _id: string;
  image?: string;
  mobileImage?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  status?: string;
}

/**
 * Every ACTIVE banner with a usable desktop image, newest first (the API
 * already sorts by createdAt desc).
 *
 * A banner without a usable wide crop is dropped — it has nothing to show on
 * the surface that matters most. A missing `mobileImage` is fine: phones get
 * the same banner's wide crop. Throws on failure so the caller can tell "no
 * banners" from "couldn't load banners". Server renders share a one-minute cache.
 */
export async function fetchActiveBanners(): Promise<StoreBanner[]> {
  const res = await fetch(`${API_V1}/banners`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Banners request failed (${res.status})`);
  const json = await res.json();
  if (!json?.success || !Array.isArray(json.data)) return [];

  return (json.data as ApiBanner[])
    .filter((b) => b.status === "ACTIVE" && isUsableImageRef(b.image))
    .map((b) => ({
      id: b._id,
      image: b.image as string,
      mobileImage: isUsableImageRef(b.mobileImage) ? (b.mobileImage as string) : null,
      eyebrow: b.eyebrow || "",
      title: b.title || "",
      description: b.description || "",
      ctaLabel: b.ctaLabel || "",
      ctaHref: b.ctaHref || "",
    }));
}
