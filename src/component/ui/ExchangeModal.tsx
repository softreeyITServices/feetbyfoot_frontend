"use client";

import { useState } from "react";
import Modal from "./Modal";
import { OrderItem } from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";

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

  const selectedItem = order.items.find((item) => item._id === selectedItemId);

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
      await ordersService.exchangeItem(order.orderId, selectedItemId, {
        reason,
        oldSize: selectedItem.size,
        newSize,
      });

      onSuccess();
    } catch (err) {
      console.error("Exchange failed", err);
      setError("Failed to exchange item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedItemId("");
      setNewSize("");
      setReason("Size too small");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Exchange Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Item to Exchange
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => {
              setSelectedItemId(e.target.value);
              setNewSize("");
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    ${
                      size === selectedItem?.size
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : newSize === size
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
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
            disabled={loading || !selectedItemId || !newSize}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing..." : "Submit Exchange"}
          </button>
        </div>
      </form>
    </Modal>
  );
}