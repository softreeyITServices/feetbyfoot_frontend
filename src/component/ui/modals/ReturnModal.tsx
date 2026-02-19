"use client";

import { useState } from "react";
import Modal from "../Modal";
import { OrderItem } from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Return Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Item to Return
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={loading}
            required
          >
            <option value="">Choose an item...</option>
            {order.items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.productName} - Size {item.size}
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Return
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !selectedItemId}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing..." : "Submit Return"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
