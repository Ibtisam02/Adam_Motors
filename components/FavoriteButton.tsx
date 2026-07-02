"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  carId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function FavoriteButton({ carId, className, size = "md" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const active = isLoaded && isFavorite(carId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(carId);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200",
        active
          ? "border-brass-400 bg-brass-400/15 text-brass-400"
          : "border-white/20 bg-charcoal-950/50 text-ink hover:border-brass-400 hover:text-brass-400",
        sizeMap[size],
        className
      )}
    >
      <Heart className={cn(iconSizeMap[size], active && "fill-brass-400")} />
    </button>
  );
}
