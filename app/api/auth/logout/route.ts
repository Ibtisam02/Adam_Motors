import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { verifySameOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return apiSuccess(null, "Logged out successfully");
}
