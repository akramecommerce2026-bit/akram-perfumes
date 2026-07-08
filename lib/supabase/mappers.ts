import { createMoney } from "@/lib/money";
import type { Tables } from "@/lib/supabase/database.types";
import type { Category } from "@/types/category";
import type { FragranceNotes, ProductRecord } from "@/types/product";
import type { ProductVariant } from "@/types/variant";

/**
 * Pure functions mapping Supabase rows to the app's domain records.
 *
 * Keeping mapping isolated here means the repositories stay thin and the rest of
 * the app remains ignorant of the database shape — the same records the mock
 * repository returns, so services and UI are unchanged. Money is stored as
 * integer paise in a single currency (INR), which `createMoney` defaults to.
 */

export function mapCategory(row: Tables<"categories">): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    displayOrder: row.display_order,
  };
}

export function mapVariant(row: Tables<"product_variants">): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    variantName: row.variant_name,
    price: createMoney(row.price),
    ...(row.compare_price != null ? { comparePrice: createMoney(row.compare_price) } : {}),
    stockQuantity: row.stock,
    sku: row.sku,
    ...(row.weight_value != null && row.weight_unit != null
      ? { weight: { value: row.weight_value, unit: row.weight_unit } }
      : {}),
    status: row.status,
    displayOrder: row.display_order,
  };
}

/** Group ordered fragrance-note rows into the top/heart/base pyramid. */
export function mapNotes(rows: readonly Tables<"fragrance_notes">[]): FragranceNotes {
  const ordered = [...rows].sort((a, b) => a.display_order - b.display_order);
  return {
    top: ordered.filter((n) => n.note_type === "top").map((n) => n.note),
    heart: ordered.filter((n) => n.note_type === "heart").map((n) => n.note),
    base: ordered.filter((n) => n.note_type === "base").map((n) => n.note),
  };
}

export function mapProduct(
  row: Tables<"products">,
  images: readonly Tables<"product_images">[],
  notes: readonly Tables<"fragrance_notes">[],
): ProductRecord {
  const galleryImages = [...images]
    .sort((a, b) => a.display_order - b.display_order)
    .map((image) => image.url);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    shortDescription: row.short_description,
    description: row.description,
    featuredImage: row.featured_image,
    galleryImages,
    rating: row.rating,
    reviewCount: row.review_count,
    fragranceFamily: row.fragrance_family,
    gender: row.gender,
    occasions: row.occasions,
    notes: mapNotes(notes),
    profile: {
      concentration: row.concentration,
      longevity: row.longevity,
      projection: row.projection,
      seasons: row.seasons,
    },
    isFeatured: row.is_featured,
    isSignature: row.is_signature,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
