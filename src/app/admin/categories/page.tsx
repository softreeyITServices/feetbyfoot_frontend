"use client";

import React, { useEffect, useState, useCallback } from "react";
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

      const subcategories =
        await CategoryTypeService.getAll<AdminCategoryType>();

      const countMap: Record<string, number> = {};

      subcategories.forEach((s) => {
        countMap[s.categoryId] = (countMap[s.categoryId] || 0) + 1;
      });

      const mapped: CategoryRow[] = categories && categories.length > 0 ? categories.map((item) => ({
        id: item._id,
        name: item.name,
        isActive: Boolean(item.isActive),
        createdAt: item.createdAt,
        subcategoryCount: countMap[item._id] || 0,
      })) : [];

      setRows(mapped);
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
        "Failed to load categories"
      );
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
      if (editing) {
        await CategoryService.update(editing.id, { name, isActive });
        toast.success("Category updated");
      } else {
        await CategoryService.create({ name, isActive });
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
  ];

  const COLUMNS: Column<CategoryRow>[] = [
    {
      key: "name",
      label: "Category",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-1">
          {/* Category Name */}
          <span className="font-medium text-sm text-neutral-900">
            {row.name}
          </span>

          {/* Pills Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Subcategories: {row.subcategoryCount}
            </span>
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