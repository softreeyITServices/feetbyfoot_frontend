"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";
import { bannerService } from "@/domain/application/services/banner.service";
import { uploadService } from "@/domain/application/services/upload.service"; // ✅ added
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

/* ================= TYPES ================= */

type Banner = {
  _id: string;
  title: string;
  imageUrl: string;
  redirectUrl?: string;
  isActive: boolean;
};

type BannerRow = Banner & {
  id: string;
};

type PendingAction =
  | { type: "DELETE"; row: BannerRow }
  | { type: "CREATE" };

type FormType = {
  title: string;
  imageUrl: string;
  redirectUrl: string;
  isActive: boolean;
};

/* ================= ACTION DROPDOWN ================= */

function ActionDropdown({
  row,
  onDelete,
  onToggle,
}: {
  row: BannerRow;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !ref.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block z-50">
      <button
        onClick={() => setOpen((p) => !p)}
        className="px-3 py-1 text-xs border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50"
      >
        Actions ▾
      </button>

      {open &&
        ref.current &&
        createPortal(
          (() => {
            const rect = ref.current!.getBoundingClientRect();

            return (
              <div
                ref={menuRef}
                className="fixed z-[9999] w-44 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden"
                style={{
                  top: rect.bottom + 6,
                  left: rect.right - 176,
                }}
              >
                <button
                  onClick={() => {
                    onToggle();
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100"
                >
                  {row.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600"
                >
                  Delete
                </button>
              </div>
            );
          })(),
          document.body
        )}
    </div>
  );
}

/* ================= PAGE ================= */

export default function BannerPage() {
  const [data, setData] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<FormType>({
    title: "",
    imageUrl: "",
    redirectUrl: "",
    isActive: true,
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await bannerService.getAllBanners();
      setData(res.map((x) => ({ ...x, id: x._id })));
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!pending || pending.type !== "DELETE") return;

    try {
      setDeleteLoading(true);
      await bannerService.deleteBanner(pending.row._id);

      toast.success("Deleted successfully");
      fetchData();
      setPending(null);
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    try {
      if (!form.title) return toast.error("Title is required");
      if (!form.imageUrl) return toast.error("Image is required");

      await bannerService.createBanner({
        title: form.title,
        imageUrl: form.imageUrl,
        redirectUrl: form.redirectUrl,
        isActive: form.isActive,
      });

      toast.success("Banner created");
      fetchData();
      setPending(null);

      setForm({
        title: "",
        imageUrl: "",
        redirectUrl: "",
        isActive: true,
      });
    } catch (err: any) {
      toast.error(err?.message || "Create failed");
    }
  };

  /* ================= TOGGLE ================= */

  const handleToggle = async (row: BannerRow) => {
    try {
      await bannerService.updateBanner(row._id, {
        ...row,
        isActive: !row.isActive,
      });

      toast.success(row.isActive ? "Deactivated" : "Activated");
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  /* ================= COLUMNS ================= */

  const columns: Column<BannerRow>[] = [
    {
      key: "imageUrl",
      label: "Banner",
      render: (row) => (
        <img
          src={row.imageUrl}
          alt={row.title}
          className="w-20 h-12 object-cover rounded-md border"
        />
      ),
    },
    { key: "title", label: "Title" },
    {
      key: "redirectUrl",
      label: "Redirect",
      render: (row) => row.redirectUrl || "-",
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg ${row.isActive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-600"
            }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (row) => (
        <ActionDropdown
          row={row}
          onDelete={() => setPending({ type: "DELETE", row })}
          onToggle={() => handleToggle(row)}
        />
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Banners</h1>
          <p className="text-sm text-neutral-400">
            Manage homepage banners
          </p>
        </div>

        <button
          onClick={() => setPending({ type: "CREATE" })}
          className="px-4 py-2 text-xs bg-black text-white rounded-lg"
        >
          + Create Banner
        </button>
      </div>

      <DataTable
        title="All Banners"
        description="Manage banners"
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["title"]}
      />

      {/* CREATE MODAL */}
      <AdminModal
        isOpen={pending?.type === "CREATE"}
        onClose={() => setPending(null)}
        title="Create Banner"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPending(null)}
              className="px-4 py-2 text-xs border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-xs bg-black text-white rounded-lg"
            >
              Create Banner
            </button>
          </div>
        }
      >
        <div className="space-y-6 text-sm">

          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Banner Details
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Add a banner that will be shown on the homepage
            </p>
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Title
            </label>
            <input
              placeholder="e.g. Summer Sale"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-neutral-600">
              Banner Image
            </label>

            <label className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 inline-block">
              {uploading ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    setUploading(true);
                    const url = await uploadService.uploadFile(file);

                    setForm((p) => ({ ...p, imageUrl: url }));
                    toast.success("Uploaded");
                  } catch (err: any) {
                    toast.error(err?.message || "Upload failed");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>

            <input
              placeholder="Or paste image URL"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300"
              value={form.imageUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageUrl: e.target.value }))
              }
            />

            {form.imageUrl && (
              <img
                src={form.imageUrl}
                className="w-full h-40 object-cover rounded-xl border"
              />
            )}
          </div>

          {/* REDIRECT */}
          <input
            placeholder="Redirect URL"
            className="w-full px-3 py-2.5 rounded-xl border"
            value={form.redirectUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, redirectUrl: e.target.value }))
            }
          />

          {/* TOGGLE */}
          <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl">
            <span>Active</span>
            <button
              onClick={() =>
                setForm((p) => ({ ...p, isActive: !p.isActive }))
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${form.isActive ? "bg-black" : "bg-neutral-300"
                }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition ${form.isActive ? "translate-x-5" : ""
                  }`}
              />
            </button>
          </div>
        </div>
      </AdminModal>

      <ConfirmModal
        isOpen={pending?.type === "DELETE"}
        onClose={() => setPending(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Banner"
        description={`Delete "${pending?.type === "DELETE" ? pending.row.title : ""
          }"?`}
      />
    </div>
  );
}