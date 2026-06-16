"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  GripVertical,
  X,
  CheckCircle,
  Layers,
  Package,
  FolderOpen,
  Tag,
} from "lucide-react";
import { CategoryService } from "@/domain/application/services/admin/category.service";
import { CategoryTypeService } from "@/domain/application/services/admin/subcategory.service";
import type {
  AdminCategory,
  AdminCategoryType,
} from "@/domain/shared/types/admin/category";
import { productService } from "@/domain/application/services/product.service";
import type {
  CreateMegaMenuBody,
  MegaMenuDocument,
} from "@/domain/shared/types/product.type";
import { isGetRequestError } from "@/lib/httpClientError";

type SourceSubcategory = {
  id: string;
  name: string;
};

type SourceCatalogCategory = {
  id: string;
  name: string;
  image?: string;
  subcategories: SourceSubcategory[];
};

type SourceGroup = {
  id: string;
  name: string;
  /** Base storefront path for this nav group (e.g. /mens) — used for auto hrefs */
  storefrontPath: string;
  categories: SourceCatalogCategory[];
};

type FinalSubcategory = {
  id: string;
  name: string;
  href?: string;
  /** URL path segment / identifier, e.g. casual-footwear */
  slug?: string;
  /** When true, storefront can show or use the slug (e.g. in links) */
  showSlug?: boolean;
};

type FinalCatalogCategory = {
  id: string;
  name: string;
  children: FinalSubcategory[];
  /** Set when dragged from catalog — category always has image in UI */
  fromCatalog?: boolean;
  /** Custom leaf category: single menu link, no image until it has children */
  href?: string;
  image?: string;
};

type FinalGroup = {
  id: string;
  name: string;
  href?: string;
  /** Mirrors source group; included in export for storefront linking */
  storefrontPath?: string;
  categories: FinalCatalogCategory[];
};

/** Shape for backend API — `subcategories` mirrors UI `children` */
type MenuExportSubcategory = {
  id: string;
  name: string;
  href?: string;
  slug?: string;
  showSlug?: boolean;
};

type MenuExportCategory = {
  id: string;
  name: string;
  href?: string;
  fromCatalog?: boolean;
  image?: string;
  subcategories: MenuExportSubcategory[];
};

type MenuExportGroup = {
  id: string;
  name: string;
  href?: string;
  storefrontPath?: string;
  categories: MenuExportCategory[];
};

type MenuPlacement = "top" | "footer";

type MenuExportPayload = {
  name: string;
  /** top = header mega menu, footer = footer nav */
  position: MenuPlacement;
  /** Default menu for the chosen position (top / footer) */
  isDefault: boolean;
  version: number;
  savedAt: string;
  groups: MenuExportGroup[];
};

/**
 * External API may require `href` to be present (e.g. non-null column). For true
 * header-only rows (no href, no storefrontPath), send empty string — storefront
 * treats falsy href like omitted.
 */
function exportHrefOrEmpty(
  href: string | undefined,
  groupHasStorefrontPath: boolean
): { href?: string } {
  if (href) return { href };
  if (groupHasStorefrontPath) return {};
  return { href: "" };
}

function buildMenuExportPayload(
  groups: FinalGroup[],
  meta: { name: string; position: MenuPlacement; isDefault: boolean }
): MenuExportPayload {
  const trimmedName = meta.name.trim();
  return {
    name: trimmedName || "Untitled menu",
    position: meta.position === "footer" ? "footer" : "top",
    isDefault: Boolean(meta.isDefault),
    version: 1,
    savedAt: new Date().toISOString(),
    groups: groups.map((g) => {
      const hasStore = Boolean(g.storefrontPath);
      return {
        id: g.id,
        name: g.name,
        ...exportHrefOrEmpty(g.href, hasStore),
        ...(g.storefrontPath ? { storefrontPath: g.storefrontPath } : {}),
        categories: g.categories.map((c) => ({
          id: c.id,
          name: c.name,
          ...exportHrefOrEmpty(c.href, hasStore),
          ...(c.fromCatalog !== undefined ? { fromCatalog: c.fromCatalog } : {}),
          ...(c.image ? { image: c.image } : {}),
          subcategories: c.children.map((s) => ({
            id: s.id,
            name: s.name,
            ...exportHrefOrEmpty(s.href, hasStore),
            ...(s.slug !== undefined && s.slug !== "" ? { slug: s.slug } : {}),
            ...(s.showSlug !== undefined ? { showSlug: s.showSlug } : {}),
          })),
        })),
      };
    }),
  };
}

function megaMenuPayloadToFinalGroups(
  payload: Pick<MegaMenuDocument, "groups">
): FinalGroup[] {
  return (payload.groups ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    ...(g.href ? { href: g.href } : {}),
    ...(g.storefrontPath ? { storefrontPath: g.storefrontPath } : {}),
    categories: (g.categories ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      ...(c.href ? { href: c.href } : {}),
      ...(c.fromCatalog !== undefined ? { fromCatalog: c.fromCatalog } : {}),
      image: c.image ?? "",
      children: (c.subcategories ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        ...(s.href ? { href: s.href } : {}),
        ...(s.slug !== undefined && s.slug !== "" ? { slug: s.slug } : {}),
        ...(s.showSlug !== undefined ? { showSlug: s.showSlug } : {}),
      })),
    })),
  }));
}

