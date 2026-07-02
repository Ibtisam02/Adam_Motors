import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { getCloudinarySignature } from "@/lib/cloudinary";
import { verifySameOrigin } from "@/lib/csrf";

/**
 * POST /api/upload
 * Admin only — returns a signature for a signed Cloudinary upload.
 *
 * The browser uses this signature with the Cloudinary Upload Widget
 * to upload directly to Cloudinary without exposing the API secret.
 */
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "AdamMoters";

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = getCloudinarySignature(paramsToSign);

    return apiSuccess({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    console.error("Cloudinary signature error:", err);
    return apiError("Failed to generate upload signature", 500);
  }
}
