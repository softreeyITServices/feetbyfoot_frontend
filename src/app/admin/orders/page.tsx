"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";

import {
  CodApiPaymentStatus,
  ExchangeHistoryItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  UpdateOrderStatusRequest,
} from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import { canDownloadOrderInvoicePdf } from "@/lib/orderPdf";
import { OrderPdfDownloadIcon } from "@/component/ui/tables/order/OrderPdfDownloadIcon";
import { AdminModal } from "@/component/admin/AdminModal";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";
import toast from "react-hot-toast";
import { FileDown, Loader2, MapPin } from "lucide-react";
import { TrackingModal } from "@/component/ui/modals/TrackingModal";


const isCodOrder = (order: Order) =>
  String(order.paymentMethod).toUpperCase() === "COD";

function formatDateTime(iso?: string | null) {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}

function formatMoney(amount: number, currency?: string) {
  const n =
    typeof amount === "number" && !Number.isNaN(amount)
      ? amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : String(amount);
  if (currency && currency !== "INR") return `${currency} ${n}`;
  return `₹${n}`;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(7.5rem,1fr)_minmax(0,2fr)] gap-x-3 gap-y-0.5 text-xs py-1.5 border-b border-neutral-200/80 last:border-0">
      <span className="text-neutral-500 font-medium shrink-0">{label}</span>
      <span className="text-neutral-900 wrap-break-word min-w-0">
        {value === null || value === undefined || value === "" ? "—" : value}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>
      <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
        {children}
      </div>
    </section>
  );
}

function ExchangeBlock({ ex }: { ex: ExchangeHistoryItem }) {
  return (
    <div className="rounded border border-neutral-200 bg-neutral-50 p-2 text-[11px] space-y-1">
      <DetailRow label="Exchange ID" value={ex.exchangeId} />
      <DetailRow label="Line ID" value={ex._id} />
      <DetailRow label="Status" value={ex.status} />
      <DetailRow label="Old size" value={ex.oldSize} />
      <DetailRow label="New size" value={ex.newSize} />
      <DetailRow label="Quantity" value={ex.quantity} />
      <DetailRow label="Reason" value={ex.reason} />
      <DetailRow label="Requested" value={formatDateTime(ex.requestedAt)} />
      <DetailRow label="Approved" value={formatDateTime(ex.approvedAt)} />
      <div className="flex items-center justify-between">
        <DetailRow label="Replacement AWB" value={ex.replacementAwb} />
        {ex.replacementAwb && (
          <button 
            onClick={() => (window as any).setAdminTrackingWaybill(ex.replacementAwb)}
            className="text-[10px] text-indigo-600 font-bold hover:underline"
          >
            Track ↗
          </button>
        )}
      </div>
    </div>
  );
}

