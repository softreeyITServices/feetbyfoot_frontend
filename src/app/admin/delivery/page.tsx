"use client";

import { useCallback, useEffect, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import {
  AdminDeliveryService,
  CourierStatus,
  ShipmentRow,
  daysSince,
  humaniseStatus,
} from "@/domain/application/services/admin/delivery.service";
import toast from "react-hot-toast";

type Row = ShipmentRow & { id: string };

/** Every courier state, in the order a parcel normally passes through them. */
const STATUS_FILTERS: CourierStatus[] = [
  "MANIFESTED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "NDR",
  "RTO_INITIATED",
  "RTO_DELIVERED",
  "CANCELLED",
  "LOST",
];

const STATUS_STYLE: Partial<Record<CourierStatus, string>> = {
  DELIVERED: "bg-green-100 text-green-800",
  NDR: "bg-red-100 text-red-800",
  RTO_INITIATED: "bg-orange-100 text-orange-800",
  RTO_DELIVERED: "bg-orange-100 text-orange-800",
  LOST: "bg-red-100 text-red-800",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-800",
};

export default function AdminDeliveryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminDeliveryService.listShipments({
        status: status || undefined,
        page,
        limit,
      });
      setRows(data.rows.map((r) => ({ ...r, id: r._id })));
      setTotal(data.total);
    } catch {
      toast.error("Could not load shipments");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<Row>[] = [
    { key: "orderNumber", label: "Order", sortable: true },
    {
      key: "delhivery",
      label: "Waybill",
      render: (r) =>
        r.delhivery?.trackingUrl ? (
          <a
            href={r.delhivery.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {r.delhivery.waybill}
          </a>
        ) : (
          (r.delhivery?.waybill ?? "—")
        ),
    },
    {
      key: "orderStatus",
      label: "Courier status",
      render: (r) => {
        const s = r.delhivery?.status;
        return (
          <span
            className={`rounded px-2 py-0.5 text-xs ${
              (s && STATUS_STYLE[s]) ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {humaniseStatus(s)}
          </span>
        );
      },
    },
    {
      key: "deliveredAt",
      label: "Last update",
      render: (r) => {
        const days = daysSince(r.delhivery?.lastEventAt);
        return (
          <div>
            <div className="text-sm">{r.delhivery?.lastEvent ?? "—"}</div>
            {/* A parcel silent for days is usually a parcel in trouble. */}
            <div
              className={`text-xs ${
                days !== null && days > 3 ? "text-red-600" : "text-gray-500"
              }`}
            >
              {days === null ? "" : `${days} day${days === 1 ? "" : "s"} ago`}
            </div>
          </div>
        );
      },
    },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (r) => (
        <div>
          <div>{r.paymentMethod}</div>
          {r.paymentMethod === "COD" && (
            <div className="text-xs text-gray-500">
              {/* PAID means the courier collected cash; the money reaches our
                  bank only when Delhivery remits it. Two different facts. */}
              {r.delhivery?.codRemittedAt ? "Money received" : "Not yet remitted"}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Value",
      sortable: true,
      render: (r) => `₹${Number(r.totalAmount).toFixed(2)}`,
    },
    {
      key: "id",
      label: "Shipping Charge",
      render: (r) => {
        const chargePaise = r.delhivery?.shippingChargePaise;
        return chargePaise !== undefined && chargePaise !== null
          ? `₹${(chargePaise / 100).toFixed(2)}`
          : "—";
      },
    },
    {
      key: "id",
      label: "Failed attempts",
      render: (r) => {
        const n = r.delhivery?.ndrCount ?? 0;
        return n ? <span className="text-red-600 font-semibold">{n}</span> : "0";
      },
    },
  ];

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Deliveries</h1>
          <p className="text-sm text-gray-600">
            Every parcel handed to Delhivery. Status comes from the courier
            directly — nobody here updates it by hand.
          </p>
        </div>

        <div className="flex items-end gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded border px-2 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {humaniseStatus(s)}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              AdminDeliveryService.exportShipments(status || undefined).catch(() =>
                toast.error("Export failed"),
              )
            }
            className="rounded border px-3 py-2 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        selectable={false}
        searchKeys={["orderNumber"]}
      />

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {total} shipment{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
