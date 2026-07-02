"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart, Phone, ChevronDown, Car } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import type { ICategory } from "@/types";

interface NavbarProps {
  categories: ICategory[];
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Inventory" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ categories }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { favorites, isLoaded } = useFavorites();

  useEffect(() => {
    setOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-white/5 bg-charcoal-950/90 backdrop-blur-md"
          : "border-transparent bg-charcoal-950/40 backdrop-blur-sm"
      )}
    >
      <nav className="container-edge flex h-16 items-center justify-between sm:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-brass-400/40 text-brass-400 sm:h-10 sm:w-10">
            <Car className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-ink sm:text-xl">
            {process.env.NEXT_PUBLIC_SITE_NAME || "Prestige Motors"}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium uppercase tracking-[0.15em] text-ink/80 transition-colors hover:text-brass-400",
                pathname === link.href && "text-brass-400"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Categories dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoriesOpen((v) => !v)}
              onBlur={() => setTimeout(() => setCategoriesOpen(false), 150)}
              className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-[0.15em] text-ink/80 transition-colors hover:text-brass-400"
              aria-expanded={categoriesOpen}
            >
              Categories
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", categoriesOpen && "rotate-180")}
              />
            </button>

            {categoriesOpen && (
              <div className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-md border border-white/10 bg-charcoal-800 py-2 shadow-card">
                {categories.length === 0 && (
                  <p className="px-4 py-2 text-sm text-muted">No categories yet</p>
                )}
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/categories/${cat.slug}`}
                    className="block px-4 py-2 text-sm text-ink/80 transition-colors hover:bg-charcoal-700 hover:text-brass-400"
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="my-1 border-t border-white/10" />
                <Link
                  href="/cars"
                  className="block px-4 py-2 text-sm font-semibold text-brass-400 hover:bg-charcoal-700"
                >
                  View all inventory
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`tel:${process.env.NEXT_PUBLIC_DEALER_PHONE || ""}`}
            className="hidden items-center gap-2 text-sm font-medium text-ink/80 hover:text-brass-400 md:flex"
          >
            <Phone className="h-4 w-4" />
            <span>{process.env.NEXT_PUBLIC_DEALER_PHONE}</span>
          </a>

          <Link
            href="/favorites"
            className="relative flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 text-ink/80 transition-colors hover:border-brass-400 hover:text-brass-400"
            aria-label="View favorites"
          >
            <Heart className="h-5 w-5" />
            {isLoaded && favorites.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brass-400 text-[11px] font-bold text-charcoal-950">
                {favorites.length > 9 ? "9+" : favorites.length}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 text-ink/80 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/cars" className="btn-primary hidden lg:inline-flex">
            Browse Inventory
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-charcoal-950 lg:hidden">
          <div className="container-edge flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-sm px-3 py-3 text-sm font-medium uppercase tracking-[0.15em] text-ink/80 transition-colors hover:bg-charcoal-800 hover:text-brass-400",
                  pathname === link.href && "text-brass-400"
                )}
              >
                {link.label}
              </Link>
            ))}

            <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
              Shop by Category
            </p>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="rounded-sm px-3 py-2.5 text-sm text-ink/80 transition-colors hover:bg-charcoal-800 hover:text-brass-400"
              >
                {cat.name}
              </Link>
            ))}

            <Link href="/cars" className="btn-primary mt-3 w-full">
              Browse Inventory
            </Link>
            <a
              href={`tel:${process.env.NEXT_PUBLIC_DEALER_PHONE || ""}`}
              className="btn-outline mt-2 w-full"
            >
              <Phone className="h-4 w-4" />
              Call Dealership
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
