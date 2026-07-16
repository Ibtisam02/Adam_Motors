import Link from "next/link";
import {  Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import type { ICategory } from "@/types";
import Image from "next/image";

interface FooterProps {
  categories: ICategory[];
}

export default function Footer({ categories }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-charcoal-900">
      <div className="container-edge grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-brass-400/40 text-brass-400">
              <Image
                        src="https://res.cloudinary.com/dj0k9z7tr/image/upload/v1784187977/AdamMoters/IMG-20260716-WA00033_wwmpao.jpg"       
                        alt="Company Logo"
                        width={150}          
                        height={50}
                        className="rounded-sm"         
                        priority              
                      />
            </span>
            <span className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-ink">
              {process.env.NEXT_PUBLIC_SITE_NAME || "Prestige Motors"}
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Curated pre-owned and new vehicles, transparent pricing, and flexible
            installment plans — backed by a team that treats every sale like
            it&apos;s their own car.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 text-muted transition-colors hover:border-brass-400 hover:text-brass-400"
                aria-label="Social media link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-brass-400">
            Explore
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li><Link href="/cars" className="hover:text-ink">All Inventory</Link></li>
            <li><Link href="/cars?featured=true" className="hover:text-ink">Featured Cars</Link></li>
            <li><Link href="/favorites" className="hover:text-ink">My Favorites</Link></li>
            <li><Link href="/contact" className="hover:text-ink">Contact Us</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-brass-400">
            Shop by Category
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {categories.length === 0 && <li className="text-muted/60">Coming soon</li>}
            {categories.slice(0, 6).map((cat) => (
              <li key={cat._id}>
                <Link href={`/categories/${cat.slug}`} className="hover:text-ink">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-brass-400">
            Visit the Showroom
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" />
              <span>{process.env.NEXT_PUBLIC_DEALER_ADDRESS || "123 Auto Avenue, Motor City"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-brass-400" />
              <a href={`tel:${process.env.NEXT_PUBLIC_DEALER_PHONE || ""}`} className="hover:text-ink">
                {process.env.NEXT_PUBLIC_DEALER_PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-brass-400" />
              <a href={`mailto:${process.env.NEXT_PUBLIC_DEALER_EMAIL || ""}`} className="hover:text-ink">
                {process.env.NEXT_PUBLIC_DEALER_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <div className="container-edge flex flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>&copy; {year} {process.env.NEXT_PUBLIC_SITE_NAME || "Prestige Motors"}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/admin/login" className="hover:text-ink">Admin</Link>
            <span>Built with Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
