import { API_V1 } from "./api";

export interface StudioNote {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Fetch the editable Studio Notes block. null on failure → component uses defaults. */
export async function fetchStudioNote(): Promise<StudioNote | null> {
  try {
    const res = await fetch(`${API_V1}/studio-note`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
