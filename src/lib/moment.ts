export interface MomentStep {
  number: string;
  title: string;
  description: string;
}

export interface SeasonalCollection {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  productIds: string[];
}

export interface Moment {
  eyebrow: string;
  title: string;
  body: string;
  shopLabel: string;
  shopHref: string;
  explainerEyebrow: string;
  steps: MomentStep[];
  seasonal?: SeasonalCollection;
}

/** Fetch the editable Moment section. null on failure → components use their defaults. */
export async function fetchMoment(): Promise<Moment | null> {
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
    const res = await fetch(`${base}/api/v1/moment`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