type DragItem =
  | {
    type: "source-catalog-category";
    groupId: string;
    catalogCategoryId: string;
  }
  | {
    type: "source-subcategory";
    groupId: string;
    catalogCategoryId: string;
    subcategoryId: string;
  }
  | { type: "final-group"; id: string }
  | {
    type: "final-catalog-category";
    groupId: string;
    catalogCategoryId: string;
  }
  | {
    type: "final-subcategory";
    groupId: string;
    catalogCategoryId: string;
    subcategoryId: string;
  };

/** Top-level nav slots: same API categories/subcategories are shown under each */
const NAV_SOURCE_GROUP_TEMPLATES: Omit<SourceGroup, "categories">[] = [
  { id: "grp-men", name: "Men", storefrontPath: "/mens" },
  { id: "grp-women", name: "Women", storefrontPath: "/womens" },
  { id: "grp-kids", name: "Kids", storefrontPath: "/kids" },
  { id: "grp-gifts", name: "Gifts", storefrontPath: "/gifts" },
  { id: "grp-outlet", name: "Outlet", storefrontPath: "/shop" },
  { id: "grp-brand", name: "Brand", storefrontPath: "/brand" },
];

const DRAG_KEY = "application/json";

const FIXED_GROUP_TEMPLATE_BY_ID = new Map(
  NAV_SOURCE_GROUP_TEMPLATES.map((group) => [group.id, group])
);

function createFixedFinalGroup(
  template: Omit<SourceGroup, "categories">
): FinalGroup {
  return {
    id: template.id,
    name: template.name,
    storefrontPath: template.storefrontPath,
    categories: [],
  };
}

function createDefaultFinalGroups(): FinalGroup[] {
  return NAV_SOURCE_GROUP_TEMPLATES.map(createFixedFinalGroup);
}

function normalizeFixedFinalGroups(groups: FinalGroup[]): FinalGroup[] {
  const normalized: FinalGroup[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    const template = FIXED_GROUP_TEMPLATE_BY_ID.get(group.id);
    if (!template || seen.has(group.id)) continue;
    seen.add(group.id);
    normalized.push({
      ...group,
      href: undefined,
      storefrontPath: template.storefrontPath,
    });
  }

  for (const template of NAV_SOURCE_GROUP_TEMPLATES) {
    if (!seen.has(template.id)) {
      normalized.push(createFixedFinalGroup(template));
    }
  }

  return normalized;
}

function defaultSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function subcategoryFromSource(
  sub: SourceSubcategory,
  options?: { href?: string }
): FinalSubcategory {
  return {
    id: sub.id,
    name: sub.name,
    slug: defaultSlugFromName(sub.name),
    showSlug: true,
    ...(options?.href ? { href: options.href } : {}),
  };
}

function buildCategoryFilterHref(
  storefrontPath: string,
  categoryId: string
): string {
  const qs = new URLSearchParams();
  qs.set("category", categoryId);
  return `${storefrontPath}?${qs.toString()}`;
}

function buildSubcategoryFilterHref(
  storefrontPath: string,
  categoryId: string,
  subcategoryId: string
): string {
  const qs = new URLSearchParams();
  qs.set("category", categoryId);
  qs.set("subcategory", subcategoryId);
  return `${storefrontPath}?${qs.toString()}`;
}

function buildSharedCatalogFromApi(
  categories: AdminCategory[],
  subcategories: AdminCategoryType[]
): SourceCatalogCategory[] {
  const activeCats = categories.filter((c) => c.isActive !== false);
  const activeSubs = subcategories.filter((s) => s.isActive !== false);

  const byCategory: Record<string, SourceSubcategory[]> = {};
  for (const s of activeSubs) {
    if (!s.categoryId) continue;
    if (!byCategory[s.categoryId]) byCategory[s.categoryId] = [];
    byCategory[s.categoryId].push({ id: s._id, name: s.name });
  }

  return activeCats.map((c) => ({
    id: c._id,
    name: c.name,
    image: c.image?.url,
    subcategories: byCategory[c._id] ?? [],
  }));
}


