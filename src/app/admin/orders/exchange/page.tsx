"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import {
  ExchangeService,
  ExchangeDetails,
  ExchangeItemInfo,
  ExchangeOrder,
  ExchangeEntry,
} from "@/domain/application/services/admin/exchange.service";
import toast from "react-hot-toast";
import Image from "next/image";
import { TrackingModal } from "@/component/ui/modals/TrackingModal";
import { isGetRequestError } from "@/lib/httpClientError";


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
  | { type: "RECEIVED"; row: ExchangeRow }
  | { type: "PACKED"; row: ExchangeRow }
  | { type: "SHIPPED"; row: ExchangeRow }
  | { type: "DELIVERED"; row: ExchangeRow }
  | { type: "COMPLETE"; row: ExchangeRow };

/* ================= STATUS STYLE ================= */

const STATUS_STYLE: Record<string, string> = {
  // item-level statuses
  EXCHANGE_REQUESTED:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  EXCHANGE_APPROVED:   "bg-blue-50 text-blue-700 border border-blue-200",
  EXCHANGE_RECEIVED:   "bg-teal-50 text-teal-700 border border-teal-200",
  PACKED:              "bg-orange-50 text-orange-700 border border-orange-200",
  SHIPPED:             "bg-indigo-50 text-indigo-700 border border-indigo-200",
  DELIVERED:           "bg-teal-50 text-teal-700 border border-teal-200",
  EXCHANGED:           "bg-green-50 text-green-700 border border-green-200",
  EXCHANGE_REJECTED:   "bg-red-50 text-red-700 border border-red-200",
  // exchangeRequest-level statuses (details.status)
  REQUESTED:           "bg-yellow-50 text-yellow-700 border border-yellow-200",
  APPROVED:            "bg-blue-50 text-blue-700 border border-blue-200",
  REJECTED:            "bg-red-50 text-red-700 border border-red-200",
  COMPLETED:           "bg-green-50 text-green-700 border border-green-200",
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
  const itemStatus = row.newItem?.status;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // No actions for terminal states
  if (itemStatus === "EXCHANGED" || itemStatus === "EXCHANGE_REJECTED") {
    return (
      <span className="text-xs text-neutral-400">
        {itemStatus === "EXCHANGED" ? "Completed" : "Rejected"}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((p) => !p)}
        className="px-3 py-1 text-xs border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50"
      >
        Actions ▾
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg">
          <div className="py-1 text-xs">
            {/* EXCHANGE_REQUESTED → can Approve or Reject */}
            {itemStatus === "EXCHANGE_REQUESTED" && (
              <>
                <button
                  onClick={() => { onAction("APPROVE"); setOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-blue-700"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => { onAction("REJECT"); setOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-red-600"
                >
                  ❌ Reject
                </button>
              </>
            )}

            {/* EXCHANGE_APPROVED → can Mark as Received */}
            {itemStatus === "EXCHANGE_APPROVED" && (
              <button
                onClick={() => { onAction("RECEIVED"); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-teal-700"
              >
                📥 Mark as Received
              </button>
            )}

            {/* EXCHANGE_RECEIVED → can mark Packed */}
            {itemStatus === "EXCHANGE_RECEIVED" && (
              <button
                onClick={() => { onAction("PACKED"); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-orange-700"
              >
                📦 Mark as Packed
              </button>
            )}

            {/* PACKED → can mark Shipped */}
            {itemStatus === "PACKED" && (
              <button
                onClick={() => { onAction("SHIPPED"); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-indigo-700"
              >
                🚚 Mark as Shipped
              </button>
            )}

            {/* SHIPPED → can mark Delivered */}
            {itemStatus === "SHIPPED" && (
              <button
                onClick={() => { onAction("DELIVERED"); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-teal-700"
              >
                📬 Mark as Delivered
              </button>
            )}

            {/* DELIVERED → can complete exchange */}
            {itemStatus === "DELIVERED" && (
              <button
                onClick={() => { onAction("COMPLETE"); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-green-700"
              >
                ✅ Complete Exchange
              </button>
            )}
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
        style={{ backgroundColor: color ? color.toLowerCase() : "transparent" }}
      />
      {color}
    </span>
  );
}

/* ================= PAGE ================= */

/* ================= PAGE ================= */

function ExchangePage() {
  const [data, setData] = useState<ExchangeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ExchangeRow | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [trackingWaybill, setTrackingWaybill] = useState<string | null>(null);

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [form, setForm] = useState({ adminNotes: "", rejectReason: "" });
  const [filters, setFilters] = useState({ 
    status: "", 
    search: "", 
    page: 1, 
    limit: 10 
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await ExchangeService.getAll({
        page: filters.page,
        limit: filters.limit,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });

      // Flatten: one row per exchange entry
      const rows: ExchangeRow[] = (res.data ?? []).flatMap((order: ExchangeOrder) =>
        (order.exchanges ?? []).map((entry: ExchangeEntry) => ({
          id: String(entry.details.exchangeId), // Parent Exchange document _id
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
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error(err);
      if (!isGetRequestError(err)) {
        toast.error("Failed to load exchanges");
      }
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
        const result = await ExchangeService.exchangeAction(row.orderMongoId, {
          itemId: row.newItem._id,
          action: "APPROVE",
        });

        // The approval always succeeds; the courier pickup may not. Saying
        // "approved" alone would leave nobody aware that no pickup exists.
        if (result?.pickupScheduled === false) {
          toast.error(
            `Exchange approved, but no pickup was booked: ${
              result.pickupError ?? "courier did not respond"
            }. Schedule it manually.`,
            { duration: 8000 },
          );
        } else {
          toast.success(
            result?.pickupAwb
              ? `Exchange approved. Pickup booked (${result.pickupAwb})`
              : "Exchange approved",
          );
        }
      } else if (type === "REJECT") {
        if (!form.rejectReason) {
          toast.error("Reject reason required");
          return;
        }
        await ExchangeService.exchangeAction(row.orderMongoId, {
          itemId: row.newItem._id,
          action: "REJECT",
          reason: form.rejectReason,
        });
        toast.success("Exchange rejected");

      } else if (type === "RECEIVED") {
        // Updates the order item's status to EXCHANGE_RECEIVED, updates exchange status to RECEIVED,
        // and restores the old returned item's stock in inventory on the backend.
        await ExchangeService.updateItemStatus(row.orderMongoId, row.newItem._id, "EXCHANGE_RECEIVED");
        toast.success("Marked as Received — Old Stock Restored");

      } else if (type === "PACKED") {
        await ExchangeService.updateItemStatus(row.orderMongoId, row.newItem._id, "PACKED");
        toast.success("Marked as Packed");

      } else if (type === "SHIPPED") {
        await ExchangeService.updateItemStatus(row.orderMongoId, row.newItem._id, "SHIPPED");
        toast.success("Marked as Shipped — Delhivery waybill created");

      } else if (type === "DELIVERED") {
        await ExchangeService.updateItemStatus(row.orderMongoId, row.newItem._id, "DELIVERED");
        toast.success("Marked as Delivered");

      } else if (type === "COMPLETE") {
        await ExchangeService.completeExchange(row.orderMongoId, row.newItem._id);
        toast.success("Exchange completed — old stock restored");
      }

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
          {row.oldItem && typeof row.oldItem === "object" && row.oldItem.productImage?.startsWith("http") && (
            <Image
              src={row.oldItem.productImage}
              alt={row.oldItem.productName}
              width={32}
              height={32}
              className="rounded object-cover"
            />
          )}
          <span className="text-xs">{typeof row.oldItem === "object" ? row.oldItem?.productName : "—"}</span>
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
          className={`px-2 py-0.5 text-xs rounded-lg whitespace-nowrap ${
            STATUS_STYLE[row.newItem?.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {row.newItem?.status?.replace(/_/g, " ")}
        </span>
      ),
    },

    {
      key: "details",
      label: "Courier Status",
      render: (row) => {
        const courierStatus = row.newItem?.packageStatus;
        return (
          <span
            className={`px-2 py-0.5 text-xs rounded-lg whitespace-nowrap bg-neutral-100 text-neutral-700`}
          >
            {courierStatus ? courierStatus.replace(/_/g, " ") : "—"}
          </span>
        );
      },
    },

    {
      key: "details",
      label: "Requested",
      render: (row) => (row.details.requestedAt ? new Date(row.details.requestedAt).toLocaleDateString() : "—"),
    },

    {
      key: "id",
      label: "Actions",
      render: (row) => <ActionDropdown row={row} onAction={(type) => setPending({ type, row })} />,
    },
  ];

  const filteredData = data.filter((row) => {
    if (!filters.status) return true;
    const target = filters.status.toUpperCase();
    const itemStatus = (row.newItem?.status || "").toUpperCase();
    const detailStatus = (row.details?.status || "").toUpperCase();

    if (target === "DELIVERED") {
      return itemStatus === "DELIVERED" || detailStatus === "DELIVERED";
    }
    if (target === "EXCHANGED") {
      return itemStatus === "EXCHANGED" || detailStatus === "COMPLETED" || detailStatus === "EXCHANGED";
    }
    if (target === "EXCHANGE_REQUESTED") {
      return itemStatus === "EXCHANGE_REQUESTED" || detailStatus === "REQUESTED" || detailStatus === "EXCHANGE_REQUESTED";
    }
    if (target === "EXCHANGE_APPROVED") {
      return itemStatus === "EXCHANGE_APPROVED" || detailStatus === "APPROVED" || detailStatus === "EXCHANGE_APPROVED";
    }
    if (target === "EXCHANGE_REJECTED") {
      return itemStatus === "EXCHANGE_REJECTED" || detailStatus === "REJECTED" || detailStatus === "EXCHANGE_REJECTED";
    }

    return itemStatus === target || detailStatus === target;
  });

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Exchanges</h1>
          <p className="text-sm text-neutral-400">Manage product exchange requests</p>
        </div>

        <div className="flex gap-2">
          <select
            className="border px-3 py-2 rounded-lg text-sm bg-white"
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
          >
            <option value="">All Status</option>
            <option value="EXCHANGE_REQUESTED">Requested</option>
            <option value="EXCHANGE_APPROVED">Approved</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="EXCHANGED">Exchanged</option>
            <option value="EXCHANGE_REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <DataTable<ExchangeRow>
        title="All Exchanges"
        description="Manage exchange requests"
        columns={columns}
        data={filteredData}
        loading={loading}
        paginationMode="server"
        currentPage={filters.page}
        totalPages={meta.totalPages}
        pageSize={filters.limit}
        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
        onSearchChange={(search) => setFilters((p) => ({ ...p, search, page: 1 }))}
        onView={(row) => setSelected(row)}
      />

      {/* DETAILS MODAL */}
      <AdminModal isOpen={!!selected} onClose={() => setSelected(null)} title="Exchange Details" size="lg">
        {selected && (
          <div className="space-y-5 text-sm">
            {/* Order info */}
            <div className="grid grid-cols-2 gap-3">
              <p>
                <b>Order:</b> {selected.orderNumber}
              </p>
              <p>
                <b>Customer:</b> {selected.customerName}
              </p>
              <p>
                <b>Exchange ID:</b> {selected.details.exchangeId || "—"}
              </p>
              <p>
                <b>Requested:</b> {new Date(selected.details.requestedAt).toLocaleString()}
              </p>
              <p>
                <b>Status:</b> {selected.details.status}
              </p>
              <p>
                <b>Reason:</b> {selected.details.reason || "—"}
              </p>
              {selected.details.pickupAwb && (
                <div className="col-span-2 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      Exchange Pickup (Reverse)
                    </p>
                    <p className="font-mono font-bold text-neutral-800">{selected.details.pickupAwb}</p>
                  </div>
                  <button
                    onClick={() => setTrackingWaybill(selected.details.pickupAwb!)}
                    className="bg-neutral-800 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-neutral-900 transition-colors shadow-sm"
                  >
                    Track Pickup ↗
                  </button>
                </div>
              )}

              {selected?.details?.replacementAwb && (
                <div className="col-span-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                      Replacement Shipment (Forward)
                    </p>
                    <p className="font-mono font-bold text-blue-900">{selected?.details?.replacementAwb}</p>
                  </div>
                  <button
                    onClick={() => setTrackingWaybill((selected?.details?.replacementAwb || selected?.newItem?.waybill)!)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Track Shipment ↗
                  </button>
                </div>
              )}
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
              <p>
                <b>Qty:</b> {selected.details.quantity}
              </p>
            </div>

            {/* Old item */}
            <div>
              <p className="font-semibold mb-2">Original Item</p>
              <div className="border rounded-lg p-3 flex gap-3">
                {selected.oldItem && typeof selected.oldItem === "object" && selected.oldItem.productImage?.startsWith("http") && (
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
                    Size: {selected.details.oldSize} · Color: {selected.details.oldColor || "—"} · Qty:{" "}
                    {selected.details.quantity}
                  </p>
                  <p className="text-xs text-neutral-500">₹{selected.oldItem?.unitPrice}</p>
                </div>
              </div>
            </div>

            {/* New item */}
            <div>
              <p className="font-semibold mb-2">Replacement Item</p>
              <div className="border rounded-lg p-3 flex gap-3">
                {selected.newItem && typeof selected.newItem === "object" && selected.newItem.productImage?.startsWith("http") && (
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
                    Size: {selected.details.newSize} · Color: {selected.details.newColor || "—"} · Qty:{" "}
                    {selected.details.quantity}
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
              <p>
                <b>Order:</b> {pending.row.orderNumber}
              </p>
              <p>
                <b>Customer:</b> {pending.row.customerName}
              </p>
              <p>
                <b>Product:</b> {pending.row.oldItem?.productName}
              </p>
              <p>
                <b>Exchange:</b> {pending.row.details.oldSize} → {pending.row.details.newSize}
                {pending.row.details.newColor
                  ? ` · ${pending.row.details.oldColor || "—"} → ${pending.row.details.newColor}`
                  : ""}
              </p>
              <p>
                <b>Current Status:</b> {pending.row.newItem?.status?.replace(/_/g, " ")}
              </p>
            </div>

            {pending.type === "REJECT" && (
              <textarea
                placeholder="Reject Reason (required)"
                className="w-full border p-2 rounded-lg text-sm"
                value={form.rejectReason}
                onChange={(e) => setForm((p) => ({ ...p, rejectReason: e.target.value }))}
              />
            )}

            {pending.type === "APPROVE" && (
              <p className="text-blue-600">✅ Approve this exchange request? Stock will be reserved.</p>
            )}
            {pending.type === "RECEIVED" && (
              <p className="text-teal-600">📥 Mark this exchange item as Received at warehouse? Old item stock will be restored.</p>
            )}
            {pending.type === "PACKED" && <p className="text-orange-600">📦 Mark this exchange item as Packed?</p>}
            {pending.type === "SHIPPED" && (
              <p className="text-indigo-600">🚚 Mark as Shipped? This will create a Delhivery waybill.</p>
            )}
            {pending.type === "DELIVERED" && <p className="text-teal-600">📬 Mark as Delivered to the customer?</p>}
            {pending.type === "COMPLETE" && (
              <p className="text-green-600">✅ Complete this exchange? Old item stock will be restored.</p>
            )}
          </div>
        )}
      </AdminModal>

      {trackingWaybill && <TrackingModal waybill={trackingWaybill} onClose={() => setTrackingWaybill(null)} />}
    </div>
  );
}

export default ExchangePage;

