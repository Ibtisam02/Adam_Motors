import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ICategory } from "@/types";

// Maps common category names to a representative gradient/emoji-free icon
// treatment so the grid feels designed rather than generic, even before
// per-category images are uploaded.
const CATEGORY_LABELS: Record<string, string> = {
  suv: "Built for every terrain",
  sedan: "Comfort meets efficiency",
  hatchback: "Compact & city-ready",
  truck: "Power & capability",
  luxury: "Premium experience",
  sports: "Performance unleashed",
};

interface CategoryCardProps {
  category: ICategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const tagline = CATEGORY_LABELS[category.slug] || category.description || "Explore the lineup";

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-md border border-white/5 bg-charcoal-800 p-6 shadow-card transition-all duration-300 hover:border-brass-400/40 hover:bg-charcoal-700"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brass-400/10 blur-2xl transition-transform duration-500 group-hover:scale-150"
        aria-hidden
      />
      <div className="relative">
        <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-ink sm:text-2xl">
          {category.name}
        </h3>
        <p className="mt-1.5 text-sm text-muted">{tagline}</p>
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-brass-400">
          {category.carCount ?? 0} {category.carCount === 1 ? "vehicle" : "vehicles"}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink transition-all duration-300 group-hover:border-brass-400 group-hover:bg-brass-400 group-hover:text-charcoal-950">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
