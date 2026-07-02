import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import Hero from "@/components/Hero";
import CarCard from "@/components/CarCard";
import CategoryCard from "@/components/CategoryCard";
import StarRating from "@/components/StarRating";
import ContactForm from "@/components/ContactForm";
import { getFeaturedCars, getLatestCars } from "@/actions/car.actions";
import { getCategoriesWithCounts } from "@/actions/category.actions";
import { getLatestApprovedReviews } from "@/actions/review.actions";
import type { ICar, ICategory, IReview } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  let featuredCars: ICar[] = [];
  let latestCars: ICar[] = [];
  let categories: ICategory[] = [];
  let reviews: (IReview & { carId: { title: string } })[] = [];

  try {
    [featuredCars, latestCars, categories, reviews] = await Promise.all([
      getFeaturedCars(6),
      getLatestCars(8),
      getCategoriesWithCounts(),
      getLatestApprovedReviews(6),
    ]);
  } catch (err) {
    console.error("Homepage data error:", err);
  }

  return (
    <>
      <Hero />

      {/* Featured Cars */}
      <section id="featured" className="bg-charcoal-950 py-16 sm:py-24">
        <div className="container-edge">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">
                <span className="h-px w-8 bg-brass-400" />
                Handpicked
              </p>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
                Featured Vehicles
              </h2>
            </div>
            <Link href="/cars?featured=true" className="btn-outline shrink-0">
              View All Featured
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredCars.length === 0 ? (
            <EmptyState message="Featured vehicles will appear here once the admin marks cars as featured." />
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCars.map((car, i) => (
                <CarCard key={car._id} car={car} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="bg-charcoal-900 py-16 sm:py-24">
        <div className="container-edge">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow justify-center">
              <span className="h-px w-8 bg-brass-400" />
              Find Your Fit
              <span className="h-px w-8 bg-brass-400" />
            </p>
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-3 text-muted">
              Whether you need rugged capability or everyday efficiency, browse
              our inventory by body style to find the right match.
            </p>
          </div>

          {categories.length === 0 ? (
            <EmptyState message="Categories will appear here once the admin adds them." />
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Cars */}
      <section className="bg-charcoal-950 py-16 sm:py-24">
        <div className="container-edge">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">
                <span className="h-px w-8 bg-brass-400" />
                Just Arrived
              </p>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
                Latest Additions
              </h2>
            </div>
            <Link href="/cars?sort=newest" className="btn-outline shrink-0">
              View Full Inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {latestCars.length === 0 ? (
            <EmptyState message="New inventory will appear here as soon as the admin adds vehicles." />
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestCars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="bg-charcoal-900 py-16 sm:py-24">
        <div className="container-edge">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow justify-center">
              <span className="h-px w-8 bg-brass-400" />
              Word on the Lot
              <span className="h-px w-8 bg-brass-400" />
            </p>
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
              Customer Reviews
            </h2>
          </div>

          {reviews.length === 0 ? (
            <EmptyState message="Customer reviews will appear here once approved by the admin." />
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <div key={review._id} className="card-surface flex flex-col gap-3 p-6">
                  <MessageSquare className="h-6 w-6 text-brass-400/60" />
                  <StarRating rating={review.rating} />
                  <p className="line-clamp-4 text-sm leading-relaxed text-ink/90">
                    {review.comment}
                  </p>
                  <div className="mt-auto pt-2">
                    <p className="text-sm font-semibold text-ink">{review.reviewerName}</p>
                    {review.carId?.title && (
                      <p className="text-xs text-muted">on {review.carId.title}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-charcoal-950 py-16 sm:py-24">
        <div className="container-edge">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <p className="section-eyebrow">
                <span className="h-px w-8 bg-brass-400" />
                Get In Touch
              </p>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
                Have Questions? <br className="hidden sm:block" />
                We&apos;re Here to Help
              </h2>
              <p className="mt-4 max-w-md text-muted">
                Send us a message about a specific vehicle, financing, or a
                trade-in, and our team will respond as soon as possible.
              </p>

              <div className="mt-8 space-y-4 text-sm text-muted">
                <p>
                  <span className="font-semibold text-ink">Phone:</span>{" "}
                  {process.env.NEXT_PUBLIC_DEALER_PHONE}
                </p>
                <p>
                  <span className="font-semibold text-ink">Email:</span>{" "}
                  {process.env.NEXT_PUBLIC_DEALER_EMAIL}
                </p>
                <p>
                  <span className="font-semibold text-ink">Address:</span>{" "}
                  {process.env.NEXT_PUBLIC_DEALER_ADDRESS}
                </p>
              </div>
            </div>

            <div className="card-surface p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-10 rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-10 text-center">
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
