import { NextResponse } from "next/server";
import cn from "./cn";

export { cn };

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function apiError(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error, details }, { status });
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Strip ALL HTML tags from a string — safe for plain text fields like
 * names, emails, and search queries. No DOM dependency.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")          // strip all tags
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/javascript:/gi, "")     // kill any leftover js: urls
    .trim();
}

/**
 * Allow a safe subset of formatting tags for rich text fields
 * (description, installment details). Strips everything else.
 * No DOM dependency — runs safely on the server.
 */
export function sanitizeHtml(input: string): string {
  const ALLOWED_TAGS = ["b", "strong", "i", "em", "ul", "ol", "li", "p", "br", "h3", "h4"];

  // Build a regex that matches any tag NOT in the allowed list
  return input
    // Remove script and style blocks entirely including content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // Strip all attributes from allowed tags (prevents onclick etc.)
    .replace(/<(\/?)(\w+)([^>]*)>/g, (_match, slash, tag, _attrs) => {
      const lowerTag = tag.toLowerCase();
      if (ALLOWED_TAGS.includes(lowerTag)) {
        return `<${slash}${lowerTag}>`;
      }
      return "";
    })
    // Kill any remaining javascript: references
    .replace(/javascript:/gi, "")
    .trim();
}

export function formatPrice(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}