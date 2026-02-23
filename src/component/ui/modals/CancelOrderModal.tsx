"use client";

import { useState } from "react";
import Modal from "../Modal";
import { ordersService } from "@/domain/application/services/order.service";

interface CancelOrderModalProps {
  open: boolean;
  orderId: string;
  orderNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found cheaper elsewhere",
  "Delivery time too long",
  "Changed my mind",
  "Other",
];

export default function CancelOrderModal({
  open,
  orderId,
  orderNumber,
  onClose,
  onSuccess,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState<string>("Ordered by mistake");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      await ordersService.cancelOrder(orderId, reason);

      onSuccess();
    } catch (error: unknown) {
      // console.error("Cancel order failed", err);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to cancel order. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason("Ordered by mistake");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Cancel Order">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel order{" "}
          <span className="font-semibold">{orderNumber}</span>?
        </p>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {CANCEL_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Keep Order
          </button>

          <button
            onClick={handleCancelOrder}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {loading ? "Cancelling..." : "Yes, Cancel Order"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
