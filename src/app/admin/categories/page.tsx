"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ADMIN_UPLOAD_URL } from "@/constants/apis";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { CategoryService } from "@/domain/application/services/admin/category.service";
import { CategoryTypeService } from "@/domain/application/services/admin/subcategory.service";

import type {
  AdminCategory,
  AdminCategoryType,
  CategoryRow,
} from "@/domain/shared/types/admin/category";

import { toast } from "react-hot-toast";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";
import { SubcategoryModal } from "@/component/ui/modals/admin/SubcategoryModal";
import { AdminForm, FormField } from "@/component/admin/Adminform";
import { AdminModal } from "@/component/admin/AdminModal";
import { isGetRequestError } from "@/lib/httpClientError";

/* ================= PAGE ================= */

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryRow | null>(null);

  const [initialized, setInitialized] = useState(false);

  /* ================= LOAD ================= */

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);

      const categories: AdminCategory[] = await CategoryService.getAll();
      console.log('categories', categories)

      const subcategories =
        await CategoryTypeService.getAll<AdminCategoryType>();
      console.log('subcategories', subcategories)

      const countMap: Record<string, number> = {};

      subcategories.forEach((s) => {
        countMap[s.categoryId] = (countMap[s.categoryId] || 0) + 1;
      });

      const mapped: CategoryRow[] = categories && categories.length > 0 ? categories.map((item) => ({
        id: item._id,
        name: item.name,
        isActive: Boolean(item.isActive),
        createdAt: item.createdAt,
        image: item.image,
        subcategoryCount: countMap[item._id] || 0,
      })) : [];

      setRows(mapped);
    } catch (error: unknown) {
      if (!isGetRequestError(error)) {
        toast.error(
          (error as { message?: string })?.message ||
          "Failed to load categories"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (initialized) return;

    setInitialized(true);
    void loadCategories();
  }, [initialized, loadCategories]);

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await CategoryService.delete(deleteTarget.id);

      setRows((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id)
      );

      toast.success("Category deleted");

      setDeleteTarget(null);
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
        "Failed to delete category"
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (values: Record<string, unknown>) => {
    const name = String(values.name ?? "").trim();
    const statusValue = String(values.isActive ?? "Active");
    const isActive = statusValue === "Active";

    if (!name) {
      toast.error("Name is required");
      return;
    }

    try {
      // — optional image upload
      let image: { url: string; publicId: string } | undefined;
      const imageFiles = values.image as (File | string)[] | undefined;

      if (imageFiles && imageFiles.length > 0) {
        const file = imageFiles[0];

        if (file instanceof File) {
          const fd = new FormData();
          fd.append("file", file);

          const uploadRes = await fetch(ADMIN_UPLOAD_URL, {
            method: "POST",
            body: fd,
          });

          if (!uploadRes.ok) {
            toast.error("Image upload failed");
            return;
          }

          const uploadData = await uploadRes.json();
          image = { url: uploadData.url, publicId: uploadData.publicId };
        } else if (typeof file === "string" && editing?.image) {
          // if it's already a string (existing URL), keep existing image
          image = editing.image;
        }
      }

      const payload = { name, isActive, ...(image ? { image } : {}) };

      if (editing) {
        await CategoryService.update(editing.id, payload);
        toast.success("Category updated");
      } else {
        await CategoryService.create(payload);
        toast.success("Category created");
      }

      setOpen(false);
      setEditing(null);

      await loadCategories();
    } catch (error: unknown) {
      console.error(error);
      toast.error((error as { message?: string })?.message || "Failed to save category");
    }
  };

  /* ================= COLUMNS ================= */

  const CATEGORY_FIELDS: FormField[] = [
    {
      key: "name",
      label: "Category Name",
      type: "text",
      required: true,
      cols: 1,
    },
    {
      key: "isActive",
      label: "Status",
      type: "radio",
      required: true,
      cols: 1,
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
    {
      key: "image",
      label: "Category Image (optional)",
      type: "image",
      required: false,
      accept: "image/*",
      multiple: false,
      hint: "Recommended: square image, minimum 200×200 px",
      cols: 1,
    },
  ];

  const COLUMNS: Column<CategoryRow>[] = [
    {
      key: "name",
      label: "Category",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          {row.image?.url ? (
            <Image
              src={row.image.url}
              alt={row.name}
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-neutral-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200">
              <span className="text-[10px] text-neutral-400">IMG</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm text-neutral-900">{row.name}</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Subcategories: {row.subcategoryCount}
              </span>
            </div>
          </div>
        </div>
      ),
    },

    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={
            row.isActive
              ? "px-2 py-0.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "px-2 py-0.5 text-xs rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-200"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created",
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "—",
    },

  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <DataTable<CategoryRow>
        title="Categories"
        description={loading ? "Loading..." : ""}
        columns={COLUMNS}
        data={rows}
        searchKeys={["name"]}
        onAdd={() => {
          setEditing(null);
          setOpen(true);
        }}

        onEdit={(row) => {
          setEditing(row);
          setOpen(true);
        }}
        onSettings={(row) => {
          setSelectedCategory(row);
          setSubModalOpen(true);
        }}
        onDelete={(row) => setDeleteTarget(row)}
      />
      <AdminModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Category" : "Create Category"}
        description={
          editing
            ? "Update category details."
            : "Fill in category details below."
        }
        size="md"
      >
        <AdminForm
          fields={CATEGORY_FIELDS}
          initialValues={{
            name: editing?.name ?? "",
            isActive: editing?.isActive ? "Active" : "Inactive",
            image: editing?.image?.url ? [editing.image.url] : [],
          }}
          submitLabel={editing ? "Save Changes" : "Create Category"}
          onSubmit={handleSubmit}
          onCancel={() => {
            setOpen(false);
            setEditing(null);
          }}
        />
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Category"
        description={`Delete "${deleteTarget?.name}"?`}
      />

      <SubcategoryModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        categoryId={selectedCategory?.id ?? null}
        categoryName={selectedCategory?.name}
      />
    </div>
  );
}
