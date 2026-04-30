"use client";

import { useState } from "react";
import Modal from "../Modal";
import { OrderItem } from "@/domain/shared/types/order.type";
import { ordersService } from "@/domain/application/services/order.service";
import Image from "next/image";

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

const COLOR_CSS_MAP: Record<string, string> = {
  Mint: "#98FF98",
  Peach: "#FFDAB9",
  Charcoal: "#36454F",
  Bronze: "#CD7F32",
  Mustard: "#FFDB58",
  Cream: "#FFFDD0",
};

function colorToCss(name: string): string {
  return COLOR_CSS_MAP[name] ?? name.toLowerCase();
}

/** All unique active sizes from the product (including the item's current size). */
function exchangeSizeOptions(item: OrderItem | undefined): string[] {
  if (!item?.product?.sizes?.length) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of item.product.sizes) {
    if (!s.isActive || s.quantity <= 0) continue;
    if (seen.has(s.size)) continue;
    seen.add(s.size);
    result.push(s.size);
  }
  return result;
}

/** Unique active colors for a given size (or all sizes if forSize is empty). */
function exchangeColorOptions(
  item: OrderItem | undefined,
  forSize: string
): string[] {
  if (!item?.product?.sizes?.length) return [];
  const pool = forSize
    ? item.product.sizes.filter((s) => s.size === forSize)
    : item.product.sizes;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of pool) {
    if (!s.isActive || s.quantity <= 0 || !s.color) continue;
    if (seen.has(s.color)) continue;
    seen.add(s.color);
    result.push(s.color);
  }
  return result;
}

function isItemExchangeable(item: OrderItem): boolean {
  if (item.status !== "DELIVERED") return false;
  if (item.exchangeRequests && item.exchangeRequests.length > 0) return false;
  const hasSizes = exchangeSizeOptions(item).length > 0;
  const hasColors = exchangeColorOptions(item, "").length > 0;
  return hasSizes || hasColors;
}

