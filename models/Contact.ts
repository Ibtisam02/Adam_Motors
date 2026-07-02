import { Schema, model, models, Model, Document } from "mongoose";

export interface ContactDocument extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "responded";
  createdAt: Date;
}

const ContactSchema = new Schema<ContactDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: 30,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["new", "read", "responded"],
      default: "new",
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Contact: Model<ContactDocument> =
  models.Contact || model<ContactDocument>("Contact", ContactSchema);

export default Contact;
