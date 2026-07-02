import type { Metadata } from "next";
import CategoryManager from "@/components/CategoryManager";
import { getCategoriesWithCounts } from "@/actions/category.actions";

export const metadata: Metadata = { title: "Manage Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
          Manage Categories
        </h1>
        <p className="mt-1 text-sm text-muted">
          Categories power the &quot;Shop by Category&quot; section and filters on the public site.
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
