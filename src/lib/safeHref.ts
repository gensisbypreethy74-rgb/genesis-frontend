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

/**
 * Where to go after signing in: the `?next=` path, or home.
 *
 * Only plain on-site paths pass. The value comes from the address bar, and the
 * router must never be handed another site or a javascript: URL — so no
 * scheme, no "//host", no backslashes and no whitespace or control characters
 * (browsers drop tabs and newlines, turning "/\t/evil.com" into "//evil.com").
 * The sign-in pages themselves fall back to home rather than loop.
 */
export function safeNextPath(next: string | null | undefined): string {
  const s = next || "";
  if (!s.startsWith("/") || s.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(s)) return "/";
  if (/^\/(sign-in|register|login)(?=$|[/?#])/.test(s)) return "/";
  return s;
}
