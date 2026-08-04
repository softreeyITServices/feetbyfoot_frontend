/**
 * Formats image URLs for production safety:
 * 1. Upgrades HTTP to HTTPS to prevent Mixed Content security blocks on HTTPS origins.
 * 2. Prepends API_BASE_URL to relative backend upload paths (/uploads/...).
 */
export function formatImageUrl(url?: string | null): string {
  if (!url) return "";
  let trimmed = url.trim();

  // Upgrade HTTP to HTTPS to avoid browser Mixed Content blocking
  if (trimmed.startsWith("http://")) {
    trimmed = trimmed.replace(/^http:\/\//i, "https://");
  }

  // Prepend backend API URL if image path is relative (/uploads/...)
  if (trimmed.startsWith("/uploads/")) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanApiBase = apiBase.replace(/\/+$/, "");
    trimmed = `${cleanApiBase}${trimmed}`;
  }

  return trimmed;
}
