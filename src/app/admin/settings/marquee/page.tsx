"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";
import { AnnouncementService } from "@/domain/application/services/admin/announcement.service";
import type {
  Announcement,
  UpdateAnnouncementBody,
} from "@/domain/shared/types/announcement";
import toast from "react-hot-toast";

type AnnouncementRow = Announcement & { id: string };

type ActiveFilter = "all" | "active" | "inactive";

type ModalMode = "create" | "edit" | null;

function toastErr(err: unknown) {
  const any = err as Error & { data?: { message?: string | string[] } };
  const m = any.data?.message;
  const text = Array.isArray(m)
    ? m.join(", ")
    : typeof m === "string"
      ? m
      : any.message || "Something went wrong";
  toast.error(text);
}

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(v: string): string | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

const emptyForm = {
  message: "",
  isActive: true,
  priority: 0,
  startLocal: "",
  endLocal: "",
};

export default function MarqueeSettingsPage() {
  const [data, setData] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ActiveFilter>("all");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingRow, setEditingRow] = useState<AnnouncementRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementRow | null>(
    null
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const isActive =
        filter === "active" ? true : filter === "inactive" ? false : undefined;
      const list = await AnnouncementService.listAdmin(isActive);
      setData(list.map((x) => ({ ...x, id: x._id })));
    } catch (err) {
      toastErr(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingRow(null);
    setForm(emptyForm);
    setModalMode("create");
  };

  const openEdit = (row: AnnouncementRow) => {
    setEditingRow(row);
    setForm({
      message: row.message,
      isActive: row.isActive,
      priority: row.priority ?? 0,
      startLocal: toDatetimeLocalValue(row.startDate ?? undefined),
      endLocal: toDatetimeLocalValue(row.endDate ?? undefined),
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingRow(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    const msg = form.message.trim();
    if (!msg) {
      toast.error("Message is required");
      return;
    }
    if (msg.length > 500) {
      toast.error("Message must be at most 500 characters");
      return;
    }

    const startDate = form.startLocal.trim()
      ? fromDatetimeLocalValue(form.startLocal)
      : undefined;
    const endDate = form.endLocal.trim()
      ? fromDatetimeLocalValue(form.endLocal)
      : undefined;

    if (form.startLocal.trim() && startDate === undefined) {
      toast.error("Invalid start date");
      return;
    }
    if (form.endLocal.trim() && endDate === undefined) {
      toast.error("Invalid end date");
      return;
    }

    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() > new Date(endDate).getTime()
    ) {
      toast.error("Start date cannot be after end date");
      return;
    }

    try {
      setSaving(true);
      const baseFields = {
        message: msg,
        isActive: form.isActive,
        priority: Math.max(0, Math.floor(Number(form.priority)) || 0),
      };

      if (modalMode === "create") {
        await AnnouncementService.create({
          ...baseFields,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });
        toast.success("Announcement created");
      } else if (modalMode === "edit" && editingRow) {
        const updateBody: UpdateAnnouncementBody = { ...baseFields };
        if (startDate) updateBody.startDate = startDate;
        if (endDate) updateBody.endDate = endDate;
        await AnnouncementService.update(editingRow._id, updateBody);
        toast.success("Announcement updated");
      }
      closeModal();
      fetchData();
    } catch (err) {
      toastErr(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await AnnouncementService.delete(deleteTarget._id);
      toast.success("Announcement removed");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toastErr(err);
    }
  };

  const columns: Column<AnnouncementRow>[] = [
    {
      key: "message",
      label: "Message",
      render: (row) => (
        <p className="max-w-md truncate text-sm" title={row.message}>
          {row.message}
        </p>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (row) => <span className="text-sm">{row.priority ?? 0}</span>,
    },
    {
      key: "isActive",
      label: "Active",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg ${
            row.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {row.isActive ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Start",
      render: (row) => (
        <span className="text-xs text-neutral-600">
          {row.startDate
            ? new Date(row.startDate).toLocaleString()
            : "—"}
        </span>
      ),
    },
    {
      key: "endDate",
      label: "End",
      render: (row) => (
        <span className="text-xs text-neutral-600">
          {row.endDate ? new Date(row.endDate).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => (
        <span className="text-xs text-neutral-600">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="px-3 py-1 text-xs border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg bg-white hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Home marquee</h1>
          <p className="text-sm text-neutral-500">
            Announcements shown in the scrolling bar on the storefront home
            page. Only active items within their date range appear publicly
            (per backend rules).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Filter</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ActiveFilter)}
              className="border border-neutral-300 rounded-lg px-2 py-1.5 text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
          >
            New announcement
          </button>
        </div>
      </div>

      <DataTable
        title="Announcements"
        description="Sorted by priority, then newest first (from API)."
        columns={columns}
        data={data}
        loading={loading}
      />

      <AdminModal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "create" ? "New announcement" : "Edit announcement"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm border border-neutral-300 rounded-lg bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              rows={4}
              maxLength={500}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              placeholder="e.g. Free shipping this weekend"
            />
            <p className="text-xs text-neutral-400 mt-1">
              {form.message.length}/500
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Priority
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: Number(e.target.value),
                  }))
                }
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="rounded border-neutral-300"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Start (optional)
              </label>
              <input
                type="datetime-local"
                value={form.startLocal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startLocal: e.target.value }))
                }
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                End (optional)
              </label>
              <input
                type="datetime-local"
                value={form.endLocal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endLocal: e.target.value }))
                }
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove announcement?"
        description="This deactivates the announcement for customers. You can create a new one anytime."
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}
