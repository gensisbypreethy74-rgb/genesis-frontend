import { API_V1 } from "./api";

export interface MomentStep {
  number: string;
  title: string;
  description: string;
}

/**
 * Header copy for The Moment's product showcase. Membership isn't listed here —
 * a piece is in The Moment when its `category` is "The Moment".
 */
export interface SeasonalCollection {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
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

/** Fetch the editable Moment section. null on failure → its sections are left out. */
export async function fetchMoment(): Promise<Moment | null> {
  try {
    const res = await fetch(`${API_V1}/moment`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
