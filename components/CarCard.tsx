import Link from "next/link";
import Image from "next/image";
import { Calendar, Gauge, Fuel, Settings2, ImageOff } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { formatPrice, formatNumber } from "@/lib/utils";
import { cld } from "@/lib/cloudinary-url";
import type { ICar } from "@/types";

interface CarCardProps {
  car: ICar;
  priority?: boolean;
}

export default function CarCard({ car, priority = false }: CarCardProps) {
  const image = car.images?.[0];
  const category = typeof car.categoryId === "object" ? car.categoryId : null;

  return (
    <Link
      href={`/cars/${car._id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-white/5 bg-charcoal-800 shadow-card transition-transform duration-300 hover:-translate-y-1 hover:border-brass-400/30"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal-700">
        {image ? (
          <Image
            src={cld(image.url, 600)}
            alt={car.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {car.featured && (
            <span className="rounded-sm bg-brass-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-charcoal-950">
              Featured
            </span>
          )}
          {car.sold && (
            <span className="rounded-sm bg-charcoal-950/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
              Sold
            </span>
          )}
          {car.installmentAvailable && !car.sold && (
            <span className="rounded-sm bg-charcoal-950/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brass-300">
              Installments
            </span>
          )}
        </div>

        <FavoriteButton carId={car._id} size="sm" className="absolute right-3 top-3" />

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal-950/90 to-transparent px-4 pb-3 pt-8">
          <p className="font-display text-xl font-semibold text-brass-300 sm:text-2xl">
            {formatPrice(car.price)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {category && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-400">
              {category.name}
            </p>
          )}
          <h3 className="mt-1 line-clamp-1 font-display text-base font-semibold text-ink sm:text-lg">
            {car.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            {car.brand} {car.CarModel}
          </p>
        </div>

        {/* Spec strip — signature element */}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs text-muted sm:grid-cols-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brass-400/80" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-brass-400/80" />
            <span>{formatNumber(car.mileage)} mi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-brass-400/80" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 text-brass-400/80" />
            <span>{car.transmission}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
