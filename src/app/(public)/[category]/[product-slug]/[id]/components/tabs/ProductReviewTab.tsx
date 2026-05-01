import { Review } from "@/domain/shared/types/rating.type";
import { RatingStarIcon } from "@/icons/RatingStarIcon";

interface Props {
  reviews: Review[];
  totalRatings: number;
  averageRating: number;
}

export default function ProductReviewTab({
  reviews,
  totalRatings,
  averageRating,
}: Props) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div id="reviews-section" className="space-y-6">
      {/* Rating Summary */}
      <div className="pb-6">
        <div className="text-3xl font-semibold text-gray-900">
          {averageRating.toFixed(1)} / 5
        </div>
        <div className="text-gray-500 text-sm mt-1">
          Based on {totalRatings} review{totalRatings !== 1 && "s"}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 && (
        <div className="text-gray-500">No reviews yet.</div>
      )}

      {reviews.map((review) => (
        <div key={review._id} className="border-b border-gray-300 pb-6">
          <div className="flex justify-between items-center">
            <div className="font-medium text-gray-900">
              {review.userId.name}
            </div>
            <div className="text-xs text-gray-400">
              {formatDate(review.createdAt)}
            </div>
          </div>

          <div className="flex mt-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < review.rating
                  ? "text-yellow-400"
                  : "text-gray-300"
                  }`}
              >
                <RatingStarIcon key={i}
                  fill={i < Math.round(averageRating) ? "#FACC15" : "#D1D5DB"} />
              </span>
            ))}
          </div>

          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}