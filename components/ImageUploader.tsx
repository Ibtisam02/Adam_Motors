"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { Upload, X, Loader2, GripVertical } from "lucide-react";
import { cld } from "@/lib/cloudinary-url";
import type { ICarImage } from "@/types";

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info: unknown }) => void
      ) => { open: () => void };
    };
  }
}

interface ImageUploaderProps {
  images: ICarImage[];
  onChange: (images: ICarImage[]) => void;
  maxImages?: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUploader({ images, onChange, maxImages = 15 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.cloudinary) {
      setScriptLoaded(true);
    }
  }, []);

  function openWidget() {
    setError(null);

    if (images.length >= maxImages) {
      setError(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    if (!window.cloudinary) {
      setError("Image upload service is still loading. Please try again in a moment.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError("Cloudinary is not configured. Check your .env.local file.");
      return;
    }

    setUploading(true);

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        multiple: true,
        maxFiles: maxImages - images.length,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxImageFileSize: MAX_FILE_SIZE,
        minImageWidth: 400,
        minImageHeight: 300,
        sources: ["local", "url", "camera"],
        showAdvancedOptions: false,
        cropping: false,
        theme: "minimal",
        styles: {
          palette: {
            window: "#181D26",
            windowBorder: "#232A36",
            tabIcon: "#D9A23C",
            menuIcons: "#9AA4B2",
            textDark: "#0A0C10",
            textLight: "#F4F1EB",
            link: "#D9A23C",
            action: "#D9A23C",
            inactiveTabIcon: "#4A5568",
            error: "#F87171",
            inProgress: "#D9A23C",
            complete: "#34D399",
            sourceBg: "#11151C",
          },
        },
      },
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload error:", err);
          setError("Upload failed. Please try again.");
          setUploading(false);
          return;
        }

        const info = result.info as Record<string, unknown>;

        if (result.event === "success") {
          onChange([
            ...images,
            {
              url: info.secure_url as string,
              publicId: info.public_id as string,
            },
          ]);
        }

        if (result.event === "close") {
          setUploading(false);
        }
      }
    );

    widget.open();
  }

  function removeImage(index: number) {
    const image = images[index];

    fetch("/api/upload/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId: image.publicId }),
    }).catch(() => {});

    onChange(images.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div>
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={img.publicId}
            className="group relative aspect-square overflow-hidden rounded-sm border border-white/10 bg-charcoal-800"
          >
            <Image
              src={cld(img.url, 300)}
              alt={`Car image ${i + 1}`}
              fill
              sizes="200px"
              className="object-cover"
            />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-sm bg-brass-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-charcoal-950">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal-950/80 text-ink opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {images.length > 1 && i > 0 && (
              <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveImage(i, i - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal-950/80 text-ink"
                  aria-label="Move left"
                >
                  <GripVertical className="h-3.5 w-3.5 rotate-90" />
                </button>
              </div>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={openWidget}
            disabled={uploading || !scriptLoaded}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-white/10 text-muted transition-colors hover:border-brass-400 hover:text-brass-400 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
            <span className="text-xs font-medium">
              {uploading ? "Uploading…" : "Add Photos"}
            </span>
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <p className="mt-2 text-xs text-muted">
        JPG, PNG, or WEBP. Max 10MB per image, minimum 400×300px. The first
        image is used as the cover photo. Up to {maxImages} images.
      </p>
    </div>
  );
}