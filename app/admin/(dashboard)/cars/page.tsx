import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import CarsTable from "@/components/CarsTable";
import Pagination from "@/components/Pagination";
import { getAllCarsAdmin } from "@/actions/car.actions";

export const metadata: Metadata = { title: "Manage Cars" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminCarsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;

  const { data: cars, pagination } = await getAllCarsAdmin({ page, search: sp.search });

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (targetPage > 1) params.set("page", String(targetPage));
    return `/admin/cars${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
            Manage Cars
          </h1>
          <p className="mt-1 text-sm text-muted">{pagination.total} total vehicles</p>
        </div>
        <Link href="/admin/cars/new" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Add New Car
        </Link>
      </div>

      <form className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          name="search"
          defaultValue={sp.search}
          placeholder="Search by title, brand, or model…"
          className="input-field pl-10"
        />
      </form>

      <CarsTable cars={cars} />

      <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} buildHref={buildHref} />
    </div>
  );
}
