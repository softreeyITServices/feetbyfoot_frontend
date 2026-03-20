"use client";

import React, { useEffect, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { AdminForm, FormField } from "@/component/admin/Adminform";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";

import { toast } from "react-hot-toast";
import { AdminCategoryType } from "@/domain/shared/types/admin/category";
import { CategoryTypeService } from "@/domain/application/services/admin/subcategory.service";

/* ================= TYPES ================= */

interface SubcategoryRow {
  id: string;
  name: string;
  isActive?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  categoryId: string | null;
  categoryName?: string;
}

/* ================= FORM ================= */

const FIELDS: FormField[] = [
  {
    key: "name",
    label: "Subcategory Name",
    type: "text",
    required: true,
  },
];

/* ================= COMPONENT ================= */

export function SubcategoryModal({
  open,
  onClose,
  categoryId,
  categoryName,
}: Props) {
  const [rows, setRows] = useState<SubcategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<SubcategoryRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubcategoryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= LOAD ================= */

  const load = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);

      const data = await CategoryTypeService.getByCategory<AdminCategoryType>(
        categoryId
      );

      setRows(
        data.map((item) => ({
          id: item._id,
          name: item.name,
          isActive: item.isActive,
        }))
      );
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
        "Failed to load subcategories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open, categoryId]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!categoryId) return;

    const name = String(values.name ?? "").trim();

    if (!name) {
      toast.error("Name is required");
      return;
    }

    try {
      if (editing) {
        await CategoryTypeService.update(editing.id, {
          name,
          categoryId,
        });
        toast.success("Subcategory updated");
      } else {
        await CategoryTypeService.create({
          name,
          categoryId,
        });
        toast.success("Subcategory created");
      }

      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
        "Failed to save subcategory"
      );
    }
  };

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await CategoryTypeService.delete(deleteTarget.id);

      toast.success("Subcategory deleted");

      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));

      setDeleteTarget(null);
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
        "Failed to delete"
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ================= TABLE ================= */

  const columns: Column<SubcategoryRow>[] = [
    { key: "name", label: "Name" },
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
  ];

  /* ================= UI ================= */

  return (
    <>
      <AdminModal
        isOpen={open}
        onClose={onClose}
        title={`Subcategories → ${categoryName ?? ""}`}
        description="Manage subcategories"
        size="xl"
      >
        <DataTable<SubcategoryRow>
          title="Subcategories"
          description={loading ? "Loading..." : ""}
          columns={columns}
          data={rows}
          searchKeys={["name"]}
          onAdd={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          onEdit={(row) => {
            setEditing(row);
            setFormOpen(true);
          }}
          onDelete={(row) => setDeleteTarget(row)}
        />

        <AdminModal
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          title={editing ? "Edit Subcategory" : "Add Subcategory"}
        >
          <AdminForm
            fields={FIELDS}
            initialValues={{
              name: editing?.name ?? "",
            }}
            onSubmit={handleSubmit}
          />
        </AdminModal>
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Subcategory"
        description={`Delete "${deleteTarget?.name}"?`}
      />
    </>
  );
}