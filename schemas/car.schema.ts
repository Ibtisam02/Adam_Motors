import { z } from "zod";

const currentYear = new Date().getFullYear();

export const carImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  publicId: z.string().min(1, "Missing image public ID"),
});

export const carSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be under 150 characters"),
  brand: z.string().trim().min(1, "Brand is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(60),
  year: z.coerce
    .number()
    .int("Year must be a whole number")
    .min(1950, "Year must be 1950 or later")
    .max(currentYear + 1, `Year cannot be after ${currentYear + 1}`),
  mileage: z.coerce.number().min(0, "Mileage cannot be negative"),
  fuelType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric", "CNG"]),
  transmission: z.enum(["Automatic", "Manual", "CVT", "Semi-Automatic"]),
  engine: z.string().trim().min(1, "Engine details are required").max(100),
  color: z.string().trim().min(1, "Color is required").max(40),
  price: z.coerce.number().positive("Price must be a positive number"),
  categoryId: z.string().min(1, "Category is required"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  installmentAvailable: z.coerce.boolean().default(false),
  installmentDetails: z.string().trim().max(5000).optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  sold: z.coerce.boolean().default(false),
  images: z.array(carImageSchema).max(15, "Maximum of 15 images allowed").default([]),
});

export type CarInput = z.infer<typeof carSchema>;

// Used for query-string filtering on the listing page / API
export const carFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  search: z.string().trim().max(100).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  year: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sort: z.enum(["newest", "oldest", "price_low", "price_high"]).default("newest"),
  featured: z.string().optional(),
});
