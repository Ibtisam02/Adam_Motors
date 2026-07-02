import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteCloudinaryImages } from "@/lib/cloudinary";
import { verifySameOrigin } from "@/lib/csrf";

/**
 * POST /api/upload/delete
 * Admin only — delete one image from Cloudinary by public ID.
 * Used when an admin removes an image from the form before saving.
 */
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  let body: { publicId?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  if (!body.publicId) {
    return apiError("publicId is required", 400);
  }

  try {
    await deleteCloudinaryImages([body.publicId]);
    return apiSuccess(null, "Image deleted");
  } catch (err) {
    console.error("Delete image error:", err);
    return apiError("Failed to delete image", 500);
  }
}
