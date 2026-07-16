import { getCurrentAdmin } from "@/lib/auth";
import connectDB from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET() {
  await connectDB();
  const admin = await getCurrentAdmin();

  if (!admin) {
    return apiError("Not authenticated", 401);
  }

  return apiSuccess({ id: admin.id, email: admin.email, role: admin.role });
}
