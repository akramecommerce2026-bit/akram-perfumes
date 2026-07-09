import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const PRODUCT_IMAGE_BUCKET = "product-images";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function extensionFor(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "jpg";
  }
}

/**
 * Uploads an image to the public product-images bucket and returns its public
 * URL. Validates type + size. Uses the service-role client (server-only), so
 * uploads are never exposed to the browser.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP or AVIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large. Maximum size is 5 MB.");
  }

  const db = getSupabaseAdminClient();
  const path = `products/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const { error } = await db.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  return db.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Removes a previously uploaded object by its public URL. No-op for URLs that
 * don't belong to our bucket (e.g. externally hosted images).
 */
export async function deleteProductImageByUrl(url: string): Promise<void> {
  const marker = `/${PRODUCT_IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = url.slice(index + marker.length);
  if (!path) return;

  const db = getSupabaseAdminClient();
  await db.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
}
