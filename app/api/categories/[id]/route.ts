import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Car from "@/models/Car";
import { categorySchema } from "@/schemas/category.schema";
import { apiSuccess, apiError, sanitizeText, slugify } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/csrf";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/categories/:id
 * Admin only — update a category.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid category ID", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed", 400, parsed.error.flatten());
  }

  const name = sanitizeText(parsed.data.name);
  const description = parsed.data.description ? sanitizeText(parsed.data.description) : "";
  const slug = slugify(name);

  try {
    await connectDB();

    const duplicate = await Category.findOne({
      _id: { $ne: id },
      $or: [{ name: { $regex: `^${name}$`, $options: "i" } }, { slug }],
    });

    if (duplicate) {
      return apiError("A category with this name already exists", 409);
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, slug },
      { new: true, runValidators: true }
    );

    if (!category) {
      return apiError("Category not found", 404);
    }

    return apiSuccess(category, "Category updated successfully");
  } catch (err) {
    console.error("Update category error:", err);
    return apiError("Failed to update category", 500);
  }
}

/**
 * DELETE /api/categories/:id
 * Admin only — delete a category. Blocks deletion if cars still
 * reference this category to avoid orphaned data.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid category ID", 400);
  }

  try {
    await connectDB();

    const carsInCategory = await Car.countDocuments({ categoryId: id });
    if (carsInCategory > 0) {
      return apiError(
        `Cannot delete this category — ${carsInCategory} car(s) are assigned to it. Reassign or delete those cars first.`,
        409
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return apiError("Category not found", 404);
    }

    return apiSuccess(null, "Category deleted successfully");
  } catch (err) {
    console.error("Delete category error:", err);
    return apiError("Failed to delete category", 500);
  }
}
