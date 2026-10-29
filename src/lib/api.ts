/**
 * Backend origin without a trailing `/api` (e.g. `https://api.example.com`).
 * Every storefront request builds on this one value; `next.config.ts` fails a
 * production build when `NEXT_PUBLIC_API_URL` is missing, so the localhost
 * fallback only ever applies in development.
 */
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

/** Versioned API root, e.g. `${API_V1}/products`. */
export const API_V1 = `${API_ORIGIN}/api/v1`;