function OrderLineItemDetail({ 
  item, 
  index,
  hideWaybill,
  onSeen
}: { 
  item: OrderItem; 
  index: number;
  hideWaybill?: boolean;
  onSeen?: () => void;
}) {
  // If we are showing the waybill for the first time, notify the parent
  useEffect(() => {
    if (item.waybill && !hideWaybill && onSeen) {
      onSeen();
    }
  }, [item.waybill, hideWaybill, onSeen]);

  return (
    <div className="rounded-lg border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-800 flex flex-wrap items-center gap-2 justify-between">
        <span>
          Item {index + 1}: {item.productName}
        </span>
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_STYLE[item.status] ?? "bg-neutral-200 text-neutral-700"}`}
        >
          {item.status}
        </span>
      </div>
      <div className="p-3 grid gap-3 sm:grid-cols-[auto_1fr]">
        {item.productImage ? (
          <a
            href={item.productImage}
            target="_blank"
            rel="noopener noreferrer"
            className="block shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.productImage}
              alt=""
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-neutral-200 bg-neutral-50"
            />
          </a>
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md border border-dashed border-neutral-200 bg-neutral-50 text-[10px] text-neutral-400 flex items-center justify-center text-center px-1">
            No image
          </div>
        )}
        <div className="min-w-0 space-y-0">
          <DetailRow label="Item _id" value={item._id} />
          <DetailRow label="Product ID" value={item.productId} />
          <DetailRow label="Slug" value={item.productSlug} />
          <DetailRow label="Size" value={item.size} />
          <DetailRow label="Quantity" value={item.quantity} />
          <DetailRow
            label="Unit price"
            value={formatMoney(item.unitPrice, item.currency)}
          />
          <DetailRow label="Currency" value={item.currency} />
          <DetailRow
            label="Line total"
            value={formatMoney(item.unitPrice * item.quantity, item.currency)}
          />
          {item.gstRate !== undefined && (
            <>
              <DetailRow
                label="Taxable value"
                value={formatMoney((item.unitPrice * item.quantity) - (item.gstAmount || 0), item.currency)}
              />
              <DetailRow
                label="GST"
                value={`${item.gstAmount ? formatMoney(item.gstAmount, item.currency) : "—"} (${item.gstRate}%)`}
              />
            </>
          )}
          {item.waybill && !hideWaybill && (
            <div className="flex items-center justify-between pt-1 mt-1 border-t border-neutral-100">
              <DetailRow 
                label={["RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_RECEIVED"].includes(item.status) ? "Return Waybill" : "Waybill"} 
                value={<span className="font-mono text-indigo-600 font-bold">{item.waybill}</span>} 
              />
              <button 
                onClick={() => (window as any).setAdminTrackingWaybill(item.waybill)}
                className="text-[10px] text-white bg-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-700 font-bold shadow-sm flex items-center gap-1"
              >
                <span>Track</span>
                <span>↗</span>
              </button>
            </div>
          )}
        </div>
      </div>


      {item.product && (
        <div className="px-3 pb-3 border-t border-neutral-100 pt-3">
          <p className="text-[11px] font-semibold text-neutral-600 mb-2">
            Product snapshot (at order time)
          </p>
          <DetailRow label="Snapshot _id" value={item.product._id} />
          <DetailRow label="Name" value={item.product.name} />
          {item.product.sizes?.length ? (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-[11px] border border-neutral-200 rounded-md">
                <thead>
                  <tr className="bg-neutral-50 text-left">
                    <th className="p-2 font-medium">Size</th>
                    <th className="p-2 font-medium">Qty</th>
                    <th className="p-2 font-medium">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {item.product.sizes.map((s, i) => (
                    <tr key={`${s.size}-${i}`} className="border-t border-neutral-100">
                      <td className="p-2">{s.size}</td>
                      <td className="p-2">{s.quantity}</td>
                      <td className="p-2">{s.isActive ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[11px] text-neutral-400">No sizes on snapshot</p>
          )}
        </div>
      )}

      {item.returnRequest && (
        <div className="px-3 pb-3 border-t border-neutral-100 pt-3">
          <p className="text-[11px] font-semibold text-neutral-600 mb-2">
            Return request
          </p>
          <DetailRow label="Status" value={item.returnRequest.status} />
          <DetailRow label="Reason" value={item.returnRequest.reason} />
          <DetailRow
            label="Requested at"
            value={formatDateTime(item.returnRequest.requestedAt)}
          />
        </div>
      )}

      {item.exchangeRequests && item.exchangeRequests.length > 0 && (
        <div className="px-3 pb-3 border-t border-neutral-100 pt-3 space-y-2">
          <p className="text-[11px] font-semibold text-neutral-600">
            Exchange history ({item.exchangeRequests.length})
          </p>
          {item.exchangeRequests.map((ex) => (
            <ExchangeBlock key={ex._id} ex={ex} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetailsBody({ order }: { order: OrderRow }) {
  const addr = order.shippingAddress;
  
  // Group items by waybill
  const shipmentsMap: Record<string, OrderItem[]> = {};
  order.items.forEach(item => {
    if (item.waybill) {
      if (!shipmentsMap[item.waybill]) shipmentsMap[item.waybill] = [];
      shipmentsMap[item.waybill].push(item);
    }
  });

  return (
    <div className="space-y-5 text-sm">
      <DetailSection title="Order identifiers">
        <DetailRow label="orderId" value={order.orderId} />
        <DetailRow label="Order number" value={order.orderNumber} />
        <DetailRow label="UUID" value={order.uuid} />
        <DetailRow label="User ID" value={order.userId} />
      </DetailSection>

      <DetailSection title="Status & payment">
        <DetailRow
          label="Order status"
          value={
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-[11px] ${STATUS_STYLE[order.orderStatus] ?? ""}`}
            >
              {order.orderStatus}
            </span>
          }
        />
        <DetailRow
          label="Payment status"
          value={
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-[11px] ${STATUS_STYLE[order.paymentStatus] ?? ""}`}
            >
              {order.paymentStatus}
            </span>
          }
        />
        <DetailRow label="Payment method" value={order.paymentMethod} />
        {isCodOrder(order) && (
          <>
            <DetailRow label="COD remarks" value={order.codPaymentRemarks} />
            <DetailRow
              label="COD transaction ID"
              value={order.codTransactionId}
            />
          </>
        )}
      </DetailSection>

      {/* Grouped Shipments */}
      {Object.keys(shipmentsMap).length > 0 && (
        <DetailSection title={`Shipments (${Object.keys(shipmentsMap).length})`}>
          <div className="space-y-4">
            {Object.entries(shipmentsMap).map(([waybill, items], idx) => (
              <div key={waybill} className="border border-indigo-100 rounded-lg overflow-hidden">
                <div className="bg-indigo-50 px-3 py-2 flex items-center justify-between border-b border-indigo-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-indigo-500 font-bold uppercase">Package {idx + 1}</span>
                    <span className="text-xs font-mono font-bold text-indigo-900">{waybill}</span>
                  </div>
                  <button 
                    onClick={() => (window as any).setAdminTrackingWaybill(waybill)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Track Package ↗
                  </button>
                </div>
                <div className="p-2 space-y-1">
                  {items.map(it => (
                    <div key={it._id} className="flex items-center gap-2 text-[11px] text-neutral-600">
                      <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></span>
                      <span className="font-medium">{it.productName}</span>
                      <span className="text-neutral-400">({it.size} x {it.quantity})</span>
                      <span className={`ml-auto px-1.5 rounded text-[9px] font-bold ${STATUS_STYLE[it.status]}`}>{it.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      <DetailSection title="Amounts">
        <DetailRow label="Subtotal" value={formatMoney(order.subtotal)} />
        <DetailRow
          label="Discount"
          value={formatMoney(order.discountAmount)}
        />
        <DetailRow
          label="Shipping"
          value={formatMoney(order.shippingCost)}
        />
        <DetailRow
          label="Platform fee"
          value={
            <div className="flex flex-col space-y-1">
              <span className="font-medium">{formatMoney(order.platformFee)}</span>
              {order.appliedFees && order.appliedFees.length > 0 && (
                <div className="mt-1 space-y-1.5 border-t border-neutral-100 pt-1.5">
                  {order.appliedFees.map((fee, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-neutral-600 font-medium">{fee.name}</span>
                        <span className="text-neutral-900">{formatMoney(fee.amount)}</span>
                      </div>
                      {fee.description && (
                        <span className="text-[9px] text-neutral-400 italic leading-tight">
                          {fee.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
        />
        <DetailRow 
          label="Total GST (Included)" 
          value={
            <div className="flex flex-col">
              <span className="font-medium text-emerald-600">{formatMoney(order.gstAmount)}</span>
              <span className="text-[10px] text-neutral-400">CGST: {formatMoney(order.gstAmount / 2)} | SGST: {formatMoney(order.gstAmount / 2)}</span>
            </div>
          } 
        />
        <DetailRow
          label="Grand Total"
          value={
            <span className="font-bold text-lg text-indigo-600">
              {formatMoney(order.totalAmount)}
            </span>
          }
        />
      </DetailSection>

      <DetailSection title="Shipping address">
        <DetailRow label="Address _id" value={addr._id} />
        <DetailRow label="Full name" value={addr.fullName} />
        <DetailRow label="Phone" value={addr.phone} />
        <DetailRow label="Line 1" value={addr.addressLine1} />
        <DetailRow label="Line 2" value={addr.addressLine2} />
        <DetailRow label="City" value={addr.city} />
        <DetailRow label="State" value={addr.state} />
        <DetailRow label="Pincode" value={addr.pincode} />
        <DetailRow label="Country" value={addr.country} />
        <DetailRow label="Latitude" value={addr.latitude} />
        <DetailRow label="Longitude" value={addr.longitude} />
      </DetailSection>

      <DetailSection title={`All Item Details (${order.items.length})`}>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <OrderLineItemDetail 
              key={item._id} 
              item={item} 
              index={i} 
              hideWaybill={true}
            />
          ))}
        </div>
      </DetailSection>

      <DetailSection title="Timestamps">
        <DetailRow label="Created" value={formatDateTime(order.createdAt)} />
        <DetailRow label="Updated" value={formatDateTime(order.updatedAt)} />
      </DetailSection>
    </div>
  );
}


/* ================= TYPES ================= */

type OrderRow = Order & {
  id: string;
  actions?: unknown;
  paymentUpdate?: boolean;
  /** Column key only (not stored on rows). */
  invoicePdf?: boolean;
};

type PendingStatusChange = {
  order: OrderRow;
  status: OrderStatus;
};

type PendingPaymentChange = {
  order: OrderRow;
  paymentStatus: PaymentStatus;
};

/* ================= STATUS STYLE ================= */

const STATUS_STYLE: Record<string, string> = {
  CREATED: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
  PACKED: "bg-purple-50 text-purple-700 border border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",

  PARTIALLY_RETURNED:
    "bg-orange-50 text-orange-700 border border-orange-200",
  PARTIALLY_EXCHANGED:
    "bg-orange-50 text-orange-700 border border-orange-200",
  PARTIALLY_DELIVERED:
    "bg-orange-50 text-orange-700 border border-orange-200",
  RETURNED: "bg-gray-100 text-gray-700 border border-gray-200",
  EXCHANGED: "bg-gray-100 text-gray-700 border border-gray-200",

  PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  PAID: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border border-red-200",
  REFUNDED: "bg-gray-100 text-gray-700 border border-gray-200",
  PARTIALLY_REFUNDED:
    "bg-orange-50 text-orange-700 border border-orange-200",
};

/* ================= STATUS DROPDOWN ================= */

function StatusDropdown({
  row,
  onChange,
}: {
  row: OrderRow;
  onChange: (status: OrderStatus) => void;
}) {
  // Define the next logical step for each status
  const NEXT_STEP: Partial<Record<OrderStatus, { status: OrderStatus; label: string; style: string }>> = {
    [OrderStatus.CONFIRMED]:           { status: OrderStatus.PACKED,    label: "📦 Mark as Packed",    style: "text-purple-700 hover:bg-purple-50 border-purple-200" },
    [OrderStatus.PACKED]:              { status: OrderStatus.SHIPPED,   label: "🚚 Mark as Shipped",   style: "text-indigo-700 hover:bg-indigo-50 border-indigo-200" },
    [OrderStatus.SHIPPED]:             { status: OrderStatus.DELIVERED, label: "📬 Mark as Delivered", style: "text-emerald-700 hover:bg-emerald-50 border-emerald-200" },
    [OrderStatus.PARTIALLY_DELIVERED]: { status: OrderStatus.DELIVERED, label: "📬 Mark as Delivered", style: "text-emerald-700 hover:bg-emerald-50 border-emerald-200" },
  };

  // Statuses that can be cancelled (before delivery)
  const canCancel = [
    OrderStatus.CONFIRMED,
    OrderStatus.PACKED,
    OrderStatus.SHIPPED,
    OrderStatus.PARTIALLY_DELIVERED,
  ].includes(row.orderStatus as OrderStatus);

  const next = NEXT_STEP[row.orderStatus as OrderStatus];

  // Terminal states — no action button
  if (!next && !canCancel) {
    return (
      <span className="text-xs text-neutral-400 italic">
        {row.orderStatus === OrderStatus.DELIVERED ? "Delivered" :
         row.orderStatus === OrderStatus.CANCELLED  ? "Cancelled" :
         row.orderStatus === OrderStatus.RETURNED   ? "Returned"  :
         row.orderStatus === OrderStatus.EXCHANGED  ? "Exchanged" : "—"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Next step action */}
      {next && (
        <button
          onClick={() => onChange(next.status)}
          className={`px-2.5 py-1 text-xs rounded-lg border bg-white font-medium transition-colors ${next.style}`}
        >
          {next.label}
        </button>
      )}

      {/* Cancel button — always visible for pre-delivery orders */}
      {canCancel && (
        <button
          onClick={() => onChange(OrderStatus.CANCELLED)}
          className="px-2.5 py-1 text-xs rounded-lg border border-red-200 bg-white text-red-600 font-medium hover:bg-red-50 transition-colors"
        >
          ✕ Cancel
        </button>
      )}
    </div>
  );
}


/* ================= PAGE ================= */

function OrderPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);
  const [pendingPaymentChange, setPendingPaymentChange] =
    useState<PendingPaymentChange | null>(null);
  const [codPaymentRemarks, setCodPaymentRemarks] = useState("");
  const [codTransactionIdInput, setCodTransactionIdInput] = useState("");
  const [codPaymentLoading, setCodPaymentLoading] = useState(false);
  const [trackingWaybill, setTrackingWaybill] = useState<string | null>(null);

  // Expose state for nested components (simpler than passing props through multiple levels here)
  useEffect(() => {
    (window as any).setAdminTrackingWaybill = setTrackingWaybill;
    return () => { delete (window as any).setAdminTrackingWaybill; };
  }, []);


  const [filters, setFilters] = useState({
    paymentStatus: "",
    orderStatus: "",
    search: "",
    page: 1,
    perPage: 10,
  });

  const [meta, setMeta] = useState({
    totalPages: 1,
    total: 0,
  });

  const [bulkPdfLoading, setBulkPdfLoading] = useState(false);

  /* ================= FETCH ================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await ordersService.getOrders({
        page: filters.page,
        perPage: filters.perPage,
        paymentStatus: filters.paymentStatus || undefined,
        orderStatus: filters.orderStatus || undefined,
        search: filters.search || undefined,
      });

      console.log('res', res)

      const transformed: OrderRow[] = (res.data || []).map((order) => ({
        ...order,
        id: order._id,
        paymentUpdate: order.paymentStatus === PaymentStatus.PAID,
      }));

      setOrders(transformed);
      if (res.meta) {
        setMeta({
          totalPages: res.meta.totalPages,
          total: res.meta.total,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  useEffect(() => {
    if (pendingPaymentChange) {
      setCodPaymentRemarks("");
      setCodTransactionIdInput("");
    }
  }, [pendingPaymentChange]);

  /* ================= STATUS UPDATE ================= */

  const handleStatusChange = async (
    order: OrderRow,
    status: OrderStatus
  ) => {
    try {
      const payload: UpdateOrderStatusRequest = {
        status,
        items: [
          {
            orderId: order._id,
            itemId: order.items.map((item) => item._id),
          },
        ],
      };

      await ordersService.updateOrderStatus(payload);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentStatusChange = async (
    order: OrderRow,
    paymentStatus: PaymentStatus,
    extras?: { remarks?: string; transactionId?: string }
  ): Promise<boolean> => {
    if (!isCodOrder(order)) {
      toast.error("Payment status can only be updated for COD orders here.");
      return false;
    }

    const codAllowed: Array<PaymentStatus> = [
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED,
    ];
    if (!codAllowed.includes(paymentStatus)) {
      toast.error("This payment status is not supported for COD updates.");
      return false;
    }

    try {
      await ordersService.updateCodPaymentStatus({
        orderId: order._id,
        paymentStatus: paymentStatus as CodApiPaymentStatus,
        ...(extras?.remarks ? { remarks: extras.remarks } : {}),
        ...(extras?.transactionId ? { transactionId: extras.transactionId } : {}),
      });
      toast.success("COD payment status updated");
      await fetchOrders();
      return true;
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update payment status"
      );
      return false;
    }
  };

  const requestStatusChange = (order: OrderRow, status: OrderStatus) => {
    if (order.orderStatus === status) return;
    setPendingStatusChange({ order, status });
  };

  const requestPaymentChange = (
    order: OrderRow,
    paymentStatus: PaymentStatus
  ) => {
    if (order.paymentStatus === paymentStatus) return;
    setPendingPaymentChange({ order, paymentStatus });
  };

  /* ================= COLUMNS ================= */

  const columns: Column<OrderRow>[] = [
    { key: "orderNumber", label: "Order No", sortable: true },
    {
      key: "shippingAddress",
      label: "Customer",
      render: (row) => <>{row.shippingAddress.fullName}</>,
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (row) => <>₹{row.totalAmount}</>,
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      render: (row) => <>{row.paymentMethod}</>,
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg ${STATUS_STYLE[row.paymentStatus]}`}
        >
          {row.paymentStatus}
        </span>
      ),
    },
    {
      key: "paymentUpdate",
      label: "Payment Done",
      render: (row) => {
        const cod = isCodOrder(row);
        return (
          <label
            className={`inline-flex items-center gap-2 text-xs ${cod ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
            title={
              cod
                ? undefined
                : "Only COD orders can be marked paid from admin (uses COD payment API)."
            }
          >
            <input
              type="checkbox"
              checked={row.paymentStatus === PaymentStatus.PAID}
              disabled={!cod || row.paymentStatus === PaymentStatus.PAID}
              onChange={() =>
                requestPaymentChange(row, PaymentStatus.PAID)
              }
            />
            <span>
              {!cod
                ? "—"
                : row.paymentStatus === PaymentStatus.PAID
                  ? "Paid"
                  : "Unpaid"}
            </span>
          </label>
        );
      },
    },
    {
      key: "orderStatus",
      label: "Order Status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-lg ${STATUS_STYLE[row.orderStatus]}`}
        >
          {row.orderStatus}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (row) => <>{row.items.length}</>,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "invoicePdf",
      label: "PDF",
      render: (row) => (
        <OrderPdfDownloadIcon
          enabled={canDownloadOrderInvoicePdf({
            paymentStatus: row.paymentStatus,
          })}
          enabledTitle="Download invoice (PDF)"
          disabledTitle="Invoice PDF is available once payment is completed (paid)."
          onDownload={() =>
            ordersService.downloadAdminSingleOrderInvoicePdf(
              row._id,
              row.orderNumber
            )
          }
        />
      ),
    },
    {
      key: "actions",
      label: "Update",
      render: (row) => (
        <StatusDropdown
          row={row}
          onChange={(status) => requestStatusChange(row, status)}
        />
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Orders</h1>
        <p className="text-sm text-neutral-400">
          Manage orders and update status
        </p>
      </div>

      {/* FILTERS + BULK EXPORT */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Payment Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-neutral-300 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-black"
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  paymentStatus: e.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">All Payment</option>
              {Object.values(PaymentStatus).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
              ▾
            </span>
          </div>

          {/* Order Status Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-neutral-300 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-black"
              value={filters.orderStatus}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  orderStatus: e.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">All Status</option>
              {Object.values(OrderStatus).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
              ▾
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={bulkPdfLoading}
          title="Download PDF listing all confirmed and paid orders (admin report)"
          onClick={async () => {
            setBulkPdfLoading(true);
            try {
              await ordersService.downloadAdminPaidOrdersReportPdf();
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "Failed to export PDF"
              );
            } finally {
              setBulkPdfLoading(false);
            }
          }}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium text-white bg-black rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none shrink-0"
        >
          {bulkPdfLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Exporting…
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" aria-hidden />
              Export paid orders (PDF)
            </>
          )}
        </button>
      </div>

      {/* TABLE */}
      <DataTable<OrderRow>
        title="All Orders"
        description="Manage orders"
        columns={columns}
        data={orders}
        loading={loading}
        paginationMode="server"
        currentPage={filters.page}
        totalPages={meta.totalPages}
        pageSize={filters.perPage}
        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
        onPageSizeChange={(perPage) =>
          setFilters((p) => ({ ...p, perPage, page: 1 }))
        }
        onSearchChange={(search) => setFilters((p) => ({ ...p, search, page: 1 }))}
        onView={(row) => setSelectedOrder(row)}
      />

      {/* MODAL */}
      <AdminModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        description="Full order, line items, and nested product / return / exchange data"
        size="xl"
        footer={
          <button
            className="h-8 px-4 text-xs font-medium text-white bg-black rounded-lg hover:bg-neutral-800"
            onClick={() => setSelectedOrder(null)}
          >
            Close
          </button>
        }
      >
        {selectedOrder && <OrderDetailsBody order={selectedOrder} />}
      </AdminModal>

      <ConfirmModal
        isOpen={!!pendingStatusChange}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={async () => {
          if (!pendingStatusChange) return;
          await handleStatusChange(
            pendingStatusChange.order,
            pendingStatusChange.status
          );
        }}
        title="Confirm status update"
        description={
          pendingStatusChange
            ? `Change order ${pendingStatusChange.order.orderNumber} status to ${pendingStatusChange.status}?`
            : ""
        }
        confirmText="Update Status"
        cancelText="Cancel"
        variant="default"
        loadingText="Updating..."
      />

      <AdminModal
        isOpen={!!pendingPaymentChange}
        onClose={() => {
          if (codPaymentLoading) return;
          setPendingPaymentChange(null);
        }}
        closeOnOutsideClick={!codPaymentLoading}
        title="Confirm COD payment update"
        description={
          pendingPaymentChange
            ? `Set payment to ${pendingPaymentChange.paymentStatus} for order ${pendingPaymentChange.order.orderNumber}. Optional fields are sent to the COD payment API.`
            : ""
        }
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button
              type="button"
              className="h-8 px-4 text-xs font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 disabled:opacity-50"
              disabled={codPaymentLoading}
              onClick={() => setPendingPaymentChange(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-8 px-4 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-60"
              disabled={codPaymentLoading}
              onClick={async () => {
                if (!pendingPaymentChange) return;
                const remarks = codPaymentRemarks.trim();
                const txn = codTransactionIdInput.trim();
                if (remarks.length > 2000) {
                  toast.error("Remarks must be at most 2000 characters.");
                  return;
                }
                if (txn.length > 256) {
                  toast.error("Transaction ID must be at most 256 characters.");
                  return;
                }
                setCodPaymentLoading(true);
                try {
                  const ok = await handlePaymentStatusChange(
                    pendingPaymentChange.order,
                    pendingPaymentChange.paymentStatus,
                    {
                      ...(remarks ? { remarks } : {}),
                      ...(txn ? { transactionId: txn } : {}),
                    }
                  );
                  if (ok) setPendingPaymentChange(null);
                } finally {
                  setCodPaymentLoading(false);
                }
              }}
            >
              {codPaymentLoading ? "Updating…" : "Update payment"}
            </button>
          </div>
        }
      >
        {pendingPaymentChange && (
          <div className="space-y-4 text-left">
            <div>
              <label
                htmlFor="cod-payment-remarks"
                className="block text-xs font-medium text-neutral-700 mb-1"
              >
                Remarks{" "}
                <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="cod-payment-remarks"
                value={codPaymentRemarks}
                onChange={(e) => setCodPaymentRemarks(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="e.g. Paid via UPI at delivery"
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-y min-h-18"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                {codPaymentRemarks.length} / 2000
              </p>
            </div>
            <div>
              <label
                htmlFor="cod-payment-txn"
                className="block text-xs font-medium text-neutral-700 mb-1"
              >
                Transaction ID{" "}
                <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                id="cod-payment-txn"
                type="text"
                value={codTransactionIdInput}
                onChange={(e) => setCodTransactionIdInput(e.target.value)}
                maxLength={256}
                placeholder="e.g. UPI reference"
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                {codTransactionIdInput.length} / 256
              </p>
            </div>
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

export default OrderPage;