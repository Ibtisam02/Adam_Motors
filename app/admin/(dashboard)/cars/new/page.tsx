import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CarForm from "@/components/CarForm";
import { getCategories } from "@/actions/category.actions";

export const metadata: Metadata = { title: "Add New Car" };
export const dynamic = "force-dynamic";

export default async function NewCarPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/cars" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brass-400">
          <ArrowLeft className="h-4 w-4" />
          Back to Cars
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
          Add New Car
        </h1>
      </div>

      {categories.length === 0 && (
        <div className="rounded-sm border border-brass-400/30 bg-brass-400/10 p-4 text-sm text-brass-300">
          You need to create at least one category before adding a car.{" "}
          <Link href="/admin/categories" className="underline">
            Create a category
          </Link>
        </div>
      )}

      <CarForm categories={categories} />
    </div>
  );
}
