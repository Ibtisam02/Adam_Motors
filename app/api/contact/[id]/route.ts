import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { apiSuccess, apiError } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/csrf";

interface Params {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES = ["new", "read", "responded"];

/**
 * PATCH /api/contact/:id
 * Admin only — update message status (new / read / responded).
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid message ID", 400);
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return apiError("Invalid status value", 400);
  }

  try {
    await connectDB();

    const message = await Contact.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    if (!message) {
      return apiError("Message not found", 404);
    }

    return apiSuccess(message, "Message updated");
  } catch (err) {
    console.error("Update message error:", err);
    return apiError("Failed to update message", 500);
  }
}

/**
 * DELETE /api/contact/:id
 * Admin only — delete a contact message.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid message ID", 400);
  }

  try {
    await connectDB();

    const message = await Contact.findByIdAndDelete(id);
    if (!message) {
      return apiError("Message not found", 404);
    }

    return apiSuccess(null, "Message deleted");
  } catch (err) {
    console.error("Delete message error:", err);
    return apiError("Failed to delete message", 500);
  }
}
