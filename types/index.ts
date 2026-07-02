// Shared TypeScript type definitions used across the app

export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric" | "CNG";
export type TransmissionType = "Automatic" | "Manual" | "CVT" | "Semi-Automatic";

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  carCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICarImage {
  url: string;
  publicId: string;
}

export interface ICar {
  _id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  engine: string;
  color: string;
  price: number;
  categoryId: string | ICategory;
  description: string;
  installmentAvailable: boolean;
  installmentDetails?: string;
  featured: boolean;
  sold: boolean;
  images: ICarImage[];
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  carId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "responded";
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CarFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  year?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: "newest" | "oldest" | "price_low" | "price_high";
  featured?: string;
}

export interface AdminJwtPayload {
  id: string;
  email: string;
  role: "admin";
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}
