import type { Metadata } from "next";
import ReviewModeration from "@/components/ReviewModeration";
import { getAllReviewsAdmin } from "@/actions/review.actions";

export const metadata: Metadata = { title: "Manage Reviews" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviewsAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
          Manage Reviews
        </h1>
        <p className="mt-1 text-sm text-muted">
          Reviews are hidden from the public site until approved here.
        </p>
      </div>

      <ReviewModeration reviews={reviews} />
    </div>
  );
}
