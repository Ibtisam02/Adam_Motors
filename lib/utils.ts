import { NextResponse } from "next/server";

/** Standardized success JSON response */
export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

/** Standardized error JSON response. Never leaks internal error details. */
export function apiError(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error, details }, { status });
}

/** Generate a URL friendly slug from a string */
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

/** Remove HTML tags from user input */
export function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Basic HTML sanitizer replacement */
export function sanitizeHtml(input: string): string {
  return input.replace(/<script.*?>.*?<\/script>/gi, "").trim();
}

/** Format a number as currency (USD by default) */
export function formatPrice(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a number with thousands separators (e.g. mileage) */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Format an ISO date string into a readable date */
export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

/** Combine class names conditionally */
export { default as cn } from "./cn";