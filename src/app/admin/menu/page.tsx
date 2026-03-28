"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { uploadService } from "@/domain/application/services/upload.service";
import { AdminModal } from "@/component/admin/AdminModal";
import { CategoryService } from "@/domain/application/services/admin/category.service";
import { CategoryTypeService } from "@/domain/application/services/admin/subcategory.service";
import type {
  AdminCategory,
  AdminCategoryType,
} from "@/domain/shared/types/admin/category";

type SourceSubcategory = {
  id: string;
  name: string;
};

type SourceCatalogCategory = {
  id: string;
  name: string;
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

type MenuExportPayload = {
  version: number;
  savedAt: string;
  groups: MenuExportGroup[];
};

function buildMenuExportPayload(groups: FinalGroup[]): MenuExportPayload {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      ...(g.href ? { href: g.href } : {}),
      ...(g.storefrontPath ? { storefrontPath: g.storefrontPath } : {}),
      categories: g.categories.map((c) => ({
        id: c.id,
        name: c.name,
        ...(c.href ? { href: c.href } : {}),
        ...(c.fromCatalog !== undefined ? { fromCatalog: c.fromCatalog } : {}),
        ...(c.image ? { image: c.image } : {}),
        subcategories: c.children.map((s) => ({
          id: s.id,
          name: s.name,
          ...(s.href ? { href: s.href } : {}),
          ...(s.slug !== undefined && s.slug !== "" ? { slug: s.slug } : {}),
          ...(s.showSlug !== undefined ? { showSlug: s.showSlug } : {}),
        })),
      })),
    })),
  };
}

type DragItem =
  | { type: "source-group"; id: string }
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
];

const DRAG_KEY = "application/json";

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
    subcategories: byCategory[c._id] ?? [],
  }));
}

function showCategoryImage(cat: FinalCatalogCategory): boolean {
  return Boolean(cat.fromCatalog) || cat.children.length > 0;
}

