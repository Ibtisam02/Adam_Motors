import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Car from "@/models/Car";
import { reviewSchema } from "@/schemas/contact-review.schema";
import { apiSuccess, apiError, sanitizeText } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/csrf";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/services/rateLimit";
import { verifyRecaptcha } from "@/services/recaptcha";

void Car;

/**
 * GET /api/reviews?carId=...
 * Public — returns approved reviews for a car.
 * Admin — pass ?status=pending to moderate all reviews.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const carId = request.nextUrl.searchParams.get("carId");
    const status = request.nextUrl.searchParams.get("status");

    if (status === "pending" || status === "all") {
      const admin = await getCurrentAdmin();
      if (!admin) return apiError("Unauthorized", 401);

      const filter: Record<string, unknown> = {};
      if (status === "pending") filter.approved = false;

      const reviews = await Review.find(filter)
        .populate("carId", "title brand model")
        .sort({ createdAt: -1 })
        .lean();

      return apiSuccess(reviews);
    }

    if (!carId || !mongoose.isValidObjectId(carId)) {
      return apiError("A valid carId is required", 400);
    }

    const reviews = await Review.find({ carId, approved: true })
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess(reviews);
  } catch (err) {
    console.error("Get reviews error:", err);
    return apiError("Failed to load reviews", 500);
  }
}

/**
 * POST /api/reviews
 * Public — submit a review. Reviews are pending until admin approval.
 * Protected by rate limiting, a honeypot field, and reCAPTCHA.
 */
export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(`review:${ip}`, RATE_LIMITS.review.limit, RATE_LIMITS.review.windowMs);
  if (!rl.success) {
    return apiError("You're submitting reviews too quickly. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed", 400, parsed.error.flatten());
  }

  const data = parsed.data;

  // Honeypot — if filled, silently pretend success so bots don't learn
  if (data.website) {
    return apiSuccess(null, "Thank you for your review!", 201);
  }

  const recaptchaOk = await verifyRecaptcha(data.recaptchaToken);
  if (!recaptchaOk) {
    return apiError("Spam verification failed. Please try again.", 400);
  }

  if (!mongoose.isValidObjectId(data.carId)) {
    return apiError("Invalid car", 400);
  }

  try {
    await connectDB();

    const car = await Car.findById(data.carId).select("_id");
    if (!car) {
      return apiError("Car not found", 404);
    }

    const review = await Review.create({
      carId: data.carId,
      reviewerName: sanitizeText(data.reviewerName),
      rating: data.rating,
      comment: sanitizeText(data.comment),
      approved: false,
    });

    return apiSuccess(
      review,
      "Thank you! Your review has been submitted and is awaiting approval.",
      201
    );
  } catch (err) {
    console.error("Create review error:", err);
    return apiError("Failed to submit review", 500);
  }
}
