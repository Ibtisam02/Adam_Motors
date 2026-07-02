import type { Metadata } from "next";
import CarCard from "@/components/CarCard";
import CarFilters from "@/components/CarFilters";
import Pagination from "@/components/Pagination";
import { getCars, getDistinctBrands, getDistinctYears } from "@/actions/car.actions";
import { getCategories } from "@/actions/category.actions";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse our full inventory of new and pre-owned vehicles. Filter by category, brand, year, fuel type, transmission, and price.",
};

interface SearchParams {
  page?: string;
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

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;

  const [{ data: cars, pagination }, categories, brands, years] = await Promise.all([
    getCars({ ...params, page }),
    getCategories(),
    getDistinctBrands(),
    getDistinctYears(),
  ]);

  function buildHref(targetPage: number) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== "page") sp.set(key, String(value));
    });
    if (targetPage > 1) sp.set("page", String(targetPage));
    return `/cars${sp.toString() ? `?${sp.toString()}` : ""}`;
  }

  return (
    <div className="container-edge py-10 sm:py-14">
      <div className="mb-8">
        <p className="section-eyebrow">
          <span className="h-px w-8 bg-brass-400" />
          Full Inventory
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
          {params.featured === "true" ? "Featured Vehicles" : "All Vehicles"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {pagination.total} {pagination.total === 1 ? "vehicle" : "vehicles"} available
        </p>
      </div>

      <CarFilters
        categories={categories}
        brands={brands}
        years={years}
        initial={{
          search: params.search,
          category: params.category,
          brand: params.brand,
          year: params.year,
          fuelType: params.fuelType,
          transmission: params.transmission,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          sort: params.sort,
        }}
      >
        {cars.length === 0 ? (
          <div className="rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-12 text-center">
            <p className="font-display text-lg uppercase tracking-wide text-ink">
              No vehicles match your search
            </p>
            <p className="mt-2 text-sm text-muted">
              Try adjusting or clearing your filters to see more results.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car, i) => (
                <CarCard key={car._id} car={car} priority={i < 3} />
              ))}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              buildHref={buildHref}
            />
          </>
        )}
      </CarFilters>
    </div>
  );
}
