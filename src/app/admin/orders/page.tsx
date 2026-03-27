"use client";

import React, { useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";

import {
  Order,
  OrderStatus,
  PaymentStatus,
  UpdateOrderStatusRequest,
} from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import { AdminModal } from "@/component/admin/AdminModal";
import { ConfirmModal } from "@/component/admin/modal/ConfirmModal";

/* ================= TYPES ================= */

type OrderRow = Order & {
  id: string;
  actions?: unknown;
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // ✅ Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="px-3 py-1 text-xs rounded-lg border border-neutral-300 bg-white flex items-center gap-2 hover:bg-neutral-50"
      >
        {row.orderStatus}
        <span className="text-xs">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg">
          <div className="py-1 max-h-60 overflow-auto">
            {Object.values(OrderStatus).map((status) => (
              <button
                key={status}
                onClick={() => {
                  onChange(status);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 flex justify-between ${row.orderStatus === status ? "font-semibold" : ""
                  }`}
              >
                {status}
                {row.orderStatus === status && "✓"}
              </button>
            ))}
          </div>
        </div>
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

  const [filters, setFilters] = useState({
    paymentStatus: "",
    orderStatus: "",
  });

  /* ================= FETCH ================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await ordersService.getOrders({
        page: 1,
        perPage: 10,
        paymentStatus: filters.paymentStatus || undefined,
        orderStatus: filters.orderStatus || undefined,
      });

      const transformed: OrderRow[] = (res.data || []).map((order) => ({
        ...order,
        id: order._id,
      }));

      setOrders(transformed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  /* ================= STATUS UPDATE ================= */

  const handleStatusChange = async (
    order: OrderRow,
    status: OrderStatus
  ) => {
    try {
      const payload: UpdateOrderStatusRequest = {
        status,
        items: order.items.map((item) => ({
          orderId: order._id,
          itemId: item._id,
        })),
      };

      await ordersService.updateOrderStatus(payload);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentStatusChange = async (
    order: OrderRow,
    paymentStatus: PaymentStatus
  ) => {
    try {
      const payload: UpdateOrderStatusRequest = {
        status: order.orderStatus,
        paymentStatus,
        items: order.items.map((item) => ({
          orderId: order._id,
          itemId: item._id,
        })),
      };

      await ordersService.updateOrderStatus(payload);
      fetchOrders();
    } catch (err) {
      console.error(err);
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
      render: (row) => (
        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={row.paymentStatus === PaymentStatus.PAID}
            disabled={row.paymentStatus === PaymentStatus.PAID}
            onChange={(e) =>
              requestPaymentChange(row, PaymentStatus.PAID)
            }
          />
          <span>
            {row.paymentStatus === PaymentStatus.PAID ? "Paid" : "Unpaid"}
          </span>
        </label>
      ),
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

      {/* FILTERS */}
      <div className="flex gap-3">
        {/* Payment Filter */}
        <div className="relative">
          <select
            className="appearance-none bg-white border border-neutral-300 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-black"
            value={filters.paymentStatus}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                paymentStatus: e.target.value,
              }))
            }
          >
            <option value="">All Payment</option>
            {Object.values(PaymentStatus).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* Arrow */}
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
              }))
            }
          >
            <option value="">All Status</option>
            {Object.values(OrderStatus).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* Arrow */}
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">
            ▾
          </span>
        </div>
      </div>

      {/* TABLE */}
      <DataTable<OrderRow>
        title="All Orders"
        description="Manage orders"
        columns={columns}
        data={orders}
        loading={loading}
        searchKeys={["orderNumber"]}
        onView={(row) => setSelectedOrder(row)}
      />

      {/* MODAL */}
      <AdminModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        description="Detailed view of the order"
        size="lg"
        footer={
          <button
            className="h-8 px-4 text-xs font-medium text-white bg-black rounded-lg hover:bg-neutral-800"
            onClick={() => setSelectedOrder(null)}
          >
            Close
          </button>
        }
      >
        {selectedOrder && (
          <div className="space-y-2 text-sm">
            <p>
              <b>Order:</b> {selectedOrder.orderNumber}
            </p>
            <p>
              <b>Customer:</b> {selectedOrder.shippingAddress.fullName}
            </p>
            <p>
              <b>Total:</b> ₹{selectedOrder.totalAmount}
            </p>

            <div className="mt-4">
              <b>Items:</b>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {selectedOrder.items.map((item) => (
                  <li key={item._id}>
                    {item.productName} ({item.size}) × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
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

      <ConfirmModal
        isOpen={!!pendingPaymentChange}
        onClose={() => setPendingPaymentChange(null)}
        onConfirm={async () => {
          if (!pendingPaymentChange) return;
          await handlePaymentStatusChange(
            pendingPaymentChange.order,
            pendingPaymentChange.paymentStatus
          );
        }}
        title="Confirm payment update"
        description={
          pendingPaymentChange
            ? `Change payment status for order ${pendingPaymentChange.order.orderNumber} to ${pendingPaymentChange.paymentStatus}?`
            : ""
        }
        confirmText="Update Payment"
        cancelText="Cancel"
        variant="default"
        loadingText="Updating..."
      />
    </div>
  );
}

export default OrderPage;