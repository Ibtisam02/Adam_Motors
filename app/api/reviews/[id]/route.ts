import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { apiSuccess, apiError } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/csrf";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/reviews/:id
 * Admin only — approve or unapprove a review.
 * Body: { approved: boolean }
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid review ID", 400);
  }

  let body: { approved?: boolean };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  if (typeof body.approved !== "boolean") {
    return apiError("`approved` must be a boolean", 400);
  }

  try {
    await connectDB();

    const review = await Review.findByIdAndUpdate(
      id,
      { approved: body.approved },
      { new: true }
    );

    if (!review) {
      return apiError("Review not found", 404);
    }

    return apiSuccess(review, body.approved ? "Review approved" : "Review hidden");
  } catch (err) {
    console.error("Update review error:", err);
    return apiError("Failed to update review", 500);
  }
}

/**
 * DELETE /api/reviews/:id
 * Admin only — permanently delete a review.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid review ID", 400);
  }

  try {
    await connectDB();

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return apiError("Review not found", 404);
    }

    return apiSuccess(null, "Review deleted");
  } catch (err) {
    console.error("Delete review error:", err);
    return apiError("Failed to delete review", 500);
  }
}
