"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import {
  ExchangeService,
  ExchangeDetails,
  ExchangeItemInfo,
} from "@/domain/application/services/admin/exchange.service";
import toast from "react-hot-toast";
import Image from "next/image";

/* ================= TYPES ================= */

type ExchangeRow = {
  id: string;
  exchangeId: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  orderMongoId: string;
  details: ExchangeDetails;
  newItem: ExchangeItemInfo;
  oldItem: ExchangeItemInfo;
};

type PendingAction =
  | { type: "APPROVE"; row: ExchangeRow }
  | { type: "REJECT"; row: ExchangeRow }
  | { type: "SHIP"; row: ExchangeRow };

/* ================= STATUS STYLE ================= */

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  EXCHANGE_REQUESTED: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  EXCHANGE_APPROVED: "bg-blue-50 text-blue-700 border border-blue-200",
  REPLACEMENT_SHIPPED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  EXCHANGE_REJECTED: "bg-red-50 text-red-700 border border-red-200",
  COMPLETED: "bg-green-50 text-green-700 border border-green-200",
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
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
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
        <div className="absolute right-0 z-50 mt-2 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg">
          <div className="py-1 text-xs">
            <button
              onClick={() => { onAction("APPROVE"); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100"
            >
              Approve
            </button>
            <button
              onClick={() => { onAction("REJECT"); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100"
            >
              Reject
            </button>
            <button
              onClick={() => { onAction("SHIP"); setOpen(false); }}
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

/* ================= COLOR DOT ================= */

function ColorDot({ color }: { color?: string }) {
  if (!color) return <span className="text-neutral-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="w-3 h-3 rounded-full border border-neutral-300 inline-block"
        style={{ backgroundColor: color.toLowerCase() }}
      />
      {color}
    </span>
  );
}

/* ================= PAGE ================= */

function ExchangePage() {
  const [data, setData] = useState<ExchangeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ExchangeRow | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const [form, setForm] = useState({ adminNotes: "", rejectReason: "" });
  const [filters, setFilters] = useState({ status: "", orderNumber: "" });

  /* ================= FETCH ================= */


  const fetchData = async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = { page: 1, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.orderNumber) params.orderNumber = filters.orderNumber;

      const res = await ExchangeService.getAll(params);

      // Flatten: one row per exchange entry
      const rows: ExchangeRow[] = (res.data ?? []).flatMap((order) =>
        (order.exchanges ?? []).map((entry) => ({
          id: entry.details._id,
          exchangeId: entry.details.exchangeId,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          orderId: order.orderId,
          orderMongoId: order._id,
          details: entry.details,
          newItem: entry.newItem,
          oldItem: entry.oldItem,
        }))
      );

      setData(rows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exchanges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  /* ================= ACTION HANDLER ================= */

  console.log("data",data)


  const handleAction = async () => {
    if (!pending) return;
    const { row, type } = pending;
    console.log("row", row);


    const reason = type === "REJECT" ? form.rejectReason : form.adminNotes;
    if ((type === "APPROVE" || type === "REJECT") && !reason) {
      toast.error(type === "REJECT" ? "Reject reason required" : "Admin notes required");
      return;
    }

    try {
      await ExchangeService.exchangeAction(row.orderMongoId, {
        itemId: row.newItem._id,
        action: type,
        reason: reason || undefined,
      });

      const label = type === "APPROVE" ? "approved" : type === "REJECT" ? "rejected" : "shipped";
      toast.success(`Exchange ${label}`);

      fetchData();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Something went wrong");
    } finally {
      setPending(null);
      setForm({ adminNotes: "", rejectReason: "" });
    }
  };

  /* ================= COLUMNS ================= */

  const columns: Column<ExchangeRow>[] = [
    { key: "orderNumber", label: "Order No" },
    { key: "customerName", label: "Customer" },

    {
      key: "oldItem",
      label: "Product",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.oldItem?.productImage && (
            <Image
              src={row.oldItem.productImage}
              alt={row.oldItem.productName}
              width={32}
              height={32}
              className="rounded object-cover"
            />
          )}
          <span className="text-xs">{row.oldItem?.productName}</span>
        </div>
      ),
    },

    {
      key: "details",
      label: "Size Change",
      render: (row) => (
        <span className="text-xs">
          {row.details.oldSize} → {row.details.newSize}
        </span>
      ),
    },

    {
      key: "details",
      label: "Color Change",
      render: (row) => (
        <span className="text-xs flex items-center gap-1">
          <ColorDot color={row.details.oldColor} />
          {" → "}
          <ColorDot color={row.details.newColor} />
        </span>
      ),
    },

    {
      key: "details",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg whitespace-nowrap ${STATUS_STYLE[row.details.status] ?? "bg-gray-100 text-gray-600"}`}
        >
          {row.details.status}
        </span>
      ),
    },

    {
      key: "details",
      label: "Requested",
      render: (row) =>
        row.details.requestedAt
          ? new Date(row.details.requestedAt).toLocaleDateString()
          : "—",
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
        <p className="text-sm text-neutral-400">Manage product exchange requests</p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3">
        <input
          placeholder="Order Number"
          className="border px-3 py-2 rounded-lg text-sm"
          value={filters.orderNumber}
          onChange={(e) => setFilters((p) => ({ ...p, orderNumber: e.target.value }))}
        />
        <select
          className="border px-3 py-2 rounded-lg text-sm"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="REQUESTED">Requested</option>
          <option value="EXCHANGE_APPROVED">Approved</option>
          <option value="REPLACEMENT_SHIPPED">Shipped</option>
          <option value="EXCHANGE_REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* TABLE */}
      <DataTable<ExchangeRow>
        title="All Exchanges"
        description="Manage exchange requests"
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["orderNumber", "customerName"]}
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
          <div className="space-y-5 text-sm">
            {/* Order info */}
            <div className="grid grid-cols-2 gap-3">
              <p><b>Order:</b> {selected.orderNumber}</p>
              <p><b>Customer:</b> {selected.customerName}</p>
              <p><b>Exchange ID:</b> {selected.details.exchangeId || "—"}</p>
              <p><b>Requested:</b> {new Date(selected.details.requestedAt).toLocaleString()}</p>
              <p><b>Status:</b> {selected.details.status}</p>
              <p><b>Reason:</b> {selected.details.reason || "—"}</p>
            </div>

            {/* Size / Color change */}
            <div className="border rounded-lg p-3 bg-neutral-50 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Size</p>
                <p className="font-medium">
                  {selected.details.oldSize} → {selected.details.newSize}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Color</p>
                <span className="font-medium flex items-center gap-1">
                  <ColorDot color={selected.details.oldColor} />
                  {" → "}
                  <ColorDot color={selected.details.newColor} />
                </span>
              </div>
              <p><b>Qty:</b> {selected.details.quantity}</p>
            </div>

            {/* Old item */}
            <div>
              <p className="font-semibold mb-2">Original Item</p>
              <div className="border rounded-lg p-3 flex gap-3">
                {selected.oldItem?.productImage && (
                  <Image
                    src={selected.oldItem.productImage}
                    alt={selected.oldItem.productName}
                    width={56}
                    height={56}
                    className="rounded object-cover"
                  />
                )}
                <div className="space-y-1">
                  <p className="font-medium">{selected.oldItem?.productName}</p>
                  <p className="text-xs text-neutral-500">
                    Size: {selected.oldItem?.size} · Color: {selected.oldItem?.color || "—"} · Qty: {selected.oldItem?.quantity}
                  </p>
                  <p className="text-xs text-neutral-500">₹{selected.oldItem?.unitPrice}</p>
                </div>
              </div>
            </div>

            {/* New item */}
            <div>
              <p className="font-semibold mb-2">Replacement Item</p>
              <div className="border rounded-lg p-3 flex gap-3">
                {selected.newItem?.productImage && (
                  <Image
                    src={selected.newItem.productImage}
                    alt={selected.newItem.productName}
                    width={56}
                    height={56}
                    className="rounded object-cover"
                  />
                )}
                <div className="space-y-1">
                  <p className="font-medium">{selected.newItem?.productName}</p>
                  <p className="text-xs text-neutral-500">
                    Size: {selected.newItem?.size} · Color: {selected.newItem?.color || "—"} · Qty: {selected.newItem?.quantity}
                  </p>
                  <p className="text-xs text-neutral-500">₹{selected.newItem?.unitPrice}</p>
                </div>
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
            <div className="border rounded-lg p-3 bg-neutral-50">
              <p><b>Order:</b> {pending.row.orderNumber}</p>
              <p><b>Customer:</b> {pending.row.customerName}</p>
              <p><b>Product:</b> {pending.row.oldItem?.productName}</p>
              <p>
                <b>Exchange:</b>{" "}
                {pending.row.details.oldSize} → {pending.row.details.newSize}
                {pending.row.details.newColor ? ` · ${pending.row.details.oldColor || "—"} → ${pending.row.details.newColor}` : ""}
              </p>
              <p><b>Status:</b> {pending.row.details.status}</p>
            </div>

            {pending.type === "APPROVE" && (
              <textarea
                placeholder="Admin Notes"
                className="w-full border p-2 rounded-lg text-sm"
                value={form.adminNotes}
                onChange={(e) => setForm((p) => ({ ...p, adminNotes: e.target.value }))}
              />
            )}

            {pending.type === "REJECT" && (
              <textarea
                placeholder="Reject Reason"
                className="w-full border p-2 rounded-lg text-sm"
                value={form.rejectReason}
                onChange={(e) => setForm((p) => ({ ...p, rejectReason: e.target.value }))}
              />
            )}

            {pending.type === "SHIP" && (
              <p className="text-neutral-500">Confirm shipping replacement for this exchange?</p>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}

export default ExchangePage;