export default function ExchangeModal({
  open,
  order,
  onClose,
  onSuccess,
}: ExchangeModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [newSize, setNewSize] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("Size too small");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedItem = order.items.find((item) => item._id === selectedItemId);
  const orderId = order.orderId;

  const sizeChoices = exchangeSizeOptions(selectedItem);
  // When a new size is chosen show colors for that size; otherwise show all product colors
  const colorChoices = exchangeColorOptions(selectedItem, newSize);

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setNewSize("");
    setNewColor("");
    setQuantity(1);
    setError(null);
  };

  const handleSelectSize = (size: string) => {
    setNewSize(size);
    setNewColor(""); // reset color when size changes so choices refresh
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      setError("Please select an item to exchange");
      return;
    }

    if (!newSize.trim()) {
      setError("Please select a size");
      return;
    }

    if (!newColor.trim()) {
      setError("Please select a color");
      return;
    }

    const resolvedOldColor = selectedItem.color || "";

    const unchanged =
      newSize === selectedItem.size &&
      newColor === resolvedOldColor;

    if (unchanged) {
      setError("Please select a different size or color from your current one");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ordersService.exchangeItems({
        orderId,
        lines: [
          {
            orderItemId: selectedItem._id,
            reason,
            oldSize: selectedItem.size,
            newSize: newSize,
            oldColor: resolvedOldColor,
            newColor: newColor,
            quantity,
          },
        ],
        notes,
      });

      onSuccess();
    } catch (err: unknown) {
      const raw =
        err instanceof Error
          ? err.message
          : "Failed to exchange item. Please try again.";
      setError(
        /not available/i.test(raw)
          ? "That size/color is not available. Please choose another."
          : raw
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSelectedItemId("");
    setNewSize("");
    setNewColor("");
    setQuantity(1);
    setReason("Size too small");
    setNotes("");
    setError(null);
    onClose();
  };

  const hasEligibleItems = order.items.some(isItemExchangeable);

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
              const exchangeable = isItemExchangeable(item);
              const isExchangeRequested = item.status === "EXCHANGE_REQUESTED";
              const isExchangeApproved = item.status === "EXCHANGE_APPROVED";
              const isReplacementShipped = item.status === "REPLACEMENT_SHIPPED";
              
              const currentExchange = item.exchangeRequests?.[item.exchangeRequests.length - 1];

              return (
                <label
                  key={item._id}
                  className={`border rounded-lg p-3 flex gap-3 transition relative
                    ${selectedItemId === item._id
                      ? "border-blue-600 bg-blue-50"
                      : (isExchangeRequested || isExchangeApproved)
                        ? "border-amber-400 bg-amber-50/30"
                        : "border-gray-200"}
                    ${exchangeable
                      ? "cursor-pointer hover:border-blue-400"
                      : "opacity-90 cursor-not-allowed"}`}
                >
                  <input
                    type="radio"
                    name="exchangeItem"
                    value={item._id}
                    checked={selectedItemId === item._id}
                    onChange={() => {
                      if (!exchangeable || loading) return;
                      handleSelectItem(item._id);
                    }}
                    disabled={!exchangeable || loading}
                    className="hidden"
                  />

                  <Image
                    src={
                      item.productImage &&
                      typeof item.productImage === "string" &&
                      (item.productImage.startsWith("http") || item.productImage.startsWith("/"))
                        ? item.productImage
                        : "/assets/images/logo.png"
                    }
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md"
                    width={200}
                    height={200}
                  />

                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.productName}</div>
                    <div className="text-xs text-gray-500">
                      Size: {item.size}
                      {item.color ? ` · Color: ${item.color}` : ""}
                      <span className="mx-1">·</span>
                      Qty Ordered: {item.quantity}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {isExchangeRequested ? (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                            Exchange Requested
                          </span>
                        ) : isExchangeApproved ? (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                            Exchange Approved
                          </span>
                        ) : isReplacementShipped ? (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                            Replacement Shipped
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                            {item.status}
                          </span>
                        )}
                      </div>

                      {/* NEW: Tracking Link inside the Modal */}
                      {currentExchange?.pickupAwb && (
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-amber-200">
                          <span className="text-[10px] font-mono text-gray-600">
                            Pickup: {currentExchange.pickupAwb}
                          </span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentExchange.pickupAwb?.startsWith("MOCK")) {
                                alert("This is a MOCK tracking ID for development purposes. Real tracking will be available once the live API is connected.");
                              } else {
                                window.open(`https://www.delhivery.com/track/package/${currentExchange.pickupAwb}`, "_blank");
                              }
                            }}
                            className="text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            Track →
                          </button>
                        </div>
                      )}

                      {(currentExchange?.replacementAwb || (isReplacementShipped && item.waybill)) && (
                        <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded border border-blue-200 mt-1">
                          <span className="text-[10px] font-mono text-blue-700">
                            Shipment: {currentExchange?.replacementAwb || item.waybill}
                          </span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const awb = currentExchange?.replacementAwb || item.waybill;
                              if (awb?.startsWith("MOCK")) {
                                alert("This is a MOCK tracking ID for development purposes. Real tracking will be available once the live API is connected.");
                              } else {
                                window.open(`https://www.delhivery.com/track/package/${awb}`, "_blank");
                              }
                            }}
                            className="text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            Track →
                          </button>
                        </div>
                      )}
                    </div>

                    {item.exchangeRequests && item.exchangeRequests.length > 0 && (
                      <div className="mt-2 p-2 bg-white/50 border border-gray-100 rounded text-[11px] text-gray-600">
                        <span className="font-medium">Reason:</span> {currentExchange?.reason}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Size & Color selectors */}
        {selectedItemId && (
          <>
            {/* New Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Size{" "}
                <span className="text-gray-400 font-normal">
                  (Current: {selectedItem?.size})
                </span>
              </label>

              {sizeChoices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sizeChoices.map((size) => {
                    const isCurrent = size === selectedItem?.size;
                    const isSelected = newSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSelectSize(size)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative
                          ${isSelected
                            ? "bg-blue-600 text-white"
                            : isCurrent
                              ? "bg-gray-200 text-gray-700 ring-1 ring-gray-400 hover:bg-gray-300"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {size}
                        {isCurrent && (
                          <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-gray-500 text-white rounded-full px-1">
                            now
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No sizes available.</p>
              )}
            </div>

            {/* New Color */}
            {colorChoices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Color{" "}
                  {selectedItem?.color && (
                    <span className="text-gray-400 font-normal">
                      (Current: {selectedItem.color})
                    </span>
                  )}
                </label>

                <div className="flex flex-wrap gap-3">
                  {colorChoices.map((color) => (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      onClick={() =>
                        setNewColor((prev) => (prev === color ? "" : color))
                      }
                      disabled={loading}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                        ${newColor === color
                          ? "border-blue-600 scale-110 ring-2 ring-blue-300"
                          : color === selectedItem?.color
                            ? "border-gray-400 opacity-60"
                            : "border-transparent hover:border-gray-400"}`}
                      style={{ backgroundColor: colorToCss(color) }}
                    >
                      {newColor === color && (
                        <span className="text-white text-xs font-bold drop-shadow">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {newColor && (
                  <p className="mt-1 text-xs text-blue-600">
                    Selected: {newColor}
                  </p>
                )}
              </div>
            )}
          {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity{" "}
                <span className="text-gray-400 font-normal">
                  (Max: {selectedItem?.quantity ?? 1})
                </span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                <button
                  type="button"
                  disabled={loading || quantity >= (selectedItem?.quantity ?? 1)}
                  onClick={() => setQuantity((q) => Math.min(selectedItem?.quantity ?? 1, q + 1))}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </>
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
            <option value="Wrong color received">Wrong color received</option>
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
            disabled={loading || !selectedItemId || (!newSize && !newColor)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit Exchange"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
