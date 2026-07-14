"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import { AdminModal } from "@/component/admin/AdminModal";
import {
  AdminDeliveryService,
  NdrAction,
  OpenNdrRow,
  daysSince,
} from "@/domain/application/services/admin/delivery.service";
import toast from "react-hot-toast";

type NdrRow = OpenNdrRow & { id: string };

type PendingAction = { row: NdrRow; act: NdrAction } | null;

/**
 * Delhivery makes a limited number of delivery attempts before returning the
 * parcel to us as an RTO. Once that starts there is no way to stop it — the
 * NDR API accepts RE-ATTEMPT, DEFER_DLV and EDIT_DETAILS, but there is no
 * "send it back" and no "cancel the return". So the age of a failed attempt
 * is the whole story on this screen, and the oldest rows are the urgent ones.
 */
const urgencyClass = (days: number | null): string => {
  if (days === null) return "text-gray-500";
  if (days >= 3) return "text-red-600 font-semibold";
  if (days >= 1) return "text-amber-600 font-medium";
  return "text-gray-700";
};

export default function AdminNdrPage() {
  const [rows, setRows] = useState<NdrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingAction>(null);
  const [deferDate, setDeferDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminDeliveryService.listOpenNdrs();
      setRows(data.map((r) => ({ ...r, id: r._id })));
    } catch {
      toast.error("Could not load failed deliveries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!pending) return;
    const waybill = pending.row.delhivery?.waybill;
    if (!waybill) {
      toast.error("This order has no waybill");
      return;
    }
    if (pending.act === "DEFER_DLV" && !deferDate) {
      toast.error("Pick a delivery date");
      return;
    }

    setSubmitting(true);
    try {
      await AdminDeliveryService.actOnNdr(waybill, {
        act: pending.act,
        ...(pending.act === "DEFER_DLV" ? { deferred_date: deferDate } : {}),
      });
      // Delhivery's NDR API is asynchronous: it returns a job id, not a result.
      // The row stays open until a later scan proves the parcel moved.
      toast.success("Request sent to Delhivery. It stays listed until the parcel moves.");
      setPending(null);
      setDeferDate("");
      void load();
    } catch {
      toast.error("Delhivery rejected the request");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<NdrRow>[] = [
    { key: "orderNumber", label: "Order", sortable: true },
    {
      key: "delhivery",
      label: "Waybill",
      render: (r) => r.delhivery?.waybill ?? "—",
    },
    {
      key: "shippingAddress",
      label: "Customer",
      render: (r) => (
        <div>
          <div>{r.shippingAddress?.fullName ?? "—"}</div>
          <div className="text-xs text-gray-500">
            {r.shippingAddress?.phone} · {r.shippingAddress?.pincode}
          </div>
        </div>
      ),
    },
    {
      key: "orderStatus",
      label: "Why it failed",
      render: (r) => (
        <span className="text-sm">{r.delhivery?.ndrReason ?? "Not stated"}</span>
      ),
    },
    {
      key: "totalAmount",
      label: "Attempts",
      render: (r) => {
        const count = r.delhivery?.ndrCount ?? 0;
        return (
          <span className={count >= 2 ? "text-red-600 font-semibold" : ""}>
            {count}
          </span>
        );
      },
    },
    {
      key: "paymentMethod",
      label: "Waiting",
      render: (r) => {
        const days = daysSince(r.delhivery?.ndrLastAt);
        return (
          <span className={urgencyClass(days)}>
            {days === null ? "—" : `${days} day${days === 1 ? "" : "s"}`}
          </span>
        );
      },
    },
    {
      key: "_id",
      label: "Value",
      render: (r) => (
        <div>
          <div>₹{Number(r.totalAmount).toFixed(2)}</div>
          {/* An RTO on COD loses the goods and both freight legs. */}
          {r.paymentMethod === "COD" && (
            <span className="text-xs text-red-600">COD — at risk</span>
          )}
        </div>
      ),
    },
    {
      key: "shippingAddress",
      label: "Action",
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => setPending({ row: r, act: "RE-ATTEMPT" })}
            className="rounded bg-black px-2 py-1 text-xs text-white"
          >
            Reattempt
          </button>
          <button
            onClick={() => setPending({ row: r, act: "DEFER_DLV" })}
            className="rounded border px-2 py-1 text-xs"
          >
            Defer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Failed Deliveries</h1>
          <p className="text-sm text-gray-600">
            Delhivery tried to deliver these and could not. If nobody acts, the
            parcel is returned to us automatically — and a returned COD order
            means the goods and both freight legs are lost.
          </p>
        </div>
        <button
          onClick={() =>
            AdminDeliveryService.exportOpenNdrs().catch(() =>
              toast.error("Export failed"),
            )
          }
          className="rounded border px-3 py-2 text-sm"
        >
          Export CSV
        </button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        searchKeys={["orderNumber"]}
      />

      <AdminModal
        isOpen={!!pending}
        onClose={() => {
          setPending(null);
          setDeferDate("");
        }}
        title={
          pending?.act === "DEFER_DLV" ? "Defer delivery" : "Request a reattempt"
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Order <strong>{pending?.row.orderNumber}</strong> · waybill{" "}
            {pending?.row.delhivery?.waybill}
          </p>

          {pending?.act === "DEFER_DLV" && (
            <label className="block text-sm">
              Deliver on
              <input
                type="date"
                value={deferDate}
                onChange={(e) => setDeferDate(e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1"
              />
              {/* Delhivery rejects anything beyond 6 days from the first
                  pending date, so let them enforce it rather than guess here. */}
              <span className="text-xs text-gray-500">
                Delhivery allows up to 6 days from the first failed attempt.
              </span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setPending(null)}
              className="rounded border px-3 py-1 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send to Delhivery"}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
