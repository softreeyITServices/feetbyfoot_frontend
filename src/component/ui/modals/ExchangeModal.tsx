"use client";

import { useState } from "react";
import Modal from "../Modal";
import { OrderItem } from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import Image from "next/image";
import { getSafeImageUrl } from "@/lib/imageUrl";

interface ExchangeOrderData {
  orderId: string;
  items: OrderItem[];
  status: string;
}

interface ExchangeModalProps {
  open: boolean;
  order: ExchangeOrderData;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ExchangeModal({
  open,
  order,
  onClose,
  onSuccess,
}: ExchangeModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [newSize, setNewSize] = useState<string>("");
  const [reason, setReason] = useState<string>("Size too small");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");

  const selectedItem = order.items.find(
    (item) => item._id === selectedItemId
  );

  const orderId = order.orderId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItemId || !newSize) {
      setError("Please select an item and new size");
      return;
    }

    if (!selectedItem) {
      setError("Selected item not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ordersService.exchangeItems({
        orderId: orderId,
        lines: [
          {
            orderItemId: selectedItem._id,
            productId: selectedItem.productId,
            reason,
            fromSize: selectedItem.size,
            toSize: newSize,
            quantity: 1,
          },
        ],
        notes: notes,
      });

      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to exchange item. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedItemId("");
      setNewSize("");
      setReason("Size too small");
      setNotes("");
      setError(null);
      onClose();
    }
  };

  const hasEligibleItems = order.items.some(
    (item) =>
      item.status === "DELIVERED" &&
      (!item.exchangeRequests || item.exchangeRequests.length === 0)
  );

  console.log(order)

  return (
    <Modal open={open} onClose={handleClose} title="Exchange Item">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Select Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Item to Exchange
          </label>

          {!hasEligibleItems && (
            <div className="p-3 bg-gray-100 text-sm text-gray-600 rounded-md">
              No items available for exchange.
            </div>
          )}

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {order.items.map((item) => {
              const isDelivered = item.status === "DELIVERED";
              const isExchangeRequested = item.status === "EXCHANGE_REQUESTED";

              const isExchangeable =
                isDelivered &&
                !isExchangeRequested &&
                (!item.exchangeRequests || item.exchangeRequests.length === 0);

              return (
                <label
                  key={item._id}
                  className={`
        border rounded-lg p-3 flex gap-3 transition relative
        ${selectedItemId === item._id
                      ? "border-blue-600 bg-blue-50"
                      : isExchangeRequested
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200"}
        ${isExchangeable
                      ? "cursor-pointer hover:border-blue-400"
                      : "opacity-80 cursor-not-allowed"}
      `}
                >
                  <input
                    type="radio"
                    name="exchangeItem"
                    value={item._id}
                    checked={selectedItemId === item._id}
                    onChange={() => {
                      if (!isExchangeable || loading) return;
                      setSelectedItemId(item._id);
                      setNewSize("");
                    }}
                    disabled={!isExchangeable || loading}
                    className="hidden"
                  />

                  <Image
                    src={getSafeImageUrl(item.productImage)}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md"
                    width={200}
                    height={200}
                  />

                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {item.productName}
                    </div>

                    <div className="text-xs text-gray-500">
                      Size: {item.size}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 ">
                      {isExchangeRequested ? (
                        <div className="mt-1 flex justify-between items-center w-full">
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 w-fit">
                            Exchange Requested
                          </span>

                          {item.exchangeRequests && item.exchangeRequests[0].requestedAt && (
                            <div className="text-xs text-gray-500">
                              Requested on{" "}
                              {new Date(
                                item.exchangeRequests[0].requestedAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        {item.status}
                      </span>}
                    </div>

                    {/* Exchange Info Section */}
                    {isExchangeRequested && item.exchangeRequests && (
                      <div className="mt-2 p-2 bg-white border border-yellow-200 rounded text-xs text-gray-700">
                        <div>
                          <span className="font-medium">Reason:</span>{" "}
                          {item.exchangeRequests[0].reason}
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Select New Size */}
        {selectedItemId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Size (Current: {selectedItem?.size})
            </label>

            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setNewSize(size)}
                  disabled={size === selectedItem?.size || loading}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${size === selectedItem?.size
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : newSize === size
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Exchange
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          >
            <option value="Size too small">Size too small</option>
            <option value="Size too large">Size too large</option>
            <option value="Wrong item received">Wrong item received</option>
            <option value="Defective product">Defective product</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional details..."
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !selectedItemId || !newSize}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit Exchange"}
          </button>
        </div>
      </form>
    </Modal>
  );
}