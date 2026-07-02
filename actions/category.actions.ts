import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Car from "@/models/Car";

/** Get all categories with a count of available cars in each */
export async function getCategoriesWithCounts() {
  await connectDB();

  const categories = await Category.find().sort({ name: 1 }).lean();

  const counts = await Car.aggregate([
    { $match: { sold: false } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  return categories.map((cat) => ({
    ...JSON.parse(JSON.stringify(cat)),
    carCount: countMap.get(cat._id.toString()) || 0,
  }));
}

/** Get all categories (no counts) */
export async function getCategories() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

/** Get a single category by its slug */
export async function getCategoryBySlug(slug: string) {
  await connectDB();
  const category = await Category.findOne({ slug }).lean();
  return category ? JSON.parse(JSON.stringify(category)) : null;
}
