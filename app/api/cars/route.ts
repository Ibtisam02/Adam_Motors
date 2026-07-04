import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Car from "@/models/Car";
import Category from "@/models/Category";
import { carSchema, carFilterSchema } from "@/schemas/car.schema";
import { apiSuccess, apiError, sanitizeText, sanitizeHtml } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/csrf";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

// Ensure the Category model is registered for population
void Category;

/**
 * GET /api/cars
 * Public — list cars with search, filters, sorting, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = carFilterSchema.safeParse(params);

    if (!parsed.success) {
      return apiError("Invalid query parameters", 400, parsed.error.flatten());
    }

    const {
      page,
      limit,
      search,
      category,
      brand,
      year,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sort,
      featured,
    } = parsed.data;

    await connectDB();

    // Only admins should be able to see sold cars in management views.
    // Public listing only shows non-sold cars unless explicitly requested
    // by an authenticated admin.
    const admin = await getCurrentAdmin();
    const includeSold = request.nextUrl.searchParams.get("includeSold") === "true";

    const filter: Record<string, unknown> = {};

    if (!(admin && includeSold)) {
      filter.sold = false;
    }

    if (category && mongoose.isValidObjectId(category)) {
      filter.categoryId = category;
    } else if (category) {
      // Allow filtering by category slug
      const cat = await Category.findOne({ slug: category }).lean();
      if (cat) filter.categoryId = cat._id;
      else filter.categoryId = null; // no matches
    }

    if (brand) filter.brand = { $regex: `^${escapeRegex(brand)}$`, $options: "i" };
    if (year) filter.year = Number(year);
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (featured === "true") filter.featured = true;

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      filter.price = priceFilter;
    }

    if (search) {
      const safe = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { brand: { $regex: safe, $options: "i" } },
        { CarModel: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
    };

    const skip = (page - 1) * limit;

    const [cars, total] = await Promise.all([
      Car.find(filter)
        .populate("categoryId", "name slug")
        .sort(sortMap[sort])
        .skip(skip)
        .limit(limit)
        .lean(),
      Car.countDocuments(filter),
    ]);

    return apiSuccess({
      data: cars,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("Get cars error:", err);
    return apiError("Failed to load cars", 500);
  }
}

/**
 * POST /api/cars
 * Admin only — create a new car listing.
 *
 * Uses a MongoDB transaction so that if the database write fails after
 * images have already been uploaded to Cloudinary, the orphaned images
 * are cleaned up automatically.
 */
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
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

  const parsed = carSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed", 400, parsed.error.flatten());
  }

  const data = parsed.data;
console.log(JSON.stringify(data));

  if (!mongoose.isValidObjectId(data.categoryId)) {
    return apiError("Invalid category", 400);
  }

  await connectDB();

  const category = await Category.findById(data.categoryId);
  if (!category) {
    return apiError("Selected category does not exist", 400);
  }

  const session = await mongoose.startSession();

  try {
    let createdCar;

    await session.withTransaction(async () => {
      const [car] = await Car.create(
        [
          {
            title: sanitizeText(data.title),
            brand: sanitizeText(data.brand),
            CarModel: sanitizeText(data.CarModel),
            year: data.year,
            mileage: data.mileage,
            fuelType: data.fuelType,
            transmission: data.transmission,
            engine: sanitizeText(data.engine),
            color: sanitizeText(data.color),
            price: data.price,
            categoryId: data.categoryId,
            description: sanitizeHtml(data.description),
            installmentAvailable: data.installmentAvailable,
            installmentDetails: data.installmentDetails
              ? sanitizeHtml(data.installmentDetails)
              : "",
            featured: data.featured,
            sold: data.sold,
            images: data.images,
          },
        ],
        { session }
      );
      createdCar = car;
    });

    return apiSuccess(createdCar, "Car created successfully", 201);
  } catch (err) {
    console.error("Create car error:", err);

    // Roll back: remove any images that were already uploaded to
    // Cloudinary for this car since the DB write failed.
    if (data.images?.length) {
      await deleteCloudinaryImages(data.images.map((img) => img.publicId));
    }

    return apiError("Failed to create car. Uploaded images have been cleaned up.", 500);
  } finally {
    await session.endSession();
  }
}

/** Escape special regex characters in user-supplied search strings */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
