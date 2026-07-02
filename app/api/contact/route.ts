import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { contactSchema } from "@/schemas/contact-review.schema";
import { apiSuccess, apiError, sanitizeText } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/csrf";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/services/rateLimit";
import { verifyRecaptcha } from "@/services/recaptcha";
import { sendContactNotification } from "@/services/email";

/**
 * GET /api/contact
 * Admin only — list all contact messages.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  try {
    await connectDB();
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    return apiSuccess(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    return apiError("Failed to load messages", 500);
  }
}

/**
 * POST /api/contact
 * Public — submit a contact / inquiry form.
 * Protected by rate limiting, honeypot, and reCAPTCHA.
 */
export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(`contact:${ip}`, RATE_LIMITS.contact.limit, RATE_LIMITS.contact.windowMs);
  if (!rl.success) {
    return apiError("You're sending messages too quickly. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed", 400, parsed.error.flatten());
  }

  const data = parsed.data;

  if (data.website) {
    return apiSuccess(null, "Thank you! We'll be in touch soon.", 201);
  }

  const recaptchaOk = await verifyRecaptcha(data.recaptchaToken);
  if (!recaptchaOk) {
    return apiError("Spam verification failed. Please try again.", 400);
  }

  try {
    await connectDB();

    const contact = await Contact.create({
      name: sanitizeText(data.name),
      email: sanitizeText(data.email).toLowerCase(),
      phone: sanitizeText(data.phone),
      message: sanitizeText(data.message),
      status: "new",
    });

    // Fire-and-forget — don't block the response on email delivery
    sendContactNotification({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
    });

    return apiSuccess(null, "Thank you! We'll be in touch soon.", 201);
  } catch (err) {
    console.error("Create contact error:", err);
    return apiError("Failed to send message", 500);
  }
}
