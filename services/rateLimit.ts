/**
 * Simple in-memory rate limiter, keyed by an identifier (usually IP + route).
 *
 * NOTE: This works per-server-instance. For multi-instance / serverless
 * deployments behind a load balancer, replace this with a shared store
 * such as Redis (e.g. Upstash) using the same `check()` interface.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically clear expired buckets so the map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 60_000).unref?.();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check & increment a rate limit bucket.
 *
 * @param key unique identifier, e.g. `login:${ip}`
 * @param limit max requests allowed within the window
 * @param windowMs window length in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Extract a best-effort client IP from request headers */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}

// Rate limit presets used across the app
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts / 15 min
  review: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 reviews / hour
  contact: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 messages / hour
};
