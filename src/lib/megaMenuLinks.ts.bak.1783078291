import type { MenuCategory, MenuGroup, MenuSubcategory } from "@/domain/shared/types/product.type";

export function groupPrimaryHref(g: MenuGroup): string {
  if (g.href) return g.href;
  if (g.storefrontPath) return g.storefrontPath;
  return "#";
}

/** No own link: label only (still may open a flyout if the group has categories). */
export function groupIsHeaderOnly(g: MenuGroup): boolean {
  return !g.href && !g.storefrontPath;
}

export function categoryIsHeaderOnly(g: MenuGroup, c: MenuCategory): boolean {
  return !c.href && !g.storefrontPath;
}

export function subcategoryIsHeaderOnly(
  g: MenuGroup,
  s: MenuSubcategory
): boolean {
  return !s.href && !g.storefrontPath;
}

export function categoryHref(g: MenuGroup, c: MenuCategory): string {
  if (c.href) return c.href;
  if (g.storefrontPath) {
    const qs = new URLSearchParams();
    // Items in this tier are actually categoryTypes (e.g. "Ankle", "12-24 Month"),
    // not real Category documents, so they must map to the "subcategory"
    // param (-> categoryTypeIds on the backend), not "category" (-> categoryIds).
    qs.set("subcategory", c.id);
    return `${g.storefrontPath}?${qs.toString()}`;
  }
  return "#";
}

export function subcategoryHref(
  g: MenuGroup,
  c: MenuCategory,
  s: MenuSubcategory
): string {
  if (s.href) return s.href;
  if (g.storefrontPath) {
    const qs = new URLSearchParams();
    qs.set("category", c.id);
    qs.set("subcategory", s.id);
    return `${g.storefrontPath}?${qs.toString()}`;
  }
  return "#";
}

export function pathFromHref(href: string): string {
  try {
    if (href.startsWith("/")) return href.split("?")[0] ?? href;
    const u = new URL(href);
    return u.pathname;
  } catch {
    return href.split("?")[0] ?? href;
  }
}

export function isGroupPathActive(pathname: string, g: MenuGroup): boolean {
  const raw = g.storefrontPath || g.href;
  if (!raw || raw === "#") return false;
  const path = pathFromHref(raw);
  if (!path || path === "#") return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}
