import connectDB from "@/lib/db";
import Car from "@/models/Car";
import Category from "@/models/Category";
import Review from "@/models/Review";
import Contact from "@/models/Contact";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Aggregate dashboard stats for the admin overview page */
export async function getDashboardStats() {
  await connectDB();

  const [totalCars, totalCategories, totalReviews, totalMessages, pendingReviews, newMessages] =
    await Promise.all([
      Car.countDocuments(),
      Category.countDocuments(),
      Review.countDocuments({ approved: true }),
      Contact.countDocuments(),
      Review.countDocuments({ approved: false }),
      Contact.countDocuments({ status: "new" }),
    ]);

  const carsByCategoryAgg = await Car.aggregate([
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ["$category.name", "Uncategorized"] },
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyInquiriesAgg = await Contact.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthlyInquiries: { month: string; count: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const match = monthlyInquiriesAgg.find(
      (m) => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1
    );
    monthlyInquiries.push({
      month: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      count: match ? match.count : 0,
    });
  }

  const [recentCars, recentReviews, recentMessages] = await Promise.all([
    Car.find().sort({ createdAt: -1 }).limit(5).select("title brand model price createdAt").lean(),
    Review.find().sort({ createdAt: -1 }).limit(5).populate("carId", "title").lean(),
    Contact.find().sort({ createdAt: -1 }).limit(5).select("name email status createdAt").lean(),
  ]);

  return {
    cards: {
      totalCars,
      totalCategories,
      totalReviews,
      totalMessages,
      pendingReviews,
      newMessages,
    },
    charts: {
      carsByCategory: JSON.parse(JSON.stringify(carsByCategoryAgg)) as { name: string; count: number }[],
      monthlyInquiries,
    },
    recentActivity: {
      cars: JSON.parse(JSON.stringify(recentCars)),
      reviews: JSON.parse(JSON.stringify(recentReviews)),
      messages: JSON.parse(JSON.stringify(recentMessages)),
    },
  };
}
