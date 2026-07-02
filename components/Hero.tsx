"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldCheck, Wallet, Award } from "lucide-react";

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    router.push(`/cars${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden bg-charcoal-950">
      {/* Signature: ambient "headlight horizon" graphic */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(217,162,60,0.10)_0%,_transparent_60%)]" />
        <svg
          className="absolute bottom-0 left-0 right-0 h-1/2 w-full opacity-30"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          fill="none"
        >
          <path d="M0 400L1440 250V400H0Z" fill="url(#roadGrad)" />
          <line x1="0" y1="320" x2="1440" y2="220" stroke="#D9A23C" strokeOpacity="0.25" strokeWidth="1" />
          <line x1="0" y1="380" x2="1440" y2="290" stroke="#D9A23C" strokeOpacity="0.15" strokeWidth="1" />
          <defs>
            <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#181D26" />
              <stop offset="1" stopColor="#0A0C10" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container-edge relative flex min-h-[88vh] flex-col justify-center py-24 sm:min-h-[80vh]">
        <p className="section-eyebrow animate-fade-up">
          <span className="h-px w-8 bg-brass-400" />
          New &amp; Pre-Owned · Inspected &amp; Ready
        </p>

        <h1 className="max-w-3xl font-display text-4xl font-bold uppercase leading-[1.05] tracking-wide text-ink animate-fade-up sm:text-6xl lg:text-7xl">
          Drive home something
          <span className="block text-brass-400">worth the journey</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted animate-fade-up sm:text-lg">
          Every vehicle on our lot is inspected, priced transparently, and ready
          for a test drive. Browse the full inventory or search for the make,
          model, or body style you have in mind.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mt-8 flex w-full max-w-xl flex-col gap-2 animate-fade-up sm:flex-row sm:gap-0"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by make, model, or keyword…"
              className="h-12 w-full rounded-sm border border-white/10 bg-charcoal-800 pl-12 pr-4 text-sm text-ink placeholder:text-muted/60 focus:border-brass-400 sm:rounded-r-none sm:border-r-0"
            />
          </div>
          <button type="submit" className="btn-primary h-12 sm:rounded-l-none">
            Search Inventory
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-3 animate-fade-up">
          <a href="/cars" className="btn-outline">
            Browse All Inventory
            <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#featured" className="btn-ghost">
            View Featured Cars
          </a>
        </div>

        {/* Trust strip */}
        <div className="mt-14 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3 animate-fade-up">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-brass-400" />
            <div>
              <p className="text-sm font-semibold text-ink">Inspected Vehicles</p>
              <p className="text-xs text-muted">Every car checked before listing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-brass-400" />
            <div>
              <p className="text-sm font-semibold text-ink">Flexible Installments</p>
              <p className="text-xs text-muted">Plans tailored to your budget</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-brass-400" />
            <div>
              <p className="text-sm font-semibold text-ink">Trusted Dealership</p>
              <p className="text-xs text-muted">Years of satisfied customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
