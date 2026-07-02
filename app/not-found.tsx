import Link from "next/link";
import { Car, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-edge flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Car className="h-12 w-12 text-brass-400/60" />
      <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-wide text-ink sm:text-5xl">
        404 — Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Let&apos;s get you back on the road.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to Homepage
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
