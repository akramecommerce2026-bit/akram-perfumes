/**
 * True when an image URL points at a remote origin (an absolute http/https URL)
 * rather than a local `/public` asset.
 *
 * Product and category images live in Supabase Storage and are served as absolute
 * CDN URLs. Those are passed to `next/image` with `unoptimized`, so the browser
 * loads them straight from Supabase instead of through the Next image optimizer.
 * The optimizer performs a server-side fetch of the upstream image, which fails
 * in environments where the Supabase host resolves to a NAT64 (`64:ff9b::`)
 * address — Next 16's SSRF guard rejects it as a private IP and returns 400,
 * leaving the image blank. Loading the public object directly avoids that while
 * local `/public` assets (hero art, seeded imagery) keep full optimization.
 */
export function isRemoteImage(src: string | null | undefined): boolean {
  return typeof src === "string" && /^https?:\/\//.test(src);
}
