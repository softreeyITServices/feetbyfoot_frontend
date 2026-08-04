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
  PaymentStatus,
} from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import { DataTable } from "@/component/ui/DataTable";
import { getStatusBadgeClasses } from "@/lib/common";
import { canDownloadOrderInvoicePdf } from "@/lib/orderPdf";
import { formatDateIST } from "@/lib/formatDate";
import ExchangeModal from "@/component/ui/modals/ExchangeModal";
import { RowActionMenu } from "@/component/ui/tables/order/RowActionMenu";
import { OrderPdfDownloadIcon } from "@/component/ui/tables/order/OrderPdfDownloadIcon";
import ReturnModal from "@/component/ui/modals/ReturnModal";
import UpdateAddressModal from "@/component/ui/modals/UpdateAddressModal";
import CancelOrderModal from "@/component/ui/modals/CancelOrderModal";
import { useLayout } from "@/domain/application/context/LayoutContext";
import RateProductModal from "@/component/ui/modals/RateProductModal";
import { TrackingModal } from "@/component/ui/modals/TrackingModal";


interface FormattedOrder {
  orderId: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
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

  const [exchangeOrder, setExchangeOrder] = useState<ExchangeOrderData | null>(
    null,
  );
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<ReturnOrderData | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressOrderId, setAddressOrderId] = useState<string | null>(null);
  const [addressOrder, setAddressOrder] = useState<FormattedOrder | null>(null);

  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelOrderNumber, setCancelOrderNumber] = useState<string>("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<FormattedOrder | null>(null);
  const [trackingWaybill, setTrackingWaybill] = useState<string | null>(null);


  const fetchingRef = useRef(false);
  const { setTitle, setSubtitle } = useLayout();

  /* ---------------- FETCH ORDERS ---------------- */
  const fetchOrders = useCallback(async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const response: PaginatedOrders = await ordersService.getOrders({
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
    setTitle("My Orders");
    setSubtitle("View and manage your past orders.");
  }, []);

  /* ---------------- EXCHANGE HANDLERS ---------------- */
  const openExchangeModal = (row: FormattedOrder) => {
    console.log(row.items);
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

  const handleRating = (order: FormattedOrder) => {
    setRatingOrder(order);
    setIsRatingModalOpen(true);
  };

  const formattedOrders: FormattedOrder[] = orders.map((order) => ({
    orderId: order._id,
    orderNumber: order.orderNumber,
    date: formatDateIST(order.createdAt),
    total: order.totalAmount,
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    items: order.items,
    addressId: order.shippingAddress?._id,
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
    <div className="px-0 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-gray-500 text-center">Loading orders...</p>
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
              It looks like you haven&apos;t made any orders yet. When you do,
              they will appear here.
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
                accessor: (row) => {
                  return (
                    <div className="space-y-4">
                      {(() => {
                        const seenWaybills = new Set();
                        return row.items.map((item) => {
                        
                        // Collect tracking info for THIS item
                        const itemTracks: any[] = [];
                        
                        // 1. Shipment Tracking (Forward or Reverse)
                        const isExchanging = item.exchangeRequests && item.exchangeRequests.length > 0;
                        const isReturning = ["RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_RECEIVED"].includes(item.status);
                        
                        // Hide original waybill if it's an active exchange (not yet shipped), 
                        // if the order is only packed, or if a return is requested but not yet approved.
                        const hideOriginalWaybill = 
                          (isExchanging && !["SHIPPED", "DELIVERED", "COMPLETED"].includes(item.status)) || 
                          status === "PACKED" || 
                          item.status === "RETURN_REQUESTED";

                        if (item.waybill && !hideOriginalWaybill && !seenWaybills.has(item.waybill)) {
                          seenWaybills.add(item.waybill);
                          const isReverse = isReturning;
                          itemTracks.push({
                            waybill: item.waybill,
                            trackingUrl: item.trackingUrl,
                            label: isReverse ? "Return Pickup" : "Order Delivery",
                            isReverse: isReverse,
                            status: item.status
                          });
                        }

                        // 2. Exchange Requests (Show both Pickup and Replacement if distinct)
                        if (item.exchangeRequests && item.exchangeRequests.length > 0) {
                          item.exchangeRequests.forEach((req) => {
                            // Show Pickup Link ONLY if replacement hasn't shipped yet
                            if (req.pickupAwb && !req.replacementAwb && !seenWaybills.has(req.pickupAwb)) {
                              seenWaybills.add(req.pickupAwb);
                              itemTracks.push({
                                waybill: req.pickupAwb,
                                trackingUrl: item.trackingUrl,
                                label: "Exchange Pickup",
                                isReverse: true,
                                status: req.status,
                              });
                            }
                            // Show Replacement Link if exists
                            if (req.replacementAwb && !seenWaybills.has(req.replacementAwb)) {
                              seenWaybills.add(req.replacementAwb);
                              itemTracks.push({
                                waybill: req.replacementAwb,
                                trackingUrl: item.trackingUrl,
                                label: "Replacement Shipment",
                                isReverse: false,
                                status: req.status,
                              });
                            }
                          });
                        }

                        const getBadgeStyle = (s: string) => {
                          switch (s) {
                            case "RETURN_REQUESTED":
                            case "RETURN_APPROVED":
                            case "RETURN_RECEIVED":
                              return "bg-amber-100 text-amber-700";
                            case "EXCHANGE_REQUESTED":
                            case "EXCHANGE_APPROVED":
                            case "REPLACEMENT_SHIPPED":
                              return "bg-blue-100 text-blue-700";
                            case "RETURNED":
                            case "COMPLETED":
                              return "bg-green-100 text-green-700";
                            case "CANCELLED":
                              return "bg-red-100 text-red-700";
                            default:
                              return "bg-gray-100 text-gray-700 border border-gray-200";
                          }
                        };

                        const getReadableStatus = (s: string) => {
                          return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
                        };

                        return (
                          <div key={item._id} className="text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">
                                  {item.productName} ({item.size})
                                </p>
                              </div>
                              {status !== "DELIVERED" && status !== "SHIPPED" && (
                                <span className={`w-fit text-[10px] px-2 py-0.5 rounded-full font-medium ${getBadgeStyle(status)}`}>
                                  {getReadableStatus(status)}
                                </span>
                              )}
                            </div>

                            {/* Item-specific Tracking Links */}
                            <div className="space-y-2 mt-2">
                              {itemTracks.map((track, idx) => (
                                <div
                                  key={`${track.waybill}-${idx}`}
                                  className={`flex flex-col gap-1 p-2 rounded border ${
                                    track.isReverse 
                                      ? "bg-gray-50/80 border-gray-200" 
                                      : "bg-blue-50/50 border-blue-100/50"
                                  }`}
                                >
                                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                                    track.isReverse ? "text-gray-500" : "text-blue-600"
                                  }`}>
                                    {track.label}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-mono text-gray-600">
                                      {track.waybill}
                                    </span>
                                    <button
                                      onClick={() => setTrackingWaybill(track.waybill)}
                                      className={`text-[11px] font-medium flex items-center gap-1 hover:underline ${
                                        track.isReverse ? "text-gray-700" : "text-blue-700 font-bold"
                                      }`}
                                    >
                                      Track {track.isReverse ? "Pickup" : "Order"} →
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  );
                },
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
                      row.status,
                    )}`}
                  >
                    {row.status}
                  </span>
                ),
              },
              {
                header: "Invoice",
                accessor: (row) => (
                  <OrderPdfDownloadIcon
                    enabled={canDownloadOrderInvoicePdf({
                      paymentStatus: row.paymentStatus,
                    })}
                    enabledTitle="Download invoice (PDF)"
                    disabledTitle="Invoice PDF is available once payment is completed (paid)."
                    onDownload={() =>
                      ordersService.downloadCustomerInvoicePdf(
                        row.orderId,
                        row.orderNumber,
                      )
                    }
                  />
                ),
              },
              {
                header: "Action",
                accessor: (row) => {
                  const actions = [];

                  const isPartiallyDelivered = [
                    "DELIVERED",
                    "PARTIALLY_DELIVERED",
                    "PARTIALLY_RETURNED",
                    "PARTIALLY_EXCHANGED",
                  ].includes(row.status);

                  // Exchange only if delivered or partially delivered
                  if (isPartiallyDelivered) {
                    // Only show if at least one item is actually in DELIVERED status
                    const hasExchangableItems = row.items.some(
                      (item) => item.status === "DELIVERED",
                    );
                    if (hasExchangableItems) {
                      actions.push({
                        label: "Exchange Item",
                        onClick: () => openExchangeModal(row),
                      });
                    }
                  }

                  // Return only if delivered or partially delivered
                  if (isPartiallyDelivered) {
                    // Only show if at least one item is returnable (DELIVERED status + quantity left)
                    const hasReturnableItems = row.items.some((item) => {
                      const returnable =
                        item.quantity -
                        (item.returnRequestedQuantity || 0) -
                        (item.returnedQuantity || 0);
                      return item.status === "DELIVERED" && returnable > 0;
                    });

                    if (hasReturnableItems) {
                      actions.push({
                        label: "Return Item",
                        onClick: () => handleReturn(row),
                      });
                    }
                  }

                  // Change address only if processing
                  if (row.status === "CONFIRMED" || row.status === "PACKED") {
                    actions.push({
                      label: "Change Address",
                      onClick: () => handleAddressChange(row),
                    });
                  }

                  // Cancel only if not delivered
                  if (row.status === "CONFIRMED" || row.status === "PACKED") {
                    actions.push({
                      label: "Cancel Order",
                      onClick: () => handleCancel(row),
                      danger: true,
                    });
                  }
                  if (isPartiallyDelivered) {
                    actions.push({
                      label: "Rate Product",
                      onClick: () => handleRating(row),
                    });
                  }

                  // If no actions available
                  if (actions.length === 0) {
                    return <span className="text-xs text-gray-400"></span>;
                  }

                  return <RowActionMenu actions={actions} />;
                },
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

        {ratingOrder && (
          <RateProductModal
            open={isRatingModalOpen}
            orderId={ratingOrder.orderId}
            items={ratingOrder.items}
            onClose={() => {
              setIsRatingModalOpen(false);
              setRatingOrder(null);
            }}
            onSuccess={() => {
              setIsRatingModalOpen(false);
              setRatingOrder(null);
              toast.success("Review submitted successfully!");
            }}
          />
        )}
      </div>
      {trackingWaybill && (
        <TrackingModal
          waybill={trackingWaybill}
          onClose={() => setTrackingWaybill(null)}
        />
      )}
    </div>
  );
}

