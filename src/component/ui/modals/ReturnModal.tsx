"use client";

import { useState } from "react";
import Modal from "../Modal";
import { OrderItem } from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import Image from "next/image";

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

interface SelectedItemInfo {
  itemId: string;
  quantity: number;
  reason: string;
}

export default function ReturnModal({
  open,
  order,
  onClose,
  onSuccess,
}: ReturnModalProps) {
  // We'll store selected items in a record where key is itemId
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItemInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = order.orderId;

  const toggleItemSelection = (item: OrderItem) => {
    const alreadyRequested = item.returnRequestedQuantity || 0;
    const alreadyReturned = item.returnedQuantity || 0;
    const returnableQty = item.quantity - alreadyRequested - alreadyReturned;

    setSelectedItems((prev) => {
      const newItems = { ...prev };
      if (newItems[item._id]) {
        delete newItems[item._id];
      } else {
        newItems[item._id] = {
          itemId: item._id,
          quantity: returnableQty, // Default to max
          reason: "Size issue",
        };
      }
      return newItems;
    });
  };

  const updateItemQuantity = (itemId: string, qty: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: qty },
    }));
  };

  const updateItemReason = (itemId: string, reason: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], reason },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemsToReturn = Object.values(selectedItems);

    if (itemsToReturn.length === 0) {
      setError("Please select at least one item to return");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ordersService.returnItems({
        items: itemsToReturn.map((item) => ({
          orderId: orderId,
          itemId: item.itemId,
          reason: item.reason,
          quantity: item.quantity,
        })),
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
      setSelectedItems({});
      setError(null);
      onClose();
    }
  };

  const hasEligibleItems = order.items.some((item) => {
    const returnable =
      item.quantity -
      (item.returnRequestedQuantity || 0) -
      (item.returnedQuantity || 0);
    return item.status === "DELIVERED" && returnable > 0;
  });

  return (
    <Modal open={open} onClose={handleClose} title="Return Items">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Items to Return
          </label>

          {!hasEligibleItems && (
            <div className="p-3 bg-gray-100 text-sm text-gray-600 rounded-md">
              No items available for return.
            </div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {order.items.map((item) => {
              const alreadyRequested = item.returnRequestedQuantity || 0;
              const alreadyReturned = item.returnedQuantity || 0;
              const itemReturnableQty =
                item.quantity - alreadyRequested - alreadyReturned;

              const isDelivered = item.status === "DELIVERED";
              const isReturnable = isDelivered && itemReturnableQty > 0;
              const isSelected = !!selectedItems[item._id];

              return (
                <div
                  key={item._id}
                  className={`
                    border rounded-lg p-3 transition
                    ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200"}
                    ${!isReturnable ? "opacity-60 grayscale" : ""}
                  `}
                >
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!isReturnable || loading}
                      onChange={() => toggleItemSelection(item)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      width={200}
                      height={200}
                    />

                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {item.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Size: {item.size} · Price: ₹{item.unitPrice}
                      </div>
                      <div className="mt-1">
                        {!isReturnable ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                            {item.status === "DELIVERED" ? "Already Returned" : item.status}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            {itemReturnableQty} units available to return
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Per-item controls if selected */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Quantity
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={loading || selectedItems[item._id].quantity <= 1}
                            onClick={() => updateItemQuantity(item._id, selectedItems[item._id].quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className="w-4 text-center text-sm font-medium">
                            {selectedItems[item._id].quantity}
                          </span>
                          <button
                            type="button"
                            disabled={loading || selectedItems[item._id].quantity >= itemReturnableQty}
                            onClick={() => updateItemQuantity(item._id, selectedItems[item._id].quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Reason
                        </label>
                        <select
                          value={selectedItems[item._id].reason}
                          onChange={(e) => updateItemReason(item._id, e.target.value)}
                          className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          disabled={loading}
                        >
                          <option value="Size issue">Size issue</option>
                          <option value="Wrong item received">Wrong item received</option>
                          <option value="Defective product">Defective product</option>
                          <option value="Changed my mind">Changed my mind</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}

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
            disabled={loading || Object.keys(selectedItems).length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Processing..." : `Return ${Object.keys(selectedItems).length} Item(s)`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
