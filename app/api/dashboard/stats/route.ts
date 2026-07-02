import { getDashboardStats } from "@/actions/dashboard.actions";
import { apiSuccess, apiError } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";

/**
 * GET /api/dashboard/stats
 * Admin only — aggregate counts and chart data for the dashboard.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  try {
    const stats = await getDashboardStats();
    return apiSuccess(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return apiError("Failed to load dashboard stats", 500);
  }
}
