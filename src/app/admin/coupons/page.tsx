"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import {
  Coupon,
  CouponService,
  CouponPayload,
} from "@/domain/application/services/admin/coupon.service";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { isGetRequestError } from "@/lib/httpClientError";

/* ================= TYPES ================= */

type CouponRow = Coupon & {
  id: string;
};

type PendingAction =
  | { type: "DELETE"; row: CouponRow; deleteType: "soft" | "hard" }
  | { type: "CREATE" };

/* ================= ACTION DROPDOWN ================= */

function ActionDropdown({
  row,
  onDelete,
  onToggleActive,
  onTogglePublic,
}: {
  row: CouponRow;
  onDelete: (type: "soft" | "hard") => void;
  onToggleActive: () => void;
  onTogglePublic: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedTrigger = ref.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedTrigger && !clickedMenu) {
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
                className="fixed z-9999 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg"
                style={{
                  top: rect.bottom + 6,
                  left: rect.right - 160,
                }}
              >
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      onToggleActive();
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-100"
                  >
                    {row.isActive ? "Deactivate (Soft Delete)" : "Activate"}
                  </button>

                  <button
                    onClick={() => {
                      onTogglePublic();
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-100"
                  >
                    {row.isPublic ? "Hide from Website" : "Make Public"}
                  </button>

                  <button
                    onClick={() => {
                      onDelete("hard");
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
                  >
                    Hard Delete
                  </button>
                </div>
              </div>
            );
          })(),
          document.body
        )}
    </div>
  );
}

/* ================= PAGE ================= */

