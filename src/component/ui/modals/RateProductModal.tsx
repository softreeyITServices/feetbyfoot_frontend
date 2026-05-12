"use client";

import { useState } from "react";
import Modal from "../Modal";
import { OrderItem } from "@/domain/shared/types/order.type";
import { ratingService } from "@/domain/application/services/rating.service";
import { RatingStarIcon } from "@/icons/RatingStarIcon";

interface RateModalProps {
  open: boolean;
  orderId: string;
  items: OrderItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function RateProductModal({
  open,
  orderId,
  items,
  onClose,
  onSuccess,
}: RateModalProps) {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      setError("Please select a product");
      return;
    }

    if (rating === 0) {
      setError("Please select rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter your comments/review about the product");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ratingService.createRating({
        productIds: [selectedItem],
        rating,
        comment,
      });

      onSuccess();
    } catch (err: any) {
      console.error(err);
      // Use specific backend message if available, otherwise fallback to generic
      const errorMessage = err.data?.message || err.message || "Failed to submit rating.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedItem("");
      setRating(0);
      setComment("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Rate Product">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Select Product */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Product <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading}
          >
            <option value="">Choose product...</option>
            {items.map((item) => (
              <option key={item._id} value={item.productId}>
                {item.productName} (Size {item.size})
              </option>
            ))}
          </select>
        </div>

        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
              >
                <RatingStarIcon
                  fill={star <= rating ? "#FACC15" : "#E5E7EB"}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Write your review..."
            disabled={loading}
          />
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
            className="flex-1 border py-2 rounded-md"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex-1 bg-black text-white py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}