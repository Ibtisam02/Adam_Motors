/**
 * Build an optimized Cloudinary delivery URL with automatic format/quality
 * and a target width — used for responsive images across the site.
 *
 * This file intentionally has NO dependency on the `cloudinary` Node SDK
 * (which requires `fs` and other Node-only modules) so it can be safely
 * imported from both Server and Client Components.
 */
export function cld(url: string, width?: number): string {
  if (!url.includes("/upload/")) return url;
  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}
