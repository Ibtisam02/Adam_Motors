import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Car, { CarDocument } from "@/models/Car";
import Category from "@/models/Category";
import { CarFilters } from "@/types";

void Category;

/** Escape special regex characters in user-supplied search strings */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Fetch a paginated, filtered, sorted list of cars for the public
 * listing page. Mirrors the logic in /api/cars but runs directly
 * against the database for use in Server Components.
 */
export async function getCars(filters: CarFilters) {
  await connectDB();

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 48) : 12;

  const filter: Record<string, unknown> = { sold: false };

  if (filters.category) {
    if (mongoose.isValidObjectId(filters.category)) {
      filter.categoryId = filters.category;
    } else {
      const cat = await Category.findOne({ slug: filters.category }).lean();
      filter.categoryId = cat ? cat._id : null;
    }
  }

  if (filters.brand) {
    filter.brand = { $regex: `^${escapeRegex(filters.brand)}$`, $options: "i" };
  }
  if (filters.year) filter.year = Number(filters.year);
  if (filters.fuelType) filter.fuelType = filters.fuelType;
  if (filters.transmission) filter.transmission = filters.transmission;
  if (filters.featured === "true") filter.featured = true;

  if (filters.minPrice || filters.maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (filters.minPrice) priceFilter.$gte = Number(filters.minPrice);
    if (filters.maxPrice) priceFilter.$lte = Number(filters.maxPrice);
    filter.price = priceFilter;
  }

  if (filters.search) {
    const safe = escapeRegex(filters.search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { brand: { $regex: safe, $options: "i" } },
      { model: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
  };

  const sort = sortMap[filters.sort || "newest"];
  const skip = (page - 1) * limit;

  const [cars, total] = await Promise.all([
    Car.find(filter).populate("categoryId", "name slug").sort(sort).skip(skip).limit(limit).lean(),
    Car.countDocuments(filter),
  ]);

  return {
    data: JSON.parse(JSON.stringify(cars)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Admin-only car listing — includes sold cars and supports a simple
 * search + pagination for the management table.
 */
export async function getAllCarsAdmin(opts: { page?: number; limit?: number; search?: string }) {
  await connectDB();

  const page = opts.page && opts.page > 0 ? opts.page : 1;
  const limit = opts.limit && opts.limit > 0 ? opts.limit : 10;

  const filter: Record<string, unknown> = {};
  if (opts.search) {
    const safe = escapeRegex(opts.search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { brand: { $regex: safe, $options: "i" } },
      { model: { $regex: safe, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [cars, total] = await Promise.all([
    Car.find(filter)
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Car.countDocuments(filter),
  ]);

  return {
    data: JSON.parse(JSON.stringify(cars)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/** Get a single car by ID, populated with its category */
export async function getCarById(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;

  await connectDB();
  const car = await Car.findById(id).populate("categoryId", "name slug").lean();
  return car ? JSON.parse(JSON.stringify(car)) : null;
}

/** Get featured cars for the homepage */
export async function getFeaturedCars(limit = 6) {
  await connectDB();
  const cars = await Car.find({ featured: true, sold: false })
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(cars));
}

/** Get the latest cars added to the inventory */
export async function getLatestCars(limit = 8) {
  await connectDB();
  const cars = await Car.find({ sold: false })
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(cars));
}

/** Get other cars in the same category, excluding the current car */
export async function getRelatedCars(categoryId: string, excludeId: string, limit = 4) {
  await connectDB();
  const cars = await Car.find({
    categoryId,
    _id: { $ne: excludeId },
    sold: false,
  })
    .populate("categoryId", "name slug")
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(cars));
}

/** Get the distinct list of brands currently in inventory (for filters) */
export async function getDistinctBrands(): Promise<string[]> {
  await connectDB();
  const brands = await Car.distinct("brand", { sold: false });
  return (brands as string[]).sort();
}

/** Get the distinct list of years currently in inventory (for filters) */
export async function getDistinctYears(): Promise<number[]> {
  await connectDB();
  const years = await Car.distinct("year", { sold: false });
  return (years as number[]).sort((a, b) => b - a);
}

/** Total count of available (non-sold) cars */
export async function getAvailableCarCount(): Promise<number> {
  await connectDB();
  return Car.countDocuments({ sold: false });
}

export type { CarDocument };
