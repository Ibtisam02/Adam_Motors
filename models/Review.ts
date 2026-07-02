import { Schema, model, models, Model, Document, Types } from "mongoose";

export interface ReviewDocument extends Document {
  carId: Types.ObjectId;
  reviewerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    carId: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
      index: true,
    },
    reviewerName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: 1000,
    },
    approved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReviewSchema.index({ carId: 1, approved: 1 });

const Review: Model<ReviewDocument> =
  models.Review || model<ReviewDocument>("Review", ReviewSchema);

export default Review;
