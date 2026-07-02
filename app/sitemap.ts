import type { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import Car from "@/models/Car";
import Category from "@/models/Category";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/cars`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/favorites`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    await connectDB();

    const [cars, categories] = await Promise.all([
      Car.find({ sold: false }).select("_id updatedAt").lean(),
      Category.find().select("slug updatedAt").lean(),
    ]);

    const carRoutes: MetadataRoute.Sitemap = cars.map((car) => ({
      url: `${siteUrl}/cars/${car._id}`,
      lastModified: car.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${siteUrl}/categories/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...carRoutes, ...categoryRoutes];
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return staticRoutes;
  }
}
