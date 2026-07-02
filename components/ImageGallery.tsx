"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ImageOff, Expand } from "lucide-react";
import { cld } from "@/lib/cloudinary-url";
import { cn } from "@/lib/utils";
import type { ICarImage } from "@/types";

interface ImageGalleryProps {
  images: ICarImage[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-white/5 bg-charcoal-800 text-muted">
        <ImageOff className="h-12 w-12" />
      </div>
    );
  }

  function prev() {
    setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setActive((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div>
      {/* Main image */}
      <div className="group relative aspect-video w-full overflow-hidden rounded-md border border-white/5 bg-charcoal-800">
        <Image
          src={cld(images[active].url, 1000)}
          alt={`${title} — photo ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />

        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-charcoal-950/50 text-ink backdrop-blur-md transition-colors hover:border-brass-400 hover:text-brass-400"
          aria-label="View full size"
        >
          <Expand className="h-4 w-4" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-charcoal-950/50 text-ink backdrop-blur-md transition-colors hover:border-brass-400 hover:text-brass-400"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-charcoal-950/50 text-ink backdrop-blur-md transition-colors hover:border-brass-400 hover:text-brass-400"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-sm bg-charcoal-950/70 px-2.5 py-1 text-xs font-medium text-ink">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.publicId}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border-2 transition-colors sm:h-20 sm:w-28",
                active === i ? "border-brass-400" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={cld(img.url, 200)}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal-950/95 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={cld(images[active].url, 1600)}
              alt={`${title} — full size`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
