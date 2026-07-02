import { MessageSquare } from "lucide-react";
import StarRating from "./StarRating";
import { formatDate } from "@/lib/utils";
import type { IReview } from "@/types";

interface ReviewListProps {
  reviews: IReview[];
  averageRating: number;
  totalReviews: number;
}

export default function ReviewList({ reviews, averageRating, totalReviews }: ReviewListProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <StarRating rating={averageRating} size={20} />
        {totalReviews > 0 ? (
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{averageRating.toFixed(1)}</span> out of 5 ·{" "}
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        ) : (
          <p className="text-sm text-muted">No reviews yet</p>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-6 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted/50" />
          <p className="mt-2 text-sm text-muted">
            Be the first to share your thoughts on this vehicle.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((review) => (
            <li key={review._id} className="card-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink">{review.reviewerName}</p>
                <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
              </div>
              <StarRating rating={review.rating} className="mt-1.5" />
              <p className="mt-2 text-sm leading-relaxed text-ink/90">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
