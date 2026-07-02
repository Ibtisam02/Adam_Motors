import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

/** Get approved reviews for a car, plus the average rating and count */
export async function getApprovedReviews(carId: string) {
  if (!mongoose.isValidObjectId(carId)) {
    return { reviews: [], averageRating: 0, totalReviews: 0 };
  }

  await connectDB();

  const reviews = await Review.find({ carId, approved: true })
    .sort({ createdAt: -1 })
    .lean();

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return {
    reviews: JSON.parse(JSON.stringify(reviews)),
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  };
}

/** Admin only — get all reviews (pending and approved) for moderation */
export async function getAllReviewsAdmin() {
  await connectDB();
  const reviews = await Review.find()
    .populate("carId", "title brand model")
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(reviews));
}

/** Get the latest approved reviews across all cars (for homepage testimonials) */
export async function getLatestApprovedReviews(limit = 6) {
  await connectDB();
  const reviews = await Review.find({ approved: true })
    .populate("carId", "title brand model")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(reviews));
}
