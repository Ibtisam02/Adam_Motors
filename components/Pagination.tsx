import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Build the href for a given page number, preserving other query params */
  buildHref: (page: number) => string;
}

export default function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <PageLink
        href={buildHref(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <PageLink key={p} href={buildHref(p)} active={p === currentPage}>
            {p}
          </PageLink>
        )
      )}

      <PageLink
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/5 text-muted/30">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-sm border text-sm font-medium transition-colors",
        active
          ? "border-brass-400 bg-brass-400 text-charcoal-950"
          : "border-white/10 text-ink hover:border-brass-400 hover:text-brass-400"
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  const delta = 1;
  const range: (number | "...")[] = [];

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }

  return range;
}
