"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import {
  ReturnService,
  ReturnOrder,
  ReturnItemInfo,
  ReturnStatus,
} from "@/domain/application/services/admin/return.service";
import toast from "react-hot-toast";
import Image from "next/image";
import { TrackingModal } from "@/component/ui/modals/TrackingModal";


/* ================= TYPES ================= */

type ReturnRow = ReturnOrder & {
  id: string;
};

type PendingAction =
  | { type: "APPROVE"; row: ReturnRow; item: ReturnItemInfo }
  | { type: "REJECT"; row: ReturnRow; item: ReturnItemInfo }
  | { type: "MARK_RECEIVED"; row: ReturnRow; item: ReturnItemInfo }
  | { type: "REFUND"; row: ReturnRow; item: ReturnItemInfo }
  | { type: "VIEW_DETAILS"; row: ReturnRow; item: ReturnItemInfo };

/* ================= STATUS STYLE ================= */

const STATUS_STYLE: Record<string, string> = {
  RETURN_REQUESTED: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  RETURN_APPROVED: "bg-blue-50 text-blue-700 border border-blue-200",
  RETURN_REJECTED: "bg-red-50 text-red-700 border border-red-200",
  RETURN_RECEIVED: "bg-orange-50 text-orange-700 border border-orange-200",
  REFUNDED: "bg-green-50 text-green-700 border border-green-200",
  REFUND_COMPLETED: "bg-green-50 text-green-700 border border-green-200",
  APPROVED: "bg-blue-50 text-blue-700 border border-blue-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
  RECEIVED: "bg-orange-50 text-orange-700 border border-orange-200",
  COMPLETED: "bg-green-50 text-green-700 border border-green-200",
};

/* ================= PAGE ================= */

