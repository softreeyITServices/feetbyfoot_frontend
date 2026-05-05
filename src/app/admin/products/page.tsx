"use client";

import React, { useEffect, useState } from "react";
import { DataTable, Column } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { AdminForm, FormField } from "@/component/admin/Adminform";
import { CreateProductPayload, Product } from "@/domain/shared/types/product.type";
import { productService } from "@/domain/application/services/product.service";
import { uploadService } from "@/domain/application/services/upload.service";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";
import { toast } from "react-hot-toast";
import { CategoryService } from "@/domain/application/services/admin/category.service";
import { CategoryTypeService } from "@/domain/application/services/admin/subcategory.service";
import type {
  AdminCategory,
  AdminCategoryType,
} from "@/domain/shared/types/admin/category";
import { isGetRequestError } from "@/lib/httpClientError";

const ALLOWED_PRODUCT_LENGTHS = ["ANKLE", "CALF", "NO_SHOW", "CREW"] as const;

type ProductSizeInput = {
  color: string;
  size: string;
  quantity: number;
  isActive: boolean;
};

const normalizeProductSizes = (value: unknown): ProductSizeInput[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is Partial<ProductSizeInput> =>
        !!item && typeof item === "object"
    )
    .map((item) => ({
      color: String(item.color ?? "").trim(),
      size: String(item.size ?? "").trim().toUpperCase(),
      quantity: Math.max(0, Number(item.quantity ?? 0)),
      isActive: Boolean(item.isActive ?? true),
    }))
    .filter((item) => item.color.length > 0 && item.size.length > 0 && item.quantity > 0);
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function ProductPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [subcategories, setSubcategories] = useState<AdminCategoryType[]>([]);

  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= FETCH ================= */
  const fetchProducts = async (search = "") => {
    setLoading(true);
    try {
      const res = await productService.getAdminProductsList({
        page: 1,
        limit: 100,
        search,
      });
      setData(res?.products); // adjust if needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [categoryRows, subcategoryRows] = await Promise.all([
          CategoryService.getAll(),
          CategoryTypeService.getAll<AdminCategoryType>(),
        ]);
        setCategories(categoryRows);
        setSubcategories(subcategoryRows);
      } catch (error: unknown) {
        if (!isGetRequestError(error)) {
          toast.error(
            (error as { message?: string })?.message ||
            "Failed to load categories"
          );
        }
      }
    };

    void loadLookups();
  }, []);

  const categoryOptions = categories?.map((category) => ({
    label: category.name,
    value: category._id,
  }));

  const colorOptions = [
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Orange",
    "Purple",
    "Pink",
    "Brown",
    "Grey",
    "Gray",
    "Beige",
    "Cream",
    "Navy",
    "Teal",
    "Olive",
    "Maroon",
    "Mustard",
    "Lavender",
    "Turquoise",
    "Coral",
    "Mint",
    "Peach",
    "Charcoal",
    "Ivory",
    "Khaki",
    "Magenta",
    "Cyan",
    "Gold",
    "Silver",
    "Bronze",
  ].map((color) => ({ label: color, value: color }));

  const subcategoryOptions = subcategories?.filter(
      (subcategory) =>
        !selectedCategoryId || subcategory.categoryId === selectedCategoryId
    )
    .map((subcategory) => ({
      label: subcategory.name,
      value: subcategory._id,
    }));

  const PRODUCT_FIELDS: FormField[] = [
    { key: "name", label: "Name", type: "text", required: true, cols: 1 },
    { key: "slug", label: "Slug", type: "text", required: true, cols: 1 },

    { key: "brand", label: "Brand", type: "text", required: true, cols: 1 },

    { key: "price", label: "Price", type: "number", required: true, cols: 1 },
    { key: "salePrice", label: "Sale Price", type: "number", cols: 1 },
    {
      key: "currency",
      label: "Currency",
      type: "select",
      required: true,
      options: [{ label: "INR", value: "INR" }],
      cols: 1,
    },
    {
      key: "gstRate",
      label: "GST Rate (%)",
      type: "select",
      required: true,
      options: [
        { label: "0%", value: 0 },
        { label: "5%", value: 5 },
        { label: "12%", value: 12 },
        { label: "18%", value: 18 },
        { label: "28%", value: 28 },
      ],
      cols: 1,
    },

    {
      key: "length",
      label: "Length",
      type: "select",
      options: [
        { label: "ANKLE", value: "ANKLE" },
        { label: "CALF", value: "CALF" },
        { label: "NO_SHOW", value: "NO_SHOW" },
        { label: "CREW", value: "CREW" },
      ],
    },
    {
      key: "categoryId",
      label: "Category",
      type: "select",
      required: true,
      options: categoryOptions,
      placeholder: "Select category",
      cols: 1,
    },
    {
      key: "categoryTypeIds",
      label: "Subcategory",
      type: "multiselect",
      required: true,
      options: subcategoryOptions,
      placeholder:
        selectedCategoryId
          ? "Select one or more subcategories"
          : "Select category first",
      cols: 1,
    },

    {
      key: "gender",
      label: "Gender",
      type: "multiselect",
      required: true,
      options: [
        { label: "Men", value: "MENS" },
        { label: "Women", value: "WOMENS" },
        { label: "Kids", value: "KIDS" },
        { label: "Unisex", value: "UNISEX" },
      ],
      placeholder: "Select one or more genders",
    },

    {
      key: "tags",
      label: "Tags",
      type: "multiselect",
      options: [
        { label: "Socks", value: "socks" },
        { label: "Crew", value: "crew" },
        { label: "Ankle", value: "ankle" },
      ],
      placeholder: "Select one or more tags",
    },

    {
      key: "sizes",
      label: "Sizes",
      type: "sizes",
      required: true,
      cols: 2,
      options: colorOptions,
      validate: (value) => {
        const normalizedSizes = normalizeProductSizes(value);
        if (normalizedSizes.length === 0) {
          return "Add at least one valid size with color and quantity greater than 0";
        }
        return null;
      },
    },

    {
      key: "imageUrls",
      label: "Images",
      type: "image",
      multiple: true,
      cols: 2,
    },

    {
      key: "description",
      label: "Description",
      type: "textarea",
      cols: 2,
    },

    {
      key: "isFeatured",
      label: "Featured",
      type: "checkbox",
    },
    {
      key: "isNewArrival",
      label: "New Arrival",
      type: "checkbox",
    },
    {
      key: "isBestseller",
      label: "Best Seller",
      type: "checkbox",
    },
    {
      key: "isGiftPack",
      label: "Gift Pack",
      type: "checkbox",
    },
    {
      key: "isActive",
      label: "Active",
      type: "checkbox",
      placeholder: "Product is active",
    },
  ];
  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (values: Record<string, unknown>) => {
    const imageValues = Array.isArray(values.imageUrls)
      ? values.imageUrls
      : [];

    const selectedCategory = String(values.categoryId ?? "");
    const validSubcategoryIds = new Set(
      subcategories
        .filter((subcategory) => !selectedCategory || subcategory.categoryId === selectedCategory)
        .map((subcategory) => subcategory._id)
    );

    const categoryTypeIds = Array.isArray(values.categoryTypeIds)
      ? values.categoryTypeIds.filter(
        (value): value is string =>
          typeof value === "string" && validSubcategoryIds.has(value)
      )
      : [];

    const length = String(values.length ?? "").trim();
    const sizes = normalizeProductSizes(values.sizes);
    const colors = [...new Set(sizes.map((s) => s.color).filter(Boolean))];

    if (sizes.length === 0) {
      toast.error("Add at least one valid size with quantity greater than 0");
      return;
    }

    const name = String(values.name ?? "").trim();
    const autoSlug = toSlug(name);
    const enteredSlug = String(values.slug ?? "").trim();
    const slug = enteredSlug || autoSlug;

    if (!slug) {
      toast.error("Product name is required to generate slug");
      return;
    }

    const imageUrls = await Promise.all(
      imageValues
        .filter(
          (value): value is string | File =>
            typeof value === "string" || value instanceof File
        )
        .map(async (value) => {
          if (typeof value === "string") return value.trim();
          return uploadService.uploadFile(value);
        })
    );

    const normalizedImageUrls = imageUrls.filter((url) => url.length > 0);

    if (normalizedImageUrls.length === 0) {
      toast.error("At least one product image is required");
      return;
    }

    const payload: CreateProductPayload & {
      categoryTypeIds?: string[];
      colors?: string[];
    } = {
      ...(values as CreateProductPayload),
      slug,
      length,
      categoryTypeId: categoryTypeIds[0] ?? "",
      categoryTypeIds,
      color: colors[0] ?? "",
      colors,
      price: Number(values.price),
      salePrice: Number(values.salePrice || 0),
      gstRate: Number(values.gstRate || 18),
      currency: String(values.currency ?? "INR"),
      imageUrls: normalizedImageUrls,
      sizes,
    };

    try {
      if (editing) {
        await productService.update(editing._id, payload);
        toast.success("Product updated");
      } else {
        await productService.create(payload);
        toast.success("Product created");
      }

      setOpen(false);
      setEditing(null);
      await fetchProducts();
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message || "Failed to save product"
      );
      throw error;
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!deleteItem) return;

    setDeleting(true);
    try {
      await productService.delete(deleteItem._id);
      setDeleteItem(null);
      fetchProducts();
    } finally {
      setDeleting(false);
    }
  };

  /* ================= COLUMNS ================= */
  const columns: Column<Product>[] = [
    // ✅ NAME + SIZE PILLS
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className="font-medium">{row.name}</div>

          <div className="flex flex-wrap gap-1">
            {row.sizes?.map((size) => (
              <span
                key={size.size}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
              >
                {size.size} ({size.quantity})
              </span>
            ))}
          </div>
        </div>
      ),
    },

    // ✅ BRAND
    {
      key: "brand",
      label: "Brand",
    },

    // ✅ GENDER PILLS
    {
      key: "gender",
      label: "Gender",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.gender?.map((g) => (
            <span
              key={g}
              className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
            >
              {g}
            </span>
          ))}
        </div>
      ),
    },

    // ✅ PRICE + SALE PRICE
    {
      key: "price",
      label: "Pricing (Incl. Tax)",
      render: (row) => {
        const finalPrice = row.salePrice > 0 ? row.salePrice : row.price;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">₹{finalPrice}</span>
              {row.salePrice > 0 && (
                <span className="text-xs line-through text-gray-400">₹{row.price}</span>
              )}
            </div>
            {row.gstRate > 0 && (
              <div className="text-[10px] text-gray-500 flex flex-col leading-tight mt-1">
                <span>Base: ₹{(row.basePrice || 0).toFixed(2)}</span>
                <span>GST ({row.gstRate}%): ₹{(row.gstAmount || 0).toFixed(2)}</span>
              </div>
            )}
          </div>
        );
      },
    },

    // ✅ COLOR PILLS
    {
      key: "color",
      label: "Color",
      render: (row) => {
        const rowColors =
          row.colors?.length
            ? row.colors
            : row.sizes?.length
              ? Array.from(new Set(row.sizes.map((s) => s.color).filter(Boolean))) as string[]
              : row.color
                ? [row.color]
                : [];

        return (
          <div className="flex flex-wrap gap-1">
            {rowColors.length ? (
              rowColors.map((color: string) => (
                <span
                  key={color}
                  className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700"
                >
                  {color}
                </span>
              ))
            ) : (
              <span className="text-xs text-neutral-400">-</span>
            )}
          </div>
        );
      },
    },

    // ✅ STATUS
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-xs ${row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
            }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const tableData = data.map((item) => ({
    ...item,
    id: item._id,
  }));

  const initialFormValues: Record<string, unknown> = editing
    ? {
      ...editing,
      length: ALLOWED_PRODUCT_LENGTHS.includes(editing.length as (typeof ALLOWED_PRODUCT_LENGTHS)[number])
        ? editing.length
        : "",
      categoryTypeIds:
        editing.categoryTypeIds?.length
          ? editing.categoryTypeIds
          : editing.categoryTypeId
            ? [editing.categoryTypeId]
            : [],
      sizes:
        editing.sizes?.map((sizeEntry) => ({
          color: (sizeEntry as ProductSizeInput).color ?? "",
          size: sizeEntry.size ?? "",
          quantity: sizeEntry.quantity ?? 0,
          isActive: sizeEntry.isActive ?? true,
        })) ?? [{ color: "", size: "", quantity: 0, isActive: true }],
      gstRate: editing.gstRate ?? 18,
    }
    : {
      name: "",
      slug: "",
      brand: "",
      price: "",
      salePrice: "",
      currency: "INR",
      categoryId: "",
      categoryTypeIds: [],
      gstRate: 18,
      length: "",
      sizes: [{ color: "", size: "", quantity: 0, isActive: true }],
      gender: [],
      tags: [],
      imageUrls: [],
      description: "",
      isFeatured: false,
      isNewArrival: false,
      isBestseller: false,
      isGiftPack: false,
      isActive: true,
    };

  return (
    <div className="space-y-6">
      <DataTable<Product & { id: string }>
        data={tableData}
        title="Products"
        columns={columns}
        loading={loading}
        searchKeys={["name", "brand"]}
        onSearchChange={setSearchQuery}
        onAdd={() => {
          setEditing(null);
          setSelectedCategoryId("");
          setOpen(true);
        }}
        onEdit={(row) => {
          setEditing(row);
          setSelectedCategoryId(row.categoryId ?? "");
          setOpen(true);
        }}
        onDelete={(row) => setDeleteItem(row)}
      />

      {/* ================= CREATE / EDIT MODAL ================= */}
      <AdminModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          setSelectedCategoryId("");
        }}
        title={editing ? "Edit Product" : "Create Product"}
        size="lg"
      >
        <AdminForm
          key={editing?._id ?? "create-product"}
          fields={PRODUCT_FIELDS}
          initialValues={initialFormValues}
          submitLabel={editing ? "Update" : "Create"}
          onSubmit={handleSubmit}
          onValuesChange={(nextValues, previousValues) => {
            const nextCategoryId = String(nextValues.categoryId ?? "");
            const prevCategoryId = String(previousValues.categoryId ?? "");

            setTimeout(() => {
              setSelectedCategoryId((prev) =>
                prev === nextCategoryId ? prev : nextCategoryId
              );
            }, 0);

            const categoryChanged = nextCategoryId !== prevCategoryId;
            const resolvedValues = categoryChanged
              ? { ...nextValues, categoryTypeIds: [] }
              : nextValues;

            if (editing) return resolvedValues;

            const nextName = String(resolvedValues.name ?? "");
            const nextSlug = String(resolvedValues.slug ?? "");
            const previousName = String(previousValues.name ?? "");
            const previousSlug = String(previousValues.slug ?? "");
            const previousAutoSlug = toSlug(previousName);

            if (
              nextName !== previousName &&
              nextSlug === previousSlug &&
              (previousSlug === "" || previousSlug === previousAutoSlug)
            ) {
              return {
                ...resolvedValues,
                slug: toSlug(nextName),
              };
            }

            return resolvedValues;
          }}
          onCancel={() => {
            setOpen(false);
            setEditing(null);
            setSelectedCategoryId("");
          }}
        />
      </AdminModal>

      {/* ================= DELETE MODAL ================= */}
      <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteItem?.name}"?`}
      />
    </div>
  );
}

export default ProductPage;
