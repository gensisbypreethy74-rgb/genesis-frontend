/**
 * Backend origin without a trailing `/api` (e.g. `https://api.example.com`).
 * Every storefront request builds on this one value. There is deliberately no
 * default: `next.config.ts` refuses to start or build without a valid
 * `NEXT_PUBLIC_API_URL`, so a missing value can never quietly become localhost.
 */
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!RAW_API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set.");

// Accepts the origin with or without a trailing "/api" or "/api/v1" (and
// trailing slashes), so every form of the variable resolves to the same root.
export const API_ORIGIN = RAW_API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api(\/v1)?$/, "");

/** Versioned API root, e.g. `${API_V1}/products`. */
export const API_V1 = `${API_ORIGIN}/api/v1`;
