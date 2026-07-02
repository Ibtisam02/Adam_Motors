import { Schema, model, models, Model, Document, Types } from "mongoose";

export interface CarImage {
  url: string;
  publicId: string;
}

export interface CarDocument extends Document {
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric" | "CNG";
  transmission: "Automatic" | "Manual" | "CVT" | "Semi-Automatic";
  engine: string;
  color: string;
  price: number;
  categoryId: Types.ObjectId;
  description: string;
  installmentAvailable: boolean;
  installmentDetails?: string;
  featured: boolean;
  sold: boolean;
  images: CarImage[];
  createdAt: Date;
  updatedAt: Date;
}

const CarImageSchema = new Schema<CarImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const CarSchema = new Schema<CarDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      index: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1950, "Year must be 1950 or later"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
      index: true,
    },
    mileage: {
      type: Number,
      required: [true, "Mileage is required"],
      min: [0, "Mileage cannot be negative"],
    },
    fuelType: {
      type: String,
      required: true,
      enum: ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"],
      index: true,
    },
    transmission: {
      type: String,
      required: true,
      enum: ["Automatic", "Manual", "CVT", "Semi-Automatic"],
      index: true,
    },
    engine: {
      type: String,
      required: [true, "Engine details are required"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be a positive number"],
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 5000,
    },
    installmentAvailable: {
      type: Boolean,
      default: false,
    },
    installmentDetails: {
      type: String,
      maxlength: 5000,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    sold: {
      type: Boolean,
      default: false,
      index: true,
    },
    images: {
      type: [CarImageSchema],
      default: [],
      validate: {
        validator: (val: CarImage[]) => val.length <= 15,
        message: "A car can have at most 15 images",
      },
    },
  },
  { timestamps: true }
);

CarSchema.index({ title: "text", brand: "text", model: "text", description: "text" });
CarSchema.index({ createdAt: -1 });
CarSchema.index({ price: 1, year: -1 });

const Car: Model<CarDocument> = models.Car || model<CarDocument>("Car", CarSchema);

export default Car;
