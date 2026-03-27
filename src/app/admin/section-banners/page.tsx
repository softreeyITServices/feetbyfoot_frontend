"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";

import { SectionBannerService } from "@/domain/application/services/admin/sectionBanner.service";
import { uploadService } from "@/domain/application/services/upload.service";

import toast from "react-hot-toast";
import { createPortal } from "react-dom";

/* ================= TYPES ================= */

type SectionBanner = {
  _id: string;
  sectionKey: string;
  image: string;
  isActive: boolean;
};

type Row = SectionBanner & { id: string };

type Pending =
  | { type: "DELETE"; row: Row }
  | { type: "CREATE" }
  | { type: "EDIT"; row: Row };

type FormType = {
  sectionKey: string;
  image: string;
  isActive: boolean;
};

/* ================= ACTION DROPDOWN ================= */

function ActionDropdown({
  row,
  onDelete,
  onEdit,
  onToggle,
}: {
  row: Row;
  onDelete: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !ref.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        className="px-3 py-1 text-xs border rounded-lg"
        onClick={() => setOpen(!open)}
      >
        Actions ▾
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-44 bg-white border rounded-xl shadow-xl"
            style={{
              top: ref.current!.getBoundingClientRect().bottom + 6,
              left:
                ref.current!.getBoundingClientRect().right - 176,
            }}
          >
            <button
              className="block w-full text-left px-4 py-2 text-xs hover:bg-neutral-100"
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
            >
              Edit
            </button>

            <button
              className="block w-full text-left px-4 py-2 text-xs hover:bg-neutral-100"
              onClick={() => {
                onToggle();
                setOpen(false);
              }}
            >
              {row.isActive ? "Deactivate" : "Activate"}
            </button>

            <button
              className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

/* ================= PAGE ================= */

export default function SectionBannerPage() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);

  const [uploading, setUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState<FormType>({
    sectionKey: "HOME",
    image: "",
    isActive: true,
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await SectionBannerService.getAdminAll();

      setData(res.map(x => ({ ...x, id: x._id })));

    } catch (e: any) {

      toast.error(e.message);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= CREATE ================= */

  const handleCreate = async () => {

    if (!form.image) return toast.error("Image required");

    try {

      await SectionBannerService.create(form);

      toast.success("Created");

      setPending(null);

      fetchData();

    } catch (e: any) {

      toast.error(e.message);

    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {

    if (!pending || pending.type !== "EDIT") return;

    try {

      await SectionBannerService.update(pending.row._id, form);

      toast.success("Updated");

      setPending(null);

      fetchData();

    } catch (e: any) {

      toast.error(e.message);

    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {

    if (!pending || pending.type !== "DELETE") return;

    try {

      setDeleteLoading(true);

      await SectionBannerService.delete(pending.row._id);

      toast.success("Deleted");

      setPending(null);

      fetchData();

    } catch (e: any) {

      toast.error(e.message);

    } finally {

      setDeleteLoading(false);

    }
  };

  /* ================= TOGGLE ================= */

  const handleToggle = async (row: Row) => {

    try {

      await SectionBannerService.toggleStatus(row._id);

      toast.success("Updated");

      fetchData();

    } catch (e: any) {

      toast.error(e.message);

    }
  };

  /* ================= COLUMNS ================= */

  const columns: Column<Row>[] = [

    {
      key: "image",
      label: "Banner",
      render: row => (
        <img
          src={row.image}
          className="w-24 h-14 object-cover rounded-lg border"
        />
      ),
    },

    {
      key: "sectionKey",
      label: "Section",
    },

    {
      key: "isActive",
      label: "Status",
      render: row => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg ${
            row.isActive
              ? "bg-green-50 text-green-700"
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
      render: row => (
        <ActionDropdown
          row={row}
          onDelete={() => setPending({ type: "DELETE", row })}
          onEdit={() => {
            setForm(row);
            setPending({ type: "EDIT", row });
          }}
          onToggle={() => handleToggle(row)}
        />
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      <div className="flex justify-between">

        <div>
          <h1 className="text-xl font-bold">
            Section Banners
          </h1>

          <p className="text-sm text-neutral-400">
            Manage homepage & category banners
          </p>
        </div>

        <button
          className="px-4 py-2 bg-black text-white text-xs rounded-lg"
          onClick={() => setPending({ type: "CREATE" })}
        >
          + Add Banner
        </button>

      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["sectionKey"]}
      />

      {/* CREATE / EDIT MODAL */}

      <AdminModal
        isOpen={
          pending?.type === "CREATE" ||
          pending?.type === "EDIT"
        }
        onClose={() => setPending(null)}
        title={
          pending?.type === "EDIT"
            ? "Edit Banner"
            : "Create Banner"
        }
        footer={

          <div className="flex gap-2">

            <button
              onClick={() => setPending(null)}
              className="px-4 py-2 text-xs border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={
                pending?.type === "EDIT"
                  ? handleUpdate
                  : handleCreate
              }
              className="px-4 py-2 text-xs bg-black text-white rounded-lg"
            >
              Save
            </button>

          </div>

        }
      >

        <div className="space-y-4">

          {/* SECTION */}

          <select
            className="w-full border px-3 py-2 rounded-lg"
            value={form.sectionKey}
            onChange={e =>
              setForm({
                ...form,
                sectionKey: e.target.value,
              })
            }
          >
            <option value="HOME">HOME</option>
            <option value="MEN">MEN</option>
            <option value="WOMEN">WOMEN</option>
            <option value="KIDS">KIDS</option>
          </select>

          {/* IMAGE */}

          <div>

            <label className="text-xs">
              Upload Image
            </label>

            <input
              type="file"
              onChange={async e => {

                const file = e.target.files?.[0];

                if (!file) return;

                try {

                  setUploading(true);

                  const url =
                    await uploadService.uploadFile(file);

                  setForm({
                    ...form,
                    image: url,
                  });

                } finally {

                  setUploading(false);

                }
              }}
            />

            {form.image && (
              <img
                src={form.image}
                className="w-full h-40 object-cover rounded-lg mt-2"
              />
            )}

          </div>

          {/* ACTIVE */}

          <div className="flex justify-between bg-neutral-50 p-3 rounded-lg">

            <span>Status</span>

            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
            />

          </div>

        </div>

      </AdminModal>

      {/* DELETE */}

      <ConfirmModal
        isOpen={pending?.type === "DELETE"}
        onClose={() => setPending(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete banner?"
        description="This action cannot be undone"
      />

    </div>
  );
}