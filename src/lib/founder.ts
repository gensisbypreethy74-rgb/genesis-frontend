import { API_V1 } from "./api";

export interface FounderNote {
  eyebrow: string;
  heading: string;
  body1: string;
  body2: string;
  signature: string;
  image: string;
}

/** Fetch the editable Founder's Note. null on failure → the section is left out. */
export async function fetchFounderNote(): Promise<FounderNote | null> {
  try {
    const res = await fetch(`${API_V1}/founder-note`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
