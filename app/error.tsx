"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console for debugging — never expose
    // internal details to the user.
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container-edge flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="h-12 w-12 text-brass-400/60" />
      <h1 className="mt-6 font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
        Something Went Wrong
      </h1>
      <p className="mt-3 max-w-md text-muted">
        We hit an unexpected error loading this page. Please try again, and if
        the problem continues, contact our team.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => reset()} className="btn-primary">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
        <Link href="/" className="btn-outline">
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