function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination / Filter
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Action Modal
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    rejectReason: "",
    refundAmount: 0,
  });
  const [trackingWaybill, setTrackingWaybill] = useState<string | null>(null);


  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await ReturnService.getAll({
        page,
        perPage: 10,
        ...(statusFilter ? { status: statusFilter } : {}),
      });

      const list = (res.data || []).map((ro) => ({
        ...ro,
        id: ro._id,
      }));

      setReturns(list);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load returns",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [page, statusFilter]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) return;

    setActionLoading(true);
    try {
      const itemIds = pending.row.items.map(item => item._id);
      const targetOrderId = pending.row.order_id || (pending.row as any).orderId;

      if (pending.type === "APPROVE" || pending.type === "REJECT") {
        if (pending.type === "REJECT" && !form.rejectReason) {
          throw new Error("Reject reason is required");
        }
        await ReturnService.returnAction(targetOrderId, {
          itemIds: itemIds,
          action: pending.type,
          reason: pending.type === "REJECT" ? form.rejectReason : undefined,
        });
        toast.success(`Return request batch ${pending.type.toLowerCase()}ed.`);
      }

      if (pending.type === "MARK_RECEIVED") {
        await ReturnService.markReturnReceived(targetOrderId, itemIds);
        toast.success("Batch marked as received.");
      }

      if (pending.type === "REFUND") {
        await ReturnService.processRefund(
          targetOrderId,
          itemIds,
          form.refundAmount || pending.row.refundAmount || undefined,
        );
        toast.success("Refund processed for entire batch.");
      }

      setPending(null);
      setForm({ rejectReason: "", refundAmount: 0 });
      fetchReturns();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<ReturnRow>[] = [
    { key: "orderNumber", label: "Order No", sortable: true },
    {
      key: "createdAt",
      label: "Request Date",
      render: (row: ReturnRow) => (
        <span className="text-[11px] text-neutral-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : "N/A"}
        </span>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      render: (row: ReturnRow) => {
        const user = row.userId;
        return (
          <div className="text-xs">
            <p className="font-medium text-neutral-800">
              {user?.fullName || user?.name || "Unknown"}
            </p>
            <p className="text-neutral-500 text-[10px]">{user?.email || ""}</p>
          </div>
        );
      },
    },
    {
      key: "items",
      label: "Products",
      render: (row: ReturnRow) => (
        <div className="space-y-2">
          {row.items.map((item, idx) => (
            <div key={item._id || idx} className="flex items-center gap-2">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-8 h-8 object-cover rounded border"
              />
              <div className="text-[10px] leading-tight">
                <p className="font-medium text-neutral-800 line-clamp-1">{item.productName}</p>
                <p className="text-neutral-500">{item.size} x {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "returnStatus",
      label: "Status",
      render: (row: ReturnRow) => {
        const s = row.returnStatus || "UNKNOWN";
        let label = s.replace(/_/g, " ");
        if (s === "COMPLETED") label = "REFUNDED";

        return (
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap ${
              STATUS_STYLE[s] || "bg-neutral-100 text-neutral-600"
            }`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "id",
      label: "Actions",
      render: (row: ReturnRow) => {
        // A batch is considered "Decided" if all items in it have an actionStatus other than PENDING
        const allItemsDecided = row.items.every(item => item.actionStatus && item.actionStatus !== 'PENDING');
        const anyItemApproved = row.items.some(item => item.actionStatus === 'APPROVED' || item.status === 'RETURN_APPROVED');
        const allItemsReceived = row.items.every(item => item.actionStatus === 'RECEIVED' || item.status === 'RETURN_RECEIVED' || item.status === 'REFUNDED');
        
        const status = row.returnStatus || "PENDING";
        
        const detailsBtn = (
          <button
            onClick={() => setPending({ type: "VIEW_DETAILS", row, item: row.items[0] })}
            className="px-2 py-1 text-[11px] font-medium border border-neutral-200 text-neutral-700 bg-neutral-50 rounded hover:bg-neutral-100"
          >
            👁️ Details
          </button>
        );

        // 1. If not all items are decided yet, show Approve/Reject
        if (!allItemsDecided) {
          return (
            <div className="flex gap-2">
              {detailsBtn}
              <button
                onClick={() => setPending({ type: "APPROVE", row, item: row.items[0] })}
                className="px-2 py-1 text-[11px] font-medium border border-blue-200 text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
              >
                Approve
              </button>
              <button
                onClick={() => setPending({ type: "REJECT", row, item: row.items[0] })}
                className="px-2 py-1 text-[11px] font-medium border border-red-200 text-red-700 bg-red-50 rounded hover:bg-red-100"
              >
                Reject
              </button>
            </div>
          );
        }

        // 2. If decided and at least one was approved, but not all received yet
        if (anyItemApproved && !allItemsReceived) {
          return (
            <div className="flex gap-2">
              {detailsBtn}
              <button
                onClick={() => setPending({ type: "MARK_RECEIVED", row, item: row.items[0] })}
                className="px-2 py-1 text-[11px] font-medium border border-orange-200 text-orange-700 bg-orange-50 rounded hover:bg-orange-100"
              >
                📦 Mark Received
              </button>
            </div>
          );
        }

        // 3. If all received but not all refunded yet
        if (allItemsReceived && status !== 'REFUNDED' && status !== 'COMPLETED') {
          return (
            <div className="flex gap-2">
              {detailsBtn}
              <button
                onClick={() => setPending({ type: "REFUND", row, item: row.items[0] })}
                className="px-2 py-1 text-[11px] font-medium border border-green-200 text-green-700 bg-green-50 rounded hover:bg-green-100"
              >
                💰 Process Refund
              </button>
            </div>
          );
        }
        return (
          <div className="flex gap-2">
            {detailsBtn}
            <span className="text-[11px] text-neutral-400 mt-1">Done</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Returns</h1>
        <p className="text-sm text-neutral-400">
          Manage product returns, receiving, and refunds
        </p>
      </div>

      {/* FILTER */}
      <div className="flex justify-end">
        <select
          className="bg-white border border-neutral-300 text-sm rounded-lg px-3 py-2 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="RETURN_REQUESTED">Return Requested</option>
          <option value="RETURN_APPROVED">Return Approved</option>
          <option value="RETURN_RECEIVED">Return Received</option>
          <option value="REFUNDED">Refunded</option>
          <option value="RETURN_REJECTED">Return Rejected</option>
        </select>
      </div>

      <DataTable
        title="Return Requests"
        columns={columns}
        data={returns}
        loading={loading}
      />

      <AdminModal
        isOpen={!!pending}
        onClose={() => setPending(null)}
        title={
          pending?.type === "APPROVE"
            ? "Approve Return Batch"
            : pending?.type === "REJECT"
              ? "Reject Return Batch"
              : pending?.type === "MARK_RECEIVED"
                ? "Mark Batch as Received"
                : pending?.type === "REFUND"
                  ? "Process Batch Refund"
                  : "Return Details"
        }
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-neutral-50"
            >
              {pending?.type === "VIEW_DETAILS" ? "Close" : "Cancel"}
            </button>
            {pending?.type !== "VIEW_DETAILS" && (
              <button
                onClick={handleAction}
                disabled={
                  actionLoading ||
                  (pending?.type === "REJECT" && !form.rejectReason)
                }
                className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Confirm Batch Action"}
              </button>
            )}
          </div>
        }
      >
        {pending && (
          <div className="space-y-4 text-sm">
            <div className="border rounded-lg p-3 bg-neutral-50 space-y-2">
              <div className="flex justify-between items-start border-b pb-2 mb-2">
                 <div>
                   <p className="text-[10px] uppercase text-neutral-500 font-bold">Return ID</p>
                   <p className="font-mono text-xs">{pending.row.returnId}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] uppercase text-neutral-500 font-bold">Order No</p>
                   <p className="font-mono text-xs">{pending.row.orderNumber}</p>
                 </div>
              </div>
              
              <div className="flex justify-between items-start border-b pb-2 mb-2">
                 <div>
                   <p className="text-[10px] uppercase text-neutral-500 font-bold">Requested At</p>
                   <p className="font-mono text-xs">
                     {pending.row.createdAt ? new Date(pending.row.createdAt).toLocaleString() : "N/A"}
                   </p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] uppercase text-neutral-500 font-bold">Status</p>
                   <p className="text-xs font-bold">{pending.row.returnStatus?.replace(/_/g, " ")}</p>
                 </div>
              </div>
              
              <p className="text-xs font-bold text-neutral-800">Items in this request:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pending.row.items.map((item, idx) => (
                  <div key={item._id || idx} className="flex justify-between items-center bg-white p-2 rounded border border-neutral-100">
                    <div className="flex items-center gap-2">
                      <img src={item.productImage} className="w-8 h-8 rounded object-cover" />
                      <div>
                        <p className="font-medium text-[11px]">{item.productName}</p>
                        <p className="text-[10px] text-neutral-500">{item.size} x {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold">₹{item.unitPrice * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {pending.type === "VIEW_DETAILS" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-3 space-y-1">
                  <h4 className="font-semibold text-neutral-800 mb-2 border-b pb-1">
                    Customer Details
                  </h4>
                  <p>
                    <b>Name:</b>{" "}
                    {pending.row.shippingAddress?.fullName ||
                      (pending.row.userId as any)?.fullName || (pending.row.userId as any)?.name}
                  </p>
                  <p>
                    <b>Phone:</b> {pending.row.shippingAddress?.phone || "N/A"}
                  </p>
                  <p>
                    <b>Address:</b> {pending.row.shippingAddress?.addressLine1}{" "}
                    {pending.row.shippingAddress?.addressLine2 || ""},{" "}
                    {pending.row.shippingAddress?.city},{" "}
                    {pending.row.shippingAddress?.state} -{" "}
                    {pending.row.shippingAddress?.pincode}
                  </p>
                </div>

                <div className="border rounded-lg p-3 bg-blue-50 border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-2 border-b border-blue-200 pb-1">
                    Refund Summary
                  </h4>
                  <div className="flex justify-between text-blue-800">
                    <span>Order Total:</span>
                    <span className="font-bold">₹{pending.row.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>Return Subtotal:</span>
                    <span>₹{pending.row.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0)}</span>
                  </div>
                  <div className="flex justify-between text-blue-900 text-lg font-bold mt-2 pt-2 border-t border-blue-200">
                    <span>Total Refund:</span>
                    <span>₹{pending.row.refundAmount}</span>
                  </div>

                </div>

                {pending.row.waybill && (
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-indigo-500 font-bold uppercase">Return Waybill</p>
                      <p className="font-mono font-bold text-indigo-900">{pending.row.waybill}</p>
                    </div>
                    <button 
                      onClick={() => setTrackingWaybill(pending.row.waybill!)}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Track Return ↗
                    </button>
                  </div>
                )}
              </div>

            )}

            {pending.type === "REJECT" && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Rejection Reason for entire batch <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Why is this return batch rejected?"
                  className="w-full border p-2 rounded-lg text-sm outline-none focus:border-black"
                  value={form.rejectReason}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rejectReason: e.target.value }))
                  }
                />
              </div>
            )}

            {pending.type === "APPROVE" && (
              <p className="text-blue-600">
                ✅ Approve this entire return batch? Customer will be notified.
              </p>
            )}

            {pending.type === "MARK_RECEIVED" && (
              <p className="text-orange-600">
                📦 Mark all items in this return as received at the warehouse?
              </p>
            )}

            {pending.type === "REFUND" && (
              <div className="space-y-3">
                <p className="text-green-600 font-medium">💰 Initiate total refund for this batch?</p>
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                  <p className="text-xs text-green-700 font-medium mb-1">Total Refund Amount</p>
                  <p className="text-xl font-bold text-green-900">
                    ₹{pending.row.refundAmount}
                  </p>
                  <p className="text-[10px] text-green-600 mt-1">
                    This covers all {pending.row.items.length} item(s) in this return.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {trackingWaybill && (
        <TrackingModal
          waybill={trackingWaybill}
          onClose={() => setTrackingWaybill(null)}
        />
      )}
    </div>

  );
}

export default ReturnsPage;
