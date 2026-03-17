"use client";

import { useState } from "react";
import Modal from "../Modal";
import { OrderItem } from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import Image from "next/image";
import { getSafeImageUrl } from "@/lib/imageUrl";

interface ReturnOrderData {
  orderId: string;
  items: OrderItem[];
  status: string;
}

interface ReturnModalProps {
  open: boolean;
  order: ReturnOrderData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnModal({
  open,
  order,
  onClose,
  onSuccess,
}: ReturnModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [reason, setReason] = useState<string>("Size issue");
  const [notes, setNotes] = useState<string>(""); // UI parity only
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedItem = order.items.find(
    (item) => item._id === selectedItemId
  );

  const orderId = order.orderId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItemId) {
      setError("Please select an item to return");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ordersService.returnItems({
        items: [
          {
            orderId: orderId,
            itemId: selectedItemId,
            reason,
          },
        ],
      });

      onSuccess();
    } catch (err) {
      console.error("Return failed", err);
      setError("Failed to submit return request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedItemId("");
      setReason("Size issue");
      setNotes("");
      setError(null);
      onClose();
    }
  };

  const hasEligibleItems = order.items.some(
    (item) => item.status === "DELIVERED"
  );

  return (
    <Modal open={open} onClose={handleClose} title="Return Item">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Item to Return
          </label>

          {!hasEligibleItems && (
            <div className="p-3 bg-gray-100 text-sm text-gray-600 rounded-md">
              No items available for return.
            </div>
          )}

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {order.items.map((item) => {
              const isDelivered = item.status === "DELIVERED";
              const isReturnRequested =
                item.status === "RETURN_REQUESTED";

              const isReturnable = isDelivered && !isReturnRequested;

              return (
                <label
                  key={item._id}
                  className={`
                    border rounded-lg p-3 flex gap-3 transition relative
                    ${
                      selectedItemId === item._id
                        ? "border-blue-600 bg-blue-50"
                        : isReturnRequested
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200"
                    }
                    ${
                      isReturnable
                        ? "cursor-pointer hover:border-blue-400"
                        : "opacity-80 cursor-not-allowed"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="returnItem"
                    value={item._id}
                    checked={selectedItemId === item._id}
                    onChange={() => {
                      if (!isReturnable || loading) return;
                      setSelectedItemId(item._id);
                    }}
                    disabled={!isReturnable || loading}
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

                    <div className="mt-1 flex flex-wrap gap-2">
                      {isReturnRequested ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">
                          Return Requested
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Return
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          >
            <option value="Size issue">Size issue</option>
            <option value="Wrong item received">Wrong item received</option>
            <option value="Defective product">Defective product</option>
            <option value="Changed my mind">Changed my mind</option>
            <option value="Other">Other</option>
          </select>
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
            disabled={loading || !selectedItemId}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit Return"}
          </button>
        </div>
      </form>
    </Modal>
  );
}