export default function AdminMenuCreationPage() {
  const [sharedCatalog, setSharedCatalog] = useState<SourceCatalogCategory[]>(
    []
  );
  const [catalogLoading, setCatalogLoading] = useState(true);

  const sourceGroups = useMemo<SourceGroup[]>(
    () =>
      NAV_SOURCE_GROUP_TEMPLATES.map((t) => ({
        ...t,
        categories: sharedCatalog,
      })),
    [sharedCatalog]
  );

  const getSourceGroup = (id: string) =>
    sourceGroups.find((g) => g.id === id) ?? null;

  const getSourceCatalogCategory = (
    groupId: string,
    catalogCategoryId: string
  ) => {
    const g = getSourceGroup(groupId);
    return g?.categories.find((c) => c.id === catalogCategoryId) ?? null;
  };

  const getSourceSubcategory = (
    groupId: string,
    catalogCategoryId: string,
    subcategoryId: string
  ) => {
    const cat = getSourceCatalogCategory(groupId, catalogCategoryId);
    return cat?.subcategories.find((s) => s.id === subcategoryId) ?? null;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCatalogLoading(true);
        const [categories, subcategories] = await Promise.all([
          CategoryService.getAll(),
          CategoryTypeService.getAll<AdminCategoryType>(),
        ]);
        if (cancelled) return;
        setSharedCatalog(
          buildSharedCatalogFromApi(categories, subcategories)
        );
      } catch (error: unknown) {
        if (!cancelled) {
          if (!isGetRequestError(error)) {
            toast.error(
              (error as { message?: string })?.message ??
              "Failed to load categories from API"
            );
          }
          setSharedCatalog([]);
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [finalMenu, setFinalMenu] = useState<FinalGroup[]>(
    createDefaultFinalGroups
  );
  const [dragging, setDragging] = useState<DragItem | null>(null);
  const [savingMenu, setSavingMenu] = useState(false);
  const [menuMetaName, setMenuMetaName] = useState("Main menu");
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");

  const applyMenuDocument = (payload: MegaMenuDocument) => {
    if (payload.name !== undefined && String(payload.name).trim() !== "") {
      setMenuMetaName(String(payload.name));
    }
    setFinalMenu(
      normalizeFixedFinalGroups(megaMenuPayloadToFinalGroups(payload))
    );
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await productService.listMegaMenus();
        if (cancelled) return;
        const topItems = items.filter((i) => i.position === "top");
        if (topItems.length > 0) {
          const pick = topItems.find((i) => i.isDefault) ?? topItems[0];
          setSelectedMenuId(pick.id);
          const doc = await productService.getAdminMegaMenu(pick.id);
          if (cancelled) return;
          applyMenuDocument(doc);
        } else {
          setSelectedMenuId("");
          try {
            const doc = await productService.getMegaMenu();
            if (!cancelled) applyMenuDocument(doc);
          } catch {
            if (!cancelled) setFinalMenu(createDefaultFinalGroups());
          }
        }
      } catch {
        try {
          const doc = await productService.getMegaMenu();
          if (!cancelled) {
            setSelectedMenuId("");
            applyMenuDocument(doc);
          }
        } catch {
          if (!cancelled) setFinalMenu(createDefaultFinalGroups());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Links use the target menu group (e.g. Women), not necessarily the left drag column */
  const storefrontPathForFinalGroup = (groupId: string): string =>
    getSourceGroup(groupId)?.storefrontPath ??
    finalMenu.find((g) => g.id === groupId)?.storefrontPath ??
    "";

  const finalCatalogCategoryKeys = useMemo(() => {
    const keys = new Set<string>();
    finalMenu.forEach((g) => {
      g.categories.forEach((c) => keys.add(`${g.id}::${c.id}`));
    });
    return keys;
  }, [finalMenu]);

  /** Same API subcategory may appear under Men and Women — key by group + category + sub */
  const finalSubcategoryKeys = useMemo(() => {
    const keys = new Set<string>();
    finalMenu.forEach((g) => {
      g.categories.forEach((c) => {
        c.children.forEach((s) =>
          keys.add(`${g.id}::${c.id}::${s.id}`)
        );
      });
    });
    return keys;
  }, [finalMenu]);

  const addCatalogCategoryToFinal = (
    sourceGroupId: string,
    sourceCatalogCategoryId: string,
    targetGroupId?: string
  ) => {
    const srcGroup = getSourceGroup(sourceGroupId);
    const srcCat = getSourceCatalogCategory(
      sourceGroupId,
      sourceCatalogCategoryId
    );
    if (!srcGroup || !srcCat) return;
    const resolvedGroupId = targetGroupId ?? sourceGroupId;
    const key = `${resolvedGroupId}::${srcCat.id}`;
    if (finalCatalogCategoryKeys.has(key)) return;

    const linkBase = storefrontPathForFinalGroup(resolvedGroupId);
    const categoryHref = linkBase
      ? buildCategoryFilterHref(linkBase, srcCat.id)
      : undefined;

    setFinalMenu((prev) => {
      const hasGroup = prev.some((g) => g.id === resolvedGroupId);
      if (!hasGroup && resolvedGroupId !== sourceGroupId) return prev;

      if (!hasGroup && resolvedGroupId === sourceGroupId) {
        return [
          ...prev,
          {
            id: srcGroup.id,
            name: srcGroup.name,
            storefrontPath: srcGroup.storefrontPath,
            categories: [
              {
                id: srcCat.id,
                name: srcCat.name,
                children: [],
                fromCatalog: true,
                image: srcCat.image ?? "",
                ...(categoryHref ? { href: categoryHref } : {}),
              },
            ],
          },
        ];
      }

      return prev.map((g) => {
        if (g.id !== resolvedGroupId) return g;
        if (g.categories.some((c) => c.id === srcCat.id)) return g;
        return {
          ...g,
          categories: [
            ...g.categories,
            {
              id: srcCat.id,
              name: srcCat.name,
              children: [],
              fromCatalog: true,
              image: "",
              ...(categoryHref ? { href: categoryHref } : {}),
            },
          ],
        };
      });
    });
  };

  const addSubcategoryToFinal = (
    sourceGroupId: string,
    sourceCatalogCategoryId: string,
    sourceSubcategoryId: string,
    targetGroupId?: string,
    targetCatalogCategoryId?: string
  ) => {
    const sub = getSourceSubcategory(
      sourceGroupId,
      sourceCatalogCategoryId,
      sourceSubcategoryId
    );
    if (!sub) return;

    const srcGroup = getSourceGroup(sourceGroupId);
    const srcCat = getSourceCatalogCategory(
      sourceGroupId,
      sourceCatalogCategoryId
    );
    if (!srcGroup || !srcCat) return;

    const resolvedGroupId = targetGroupId ?? sourceGroupId;
    const resolvedCatId = targetCatalogCategoryId ?? sourceCatalogCategoryId;
    const subKey = `${resolvedGroupId}::${resolvedCatId}::${sub.id}`;
    if (finalSubcategoryKeys.has(subKey)) return;

    const linkBase = storefrontPathForFinalGroup(resolvedGroupId);
    const subHref = linkBase
      ? buildSubcategoryFilterHref(linkBase, srcCat.id, sub.id)
      : undefined;
    const newSub = subcategoryFromSource(sub, subHref ? { href: subHref } : {});
    const categoryHref = linkBase
      ? buildCategoryFilterHref(linkBase, srcCat.id)
      : undefined;

    setFinalMenu((prev) => {
      const hasGroup = prev.some((g) => g.id === resolvedGroupId);
      if (!hasGroup && resolvedGroupId === sourceGroupId) {
        return [
          ...prev,
          {
            id: srcGroup.id,
            name: srcGroup.name,
            storefrontPath: srcGroup.storefrontPath,
            categories: [
              {
                id: srcCat.id,
                name: srcCat.name,
                children: [newSub],
                fromCatalog: true,
                image: srcCat.image ?? "",
                ...(categoryHref ? { href: categoryHref } : {}),
              },
            ],
          },
        ];
      }
      if (!hasGroup) return prev;

      return prev.map((g) => {
        if (g.id !== resolvedGroupId) return g;
        const catIndex = g.categories.findIndex((c) => c.id === resolvedCatId);
        if (catIndex === -1) {
          return {
            ...g,
            categories: [
              ...g.categories,
              {
                id: srcCat.id,
                name: srcCat.name,
                children: [newSub],
                fromCatalog: true,
                image: srcCat.image ?? "",
                ...(categoryHref ? { href: categoryHref } : {}),
              },
            ],
          };
        }
        const cats = [...g.categories];
        const cat = cats[catIndex];
        if (cat.children.some((ch) => ch.id === sub.id)) return g;
        cats[catIndex] = {
          ...cat,
          children: [...cat.children, newSub],
        };
        return { ...g, categories: cats };
      });
    });
  };

  const removeCatalogCategoryFromFinal = (
    groupId: string,
    catalogCategoryId: string
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.filter((c) => c.id !== catalogCategoryId),
        };
      })
    );
  };

  const removeSubcategoryFromFinal = (
    groupId: string,
    catalogCategoryId: string,
    subcategoryId: string
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((c) => {
            if (c.id !== catalogCategoryId) return c;
            return {
              ...c,
              children: c.children.filter((s) => s.id !== subcategoryId),
            };
          }),
        };
      })
    );
  };

  const onDragStart = (payload: DragItem) => (event: React.DragEvent) => {
    event.dataTransfer.setData(DRAG_KEY, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
    setDragging(payload);
  };

  const onDragEnd = () => setDragging(null);

  const parseDropPayload = (event: React.DragEvent): DragItem | null => {
    const raw = event.dataTransfer.getData(DRAG_KEY);
    if (!raw) return dragging;
    try {
      return JSON.parse(raw) as DragItem;
    } catch {
      return dragging;
    }
  };

  const handleDropToFinal = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = parseDropPayload(event);
    if (!payload) return;

    if (payload.type === "source-catalog-category") {
      addCatalogCategoryToFinal(payload.groupId, payload.catalogCategoryId);
      return;
    }
    if (payload.type === "source-subcategory") {
      addSubcategoryToFinal(
        payload.groupId,
        payload.catalogCategoryId,
        payload.subcategoryId
      );
    }
  };

  const clearFinalMenu = () =>
    setFinalMenu((prev) =>
      normalizeFixedFinalGroups(prev).map((group) => ({
        ...group,
        categories: [],
      }))
    );

  const handleSaveMenu = async () => {
    const exportPayload = buildMenuExportPayload(finalMenu, {
      name: menuMetaName,
      position: "top",
      isDefault: true,
    });
    const body: CreateMegaMenuBody = {
      name: exportPayload.name,
      version: exportPayload.version,
      groups: exportPayload.groups,
      position: exportPayload.position,
      isDefault: exportPayload.isDefault,
      savedAt: exportPayload.savedAt,
    };
    setSavingMenu(true);
    try {
      if (selectedMenuId) {
        await productService.updateMegaMenu(selectedMenuId, body);
      } else {
        const created = await productService.createMegaMenu(body);
        if (created.id) setSelectedMenuId(created.id);
      }
      toast.success("Menu saved");
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ?? "Failed to save menu";
      toast.error(message);
    } finally {
      setSavingMenu(false);
    }
  };

  const moveGroup = (groupId: string, direction: "up" | "down") => {
    setFinalMenu((prev) => {
      const index = prev.findIndex((g) => g.id === groupId);
      if (index === -1) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const moveCatalogCategory = (
    groupId: string,
    catalogCategoryId: string,
    direction: "up" | "down"
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const index = g.categories.findIndex((c) => c.id === catalogCategoryId);
        if (index === -1) return g;
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= g.categories.length) return g;
        const cats = [...g.categories];
        const [item] = cats.splice(index, 1);
        cats.splice(target, 0, item);
        return { ...g, categories: cats };
      })
    );
  };

  const moveSubcategory = (
    groupId: string,
    catalogCategoryId: string,
    subcategoryId: string,
    direction: "up" | "down"
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((c) => {
            if (c.id !== catalogCategoryId) return c;
            const index = c.children.findIndex((s) => s.id === subcategoryId);
            if (index === -1) return c;
            const target = direction === "up" ? index - 1 : index + 1;
            if (target < 0 || target >= c.children.length) return c;
            const children = [...c.children];
            const [item] = children.splice(index, 1);
            children.splice(target, 0, item);
            return { ...c, children };
          }),
        };
      })
    );
  };

  const reorderGroupByDrop = (draggedId: string, targetIndex: number) => {
    setFinalMenu((prev) => {
      const fromIndex = prev.findIndex((g) => g.id === draggedId);
      if (fromIndex === -1 || fromIndex === targetIndex) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const reorderCatalogCategoryByDrop = (
    groupId: string,
    draggedCatalogCategoryId: string,
    targetIndex: number
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const fromIndex = g.categories.findIndex(
          (c) => c.id === draggedCatalogCategoryId
        );
        if (fromIndex === -1 || fromIndex === targetIndex) return g;
        const cats = [...g.categories];
        const [item] = cats.splice(fromIndex, 1);
        cats.splice(targetIndex, 0, item);
        return { ...g, categories: cats };
      })
    );
  };

  const reorderSubcategoryByDrop = (
    groupId: string,
    catalogCategoryId: string,
    draggedSubcategoryId: string,
    targetIndex: number
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((c) => {
            if (c.id !== catalogCategoryId) return c;
            const fromIndex = c.children.findIndex(
              (s) => s.id === draggedSubcategoryId
            );
            if (fromIndex === -1 || fromIndex === targetIndex) return c;
            const children = [...c.children];
            const [item] = children.splice(fromIndex, 1);
            children.splice(targetIndex, 0, item);
            return { ...c, children };
          }),
        };
      })
    );
  };

  const updateGroupName = (groupId: string, name: string) => {
    setFinalMenu((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name } : g))
    );
  };

  /** Menu-only display name; does not update the category in Admin → Categories. */
  const updateFinalCategoryName = (
    groupId: string,
    catalogCategoryId: string,
    name: string
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((c) =>
            c.id === catalogCategoryId ? { ...c, name } : c
          ),
        };
      })
    );
  };

  const updateSubcategory = (
    groupId: string,
    catalogCategoryId: string,
    subcategoryId: string,
    patch: Partial<Pick<FinalSubcategory, "name" | "slug" | "showSlug">>
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((c) => {
            if (c.id !== catalogCategoryId) return c;
            return {
              ...c,
              children: c.children.map((s) =>
                s.id === subcategoryId ? { ...s, ...patch } : s
              ),
            };
          }),
        };
      })
    );
  };

  const [activeGroupTab, setActiveGroupTab] = useState<string | null>(null);
  const activeTabId =
    finalMenu.length === 0
      ? null
      : activeGroupTab && finalMenu.some((g) => g.id === activeGroupTab)
        ? activeGroupTab
        : finalMenu[0]?.id ?? null;
  const activeTabGroup = finalMenu.find((g) => g.id === activeTabId) ?? null;
  const activeTabIndex = finalMenu.findIndex((g) => g.id === activeTabId);

  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogExpandedId, setCatalogExpandedId] = useState<string | null>(null);
  const filteredCatalog = catalogSearch.trim()
    ? sharedCatalog.filter(
      (c) =>
        c.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        c.subcategories.some((s) =>
          s.name.toLowerCase().includes(catalogSearch.toLowerCase())
        )
    )
    : sharedCatalog;

  /** All source groups share the same catalog — use any to resolve category lookups */
  const defaultSrcGroupId = sourceGroups[0]?.id ?? "";
  const targetGroupId = activeTabId ?? defaultSrcGroupId;

  return (
    <div className="space-y-5 pb-10">
      {/* ====== PAGE HEADER ====== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Builder</h1>
          <p className="text-sm text-gray-500 mt-0.5">Design the navigation menu shown on your website</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clearFinalMenu}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            Clear Categories
          </button>
          <button
            type="button"
            onClick={() => void handleSaveMenu()}
            disabled={savingMenu}
            className="px-5 py-2 text-sm bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-60 font-medium"
          >
            {savingMenu ? "Saving…" : "Save Menu"}
          </button>
        </div>
      </div>

      {/*
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Editing Menu</label>
            <div className="flex gap-2">
              <select
                value={selectedMenuId}
                onChange={(e) => void handleMenuSelectionChange(e.target.value)}
                disabled={menusLoading}
                className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              >
                <option value="">
                  {menusLoading ? "Loading menus..." : "Default menu"}
                </option>
                {menuList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.isDefault ? " ⭐" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Menu Name</label>
            <input
              type="text"
              value={menuMetaName}
              onChange={(e) => setMenuMetaName(e.target.value)}
              placeholder="e.g. Main Navigation"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
         
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Show In</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setMenuPlacement("top")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${menuPlacement === "top" ? "bg-black text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
              >
                Top Nav
              </button>
              <button
                type="button"
                onClick={() => setMenuPlacement("footer")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors border-l border-neutral-200 ${menuPlacement === "footer" ? "bg-black text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
              >
                Footer
              </button>
            </div>
          </div>
        
          <div className="lg:col-span-4 flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setMenuIsDefault(!menuIsDefault)}
              className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${menuIsDefault ? "bg-black" : "bg-neutral-300"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${menuIsDefault ? "translate-x-4" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-gray-700">
              <strong>Set as default</strong>
              <span className="ml-1.5 text-gray-500 font-normal text-xs">This menu will be used automatically for the selected position</span>
            </span>
          </div>
        </div>
      </div> */}

      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="max-w-md space-y-1.5">
          {/* <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Menu Name
          </label>
          <input
            type="text"
            value={menuMetaName}
            onChange={(e) => setMenuMetaName(e.target.value)}
            placeholder="e.g. Main Navigation"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          /> */}
        </div>
      </div>

      {/* ====== HOW IT WORKS ====== */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
        <span className="shrink-0 font-semibold text-neutral-700">How it works:</span>
        <span><strong className="text-neutral-800">1.</strong> Browse items on the left</span>
        <span className="hidden sm:block text-neutral-300">→</span>
        <span><strong className="text-neutral-800">2.</strong> Click <strong>+</strong> or drag into your menu (right)</span>
        <span className="hidden sm:block text-neutral-300">→</span>
        <span><strong className="text-neutral-800">3.</strong> Press <strong>Save Menu</strong></span>
      </div>

      {/* ====== MAIN BUILDER ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ===== LEFT: AVAILABLE ITEMS ===== */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-3">
            <Package className="h-4 w-4 text-neutral-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-neutral-800">Catalog Items</h2>
              <p className="text-xs text-neutral-400">Click <strong>+</strong> to add, or drag into your menu</p>
            </div>
            <span className="text-xs text-neutral-400 shrink-0">{sharedCatalog.length} categories</span>
          </div>

          {/* Search */}
          <div className="px-3 pt-3 pb-2 border-b border-neutral-100">
            <div className="relative">
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full rounded-lg border border-neutral-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-neutral-400 bg-neutral-50"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              {catalogSearch && (
                <button type="button" onClick={() => setCatalogSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[420px]">
            {catalogLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-neutral-400 rounded-full animate-spin" />
                <p className="text-sm">Loading your catalog…</p>
              </div>
            ) : sharedCatalog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Package className="h-7 w-7 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">No categories found</p>
                  <p className="text-xs text-gray-500 mt-1">Go to <strong>Admin → Categories</strong> to add some first</p>
                </div>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                <p className="text-sm text-neutral-500">No results for &quot;{catalogSearch}&quot;</p>
                <button type="button" onClick={() => setCatalogSearch("")} className="text-xs text-neutral-400 underline">Clear search</button>
              </div>
            ) : (
              filteredCatalog.map((cat) => {
                const catKey = `${targetGroupId}::${cat.id}`;
                const catAdded = finalCatalogCategoryKeys.has(catKey);
                const isExpanded = catalogExpandedId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`rounded-lg border transition-all ${catAdded ? "border-neutral-100 bg-neutral-50/50 opacity-70" : "border-neutral-200 bg-white"}`}
                  >
                    {/* Category row */}
                    <div
                      draggable
                      onDragStart={onDragStart({ type: "source-catalog-category", groupId: defaultSrcGroupId, catalogCategoryId: cat.id })}
                      onDragEnd={onDragEnd}
                      className="flex items-center gap-2 px-2.5 py-2 cursor-grab active:cursor-grabbing select-none"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-7 h-7 rounded object-cover shrink-0 border border-neutral-200" />
                        ) : (
                          <div className="w-7 h-7 bg-neutral-100 rounded flex items-center justify-center shrink-0">
                            <FolderOpen className="h-3.5 w-3.5 text-neutral-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium truncate text-neutral-800">{cat.name}</span>
                        {catAdded && <CheckCircle className="h-3.5 w-3.5 text-neutral-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {cat.subcategories.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCatalogExpandedId(isExpanded ? null : cat.id)}
                            title={isExpanded ? "Hide subcategories" : "Show subcategories"}
                            className="w-6 h-6 rounded text-neutral-400 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            addCatalogCategoryToFinal(
                              defaultSrcGroupId,
                              cat.id,
                              targetGroupId
                            );
                            setActiveGroupTab(targetGroupId);
                          }}
                          disabled={catAdded}
                          title={catAdded ? "Already in menu" : `Add "${cat.name}" to active section`}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-all ${catAdded ? "text-neutral-300 cursor-default" : "bg-black text-white hover:bg-neutral-700"
                            }`}
                        >
                          {catAdded ? <CheckCircle className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Subcategory pills — collapsible */}
                    {isExpanded && cat.subcategories.length > 0 && (
                      <div className="px-2.5 pb-2.5 pt-0.5 border-t border-neutral-100 flex flex-wrap gap-1.5 bg-neutral-50/50">
                        {cat.subcategories.map((sub) => {
                          const subKey = `${targetGroupId}::${cat.id}::${sub.id}`;
                          const subAdded = finalSubcategoryKeys.has(subKey);
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              draggable={!subAdded}
                              onDragStart={onDragStart({ type: "source-subcategory", groupId: defaultSrcGroupId, catalogCategoryId: cat.id, subcategoryId: sub.id })}
                              onDragEnd={onDragEnd}
                              onClick={() => {
                                if (!subAdded) {
                                  addSubcategoryToFinal(defaultSrcGroupId, cat.id, sub.id, targetGroupId);
                                  setActiveGroupTab(targetGroupId);
                                }
                              }}
                              title={subAdded ? "Already added" : "Click or drag to add"}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${subAdded
                                  ? "bg-neutral-100 text-neutral-400 cursor-default"
                                  : "bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 cursor-grab active:cursor-grabbing"
                                }`}
                            >
                              {subAdded ? <CheckCircle className="h-2.5 w-2.5 shrink-0" /> : <Plus className="h-2.5 w-2.5 shrink-0" />}
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===== RIGHT: YOUR MENU (TABBED) ===== */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-3">
            <Layers className="h-4 w-4 text-neutral-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-neutral-800">Final Menu</h2>
              <p className="text-xs text-neutral-400">Each tab is a section in the nav bar</p>
            </div>
          </div>

          {finalMenu.length === 0 ? (
            /* Empty state — full drop target */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropToFinal}
              className="flex-1 min-h-[420px] flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 m-3 rounded-lg text-center p-8 gap-3 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
            >
              <Layers className="h-8 w-8 text-neutral-300" />
              <div>
                <p className="font-medium text-neutral-600 text-sm">No menu sections yet</p>
                <p className="text-xs text-neutral-400 mt-1">Click <strong>+</strong> on the left, or drag items here</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-[420px]">
              {/* ---- TAB BAR ---- */}
              <div className="flex items-end border-b border-neutral-200 bg-neutral-50 overflow-x-auto">
                {finalMenu.map((group, groupIndex) => (
                  <div
                    key={group.id}
                    className="relative shrink-0"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const payload = parseDropPayload(event);
                      if (!payload || payload.type !== "final-group") return;
                      reorderGroupByDrop(payload.id, groupIndex);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveGroupTab(group.id)}
                      draggable
                      onDragStart={onDragStart({ type: "final-group", id: group.id })}
                      onDragEnd={onDragEnd}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-grab active:cursor-grabbing ${activeTabId === group.id
                          ? "border-black text-black bg-white"
                          : "border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                        }`}
                    >
                      <GripVertical className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                      {group.name}
                      {group.storefrontPath && (
                        <span className="text-[10px] text-neutral-400 font-normal">{group.storefrontPath}</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* ---- ACTIVE TAB CONTENT ---- */}
              {activeTabGroup && (
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {/* Section name + controls */}
                  <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
                    <input
                      type="text"
                      value={activeTabGroup.name}
                      onChange={(e) => updateGroupName(activeTabGroup.id, e.target.value)}
                      placeholder="Section name"
                      className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-neutral-800 outline-none border-b border-transparent focus:border-neutral-400"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveGroup(activeTabGroup.id, "up")}
                        disabled={activeTabIndex === 0}
                        title="Move tab left"
                        className="w-6 h-6 rounded border border-neutral-200 text-neutral-500 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-100"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGroup(activeTabGroup.id, "down")}
                        disabled={activeTabIndex === finalMenu.length - 1}
                        title="Move tab right"
                        className="w-6 h-6 rounded border border-neutral-200 text-neutral-500 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-100"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Category drop zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const payload = parseDropPayload(event);
                      if (!payload) return;
                      if (payload.type === "source-catalog-category") {
                        addCatalogCategoryToFinal(payload.groupId, payload.catalogCategoryId, activeTabGroup.id);
                      } else if (payload.type === "source-subcategory") {
                        addSubcategoryToFinal(payload.groupId, payload.catalogCategoryId, payload.subcategoryId, activeTabGroup.id);
                      }
                    }}
                    className="rounded-lg border-2 border-dashed border-neutral-200 px-3 py-2 text-center hover:border-neutral-400 hover:bg-neutral-50 transition-all"
                  >
                    <p className="text-xs text-neutral-400">↓ Drop categories into <strong>{activeTabGroup.name}</strong></p>
                  </div>

                  {activeTabGroup.categories.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-4">No categories yet — drop some from the left</p>
                  ) : (
                    activeTabGroup.categories.map((cat, catIndex) => (
                      <div
                        key={cat.id}
                        className="rounded-lg border border-neutral-200 bg-white overflow-hidden"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const payload = parseDropPayload(event);
                          if (!payload || payload.type !== "final-catalog-category") return;
                          if (payload.groupId !== activeTabGroup.id) return;
                          reorderCatalogCategoryByDrop(activeTabGroup.id, payload.catalogCategoryId, catIndex);
                        }}
                      >
                        {/* Category header */}
                        <div className="flex items-center gap-2 bg-amber-50/60 px-3 py-2 border-b border-amber-100">
                          <span
                            draggable
                            onDragStart={onDragStart({ type: "final-catalog-category", groupId: activeTabGroup.id, catalogCategoryId: cat.id })}
                            onDragEnd={onDragEnd}
                            className="cursor-grab active:cursor-grabbing text-neutral-300 shrink-0"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </span>
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => updateFinalCategoryName(activeTabGroup.id, cat.id, e.target.value)}
                            className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-neutral-800 outline-none border-b border-transparent focus:border-amber-400"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveCatalogCategory(activeTabGroup.id, cat.id, "up")}
                              disabled={catIndex === 0}
                              className="w-5 h-5 rounded border border-neutral-200 text-neutral-500 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-100"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCatalogCategory(activeTabGroup.id, cat.id, "down")}
                              disabled={catIndex === activeTabGroup.categories.length - 1}
                              className="w-5 h-5 rounded border border-neutral-200 text-neutral-500 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-100"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCatalogCategoryFromFinal(activeTabGroup.id, cat.id)}
                              className="w-5 h-5 rounded border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 ml-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 space-y-2">

                          {/* Subcategory drop zone */}
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              const payload = parseDropPayload(event);
                              if (!payload || payload.type !== "source-subcategory") return;
                              addSubcategoryToFinal(payload.groupId, payload.catalogCategoryId, payload.subcategoryId, activeTabGroup.id, cat.id);
                            }}
                            className="rounded-md border border-dashed border-neutral-200 px-2 py-1.5 text-center hover:border-amber-300 hover:bg-amber-50/30 transition-all"
                          >
                            <p className="text-[10px] text-neutral-400">Drop subcategories here</p>
                          </div>

                          {/* Subcategory list */}
                          {cat.children.length > 0 && (
                            <div className="flex flex-col gap-1">
                              {cat.children.map((sub, subIndex) => (
                                <div
                                  key={sub.id}
                                  className="rounded-md border border-neutral-100 bg-neutral-50 p-2"
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    const payload = parseDropPayload(event);
                                    if (!payload || payload.type !== "final-subcategory") return;
                                    if (payload.groupId !== activeTabGroup.id || payload.catalogCategoryId !== cat.id) return;
                                    reorderSubcategoryByDrop(activeTabGroup.id, cat.id, payload.subcategoryId, subIndex);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      draggable
                                      onDragStart={onDragStart({ type: "final-subcategory", groupId: activeTabGroup.id, catalogCategoryId: cat.id, subcategoryId: sub.id })}
                                      onDragEnd={onDragEnd}
                                      className="cursor-grab active:cursor-grabbing text-neutral-300 shrink-0"
                                    >
                                      <GripVertical className="h-3.5 w-3.5" />
                                    </span>
                                    <Tag className="h-3 w-3 text-neutral-400 shrink-0" />
                                    <input
                                      type="text"
                                      value={sub.name}
                                      onChange={(e) => updateSubcategory(activeTabGroup.id, cat.id, sub.id, { name: e.target.value })}
                                      className="flex-1 min-w-0 bg-transparent text-xs font-medium text-neutral-700 outline-none border-b border-transparent focus:border-neutral-300"
                                    />
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => moveSubcategory(activeTabGroup.id, cat.id, sub.id, "up")}
                                        disabled={subIndex === 0}
                                        className="w-5 h-5 rounded border border-neutral-200 text-neutral-500 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-100"
                                      >
                                        <ChevronUp className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveSubcategory(activeTabGroup.id, cat.id, sub.id, "down")}
                                        disabled={subIndex === cat.children.length - 1}
                                        className="w-5 h-5 rounded border border-neutral-200 text-neutral-500 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-100"
                                      >
                                        <ChevronDown className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeSubcategoryFromFinal(activeTabGroup.id, cat.id, sub.id)}
                                        className="w-5 h-5 rounded border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 ml-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                  {/* Slug row */}
                                  <div className="mt-1.5 pl-5 flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={sub.slug ?? ""}
                                      onChange={(e) => updateSubcategory(activeTabGroup.id, cat.id, sub.id, { slug: e.target.value })}
                                      placeholder="url-slug"
                                      className="flex-1 min-w-0 rounded border border-neutral-100 px-2 py-1 text-[11px] text-neutral-500 outline-none focus:border-neutral-300 bg-white"
                                    />
                                    <label className="flex items-center gap-1.5 text-[11px] text-neutral-500 whitespace-nowrap cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={sub.showSlug !== false}
                                        onChange={(e) => updateSubcategory(activeTabGroup.id, cat.id, sub.id, { showSlug: e.target.checked })}
                                        className="rounded border-neutral-300"
                                      />
                                      Show in URL
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ====== ADD CUSTOM LINK ====== */}
      {/* <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-neutral-500 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-neutral-800">Add Custom Link</h2>
            <p className="text-xs text-neutral-400">Add a link under one of the default nav sections</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Link Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Sale, About Us"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">URL <span className="text-neutral-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={customHref}
              onChange={(e) => setCustomHref(e.target.value)}
              placeholder="/sale  or  https://..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Add Under</label>
            <div className="flex gap-2">
              <select
                value={customParentId}
                onChange={(e) => setCustomParentId(e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white outline-none focus:border-neutral-400"
              >
                {finalMenu.map((g) => (
                  <option key={g.id} value={g.id}>Under &quot;{g.name}&quot;</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="shrink-0 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 whitespace-nowrap"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
        {customError && (
          <p className="mt-2 text-xs text-red-600">{customError}</p>
        )}
      </div> */}

    </div>
  );
}
