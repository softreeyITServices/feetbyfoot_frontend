"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";

import { AdminModal } from "@/component/admin/AdminModal";
import {
  Exchange,
  ExchangeService,
} from "@/domain/application/services/admin/exchange.service";
import { ExchangeStatus } from "@/domain/shared/types/order.type";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type ExchangeRow = Exchange & {
  id: string;
};

type PendingAction =
  | { type: "APPROVE"; row: ExchangeRow }
  | { type: "REJECT"; row: ExchangeRow }
  | { type: "SHIP"; row: ExchangeRow };

/* ================= STATUS STYLE ================= */

const STATUS_STYLE: Record<string, string> = {
  EXCHANGE_REQUESTED: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  EXCHANGE_APPROVED: "bg-blue-50 text-blue-700 border border-blue-200",
  REPLACEMENT_SHIPPED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

/* ================= ACTION DROPDOWN ================= */

function ActionDropdown({
  row,
  onAction,
}: {
  row: ExchangeRow;
  onAction: (type: PendingAction["type"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((p) => !p)}
        className="px-3 py-1 text-xs border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50"
      >
        Actions ▾
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg">
          <div className="py-1 text-xs">
            <button
              onClick={() => {
                onAction("APPROVE");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100"
            >
              Approve
            </button>

            <button
              onClick={() => {
                onAction("REJECT");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100"
            >
              Reject
            </button>

            <button
              onClick={() => {
                onAction("SHIP");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100"
            >
              Ship Replacement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= PAGE ================= */

function ExchangePage() {
  const [data, setData] = useState<ExchangeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ExchangeRow | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const [form, setForm] = useState({
    adminNotes: "",
    rejectReason: "",
  });

  const [filters, setFilters] = useState({
    status: "",
    orderNumber: "",
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = {
        page: 1,
        limit: 10,
      };

      if (filters.status) params.status = filters.status;
      if (filters.orderNumber) params.orderNumber = filters.orderNumber;

      const res = await ExchangeService.getAll(params);

      console.log("res", res);
      const transformed: ExchangeRow[] = (res.data || []).map((x) => ({
        ...x,
        id: x._id,
      }));

      setData(transformed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  /* ================= ACTION HANDLER ================= */

  const handleAction = async () => {
    if (!pending) return;

    const { row, type } = pending;

    try {
      if (type === "APPROVE") {
        if (!form.adminNotes) {
          toast.error("Admin notes required");
          return;
        }

        await ExchangeService.approve(row._id, form.adminNotes);
        toast.success("Exchange approved successfully");
      }

      if (type === "REJECT") {
        if (!form.rejectReason) {
          toast.error("Reject reason required");
          return;
        }

        await ExchangeService.reject(row._id, form.rejectReason);
        toast.success("Exchange rejected");
      }

      if (type === "SHIP") {
        await ExchangeService.shipReplacement(row._id);
        toast.success("Replacement shipped");
      }

      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setPending(null);
      setForm({ adminNotes: "", rejectReason: "" });
    }
  };

  /* ================= COLUMNS ================= */

  const columns: Column<ExchangeRow>[] = [
    { key: "exchangeId", label: "Exchange ID" },
    { key: "orderNumber", label: "Order No" },
    { key: "orderId", label: "Order ID" },

    {
      key: "lines",
      label: "Items",
      render: (row) => <>{row.lines.length}</>,
    },

    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg ${STATUS_STYLE[row.status]}`}
        >
          {row.status}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },

    {
      key: "id",
      label: "Actions",
      render: (row) => (
        <ActionDropdown
          row={row}
          onAction={(type) => setPending({ type, row })}
        />
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Exchanges</h1>
        <p className="text-sm text-neutral-400">Manage product exchanges</p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3">
        <input
          placeholder="Order Number"
          className="border px-3 py-2 rounded-lg text-sm"
          value={filters.orderNumber}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              orderNumber: e.target.value,
            }))
          }
        />

        <select
          className="border px-3 py-2 rounded-lg text-sm"
          value={filters.status}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              status: e.target.value,
            }))
          }
        >
          <option value="">All Status</option>
          {Object.values(ExchangeStatus).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <DataTable<ExchangeRow>
        title="All Exchanges"
        description="Manage exchange requests"
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["exchangeId", "orderNumber"]}
        onView={(row) => setSelected(row)}
      />

      {/* DETAILS MODAL */}
      <AdminModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Exchange Details"
        size="lg"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <p>
                <b>Exchange ID:</b> {selected.exchangeId || "NA"}
              </p>
              <p>
                <b>Order No:</b> {selected.orderNumber || "NA"}
              </p>

              <p>
                <b>Status:</b> {selected.status || "NA"}
              </p>
              <p>
                <b>Created:</b>{" "}
                {selected.createdAt
                  ? new Date(selected.createdAt).toLocaleString()
                  : "NA"}
              </p>
              <p>
                <b>Updated:</b>{" "}
                {selected.updatedAt
                  ? new Date(selected.updatedAt).toLocaleString()
                  : "NA"}
              </p>
              <p>
                <b>Approved At:</b>{" "}
                {selected.approvedAt
                  ? new Date(selected.approvedAt).toLocaleString()
                  : "NA"}
              </p>
            </div>

            <div className="space-y-1">
              <p>
                <b>Customer Notes:</b> {selected.notes || "NA"}
              </p>
              <p>
                <b>Admin Notes:</b> {selected.adminNotes || "NA"}
              </p>
              <p>
                <b>Reject Reason:</b> {selected.rejectReason || "NA"}
              </p>
            </div>

            <div className="space-y-1">
              <p>
                <b>Courier Name:</b> {selected.courierName || "NA"}
              </p>
              <p>
                <b>Pickup AWB:</b> {selected.pickupAwb || "NA"}
              </p>
              <p>
                <b>Replacement AWB:</b> {selected.replacementAwb || "NA"}
              </p>
            </div>

            <div>
              <p className="font-semibold mb-2">Items</p>
              <div className="border rounded-lg divide-y">
                {selected.lines?.length ? (
                  selected.lines.map((line) => (
                    <div key={line.orderItemId} className="p-3">
                      <p>
                        <b>Product:</b> {line.productId}
                      </p>
                      <p>
                        <b>Size:</b> {line.fromSize} → {line.toSize}
                      </p>
                      <p>
                        <b>Qty:</b> {line.quantity}
                      </p>
                      <p>
                        <b>Reason:</b> {line.reason || "NA"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-neutral-400">No items</div>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ACTION MODAL */}
      <AdminModal
        isOpen={!!pending}
        onClose={() => setPending(null)}
        title="Update Exchange"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPending(null)}
              className="px-4 py-2 text-xs border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>

            <button
              onClick={handleAction}
              className="px-4 py-2 text-xs bg-black text-white rounded-lg hover:bg-neutral-800"
            >
              Submit
            </button>
          </div>
        }
      >
        {pending && (
          <div className="space-y-4 text-sm">
            {/* CONTEXT */}
            <div className="border rounded-lg p-3 bg-neutral-50">
              <p>
                <b>Exchange ID:</b> {pending.row.exchangeId || "NA"}
              </p>
              <p>
                <b>Order No:</b> {pending.row.orderNumber || "NA"}
              </p>
              <p>
                <b>Status:</b> {pending.row.status || "NA"}
              </p>

              <p>
                <b>Items:</b>{" "}
                {pending.row.lines?.length
                  ? pending.row.lines
                      .map((l) => `${l.fromSize}→${l.toSize} (x${l.quantity})`)
                      .join(", ")
                  : "NA"}
              </p>
            </div>

            {/* INPUTS */}
            {pending.type === "APPROVE" && (
              <textarea
                placeholder="Admin Notes"
                className="w-full border p-2 rounded-lg"
                value={form.adminNotes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, adminNotes: e.target.value }))
                }
              />
            )}

            {pending.type === "REJECT" && (
              <textarea
                placeholder="Reject Reason"
                className="w-full border p-2 rounded-lg"
                value={form.rejectReason}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rejectReason: e.target.value }))
                }
              />
            )}

            {pending.type === "SHIP" && (
              <p className="text-neutral-500">Confirm shipping replacement</p>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}

export default ExchangePage;
