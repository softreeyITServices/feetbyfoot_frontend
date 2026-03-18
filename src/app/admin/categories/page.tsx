"use client";

import React, { useEffect, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { AdminForm, FormField } from "@/component/admin/Adminform";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/domain/application/services/admin/category.service";
import type { AdminCategory } from "@/domain/shared/types/admin/category";
import { toast } from "react-hot-toast";

/* =========================================================
   TYPES
========================================================= */

interface CategoryRow {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

/* =========================================================
   SAFE MAPPER (FIX)
========================================================= */

const mapCategories = (items: any): CategoryRow[] => {
  const raw = Array.isArray(items.data)
    ? items.data
    : Array.isArray(items.data?.items)
      ? items.data.items
      : [];

  return raw.map((item: AdminCategory) => ({
    id: item._id,
    name: item.name,
    isActive: Boolean(item.isActive),
    createdAt: item.createdAt,
  }));
};

/* =========================================================
   TABLE CONFIG
========================================================= */

const COLUMNS: Column<CategoryRow>[] = [
  { key: "name", label: "Name", sortable: true },
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

/* =========================================================
   PAGE
========================================================= */

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  /* ================= LOAD ================= */

  const loadCategories = async () => {
    try {
      setLoading(true);
      const items = await fetchCategories();

      // 🔥 DEBUG (remove later if not needed)
      console.log("API RESPONSE:", items);

      setRows(mapCategories(items));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

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
        await updateCategory(editing.id, { name, isActive });
        toast.success("Category updated");
      } else {
        await createCategory({ name, isActive });
        toast.success("Category created");
      }

      setOpen(false);
      setEditing(null);

      // ✅ REFRESH LIST (FIX)
      await loadCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to save category");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (row: CategoryRow) => {
    if (!window.confirm(`Delete category "${row.name}"?`)) return;

    try {
      await deleteCategory(row.id);
      toast.success("Category deleted");

      // Optimistic update (fast UI)
      setRows((prev) => prev.filter((c) => c.id !== row.id));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to delete category");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Categories
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Organize and manage product categories.
        </p>
      </div>

      <DataTable<CategoryRow>
        title="All Categories"
        description={
          loading
            ? "Loading categories..."
            : "Sortable, searchable list of categories"
        }
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
        onDelete={handleDelete}
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
    </div>
  );
}