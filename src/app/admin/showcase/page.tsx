"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";
import { showcaseService } from "@/domain/application/services/showcase.service";
import { uploadService } from "@/domain/application/services/upload.service";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

/* ================= TYPES ================= */

type MediaType = "image" | "video";

type Showcase = {
  _id: string;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string;
  customerName?: string;
  ctaLink?: string;
  isActive: boolean;
  position?: number;
};

type ShowcaseRow = Showcase & {
  id: string;
};

type PendingAction =
  | { type: "DELETE"; row: ShowcaseRow }
  | { type: "CREATE" };

type FormType = {
  mediaUrl: string;
  mediaType: MediaType;
  caption: string;
  customerName: string;
  ctaLink: string;
  isActive: boolean;
  position: number;
};

/* ================= ACTION DROPDOWN ================= */

function ActionDropdown({
  row,
  onDelete,
  onToggle,
}: {
  row: ShowcaseRow;
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

export default function ShowcasePage() {
  const [data, setData] = useState<ShowcaseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<FormType>({
    mediaUrl: "",
    mediaType: "image",
    caption: "",
    customerName: "",
    ctaLink: "",
    isActive: true,
    position: 0,
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const res: any = await showcaseService.getAllShowcases();
      setData(res?.data?.map((x: any) => ({ ...x, id: x._id })));
    } catch (err: any) {
      console.log("err", err);
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
      await showcaseService.deleteShowcase(pending.row._id);

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
      if (!form.caption) return toast.error("Caption is required");
      if (!form.mediaUrl) return toast.error("Image/video is required");

      await showcaseService.createShowcase({
        mediaUrl: form.mediaUrl,
        mediaType: form.mediaType,
        caption: form.caption,
        customerName: form.customerName,
        ctaLink: form.ctaLink,
        isActive: form.isActive,
        position: form.position,
      });

      toast.success("Showcase created");
      fetchData();
      setPending(null);

      setForm({
        mediaUrl: "",
        mediaType: "image",
        caption: "",
        customerName: "",
        ctaLink: "",
        isActive: true,
        position: 0,
      });
    } catch (err: any) {
      toast.error(err?.message || "Create failed");
    }
  };

  /* ================= TOGGLE ================= */

  const handleToggle = async (row: ShowcaseRow) => {
    try {
      await showcaseService.updateShowcase(row._id, {
        ...row,
        isActive: !row.isActive,
      });

      toast.success(row.isActive ? "Deactivated" : "Activated");
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  /* ================= UPLOAD HANDLER ================= */

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadService.uploadFile(file);
      const detectedType: MediaType = file.type.startsWith("video/")
        ? "video"
        : "image";
      setForm((p) => ({ ...p, mediaUrl: url, mediaType: detectedType }));
      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= COLUMNS ================= */

  const columns: Column<ShowcaseRow>[] = [
    {
      key: "mediaUrl",
      label: "Media",
      render: (row) =>
        row.mediaType === "video" ? (
          <video
            src={row.mediaUrl}
            className="w-20 h-12 object-cover rounded-md border"
            muted
          />
        ) : (
          <img
            src={row.mediaUrl}
            alt={row.caption}
            className="w-20 h-12 object-cover rounded-md border"
          />
        ),
    },
    {
      key: "mediaType",
      label: "Type",
      render: (row) => (
        <span className="px-2 py-0.5 text-xs rounded-lg bg-neutral-100 text-neutral-700 capitalize">
          {row.mediaType}
        </span>
      ),
    },
    { key: "caption", label: "Caption" },
    {
      key: "customerName",
      label: "Customer",
      render: (row) => row.customerName || "-",
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg ${
            row.isActive
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
          <h1 className="text-xl font-bold">Customer Showcase</h1>
          <p className="text-sm text-neutral-400">
            Manage the "Happy Customers" homepage row
          </p>
        </div>

        <button
          onClick={() => setPending({ type: "CREATE" })}
          className="px-4 py-2 text-xs bg-black text-white rounded-lg"
        >
          + Create Entry
        </button>
      </div>

      <DataTable
        title="All Entries"
        description="Manage showcase entries"
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["caption", "customerName"]}
      />

      {/* CREATE MODAL */}
      <AdminModal
        isOpen={pending?.type === "CREATE"}
        onClose={() => setPending(null)}
        title="Create Showcase Entry"
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
              Create Entry
            </button>
          </div>
        }
      >
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Entry Details
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Add a photo or video card shown in the "100,000+ Happy Customers" row
            </p>
          </div>

          {/* CAPTION */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Caption
            </label>
            <input
              placeholder="e.g. Matching your outfit to your socks"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none"
              value={form.caption}
              onChange={(e) =>
                setForm((p) => ({ ...p, caption: e.target.value }))
              }
            />
          </div>

          {/* CUSTOMER NAME */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Customer Name (optional)
            </label>
            <input
              placeholder="e.g. Sarah K."
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300"
              value={form.customerName}
              onChange={(e) =>
                setForm((p) => ({ ...p, customerName: e.target.value }))
              }
            />
          </div>

          {/* MEDIA TYPE TOGGLE */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-2">
              Media Type
            </label>
            <div className="inline-flex rounded-lg border border-neutral-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, mediaType: "image" }))}
                className={`px-4 py-1.5 text-xs font-medium ${
                  form.mediaType === "image"
                    ? "bg-black text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, mediaType: "video" }))}
                className={`px-4 py-1.5 text-xs font-medium border-l border-neutral-300 ${
                  form.mediaType === "video"
                    ? "bg-black text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                Video
              </button>
            </div>
          </div>

          {/* MEDIA UPLOAD */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-neutral-600">
              {form.mediaType === "video" ? "Video" : "Image"}
            </label>

            <label className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 inline-block">
              {uploading
                ? "Uploading..."
                : form.mediaType === "video"
                ? "Upload Video"
                : "Upload Image"}
              <input
                type="file"
                accept={form.mediaType === "video" ? "video/*" : "image/*"}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleUpload(file);
                }}
              />
            </label>

            <input
              placeholder="Or paste media URL"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300"
              value={form.mediaUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, mediaUrl: e.target.value }))
              }
            />

            {form.mediaUrl && form.mediaType === "video" ? (
              <video
                src={form.mediaUrl}
                controls
                className="w-full h-40 object-cover rounded-xl border"
              />
            ) : form.mediaUrl ? (
              <img
                src={form.mediaUrl}
                className="w-full h-40 object-cover rounded-xl border"
              />
            ) : null}
          </div>

          {/* CTA LINK */}
          <input
            placeholder="Link (optional, e.g. /shop)"
            className="w-full px-3 py-2.5 rounded-xl border"
            value={form.ctaLink}
            onChange={(e) =>
              setForm((p) => ({ ...p, ctaLink: e.target.value }))
            }
          />

          {/* POSITION */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Position (lower shows first)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2.5 rounded-xl border"
              value={form.position}
              onChange={(e) =>
                setForm((p) => ({ ...p, position: Number(e.target.value) }))
              }
            />
          </div>

          {/* TOGGLE */}
          <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl">
            <span>Active</span>
            <button
              onClick={() =>
                setForm((p) => ({ ...p, isActive: !p.isActive }))
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                form.isActive ? "bg-black" : "bg-neutral-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                  form.isActive ? "translate-x-5" : ""
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
        title="Delete Entry"
        description={`Delete "${
          pending?.type === "DELETE" ? pending.row.caption : ""
        }"?`}
      />
    </div>
  );
}