function isSingleMenuCustomCategory(cat: FinalCatalogCategory): boolean {
  return !cat.fromCatalog && cat.children.length === 0;
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
          toast.error(
            (error as { message?: string })?.message ??
              "Failed to load categories from API"
          );
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

  const [finalMenu, setFinalMenu] = useState<FinalGroup[]>([]);
  const [customName, setCustomName] = useState("");
  const [customHref, setCustomHref] = useState("");
  const [customParentId, setCustomParentId] = useState("root");
  const [customError, setCustomError] = useState("");
  const [dragging, setDragging] = useState<DragItem | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedExportJson, setSavedExportJson] = useState("");
  const [uploadingCategoryKey, setUploadingCategoryKey] = useState<
    string | null
  >(null);

  /** Links use the target menu group (e.g. Women), not necessarily the left drag column */
  const storefrontPathForFinalGroup = (groupId: string): string =>
    getSourceGroup(groupId)?.storefrontPath ??
    finalMenu.find((g) => g.id === groupId)?.storefrontPath ??
    "";

  const finalGroupIds = useMemo(
    () => new Set(finalMenu.map((g) => g.id)),
    [finalMenu]
  );

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

  const existingHrefs = useMemo(() => {
    const hrefs = new Set<string>();
    finalMenu.forEach((g) => {
      if (g.href) hrefs.add(g.href.toLowerCase());
      g.categories.forEach((c) => {
        if (c.href) hrefs.add(c.href.toLowerCase());
        c.children.forEach((s) => {
          if (s.href) hrefs.add(s.href.toLowerCase());
        });
      });
    });
    return hrefs;
  }, [finalMenu]);

  const addGroupToFinal = (sourceGroupId: string) => {
    const src = getSourceGroup(sourceGroupId);
    if (!src) return;
    if (finalGroupIds.has(sourceGroupId)) return;
    setFinalMenu((prev) => [
      ...prev,
      {
        id: src.id,
        name: src.name,
        storefrontPath: src.storefrontPath,
        categories: [],
      },
    ]);
  };

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
                image: "",
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
      let hasGroup = prev.some((g) => g.id === resolvedGroupId);
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
                image: "",
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
                image: "",
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

  const removeGroupFromFinal = (groupId: string) => {
    setFinalMenu((prev) => prev.filter((g) => g.id !== groupId));
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

    if (payload.type === "source-group") {
      addGroupToFinal(payload.id);
      return;
    }
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

  const handleDropToSource = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = parseDropPayload(event);
    if (!payload) return;

    if (payload.type === "final-group") {
      removeGroupFromFinal(payload.id);
      return;
    }
    if (payload.type === "final-catalog-category") {
      removeCatalogCategoryFromFinal(payload.groupId, payload.catalogCategoryId);
      return;
    }
    if (payload.type === "final-subcategory") {
      removeSubcategoryFromFinal(
        payload.groupId,
        payload.catalogCategoryId,
        payload.subcategoryId
      );
    }
  };

  const clearFinalMenu = () => setFinalMenu([]);

  const handleSaveMenu = () => {
    const payload: MenuExportPayload = buildMenuExportPayload(finalMenu);
    const json = JSON.stringify(payload, null, 2);
    setSavedExportJson(json);
    setSaveModalOpen(true);
    toast.success("Menu JSON ready — share with backend or copy below");
  };

  const handleCopySavedJson = async () => {
    try {
      await navigator.clipboard.writeText(savedExportJson);
      toast.success("JSON copied to clipboard");
    } catch {
      toast.error("Could not copy — select the text manually");
    }
  };

  const isGroupCollapsed = (groupId: string) => Boolean(collapsedGroups[groupId]);
  const toggleGroupCollapsed = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isValidHref = (value: string) => {
    if (value.startsWith("/")) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddCustomItem = () => {
    const name = customName.trim();
    const href = customHref.trim();

    if (!name) {
      setCustomError("Name is required.");
      return;
    }
    if (!href) {
      setCustomError("Href is required.");
      return;
    }
    if (!isValidHref(href)) {
      setCustomError("Href must be a path (/path) or https URL.");
      return;
    }
    if (existingHrefs.has(href.toLowerCase())) {
      setCustomError("This href already exists.");
      return;
    }

    if (customParentId === "root") {
      const gid = `custom-group-${Date.now()}`;
      setFinalMenu((prev) => [
        ...prev,
        {
          id: gid,
          name,
          href,
          categories: [],
        },
      ]);
    } else {
      const catId = `custom-cat-${Date.now()}`;
      setFinalMenu((prev) =>
        prev.map((g) => {
          if (g.id !== customParentId) return g;
          return {
            ...g,
            categories: [
              ...g.categories,
              {
                id: catId,
                name,
                href,
                children: [],
                fromCatalog: false,
              },
            ],
          };
        })
      );
    }

    setCustomName("");
    setCustomHref("");
    setCustomParentId("root");
    setCustomError("");
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

  const categoryKey = (groupId: string, catalogCategoryId: string) =>
    `${groupId}::${catalogCategoryId}`;

  const updateCategoryImage = (
    groupId: string,
    catalogCategoryId: string,
    image: string
  ) => {
    setFinalMenu((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          categories: g.categories.map((c) =>
            c.id === catalogCategoryId ? { ...c, image } : c
          ),
        };
      })
    );
  };

  const handleCategoryImageUpload = async (
    groupId: string,
    catalogCategoryId: string,
    file?: File
  ) => {
    if (!file) return;
    const key = categoryKey(groupId, catalogCategoryId);
    try {
      setUploadingCategoryKey(key);
      const imageUrl = await uploadService.uploadFile(file);
      updateCategoryImage(groupId, catalogCategoryId, imageUrl);
      toast.success("Category image uploaded");
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message || "Image upload failed";
      toast.error(message);
    } finally {
      setUploadingCategoryKey(null);
    }
  };

  const updateSubcategory = (
    groupId: string,
    catalogCategoryId: string,
    subcategoryId: string,
    patch: Partial<Pick<FinalSubcategory, "slug" | "showSlug">>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">Menu Creation</h1>
          <p className="text-sm text-neutral-400">
            Left: the same <strong>Categories</strong> and <strong>Subcategories</strong> from your
            admin catalog (API) appear under Men, Women, and Kids — each column only changes the
            storefront base path for links (<code className="text-[11px]">/mens</code>, etc.). Drag
            into the final menu on the right. Drag back left to remove.
          </p>
        </div>
        <div className="flex shrink-0 flex-row flex-nowrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSaveMenu}
            className="whitespace-nowrap px-3 py-2 text-xs bg-black text-white rounded-lg hover:bg-neutral-800"
          >
            Save
          </button>
          <button
            type="button"
            onClick={clearFinalMenu}
            className="whitespace-nowrap px-3 py-2 text-xs border rounded-lg hover:bg-neutral-50"
          >
            Clear Final Menu
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Add Custom Menu Item</h2>
            <p className="text-xs text-neutral-500">
            <strong>Top-level</strong>: one menu group (single link, no category image).{" "}
            <strong>Under a group</strong>: adds a custom category — image appears only after it has
            subcategories (otherwise it stays a single menu link).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label htmlFor="custom-menu-name" className="text-xs text-neutral-600">
              Name
            </label>
            <input
              id="custom-menu-name"
              type="text"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Ex: Sale"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="custom-menu-href" className="text-xs text-neutral-600">
              Href
            </label>
            <input
              id="custom-menu-href"
              type="text"
              value={customHref}
              onChange={(event) => setCustomHref(event.target.value)}
              placeholder="/sale or https://..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="custom-menu-parent" className="text-xs text-neutral-600">
              Parent
            </label>
            <select
              id="custom-menu-parent"
              value={customParentId}
              onChange={(event) => setCustomParentId(event.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            >
              <option value="root">New top-level group</option>
              {finalMenu.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="w-full md:w-auto px-4 py-2 text-xs bg-black text-white rounded-lg"
            >
              Add Custom Item
            </button>
          </div>
        </div>

        {customError && <p className="mt-2 text-xs text-red-600">{customError}</p>}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="rounded-xl border border-neutral-200 bg-white p-4 min-h-[520px] flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Catalog source (left)</h2>
            <p className="text-xs text-neutral-500">
              Data loads from <strong>Categories</strong> and <strong>Subcategories</strong> in admin.
              The list is identical under each group; only the link base (
              <code className="text-[10px]">/mens</code>, <code className="text-[10px]">/womens</code>
              , <code className="text-[10px]">/kids</code>) differs when you build the right-hand menu.
            </p>
          </div>

          <div className="space-y-4 flex-1 min-h-0">
            {catalogLoading ? (
              <p className="text-sm text-neutral-500 py-6 text-center">Loading catalog…</p>
            ) : sharedCatalog.length === 0 ? (
              <p className="text-sm text-neutral-500 py-6 text-center">
                No active categories found. Add categories and subcategories under{" "}
                <strong>Admin → Categories</strong>.
              </p>
            ) : (
              sourceGroups.map((group) => (
              <div key={group.id} className="rounded-lg border border-neutral-200 overflow-hidden">
                <div
                  draggable
                  onDragStart={onDragStart({ type: "source-group", id: group.id })}
                  onDragEnd={onDragEnd}
                  className="px-3 py-2 border-b border-neutral-200 bg-neutral-50 text-sm font-medium cursor-grab active:cursor-grabbing flex items-center gap-2 flex-wrap"
                >
                  <span className="text-[10px] uppercase tracking-wide text-neutral-500 shrink-0">
                    Group
                  </span>
                  <span>{group.name}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {group.storefrontPath}
                  </span>
                </div>

                <div className="px-3 py-2 bg-white">
                  <p className="text-[11px] font-semibold text-neutral-700 mb-2">Categories</p>
                  <div className="space-y-3">
                    {group.categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="rounded-md border border-neutral-100 bg-neutral-50/80 p-2"
                      >
                        <div
                          draggable
                          onDragStart={onDragStart({
                            type: "source-catalog-category",
                            groupId: group.id,
                            catalogCategoryId: cat.id,
                          })}
                          onDragEnd={onDragEnd}
                          className="text-sm font-medium text-neutral-900 cursor-grab active:cursor-grabbing mb-2"
                        >
                          {cat.name}
                        </div>
                        <p className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1.5">
                          Subcategories
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {cat.subcategories.map((sub) => (
                            <div
                              key={sub.id}
                              draggable
                              onDragStart={onDragStart({
                                type: "source-subcategory",
                                groupId: group.id,
                                catalogCategoryId: cat.id,
                                subcategoryId: sub.id,
                              })}
                              onDragEnd={onDragEnd}
                              className="px-2 py-1 text-xs rounded-md border border-neutral-200 bg-white cursor-grab active:cursor-grabbing"
                            >
                              {sub.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
            )}
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDropToSource}
            className="mt-4 shrink-0 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-3 py-3 text-center"
          >
            <p className="text-xs font-medium text-neutral-700">Remove zone</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Drop items from the final menu here only to remove them
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 min-h-[520px] flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Final menu (right)</h2>
            <p className="text-xs text-neutral-500">
              Add catalog items only in the dashed <strong>Add zone</strong> below. Reorder using
              ⠿ handles on rows. Remove using the left <strong>Remove zone</strong> only.
            </p>
          </div>

          {finalMenu.length === 0 ? (
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDropToFinal}
              className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/60 p-6 text-sm text-neutral-600 text-center"
            >
              <p className="font-medium text-neutral-800">Add zone</p>
              <p className="text-xs text-neutral-500 mt-1">
                Drop a group, category, or subcategory from the left here to build the menu
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDropToFinal}
                className="shrink-0 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/60 px-3 py-2.5 text-center"
              >
                <p className="text-[11px] font-medium text-neutral-800">Add zone</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Drop catalog groups, categories, or subcategories here to append to the menu
                </p>
              </div>
              <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
                {finalMenu.map((group, groupIndex) => (
                  <div
                    key={group.id}
                    className="rounded-lg border border-neutral-200"
                  >
                    <div
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const payload = parseDropPayload(event);
                        if (!payload || payload.type !== "final-group") return;
                        reorderGroupByDrop(payload.id, groupIndex);
                      }}
                      className="px-3 py-2 border-b border-neutral-200 bg-amber-50/60 flex items-center gap-2"
                    >
                      <span
                        draggable
                        onDragStart={onDragStart({ type: "final-group", id: group.id })}
                        onDragEnd={onDragEnd}
                        title="Drag to reorder groups"
                        className="cursor-grab active:cursor-grabbing select-none text-neutral-400 px-0.5"
                      >
                        ⠿
                      </span>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <label
                          htmlFor={`group-name-${group.id}`}
                          className="text-[10px] uppercase tracking-wide text-neutral-500"
                        >
                          Group name
                        </label>
                        <input
                          id={`group-name-${group.id}`}
                          type="text"
                          value={group.name}
                          onChange={(event) =>
                            updateGroupName(group.id, event.target.value)
                          }
                          placeholder="e.g. Men"
                          className="w-full rounded-md border border-amber-200/80 bg-white px-2 py-1 text-sm font-medium outline-none focus:border-amber-400"
                        />
                        {group.href ? (
                          <span className="text-xs text-neutral-500">({group.href})</span>
                        ) : group.storefrontPath ? (
                          <span className="text-xs text-neutral-500">
                            {group.storefrontPath}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapsed(group.id)}
                          className="p-1 border rounded text-neutral-700 hover:bg-white/70 flex items-center justify-center"
                          title={isGroupCollapsed(group.id) ? "Expand group" : "Collapse group"}
                          aria-expanded={!isGroupCollapsed(group.id)}
                        >
                          {isGroupCollapsed(group.id) ? (
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          ) : (
                            <ChevronUp className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGroup(group.id, "up")}
                          disabled={groupIndex === 0}
                          className="px-1 border rounded text-xs disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGroup(group.id, "down")}
                          disabled={groupIndex === finalMenu.length - 1}
                          className="px-1 border rounded text-xs disabled:opacity-40"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeGroupFromFinal(group.id);
                            setCollapsedGroups((prev) => {
                              const next = { ...prev };
                              delete next[group.id];
                              return next;
                            });
                          }}
                          className="p-1 ml-0.5 border border-red-200 rounded text-red-600 hover:bg-red-50 flex items-center justify-center"
                          title="Remove group"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>

                    {!isGroupCollapsed(group.id) && (
                      <div className="p-2 space-y-2">
                    {group.categories.length === 0 ? (
                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const payload = parseDropPayload(event);
                          if (!payload) return;
                          if (payload.type === "source-catalog-category") {
                            addCatalogCategoryToFinal(
                              payload.groupId,
                              payload.catalogCategoryId,
                              group.id
                            );
                            return;
                          }
                          if (payload.type === "source-subcategory") {
                            addSubcategoryToFinal(
                              payload.groupId,
                              payload.catalogCategoryId,
                              payload.subcategoryId,
                              group.id
                            );
                          }
                        }}
                        className="rounded-md border-2 border-dashed border-neutral-200 bg-neutral-50/80 px-3 py-4 text-center text-[11px] text-neutral-600"
                      >
                        Drop a catalog category or subcategory here (or use the top{" "}
                        <strong>Add zone</strong>)
                      </div>
                    ) : (
                      group.categories.map((cat, catIndex) => (
                        <div
                          key={cat.id}
                          className="rounded-md border border-amber-100 bg-amber-50/40 p-2"
                        >
                          <div
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              const payload = parseDropPayload(event);
                              if (!payload || payload.type !== "final-catalog-category")
                                return;
                              if (payload.groupId !== group.id) return;
                              reorderCatalogCategoryByDrop(
                                group.id,
                                payload.catalogCategoryId,
                                catIndex
                              );
                            }}
                            className="flex items-center gap-2 mb-2"
                          >
                            <span
                              draggable
                              onDragStart={onDragStart({
                                type: "final-catalog-category",
                                groupId: group.id,
                                catalogCategoryId: cat.id,
                              })}
                              onDragEnd={onDragEnd}
                              className="cursor-grab text-neutral-400"
                            >
                              ⠿
                            </span>
                            <span className="text-sm font-medium text-neutral-900 flex-1">
                              {cat.name}
                            </span>
                            {cat.href && isSingleMenuCustomCategory(cat) ? (
                              <span className="text-[11px] text-neutral-500 truncate max-w-[140px]">
                                {cat.href}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                moveCatalogCategory(group.id, cat.id, "up")
                              }
                              disabled={catIndex === 0}
                              className="px-1 border rounded text-[10px] disabled:opacity-40"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                moveCatalogCategory(group.id, cat.id, "down")
                              }
                              disabled={catIndex === group.categories.length - 1}
                              className="px-1 border rounded text-[10px] disabled:opacity-40"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                removeCatalogCategoryFromFinal(group.id, cat.id)
                              }
                              className="p-0.5 ml-0.5 border border-red-200 rounded text-red-600 hover:bg-red-50"
                              title="Remove category"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </div>
                          {showCategoryImage(cat) ? (
                            <div className="mb-2 rounded-md border border-neutral-200 bg-white p-2">
                              <p className="text-[11px] text-neutral-500 mb-1">
                                Category image
                              </p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  value={cat.image ?? ""}
                                  onChange={(event) =>
                                    updateCategoryImage(
                                      group.id,
                                      cat.id,
                                      event.target.value
                                    )
                                  }
                                  placeholder="Image URL"
                                  className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs outline-none focus:border-neutral-400"
                                />
                                <label className="shrink-0 px-3 py-1.5 text-xs border rounded-md cursor-pointer hover:bg-neutral-50">
                                  {uploadingCategoryKey ===
                                  categoryKey(group.id, cat.id)
                                    ? "Uploading..."
                                    : "Upload"}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) =>
                                      void handleCategoryImageUpload(
                                        group.id,
                                        cat.id,
                                        event.target.files?.[0]
                                      )
                                    }
                                  />
                                </label>
                              </div>
                              {cat.image ? (
                                <img
                                  src={cat.image}
                                  alt={`${cat.name}`}
                                  className="mt-2 h-16 w-24 object-cover rounded-md border border-neutral-200"
                                />
                              ) : null}
                            </div>
                          ) : isSingleMenuCustomCategory(cat) ? (
                            <p className="text-[11px] text-neutral-500 mb-2 px-0.5">
                              Single menu link — no category image. Add subcategories to enable
                              category image.
                            </p>
                          ) : null}
                          <div
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              const payload = parseDropPayload(event);
                              if (!payload || payload.type !== "source-subcategory")
                                return;
                              addSubcategoryToFinal(
                                payload.groupId,
                                payload.catalogCategoryId,
                                payload.subcategoryId,
                                group.id,
                                cat.id
                              );
                            }}
                            className="mb-2 rounded border border-dashed border-amber-300/80 bg-white px-2 py-1.5 text-[10px] text-center text-neutral-500"
                          >
                            Drop catalog subcategories here
                          </div>
                          <p className="text-[10px] text-neutral-500 mb-1 px-0.5">
                            Subcategories
                          </p>
                          <div className="flex flex-col gap-2">
                            {cat.children.length === 0 ? (
                              <span className="text-[11px] text-neutral-400 px-1">
                                Use the dashed strip above to add catalog subcategories
                              </span>
                            ) : (
                              cat.children.map((sub, subIndex) => (
                                <div
                                  key={sub.id}
                                  className="rounded-md border border-amber-200 bg-white p-2 text-xs"
                                >
                                  <div
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      const payload = parseDropPayload(event);
                                      if (
                                        !payload ||
                                        payload.type !== "final-subcategory"
                                      )
                                        return;
                                      if (payload.groupId !== group.id) return;
                                      if (payload.catalogCategoryId !== cat.id)
                                        return;
                                      reorderSubcategoryByDrop(
                                        group.id,
                                        cat.id,
                                        payload.subcategoryId,
                                        subIndex
                                      );
                                    }}
                                    className="flex flex-col gap-1"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        draggable
                                        onDragStart={onDragStart({
                                          type: "final-subcategory",
                                          groupId: group.id,
                                          catalogCategoryId: cat.id,
                                          subcategoryId: sub.id,
                                        })}
                                        onDragEnd={onDragEnd}
                                        className="cursor-grab text-neutral-400 shrink-0"
                                        title="Drop on another row to reorder"
                                      >
                                        ⠿
                                      </span>
                                      <span className="font-medium text-neutral-900 flex-1 min-w-0">
                                        {sub.name}
                                      </span>
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            moveSubcategory(
                                              group.id,
                                              cat.id,
                                              sub.id,
                                              "up"
                                            )
                                          }
                                          disabled={subIndex === 0}
                                          className="px-0.5 border rounded disabled:opacity-40"
                                        >
                                          ↑
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            moveSubcategory(
                                              group.id,
                                              cat.id,
                                              sub.id,
                                              "down"
                                            )
                                          }
                                          disabled={
                                            subIndex === cat.children.length - 1
                                          }
                                          className="px-0.5 border rounded disabled:opacity-40"
                                        >
                                          ↓
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeSubcategoryFromFinal(
                                              group.id,
                                              cat.id,
                                              sub.id
                                            )
                                          }
                                          className="p-0.5 ml-0.5 border border-red-200 rounded text-red-600 hover:bg-red-50"
                                          title="Remove subcategory"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                        </button>
                                      </div>
                                    </div>
                                    {sub.href ? (
                                      <p className="pl-6 text-neutral-500 text-[11px] leading-snug break-all">
                                        {sub.href}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div className="mt-2 pl-6 flex flex-col sm:flex-row sm:items-end gap-2">
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                      <label
                                        htmlFor={`sub-slug-${group.id}-${cat.id}-${sub.id}`}
                                        className="text-[10px] text-neutral-500"
                                      >
                                        Slug
                                      </label>
                                      <input
                                        id={`sub-slug-${group.id}-${cat.id}-${sub.id}`}
                                        type="text"
                                        value={sub.slug ?? ""}
                                        onChange={(event) =>
                                          updateSubcategory(
                                            group.id,
                                            cat.id,
                                            sub.id,
                                            { slug: event.target.value }
                                          )
                                        }
                                        placeholder="e.g. casual-footwear"
                                        className="w-full rounded border border-neutral-200 px-2 py-1 text-[11px] outline-none focus:border-neutral-400"
                                      />
                                    </div>
                                    <label className="flex items-center gap-2 text-[11px] text-neutral-600 whitespace-nowrap pb-0.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={sub.showSlug !== false}
                                        onChange={(event) =>
                                          updateSubcategory(
                                            group.id,
                                            cat.id,
                                            sub.id,
                                            { showSlug: event.target.checked }
                                          )
                                        }
                                      />
                                      Show slug
                                    </label>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <AdminModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Menu JSON (for API)"
        description="Copy this payload for your backend contract. Groups contain categories; each category lists subcategories."
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSaveModalOpen(false)}
              className="px-4 py-2 text-xs border rounded-lg"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => void handleCopySavedJson()}
              className="px-4 py-2 text-xs bg-black text-white rounded-lg"
            >
              Copy JSON
            </button>
          </>
        }
      >
        <textarea
          readOnly
          value={savedExportJson}
          className="w-full min-h-[min(420px,55vh)] rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-neutral-800 outline-none focus:border-neutral-400"
          spellCheck={false}
        />
      </AdminModal>
    </div>
  );
}
