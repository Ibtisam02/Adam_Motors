export default function CarsLoading() {
  return (
    <div className="container-edge py-10 sm:py-14">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-charcoal-800" />
        <div className="h-9 w-64 animate-pulse rounded bg-charcoal-800" />
        <div className="h-4 w-40 animate-pulse rounded bg-charcoal-800" />
      </div>

      <div className="h-12 w-full animate-pulse rounded-sm bg-charcoal-800" />

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-white/5 bg-charcoal-800">
            <div className="aspect-[4/3] w-full animate-pulse bg-charcoal-700" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-16 animate-pulse rounded bg-charcoal-700" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-charcoal-700" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-charcoal-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
