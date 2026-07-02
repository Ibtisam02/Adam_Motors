/**
 * Verify a Google reCAPTCHA v3 token against Google's siteverify endpoint.
 * Returns true if the token is valid and the score is above the threshold.
 */
export async function verifyRecaptcha(
  token: string | undefined,
  minScore = 0.5
): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // If reCAPTCHA isn't configured, don't block submissions (dev mode).
  if (!secret) return true;

  if (!token) return false;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = await res.json();
    if (!data.success) return false;

    // v3 returns a score; v2 checkbox does not
    if (typeof data.score === "number") {
      return data.score >= minScore;
    }

    return true;
  } catch (err) {
    console.error("reCAPTCHA verification failed:", err);
    return false;
  }
}
