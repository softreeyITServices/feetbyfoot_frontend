/**
 * Values that should never be passed to `next/image` `src` (common API/OpenAPI placeholders).
 */
const INVALID_PLACEHOLDER = new Set([
  "string",
  "undefined",
  "null",
  "number",
  "boolean",
  "object",
  "n/a",
  "na",
]);

/**
 * Normalizes a cover image URL from the API, or returns `undefined` if unusable.
 */
export function normalizeCoverImageUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  if (!t || INVALID_PLACEHOLDER.has(t.toLowerCase())) return undefined;

  if (t.startsWith("/")) return t;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("//")) return `https:${t}`;

  // Safe relative asset path (no spaces, no scheme) → site root
  if (/^[\w./-]+$/.test(t) && !t.includes("..")) {
    return `/${t.replace(/^\/+/, "")}`;
  }

  return undefined;
}

/**
 * Returns a `src` safe for Next.js `<Image />` (never invalid placeholders).
 */
export function safeNextImageSrc(
  raw: string | undefined | null,
  fallback: string
): string {
  return normalizeCoverImageUrl(raw) ?? fallback;
}
