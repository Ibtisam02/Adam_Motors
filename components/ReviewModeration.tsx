"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import StarRating from "./StarRating";
import { formatDate, cn } from "@/lib/utils";
import type { IReview, ICar } from "@/types";

type ReviewWithCar = IReview & { carId: Pick<ICar, "_id" | "title" | "brand" | "CarModel"> | string };

interface ReviewModerationProps {
  reviews: ReviewWithCar[];
}

type FilterTab = "pending" | "approved" | "all";

export default function ReviewModeration({ reviews: initial }: ReviewModerationProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initial);
  const [tab, setTab] = useState<FilterTab>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = reviews.filter((r) => {
    if (tab === "pending") return !r.approved;
    if (tab === "approved") return r.approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;

  async function setApproved(id: string, approved: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, approved } : r)));
        router.refresh();
      }
    } catch {
      // no-op
    } finally {
      setBusyId(null);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Permanently delete this review?")) return;

    setBusyId(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (res.ok && json.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        router.refresh();
      }
    } catch {
      // no-op
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>
          Pending {pendingCount > 0 && `(${pendingCount})`}
        </TabButton>
        <TabButton active={tab === "approved"} onClick={() => setTab("approved")}>
          Approved
        </TabButton>
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          All
        </TabButton>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-12 text-center">
          <p className="font-display text-lg uppercase tracking-wide text-ink">No reviews here</p>
          <p className="mt-2 text-sm text-muted">
            {tab === "pending" ? "All caught up — nothing awaiting approval." : "Nothing to show yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((review) => {
            const car = typeof review.carId === "object" ? review.carId : null;
            const busy = busyId === review._id;

            return (
              <li key={review._id} className="card-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">{review.reviewerName}</p>
                      <span
                        className={cn(
                          "rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          review.approved ? "bg-emerald-400/15 text-emerald-300" : "bg-brass-400/15 text-brass-300"
                        )}
                      >
                        {review.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    {car && (
                      <Link href={`/cars/${car._id}`} target="_blank" className="text-xs text-brass-400 hover:underline">
                        {car.title}
                      </Link>
                    )}
                    <p className="mt-1 text-xs text-muted">{formatDate(review.createdAt)}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-ink/90">{review.comment}</p>

                <div className="mt-4 flex items-center gap-2">
                  {busy && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                  {!review.approved ? (
                    <button
                      onClick={() => setApproved(review._id, true)}
                      disabled={busy}
                      className="btn-outline border-emerald-400/30 text-emerald-300 hover:border-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => setApproved(review._id, false)}
                      disabled={busy}
                      className="btn-outline"
                    >
                      <X className="h-3.5 w-3.5" />
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review._id)}
                    disabled={busy}
                    className="btn-outline border-red-400/30 text-red-300 hover:border-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-sm px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors",
        active ? "bg-brass-400 text-charcoal-950" : "border border-white/10 text-ink/70 hover:border-brass-400 hover:text-brass-400"
      )}
    >
      {children}
    </button>
  );
}