function CouponPage() {
  const [data, setData] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");

  /* ✅ FIXED: Proper typing */
  const [form, setForm] = useState<CouponPayload>({
    code: "",
    discountType: "FLAT",
    discountValue: 0,
    minOrderValue: 0,
    expiryDate: "",
    maxUsage: 0,
    perUserLimit: 0,
    isActive: true,
    isPublic: true,
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await CouponService.getAll();
      setData(
        res.map((r) => ({
          ...r,
          id: r._id,
        }))
      );
    } catch (err: any) {
      if (isGetRequestError(err)) return;
      toast.error(err?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (id: string) => {
    try {
      await CouponService.toggleActive(id);
      toast.success("Coupon status updated");
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleTogglePublic = async (id: string) => {
    try {
      await CouponService.togglePublic(id);
      toast.success("Coupon visibility updated");
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update visibility");
    }
  };

  /* ================= ACTION HANDLER ================= */

  const handleAction = async () => {
    if (!pending) return;

    try {
      if (pending.type === "DELETE") {
        await CouponService.delete(pending.row._id, pending.deleteType);
        toast.success(`Coupon ${pending.deleteType} deleted`);
      }

      if (pending.type === "CREATE") {
        if (!form.code) {
          toast.error("Code is required");
          return;
        }

        await CouponService.create(form);
        toast.success("Coupon created");
      }

      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setPending(null);

      /* reset form */
      setForm({
        code: "",
        discountType: "FLAT",
        discountValue: 0,
        minOrderValue: 0,
        expiryDate: "",
        maxUsage: 0,
        perUserLimit: 0,
        isActive: true,
        isPublic: true,
      });
    }
  };

  /* ================= COLUMNS ================= */

  const columns: Column<CouponRow>[] = [
    { key: "code", label: "Code" },

    {
      key: "discountValue",
      label: "Discount",
      render: (row) => (
        <>
          {row.discountType === "FLAT"
            ? `₹${row.discountValue}`
            : `${row.discountValue}%`}
        </>
      ),
    },

    { key: "minOrderValue", label: "Min Order (₹)" },

    {
      key: "maxUsage",
      label: "Usage",
      render: (row) => (
        <span className="text-xs">
          {row.usedCount ?? 0}
          <span className="text-neutral-400">
            /{row.maxUsage === 0 ? "∞" : row.maxUsage}
          </span>
        </span>
      ),
    },

    {
      key: "perUserLimit",
      label: "Per User",
      render: (row) => (
        <span className="text-xs">
          {row.perUserLimit === 0 ? "∞" : row.perUserLimit}
        </span>
      ),
    },

    {
      key: "expiryDate",
      label: "Expiry",
      render: (row) =>
        new Date(row.expiryDate).toLocaleDateString(),
    },

    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`px-2 py-0.5 text-[10px] rounded-lg w-fit ${row.isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
              }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <span
            className={`px-2 py-0.5 text-[10px] rounded-lg w-fit ${row.isPublic
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}
          >
            {row.isPublic ? "Public" : "Private"}
          </span>
        </div>
      ),
    },

    {
      key: "id",
      label: "Actions",
      render: (row) => (
        <ActionDropdown
          row={row}
          onDelete={(type) => {
            setPending({ type: "DELETE", row, deleteType: type });
          }}
          onToggleActive={() => handleToggleActive(row._id)}
          onTogglePublic={() => handleTogglePublic(row._id)}
        />
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Coupons</h1>
          <p className="text-sm text-neutral-400">
            Manage discount coupons
          </p>
        </div>

        <button
          onClick={() => setPending({ type: "CREATE" })}
          className="px-4 py-2 text-xs bg-black text-white rounded-lg hover:bg-neutral-800"
        >
          + Create Coupon
        </button>
      </div>

      {/* TABLE */}
      <DataTable<CouponRow>
        title="All Coupons"
        description="Manage coupons"
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["code"]}
        selectable={false}
      />

      {/* MODAL */}
      <AdminModal
        isOpen={!!pending}
        onClose={() => setPending(null)}
        title={
          pending?.type === "CREATE"
            ? "Create Coupon"
            : "Delete Coupon"
        }
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPending(null)}
              className="px-4 py-2 text-xs border border-neutral-300 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleAction}
              className="px-4 py-2 text-xs bg-black text-white rounded-lg"
            >
              Submit
            </button>
          </div>
        }
      >
        {/* CREATE */}
        {pending?.type === "CREATE" && (
          <div className="space-y-5 text-sm">

            {/* HEADER NOTE */}
            <div className="text-xs text-neutral-500">
              Configure coupon details below
            </div>

            {/* GRID FORM */}
            <div className="grid grid-cols-2 gap-4">

              {/* CODE */}
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1 text-neutral-600">
                  Coupon Code <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  placeholder="e.g. SAVE100"
                  className="w-full border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black p-2.5 rounded-xl outline-none transition"
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                  }
                />
              </div>

              {/* DISCOUNT TYPE */}
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-600">
                  Discount Type <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  className="w-full border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black p-2.5 rounded-xl outline-none"
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      discountType: e.target.value as "FLAT" | "PERCENTAGE",
                    }))
                  }
                >
                  <option value="FLAT">Flat</option>
                  <option value="PERCENTAGE">Percentage</option>
                </select>
              </div>

              {/* DISCOUNT VALUE */}
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-600">
                  Discount Value <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="0"
                  className="w-full border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black p-2.5 rounded-xl outline-none"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      discountValue: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* MIN ORDER */}
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-600">
                  Min Order Value
                </label>
                <input
                  type="text"
                  placeholder="0"
                  className="w-full border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black p-2.5 rounded-xl outline-none"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      minOrderValue: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* MAX USAGE */}
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-600">
                  Max Usage
                </label>
                <input
                  type="text"
                  placeholder="Unlimited = 0"
                  className="w-full border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black p-2.5 rounded-xl outline-none"
                  value={form.maxUsage}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      maxUsage: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* PER USER */}
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-600">
                  Per User Limit
                </label>
                <input
                  type="text"
                  placeholder="0"
                  className="w-full border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black p-2.5 rounded-xl outline-none"
                  value={form.perUserLimit}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      perUserLimit: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* EXPIRY */}
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1 text-neutral-600">
                  Expiry Date <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black p-2.5 rounded-xl outline-none"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      expiryDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* ACTIVE TOGGLE */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center justify-between border rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium">Active Coupon</p>
                  <p className="text-xs text-neutral-400">
                    Enable or disable this coupon
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
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${form.isActive ? "translate-x-5" : ""
                      }`}
                  />
                </button>
              </div>

              {/* PUBLIC TOGGLE */}
              <div className="flex items-center justify-between border rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium">Public on Website</p>
                  <p className="text-xs text-neutral-400">
                    If enabled, everyone can see this in the Cart drawer. If disabled, it's hidden and users must type the code manually.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setForm((p) => ({ ...p, isPublic: !p.isPublic }))
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition ${form.isPublic ? "bg-black" : "bg-neutral-300"
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${form.isPublic ? "translate-x-5" : ""
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE */}
        {pending?.type === "DELETE" && (
          <div className="space-y-3 text-sm">
            <p>
              Are you sure you want to{" "}
              <b>{pending.deleteType}</b> delete coupon{" "}
              <b>{pending.row.code}</b>?
            </p>
          </div>
        )}
      </AdminModal>
    </div>
  );
}

export default CouponPage;
