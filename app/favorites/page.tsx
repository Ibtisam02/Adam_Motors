"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, ArrowRight } from "lucide-react";
import CarCard from "@/components/CarCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { ICar } from "@/types";

export default function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (favorites.length === 0) {
      setCars([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      favorites.map((id) =>
        fetch(`/api/cars/${id}`)
          .then((res) => res.json())
          .then((json) => (json.success ? json.data : null))
          .catch(() => null)
      )
    ).then((results) => {
      if (!cancelled) {
        setCars(results.filter(Boolean) as ICar[]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [favorites, isLoaded]);

  return (
    <div className="container-edge py-10 sm:py-14">
      <div className="mb-8">
        <p className="section-eyebrow">
          <span className="h-px w-8 bg-brass-400" />
          Saved Vehicles
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
          My Favorites
        </h1>
        <p className="mt-2 text-sm text-muted">
          Vehicles you save are stored on this device — no account required.
        </p>
      </div>

      {!isLoaded || loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brass-400" />
        </div>
      ) : cars.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted/40" />
          <p className="mt-3 font-display text-lg uppercase tracking-wide text-ink">
            There is No favorites yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Tap the heart icon on any vehicle to save it here for later.
          </p>
          <Link href="/cars" className="btn-primary mt-5 inline-flex">
            Browse Inventory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
