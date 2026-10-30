import { API_V1 } from "./api";

export interface SiteSettings {
  /** International format, digits only (e.g. 9177…). "" when unknown. */
  whatsappNumber: string;
}

/**
 * Studio-wide settings, read on the server by the root layout so the first
 * paint already has the studio's own values. null on failure. Shares the
 * one-minute cache the other studio-edited sections use.
 */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${API_V1}/site-settings`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}
