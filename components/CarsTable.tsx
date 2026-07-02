"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star, CheckCircle2, ImageOff, Loader2 } from "lucide-react";
import { cld } from "@/lib/cloudinary-url";
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import type { ICar, ICategory } from "@/types";

interface CarsTableProps {
  cars: ICar[];
}

export default function CarsTable({ cars: initialCars }: CarsTableProps) {
  const router = useRouter();
  const [cars, setCars] = useState(initialCars);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleField(car: ICar, field: "featured" | "sold") {
    setBusyId(car._id);

    const category = typeof car.categoryId === "object" ? (car.categoryId as ICategory)._id : car.categoryId;

    const payload = {
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      engine: car.engine,
      color: car.color,
      price: car.price,
      categoryId: category,
      description: car.description,
      installmentAvailable: car.installmentAvailable,
      installmentDetails: car.installmentDetails,
      featured: field === "featured" ? !car.featured : car.featured,
      sold: field === "sold" ? !car.sold : car.sold,
      images: car.images,
    };

    try {
      const res = await fetch(`/api/cars/${car._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setCars((prev) => prev.map((c) => (c._id === car._id ? { ...c, ...payload, _id: c._id } as ICar : c)));
      }
    } catch {
      // Silently fail — the UI will simply not reflect the toggle
    } finally {
      setBusyId(null);
    }
  }

  async function deleteCar(carId: string) {
    if (!confirm("Delete this car permanently? This will also remove its images and reviews.")) return;

    setBusyId(carId);
    try {
      const res = await fetch(`/api/cars/${carId}`, { method: "DELETE" });
      const json = await res.json();

      if (res.ok && json.success) {
        setCars((prev) => prev.filter((c) => c._id !== carId));
        router.refresh();
      } else {
        alert(json.error || "Failed to delete car.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-12 text-center">
        <p className="font-display text-lg uppercase tracking-wide text-ink">No cars found</p>
        <p className="mt-2 text-sm text-muted">Add your first vehicle to get started.</p>
        <Link href="/admin/cars/new" className="btn-primary mt-4 inline-flex">
          Add New Car
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-white/5">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-charcoal-800 text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Specs</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {cars.map((car) => {
            const category = typeof car.categoryId === "object" ? (car.categoryId as ICategory) : null;
            const image = car.images?.[0];
            const busy = busyId === car._id;

            return (
              <tr key={car._id} className="bg-charcoal-900/40 hover:bg-charcoal-800/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-sm bg-charcoal-700">
                      {image ? (
                        <Image src={cld(image.url, 120)} alt={car.title} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="line-clamp-1 font-medium text-ink">{car.title}</p>
                      <p className="text-xs text-muted">{car.brand} {car.model} · {car.year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{category?.name || "—"}</td>
                <td className="px-4 py-3 font-semibold text-brass-400">{formatPrice(car.price)}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {formatNumber(car.mileage)} mi · {car.fuelType} · {car.transmission}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => toggleField(car, "featured")}
                      disabled={busy}
                      className={cn(
                        "flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-semibold uppercase transition-colors",
                        car.featured
                          ? "border-brass-400/40 bg-brass-400/15 text-brass-400"
                          : "border-white/10 text-muted hover:border-brass-400/40"
                      )}
                    >
                      <Star className="h-3 w-3" /> Featured
                    </button>
                    <button
                      onClick={() => toggleField(car, "sold")}
                      disabled={busy}
                      className={cn(
                        "flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-semibold uppercase transition-colors",
                        car.sold
                          ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                          : "border-white/10 text-muted hover:border-emerald-400/40"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Sold
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {busy && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                    <Link
                      href={`/admin/cars/${car._id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-ink/70 transition-colors hover:border-brass-400 hover:text-brass-400"
                      aria-label="Edit car"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => deleteCar(car._id)}
                      disabled={busy}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-ink/70 transition-colors hover:border-red-400 hover:text-red-400"
                      aria-label="Delete car"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
