"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShopIcon } from "@/icons/ShopIcon";
import { NoOrderIcon } from "@/icons/NoOrderIcon";
import toast from "react-hot-toast";

import {
  Order,
  OrderMeta,
  PaginatedOrders,
  OrderItem,
  OrderStatus,
} from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import { DataTable } from "@/component/ui/DataTable";
import { getStatusBadgeClasses } from "@/lib/common";
import ExchangeModal from "@/component/ui/modals/ExchangeModal";
import { RowActionMenu } from "@/component/ui/tables/order/RowActionMenu";
import ReturnModal from "@/component/ui/modals/ReturnModal";
import UpdateAddressModal from "@/component/ui/modals/UpdateAddressModal";
import CancelOrderModal from "@/component/ui/modals/CancelOrderModal";
import { useLayout } from "@/domain/application/context/LayoutContext";

interface FormattedOrder {
  orderId: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  addressId: string;
}

interface ExchangeOrderData {
  orderId: string;
  items: OrderItem[];
  status: string;
}

interface ReturnOrderData {
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

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<ReturnOrderData | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressOrderId, setAddressOrderId] = useState<string | null>(null);
  const [addressOrder, setAddressOrder] = useState<FormattedOrder | null>(null);

  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelOrderNumber, setCancelOrderNumber] = useState<string>("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);


  const fetchingRef = useRef(false);
  const { setTitle, setSubtitle } = useLayout();

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

  useEffect(() => {
    setTitle('My Orders');
    setSubtitle('View and manage your past orders.');
  }, []);

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
    toast.success("Exchange request submitted successfully!");
    await fetchOrders();
  };

  const formattedOrders: FormattedOrder[] = orders.map((order) => ({
    orderId: order._id,
    orderNumber: order.orderNumber,
    date: new Date(order.createdAt).toLocaleDateString(),
    total: order.totalAmount,
    status: order.orderStatus,
    items: order.items,
    addressId: order.shippingAddress?._id
  }));

  const totalPages = meta?.totalPages ?? 1;

  const handleReturn = (order: FormattedOrder) => {
    openReturnModal({
      orderId: order.orderId,
      items: order.items,
      status: order.status,
    });
  };

  const handleAddressChange = (order: FormattedOrder) => {
    setAddressOrderId(order.orderId);
    setAddressOrder(order);
    setAddressModalOpen(true);
  };

  const handleCancel = (order: FormattedOrder) => {
    setCancelOrderId(order.orderId);
    setCancelOrderNumber(order.orderNumber);
    setIsCancelModalOpen(true);
  };

  const handleCancelSuccess = async () => {
    setIsCancelModalOpen(false);
    setCancelOrderId(null);
    toast.success("Order cancelled successfully!");
    await fetchOrders();
  };


  const openReturnModal = (order: ReturnOrderData) => {
    setReturnOrder(order);
    setIsReturnModalOpen(true);
  };

  const closeReturnModal = () => {
    setIsReturnModalOpen(false);
    setReturnOrder(null);
  };

  const handleReturnSuccess = () => {
    closeReturnModal();
    fetchOrders(); // or whatever you use to refresh
  };


  return (
    <div className="px-6">
      <div className="max-w-5xl mx-auto">
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
            // searchable
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
                accessor: (row) => {
                  const actions = [];

                  // Exchange only if delivered
                  if (row.status === "DELIVERED") {
                    actions.push({
                      label: "Exchange Item",
                      onClick: () => openExchangeModal(row),
                    });
                  }

                  // Return only if delivered
                  if (row.status === "DELIVERED") {
                    actions.push({
                      label: "Return Item",
                      onClick: () => handleReturn(row),
                    });
                  }

                  // Change address only if processing
                  if (row.status === 'CONFIRMED' || row.status === 'PACKED') {
                    actions.push({
                      label: "Change Address",
                      onClick: () => handleAddressChange(row),
                    });
                  }

                  // Cancel only if not delivered
                  if (row.status === 'CONFIRMED' || row.status === 'PACKED') {
                    actions.push({
                      label: "Cancel Order",
                      onClick: () => handleCancel(row),
                      danger: true,
                    });
                  }

                  // If no actions available
                  if (actions.length === 0) {
                    return <span className="text-xs text-gray-400"></span>;
                  }

                  return <RowActionMenu actions={actions} />;
                },
              }

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

        {returnOrder && (
          <ReturnModal
            open={isReturnModalOpen}
            order={returnOrder}
            onClose={closeReturnModal}
            onSuccess={handleReturnSuccess}
          />
        )}

        {addressOrderId && (
          <UpdateAddressModal
            open={addressModalOpen}
            orderId={addressOrderId}
            currentAddressId={addressOrder?.addressId}
            onClose={() => {
              setAddressModalOpen(false);
              setAddressOrderId(null);
            }}
            onSuccess={() => {
              setAddressModalOpen(false);
              setAddressOrderId(null);
              fetchOrders();
              toast.success("Delivery address updated successfully!");
            }}
          />
        )}

        {cancelOrderId && (
          <CancelOrderModal
            open={isCancelModalOpen}
            orderId={cancelOrderId}
            orderNumber={cancelOrderNumber}
            onClose={() => {
              setIsCancelModalOpen(false);
              setCancelOrderId(null);
            }}
            onSuccess={handleCancelSuccess}
          />
        )}

      </div>
    </div>
  );
}