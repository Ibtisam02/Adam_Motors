import { getCurrentAdmin } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return apiError("Not authenticated", 401);
  }

  return apiSuccess({ id: admin.id, email: admin.email, role: admin.role });
}
