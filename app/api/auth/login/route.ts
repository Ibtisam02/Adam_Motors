import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import { loginSchema } from "@/schemas/auth.schema";
import {
  comparePassword,
  signToken,
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} from "@/lib/auth";
import { apiSuccess, apiError, sanitizeText } from "@/lib/utils";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/services/rateLimit";
import { verifySameOrigin } from "@/lib/csrf";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  // Rate limit login attempts per IP to prevent brute force
  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(`login:${ip}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs);
  if (!rl.success) {
    return apiError("Too many login attempts. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid email or password format", 400, parsed.error.flatten());
  }

  const email = sanitizeText(parsed.data.email).toLowerCase();
  const { password } = parsed.data;

  try {
    await connectDB();

    const admin = await Admin.findOne({ email }).select("+password");

    // Use a generic error message to avoid leaking which emails exist
    if (!admin) {
      return apiError("Invalid email or password", 401);
    }

    const isValid = await comparePassword(password, admin.password);
    if (!isValid) {
      return apiError("Invalid email or password", 401);
    }

    const token = signToken({
      id: admin._id.toString(),
      email: admin.email,
      role: "admin",
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(SEVEN_DAYS));

    return apiSuccess(
      { id: admin._id.toString(), email: admin.email, name: admin.name },
      "Logged in successfully"
    );
  } catch (err) {
    console.error("Login error:", err);
    return apiError("Something went wrong. Please try again.", 500);
  }
}
