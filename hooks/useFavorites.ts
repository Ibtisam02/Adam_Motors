"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dealership_favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    // Notify other components/tabs in this session
    window.dispatchEvent(new CustomEvent("favorites-changed", { detail: ids }));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently
  }
}

/**
 * Hook for managing the visitor's favorite cars in localStorage.
 * No account/login required — favorites persist across page refreshes
 * on the same browser.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    setIsLoaded(true);

    function handleChange(e: Event) {
      const custom = e as CustomEvent<string[]>;
      if (Array.isArray(custom.detail)) {
        setFavorites(custom.detail);
      } else {
        setFavorites(readFavorites());
      }
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setFavorites(readFavorites());
    }

    window.addEventListener("favorites-changed", handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("favorites-changed", handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isFavorite = useCallback(
    (carId: string) => favorites.includes(carId),
    [favorites]
  );

  const toggleFavorite = useCallback((carId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId];
      writeFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((carId: string) => {
    setFavorites((prev) => {
      const next = prev.filter((id) => id !== carId);
      writeFavorites(next);
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite, isLoaded };
}
