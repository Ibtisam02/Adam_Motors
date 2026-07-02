"use client";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Get a reCAPTCHA v3 token for the given action. Returns undefined if
 * reCAPTCHA isn't configured or the script hasn't loaded — the backend
 * treats a missing token as "skip verification" only when no secret key
 * is configured, otherwise it fails closed.
 */
export function getRecaptchaToken(action: string): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey || typeof window === "undefined" || !window.grecaptcha) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    window.grecaptcha!.ready(() => {
      window
        .grecaptcha!.execute(siteKey, { action })
        .then((token) => resolve(token))
        .catch(() => resolve(undefined));
    });
  });
}
