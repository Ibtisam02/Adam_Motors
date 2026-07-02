import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Car from "@/models/Car";
import Category from "@/models/Category";
import Review from "@/models/Review";
import { carSchema } from "@/schemas/car.schema";
import { apiSuccess, apiError, sanitizeText, sanitizeHtml } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/csrf";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

void Category;

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/cars/:id
 * Public — returns a single car with its category populated.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid car ID", 400);
  }

  try {
    await connectDB();

    const car = await Car.findById(id).populate("categoryId", "name slug").lean();

    if (!car) {
      return apiError("Car not found", 404);
    }

    return apiSuccess(car);
  } catch (err) {
    console.error("Get car error:", err);
    return apiError("Failed to load car", 500);
  }
}

/**
 * PUT /api/cars/:id
 * Admin only — update a car listing. If images were removed compared to
 * the previous version, those are deleted from Cloudinary.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid car ID", 400);
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

  if (!mongoose.isValidObjectId(data.categoryId)) {
    return apiError("Invalid category", 400);
  }

  try {
    await connectDB();

    const existingCar = await Car.findById(id);
    if (!existingCar) {
      return apiError("Car not found", 404);
    }

    const category = await Category.findById(data.categoryId);
    if (!category) {
      return apiError("Selected category does not exist", 400);
    }

    // Determine which images were removed so we can clean them up
    const oldPublicIds = new Set(existingCar.images.map((img) => img.publicId));
    const newPublicIds = new Set(data.images.map((img) => img.publicId));
    const removedPublicIds = [...oldPublicIds].filter((pid) => !newPublicIds.has(pid));

    existingCar.title = sanitizeText(data.title);
    existingCar.brand = sanitizeText(data.brand);
    existingCar.model = sanitizeText(data.model);
    existingCar.year = data.year;
    existingCar.mileage = data.mileage;
    existingCar.fuelType = data.fuelType;
    existingCar.transmission = data.transmission;
    existingCar.engine = sanitizeText(data.engine);
    existingCar.color = sanitizeText(data.color);
    existingCar.price = data.price;
    existingCar.categoryId = new mongoose.Types.ObjectId(data.categoryId);
    existingCar.description = sanitizeHtml(data.description);
    existingCar.installmentAvailable = data.installmentAvailable;
    existingCar.installmentDetails = data.installmentDetails
      ? sanitizeHtml(data.installmentDetails)
      : "";
    existingCar.featured = data.featured;
    existingCar.sold = data.sold;
    existingCar.images = data.images;

    await existingCar.save();

    if (removedPublicIds.length) {
      await deleteCloudinaryImages(removedPublicIds);
    }

    return apiSuccess(existingCar, "Car updated successfully");
  } catch (err) {
    console.error("Update car error:", err);
    return apiError("Failed to update car", 500);
  }
}

/**
 * DELETE /api/cars/:id
 * Admin only — delete a car, its Cloudinary images, and its reviews.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Unauthorized", 401);

  if (!verifySameOrigin(request)) {
    return apiError("Invalid request origin", 403);
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return apiError("Invalid car ID", 400);
  }

  const session = await mongoose.startSession();

  try {
    await connectDB();

    const car = await Car.findById(id);
    if (!car) {
      return apiError("Car not found", 404);
    }

    await session.withTransaction(async () => {
      await Car.findByIdAndDelete(id, { session });
      await Review.deleteMany({ carId: id }, { session });
    });

    if (car.images.length) {
      await deleteCloudinaryImages(car.images.map((img) => img.publicId));
    }

    return apiSuccess(null, "Car deleted successfully");
  } catch (err) {
    console.error("Delete car error:", err);
    return apiError("Failed to delete car", 500);
  } finally {
    await session.endSession();
  }
}
