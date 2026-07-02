import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CarForm from "@/components/CarForm";
import { getCategories } from "@/actions/category.actions";
import { getCarById } from "@/actions/car.actions";

export const metadata: Metadata = { title: "Edit Car" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: PageProps) {
  const { id } = await params;
  const [categories, car] = await Promise.all([getCategories(), getCarById(id)]);

  if (!car) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/cars" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brass-400">
          <ArrowLeft className="h-4 w-4" />
          Back to Cars
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
          Edit Car
        </h1>
        <p className="mt-1 text-sm text-muted">{car.title}</p>
      </div>

      <CarForm categories={categories} car={car} />
    </div>
  );
}
