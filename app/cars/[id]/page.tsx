import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Palette,
  Cog,
  Tag,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import ImageGallery from "@/components/ImageGallery";
import FavoriteButton from "@/components/FavoriteButton";
import DealerActions from "@/components/DealerActions";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import CarCard from "@/components/CarCard";
import { getCarById, getRelatedCars } from "@/actions/car.actions";
import { getApprovedReviews } from "@/actions/review.actions";
import { formatPrice, formatNumber } from "@/lib/utils";
import type { ICategory } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);
console.log(car);

  if (!car) {
    return { title: "Vehicle Not Found" };
  }

  const description = `${car.year} ${car.brand} ${car.CarModel} — ${formatPrice(car.price)}. ${car.mileage.toLocaleString()} miles, ${car.fuelType}, ${car.transmission}.`;

  return {
    title: car.title,
    description,
    openGraph: {
      title: car.title,
      description,
      images: car.images?.[0]?.url ? [car.images[0].url] : [],
    },
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) notFound();

  const category = car.categoryId as ICategory | null;
  const [reviewData, relatedCars] = await Promise.all([
    getApprovedReviews(car._id),
    category ? getRelatedCars(category._id, car._id, 4) : Promise.resolve([]),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const specs = [
    { icon: Calendar, label: "Year", value: car.year },
    { icon: Gauge, label: "Mileage", value: `${formatNumber(car.mileage)} mi` },
    { icon: Fuel, label: "Fuel Type", value: car.fuelType },
    { icon: Settings2, label: "Transmission", value: car.transmission },
    { icon: Cog, label: "Engine", value: car.engine },
    { icon: Palette, label: "Color", value: car.color },
  ];

  return (
    <div className="container-edge py-8 sm:py-12">
      <Link href="/cars" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-brass-400">
        <ArrowLeft className="h-4 w-4" />
        Back to Inventory
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left: Gallery + details */}
        <div className="lg:col-span-2">
          <ImageGallery images={car.images} title={car.title} />

          <div className="mt-8">
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-brass-400 hover:underline"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl lg:text-4xl">
              {car.title}
            </h1>
            <p className="mt-1 text-muted">{car.brand} · {car.CarModel}</p>
          </div>

          {/* Specs grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-md border border-white/5 bg-charcoal-800 p-5 sm:grid-cols-3">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-start gap-2.5">
                <spec.icon className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">{spec.label}</p>
                  <p className="text-sm font-semibold text-ink">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-ink">
              Description
            </h2>
            <div
              className="prose-invert mt-3 max-w-none text-sm leading-relaxed text-ink/85 sm:text-base [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3"
              dangerouslySetInnerHTML={{ __html: car.description }}
            />
          </div>

          {/* Installment Information */}
          {car.installmentAvailable && (
            <div className="mt-8 rounded-md border border-brass-400/20 bg-brass-400/5 p-5">
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-5 w-5 text-brass-400" />
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brass-300">
                  Installment Plans Available
                </h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/85">
                Installment plans available. Check description or contact dealer for complete details.
              </p>
              {car.installmentDetails && (
                <div
                  className="prose-invert mt-3 max-w-none text-sm leading-relaxed text-ink/80 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: car.installmentDetails }}
                />
              )}
            </div>
          )}

          {/* Reviews */}
          <div className="mt-10" id="reviews">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-ink">
              Customer Reviews
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ReviewList
                reviews={reviewData.reviews}
                averageRating={reviewData.averageRating}
                totalReviews={reviewData.totalReviews}
              />
              <ReviewForm carId={car._id} />
            </div>
          </div>
        </div>

        {/* Right: Price card + actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 card-surface space-y-5 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Price</p>
                <p className="font-display text-3xl font-bold text-brass-400">
                  {formatPrice(car.price)}
                </p>
              </div>
              <FavoriteButton carId={car._id} />
            </div>

            {car.sold && (
              <div className="rounded-sm bg-charcoal-700 px-3 py-2 text-center text-sm font-semibold uppercase tracking-wider text-ink">
                This vehicle has been sold
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted">
              <Tag className="h-4 w-4 text-brass-400" />
              <span>Listing ID: {car._id.slice(-8).toUpperCase()}</span>
            </div>

            <DealerActions carTitle={car.title} carUrl={`${siteUrl}/cars/${car._id}`} />
          </div>
        </div>
      </div>

      {/* Related cars */}
      {relatedCars.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
            You May Also Like
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCars.map((related:any) => (
              <CarCard key={related._id} car={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
