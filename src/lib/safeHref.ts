/**
 * A link typed into the studio, made safe to render.
 *
 * Only on-site paths ("/…") and https:// URLs pass — the same rule the backend
 * enforces on save. "//host" and "/\host" are rejected because browsers read
 * both as a link to another site. Anything else (a typo, "http://", a stray
 * scheme) gets `fallback`; pass "" to let the caller hide the link instead.
 */
export function safeHref(href: string | null | undefined, fallback: string): string {
  const s = (href || "").trim();
  if (s.startsWith("/") && s[1] !== "/" && s[1] !== "\\") return s;
  if (/^https:\/\/[^/\\]/i.test(s)) return s;
  return fallback;
}
