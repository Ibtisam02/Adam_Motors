"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ICategory } from "@/types";

interface CarFiltersProps {
  categories: ICategory[];
  brands: string[];
  years: number[];
  basePath?: string;
  initial: {
    search?: string;
    category?: string;
    brand?: string;
    year?: string;
    fuelType?: string;
    transmission?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
  children: React.ReactNode;
}

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"];
const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "Semi-Automatic"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

interface FilterFormState {
  search: string;
  category: string;
  brand: string;
  year: string;
  fuelType: string;
  transmission: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export default function CarFilters({ categories, brands, years, basePath = "/cars", initial, children }: CarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<FilterFormState>({
    search: initial.search || "",
    category: initial.category || "",
    brand: initial.brand || "",
    year: initial.year || "",
    fuelType: initial.fuelType || "",
    transmission: initial.transmission || "",
    minPrice: initial.minPrice || "",
    maxPrice: initial.maxPrice || "",
    sort: initial.sort || "newest",
  });

  function update(key: keyof FilterFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters(overrides?: Partial<FilterFormState>) {
    const merged = { ...form, ...overrides };
    const params = new URLSearchParams();

    Object.entries(merged).forEach(([key, value]) => {
      if (value && !(key === "sort" && value === "newest")) {
        params.set(key, value);
      }
    });

    // Use the current pathname so category pages keep their own slug-based
    // filtering and the listing page uses query params.
    const target = pathname.startsWith("/categories") ? basePath : pathname;
    router.push(`${target}${params.toString() ? `?${params.toString()}` : ""}`);
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  function clearFilters() {
    const empty: FilterFormState = {
      search: "",
      category: "",
      brand: "",
      year: "",
      fuelType: "",
      transmission: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    };
    setForm(empty);
    router.push(basePath);
    setOpen(false);
  }

  const activeFilterCount = Object.entries(form).filter(
    ([key, value]) => value && !(key === "sort" || key === "search")
  ).length;

  return (
    <div className="mb-8">
      {/* Top bar: search + mobile filter toggle + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={form.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Search by title, brand, or model…"
            className="input-field pl-10"
          />
        </form>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-outline relative shrink-0 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brass-400 px-1 text-[11px] font-bold text-charcoal-950">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={form.sort}
          onChange={(e) => {
            update("sort", e.target.value);
            applyFilters({ sort: e.target.value });
          }}
          className="input-field shrink-0 sm:w-56"
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-6 lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="hidden w-full max-w-xs shrink-0 lg:block">
          <FilterForm
            form={form}
            update={update}
            categories={categories}
            brands={brands}
            years={years}
            onApply={() => applyFilters()}
            onClear={clearFilters}
          />
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-charcoal-950/70" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-charcoal-900 p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-ink">
                  Filters
                </h2>
                <button onClick={() => setOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5 text-muted" />
                </button>
              </div>
              <FilterForm
                form={form}
                update={update}
                categories={categories}
                brands={brands}
                years={years}
                onApply={() => applyFilters()}
                onClear={clearFilters}
              />
            </div>
          </div>
        )}

        {/* Results column */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

interface FilterFormProps {
  form: FilterFormState;
  update: (key: keyof FilterFormState, value: string) => void;
  categories: ICategory[];
  brands: string[];
  years: number[];
  onApply: () => void;
  onClear: () => void;
}

function FilterForm({ form, update, categories, brands, years, onApply, onClear }: FilterFormProps) {
  return (
    <div className="card-surface space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
          Refine Results
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-muted hover:text-brass-400"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div>
        <label className="label-field">Category</label>
        <select
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className="input-field"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Brand</label>
        <select
          value={form.brand}
          onChange={(e) => update("brand", e.target.value)}
          className="input-field"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Year</label>
        <select
          value={form.year}
          onChange={(e) => update("year", e.target.value)}
          className="input-field"
        >
          <option value="">Any Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Fuel Type</label>
        <select
          value={form.fuelType}
          onChange={(e) => update("fuelType", e.target.value)}
          className="input-field"
        >
          <option value="">Any Fuel Type</option>
          {FUEL_TYPES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Transmission</label>
        <select
          value={form.transmission}
          onChange={(e) => update("transmission", e.target.value)}
          className="input-field"
        >
          <option value="">Any Transmission</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Price Range (USD)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={form.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
            className="input-field"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={form.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <button type="button" onClick={onApply} className={cn("btn-primary w-full")}>
        Apply Filters
      </button>
    </div>
  );
}
