import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Car from "@/models/Car";
import { categorySchema } from "@/schemas/category.schema";
import { apiSuccess, apiError, sanitizeText, slugify } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/csrf";
import Admin from "@/models/Admin";
import { log } from "console";

/**
 * GET /api/categories
 * Public — returns all categories, optionally with car counts
 * (used for "Shop by Category" sections and filters).
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const withCounts = request.nextUrl.searchParams.get("withCounts") === "true";

    const categories = await Category.find().sort({ name: 1 }).lean();

    if (!withCounts) {
      return apiSuccess(categories);
    }

    const counts = await Car.aggregate([
      { $match: { sold: false } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const result = categories.map((cat) => ({
      ...cat,
      carCount: countMap.get(cat._id.toString()) || 0,
    }));

    return apiSuccess(result);
  } catch (err) {
    console.error("Get categories error:", err);
    return apiError("Failed to load categories", 500);
  }
}

/**
 * POST /api/categories
 * Admin only — create a new category.
 */
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  console.log(admin);
  
  if (!admin) return apiError("Unauthorized", 401);
  
  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
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

    const existing = await Category.findOne({
      $or: [{ name: { $regex: `^${name}$`, $options: "i" } }, { slug }],
    });

    if (existing) {
      return apiError("A category with this name already exists", 409);
    }

    const category = await Category.create({ name, slug, description });

    return apiSuccess(category, "Category created successfully", 201);
  } catch (err) {
    console.error("Create category error:", err);
    return apiError("Failed to create category", 500);
  }
}
