"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { platformFeesService } from "@/domain/application/services/platformFees.service";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";
import { isGetRequestError } from "@/lib/httpClientError";

/* ================= TYPES ================= */

type PlatformFee = {
  _id: string;
  name: string;
  amount?: number;
  percentage?: number;
  MinAmount?: number;
  applicableTo?: "ALL" | "COD" | "ONLINE";
  isActive: boolean;
  description?: string;
};

type PlatformFeeRow = PlatformFee & {
  id: string;
};

type PendingAction =
  | { type: "DELETE"; row: PlatformFeeRow }
  | { type: "CREATE" };

type FormType = {
  name: string;
  amount: string;
  percentage: string;
  MinAmount: string;
  isActive: boolean;
  feeType: "FLAT" | "PERCENTAGE";
  applicableTo: "ALL" | "COD" | "ONLINE";
  description: string;
};

/* ================= ACTION DROPDOWN ================= */

function ActionDropdown({
  row,
  onDelete,
  onToggle,
}: {
  row: PlatformFeeRow;
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

      {open && ref.current &&
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

export default function PlatformFeePage() {
  const [data, setData] = useState<PlatformFeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState<FormType>({
    name: "",
    amount: "",
    percentage: "",
    MinAmount: "",
    isActive: true,
    feeType: "FLAT",
    applicableTo: "ALL",
    description: "",
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await platformFeesService.getAll();

      console.log("res",res)

      setData(res.map((x) => ({ ...x, id: x._id })));
    } catch (err: any) {
      if (!isGetRequestError(err)) {
        toast.error(err?.message || "Failed to fetch platform fees");
      }
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
      await platformFeesService.delete(pending.row._id);

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
      if (!form.name) return toast.error("Name is required");
      if (!form.applicableTo) return toast.error("Applicable To is required");

      const payload = {
        name: form.name,
        amount:
          form.feeType === "FLAT" && form.amount
            ? Number(form.amount)
            : 0,
        percentage:
          form.feeType === "PERCENTAGE" && form.percentage
            ? Number(form.percentage)
            : 0,
        MinAmount: form.MinAmount ? Number(form.MinAmount) : 0,
        isActive: form.isActive,
        applicableTo: form.applicableTo,
        description: form.description,
      };

      await platformFeesService.create(payload);

      toast.success("Created successfully");
      fetchData();
      setPending(null);

      setForm({
        name: "",
        amount: "",
        percentage: "",
        MinAmount: "",
        isActive: true,
        feeType: "FLAT",
        applicableTo: "ALL",
        description: "",
      });
    } catch (err: any) {
      toast.error(err?.message || "Create failed");
    }
  };

  /* ================= TOGGLE ================= */

  const handleToggle = async (row: PlatformFeeRow) => {
    try {
      await platformFeesService.update(row._id, {
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

  const columns: Column<PlatformFeeRow>[] = [
    { key: "name", label: "Name" },
    { key: "applicableTo", label: "Applicable To" },
    {
      key: "amount",
      label: "Amount",
      render: (row) => (row.amount ? `₹${row.amount}` : "-"),
    },
    {
      key: "percentage",
      label: "Percentage",
      render: (row) => (row.percentage ? `${row.percentage}%` : "-"),
    },
    { key: "MinAmount", label: "Min Amount" },
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
          <h1 className="text-xl font-bold">Platform Fees</h1>
          <p className="text-sm text-neutral-400">
            Manage platform charges
          </p>
        </div>

        <button
          onClick={() => setPending({ type: "CREATE" })}
          className="px-4 py-2 text-xs bg-black text-white rounded-lg"
        >
          + Create Fee
        </button>
      </div>

      <DataTable
        title="All Platform Fees"
        description="Manage platform fees"
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["name"]}
      />

      {/* CREATE MODAL */}
      <AdminModal
        isOpen={pending?.type === "CREATE"}
        onClose={() => setPending(null)}
        title="Create Platform Fee"
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
              Submit
            </button>
          </div>
        }
      >
        <div className="space-y-6 text-sm">

          {/* HEADER */}
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Configure Fee
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Choose how this fee should be applied
            </p>
          </div>

          {/* NAME */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Fee Name <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              placeholder="e.g. Platform Fee, GST"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Description (Show to User)
            </label>
            <input
              placeholder="e.g. Applied for COD below ₹2000"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          {/* TYPE SELECTOR */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-2">
              Fee Type
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* FLAT */}
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    feeType: "FLAT",
                    percentage: "",
                  }))
                }
                className={`border rounded-xl p-3 text-left transition ${form.feeType === "FLAT"
                    ? "border-black bg-neutral-50 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-400"
                  }`}
              >
                <p className="text-sm font-medium">Flat Amount</p>
                <p className="text-xs text-neutral-500">Fixed fee (₹)</p>
              </button>

              {/* PERCENTAGE */}
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    feeType: "PERCENTAGE",
                    amount: "",
                  }))
                }
                className={`border rounded-xl p-3 text-left transition ${form.feeType === "PERCENTAGE"
                    ? "border-black bg-neutral-50 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-400"
                  }`}
              >
                <p className="text-sm font-medium">Percentage</p>
                <p className="text-xs text-neutral-500">% of order</p>
              </button>
            </div>
          </div>

          {/* VALUE INPUT (ONLY ONE VISIBLE) */}
          {form.feeType === "FLAT" && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Amount (₹)
              </label>
              <input
                type="text"
                placeholder="Enter amount"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    amount: (e.target.value),
                  }))
                }
              />
            </div>
          )}

          {form.feeType === "PERCENTAGE" && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Percentage (%)
              </label>
              <input
                type="text"
                placeholder="Enter percentage"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none"
                value={form.percentage}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    percentage: (e.target.value),
                  }))
                }
              />
            </div>
          )}

          {/* APPLICABLE TO */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Applicable To <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none bg-white transition cursor-pointer"
              value={form.applicableTo}
              onChange={(e) =>
                setForm((p) => ({ ...p, applicableTo: e.target.value as any }))
              }
            >
              <option value="ALL">All Orders (Always apply)</option>
              <option value="COD">COD Only (Cash on Delivery)</option>
              <option value="ONLINE">Online Only (Prepaid)</option>
            </select>
          </div>

          {/* MIN ORDER */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Minimum Order Value
            </label>
            <input
              type="text"
              placeholder="Optional"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none"
              value={form.MinAmount}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  MinAmount: (e.target.value),
                }))
              }
            />
          </div>

          {/* ACTIVE TOGGLE */}
          <div className="flex items-center justify-between bg-neutral-50 border rounded-xl p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-neutral-500">
                Enable this fee immediately
              </p>
            </div>

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

      {/* DELETE */}
      <ConfirmModal
        isOpen={pending?.type === "DELETE"}
        onClose={() => setPending(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Platform Fee"
        description={`Are you sure you want to delete "${pending?.type === "DELETE" ? pending.row.name : ""
          }"?`}
      />
    </div>
  );
}
