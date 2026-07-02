"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Tags,
  MessageSquare,
  Mail,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cars", label: "Cars", icon: Car },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-charcoal-900 px-4 py-3 lg:hidden">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brass-400">
          Admin Panel
        </span>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5 text-ink" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal-950/70" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-charcoal-900 p-5 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brass-400">
                Admin Panel
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-ink" />
              </button>
            </div>
            <SidebarLinks pathname={pathname} isActive={isActive} onNavigate={() => setOpen(false)} />
            <SidebarFooter adminName={adminName} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-charcoal-900 p-5 lg:flex">
        <div className="mb-8">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brass-400">
            Admin Panel
          </span>
          <p className="mt-1 text-xs text-muted">
            {process.env.NEXT_PUBLIC_SITE_NAME || "Prestige Motors"}
          </p>
        </div>
        <SidebarLinks pathname={pathname} isActive={isActive} />
        <SidebarFooter adminName={adminName} onLogout={handleLogout} />
      </aside>
    </>
  );
}

function SidebarLinks({
  isActive,
  onNavigate,
}: {
  pathname: string;
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(link.href)
              ? "bg-brass-400/10 text-brass-400"
              : "text-ink/70 hover:bg-charcoal-800 hover:text-ink"
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-charcoal-800 hover:text-ink"
      >
        <ExternalLink className="h-4 w-4" />
        View Website
      </Link>
    </nav>
  );
}

function SidebarFooter({ adminName, onLogout }: { adminName: string; onLogout: () => void }) {
  return (
    <div className="mt-6 border-t border-white/5 pt-4">
      <p className="px-3 text-xs text-muted">Signed in as</p>
      <p className="truncate px-3 text-sm font-semibold text-ink">{adminName}</p>
      <button
        onClick={onLogout}
        className="mt-3 flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-charcoal-800 hover:text-red-300"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </div>
  );
}
