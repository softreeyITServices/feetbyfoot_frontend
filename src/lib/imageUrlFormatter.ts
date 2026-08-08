/**
 * Formats image URLs for production safety:
 * 1. Upgrades HTTP to HTTPS to prevent Mixed Content security blocks on HTTPS origins.
 * 2. Prepends API_BASE_URL to relative backend upload paths (/uploads/...).
 * 3. Applies a Cloudinary transformation to auto-crop/zoom product photos so they
 *    fill the card frame consistently, regardless of the original photo's framing.
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

  // Auto-crop/zoom Cloudinary images to fill frame consistently (subject-aware crop)
  if (trimmed.includes("res.cloudinary.com") && trimmed.includes("/upload/")) {
    trimmed = trimmed.replace(
      "/upload/",
      "/upload/c_fill,g_auto,ar_4:5,q_auto,f_auto/"
    );
  }

  return trimmed;
}
