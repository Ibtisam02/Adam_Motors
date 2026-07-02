import { NextRequest } from "next/server";

/**
 * Basic CSRF protection for state-changing requests (POST/PUT/PATCH/DELETE).
 *
 * Since the admin auth token is stored in a SameSite=Lax httpOnly cookie,
 * cross-site form posts won't carry the cookie for state-changing requests
 * in modern browsers. As defense in depth, we also verify that the request's
 * Origin (or Referer) header matches our own site.
 */
export function verifySameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (!host) return false;

  const candidate = origin || referer;
  if (!candidate) {
    // Allow same-origin requests with no Origin/Referer (e.g. some
    // server-to-server calls), but this should be rare for browser forms.
    return true;
  }

  try {
    const candidateHost = new URL(candidate).host;
    return candidateHost === host;
  } catch {
    return false;
  }
}
