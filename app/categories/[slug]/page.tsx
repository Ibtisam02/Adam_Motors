import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarCard from "@/components/CarCard";
import CarFilters from "@/components/CarFilters";
import Pagination from "@/components/Pagination";
import { getCars, getDistinctBrands, getDistinctYears } from "@/actions/car.actions";
import { getCategories, getCategoryBySlug } from "@/actions/category.actions";
import { ICar } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    brand?: string;
    year?: string;
    fuelType?: string;
    transmission?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: "newest" | "oldest" | "price_low" | "price_high";
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} for Sale`,
    description:
      category.description ||
      `Browse our full inventory of ${category.name} vehicles. Compare prices, specs, and availability.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = sp.page ? Number(sp.page) : 1;

  const [{ data: cars, pagination }, categories, brands, years] = await Promise.all([
    getCars({ ...sp, category: slug, page }),
    getCategories(),
    getDistinctBrands(),
    getDistinctYears(),
  ]);

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([key, value]) => {
      if (value && key !== "page") params.set(key, String(value));
    });
    if (targetPage > 1) params.set("page", String(targetPage));
    return `/categories/${slug}${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <div className="container-edge py-10 sm:py-14">
      <div className="mb-8">
        <p className="section-eyebrow">
          <span className="h-px w-8 bg-brass-400" />
          Shop by Category
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
          {category.name}
        </h1>
        {category.description && <p className="mt-2 max-w-2xl text-muted">{category.description}</p>}
        <p className="mt-2 text-sm text-muted">
          {pagination.total} {pagination.total === 1 ? "vehicle" : "vehicles"} available
        </p>
      </div>

      <CarFilters
        categories={categories}
        brands={brands}
        years={years}
        basePath="/cars"
        initial={{
          search: sp.search,
          category: slug,
          brand: sp.brand,
          year: sp.year,
          fuelType: sp.fuelType,
          transmission: sp.transmission,
          minPrice: sp.minPrice,
          maxPrice: sp.maxPrice,
          sort: sp.sort,
        }}
      >
        {cars.length === 0 ? (
          <div className="rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-12 text-center">
            <p className="font-display text-lg uppercase tracking-wide text-ink">
              No vehicles in this category yet
            </p>
            <p className="mt-2 text-sm text-muted">Check back soon or browse the full inventory.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car:ICar, i:number) => (
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
