"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShopIcon } from "@/icons/ShopIcon";
import { NoOrderIcon } from "@/icons/NoOrderIcon";

import {
  Order,
  OrderMeta,
  PaginatedOrders,
  OrderItem,
} from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import { DataTable } from "@/component/ui/DataTable";
import { getStatusBadgeClasses } from "@/lib/common";
import ExchangeModal from "@/component/ui/ExchangeModal";

interface FormattedOrder {
  orderId: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  items: OrderItem[];
}

interface ExchangeOrderData {
  orderId: string;
  items: OrderItem[];
  status: string;
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [meta, setMeta] = useState<OrderMeta>();

  const [exchangeOrder, setExchangeOrder] = useState<ExchangeOrderData | null>(null);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  const fetchingRef = useRef(false);

  /* ---------------- FETCH ORDERS ---------------- */
  const fetchOrders = useCallback(async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const response: PaginatedOrders =
        await ordersService.getOrders({
          page,
          perPage: pageSize,
        });

      setOrders(response?.data ?? []);
      setMeta(response?.meta);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch orders", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ---------------- EXCHANGE HANDLERS ---------------- */
  const openExchangeModal = (row: FormattedOrder) => {
    setExchangeOrder({
      orderId: row.orderId,
      items: row.items,
      status: row.status,
    });
    setIsExchangeModalOpen(true);
  };

  const closeExchangeModal = () => {
    setIsExchangeModalOpen(false);
    setExchangeOrder(null);
  };

  const handleExchangeSuccess = async () => {
    closeExchangeModal();
    await fetchOrders();
  };

  const formattedOrders: FormattedOrder[] = orders.map((order) => ({
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    date: new Date(order.createdAt).toLocaleDateString(),
    total: order.totalAmount,
    status: order.orderStatus,
    items: order.items,
  }));

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-xl font-semibold text-gray-900">
            My Orders
          </h1>
          <p className="text-gray-500 mt-2 text-md">
            View and manage your past orders.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-gray-500 text-center">
            Loading orders...
          </p>
        )}

        {!loading && orders.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-8">
              <NoOrderIcon width={30} height={40} />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              No orders found
            </h2>

            <p className="text-gray-500 max-w-md mb-8">
              It looks like you haven&apos;t made any orders yet.
              When you do, they will appear here.
            </p>

            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 rounded-md shadow-sm transition-all duration-200"
            >
              <ShopIcon width={18} height={18} />
              Browse products
            </button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <DataTable
            loading={loading}
            data={formattedOrders}
            searchable
            pagination={{
              page,
              totalPages,
              totalItems: meta?.total ?? 0,
              pageSize: pageSize,
              onPageChange: (newPage: number) => {
                setPage(newPage);
              },
              onPageSizeChange: (size: number) => {
                setPageSize(size);
                setPage(1);
              },
            }}
            columns={[
              {
                header: "Order",
                accessor: (row) => (
                  <div>
                    <p className="font-medium">{row.orderNumber}</p>
                    <p className="text-xs text-gray-500">{row.date}</p>
                  </div>
                ),
              },
              {
                header: "Items",
                accessor: (row) => (
                  <div className="space-y-1">
                    {row.items.map((item) => (
                      <div key={item._id}>
                        {item.productName} (Size {item.size})
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                header: "Total",
                accessor: (row) => `₹${row.total}`,
              },
              {
                header: "Status",
                accessor: (row) => (
                  <span
                    className={`px-2 py-1 text-xs rounded ${getStatusBadgeClasses(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                ),
              },
              {
                header: "Action",
                accessor: (row) => (
                  <div className="space-y-1">
                    {row.status === "DELIVERED" ? (
                      <button
                        onClick={() => openExchangeModal(row)}
                        className="block text-blue-600 hover:underline text-xs"
                      >
                        Exchange
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Processing</span>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}

        {/* Exchange Modal */}
        {exchangeOrder && (
          <ExchangeModal
            open={isExchangeModalOpen}
            order={exchangeOrder}
            onClose={closeExchangeModal}
            onSuccess={handleExchangeSuccess}
          />
        )}
      </div>
    </div>
  );
}