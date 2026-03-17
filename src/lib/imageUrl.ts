const FALLBACK_IMAGE_SRC = "/file.svg";
const BLOCKED_IMAGE_HOSTS = new Set(["cdn.site.com"]);

export function getSafeImageUrl(src?: string | null): string {
  if (!src) return FALLBACK_IMAGE_SRC;

  if (src.startsWith("/")) return src;

  try {
    const parsed = new URL(src);
    if (BLOCKED_IMAGE_HOSTS.has(parsed.hostname)) {
      return FALLBACK_IMAGE_SRC;
    }
    return src;
  } catch {
    return FALLBACK_IMAGE_SRC;
  }
}

export function getSafeImageUrls(urls?: Array<string | null | undefined>): string[] {
  const safeUrls = (urls ?? [])
    .map((url) => getSafeImageUrl(url))
    .filter((url) => Boolean(url));

  return safeUrls.length > 0 ? safeUrls : [FALLBACK_IMAGE_SRC];
}
