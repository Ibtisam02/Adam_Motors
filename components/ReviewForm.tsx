"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle, Star } from "lucide-react";
import { reviewSchema, type ReviewInput } from "@/schemas/contact-review.schema";
import { getRecaptchaToken } from "@/lib/recaptcha-client";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  carId: string;
}

export default function ReviewForm({ carId }: ReviewFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { carId, reviewerName: "", rating: 5, comment: "", website: "" },
  });

  async function onSubmit(values: ReviewInput) {
    setStatus("idle");
    setServerError(null);

    try {
      const recaptchaToken = await getRecaptchaToken("review");

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, carId, recaptchaToken }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      reset({ carId, reviewerName: "", rating: 5, comment: "", website: "" });
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface space-y-4 p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-ink">
        Leave a Review
      </h3>

      <div className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div>
        <label htmlFor="reviewerName" className="label-field">Your Name</label>
        <input
          id="reviewerName"
          type="text"
          className="input-field"
          placeholder="Jane Smith"
          {...register("reviewerName")}
        />
        {errors.reviewerName && <p className="mt-1 text-xs text-red-400">{errors.reviewerName.message}</p>}
      </div>

      <div>
        <label className="label-field">Rating</label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => field.onChange(star)}
                  aria-label={`Rate ${star} out of 5`}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      star <= field.value
                        ? "fill-brass-400 text-brass-400"
                        : "fill-transparent text-muted/40 hover:text-brass-300"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        />
        {errors.rating && <p className="mt-1 text-xs text-red-400">{errors.rating.message}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="label-field">Your Review</label>
        <textarea
          id="comment"
          rows={4}
          className="input-field resize-none"
          placeholder="Share your experience with this vehicle or our dealership…"
          {...register("comment")}
        />
        {errors.comment && <p className="mt-1 text-xs text-red-400">{errors.comment.message}</p>}
      </div>

      {status === "success" && (
        <div className="flex items-start gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Thank you! Your review has been submitted and is awaiting approval.</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
