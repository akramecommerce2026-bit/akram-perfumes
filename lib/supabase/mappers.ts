import { createMoney } from "@/lib/money";
import type { Tables } from "@/lib/supabase/database.types";
import type { Category } from "@/types/category";
import type { FragranceNotes, ProductRecord } from "@/types/product";
import type { ShipmentStatus, ShipmentTracking, TrackingEvent } from "@/types/shipment";
import type { ProductVariant } from "@/types/variant";
import { resolveProductImage } from "@/lib/product-image";

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
    imageUrl: row.image_url ?? undefined,
    displayOrder: row.display_order,
  };
}

export function mapVariant(
  row: Tables<"product_variants">,
  images: readonly Tables<"product_images">[] = [],
): ProductVariant {
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
    images: [...images]
      .sort((a, b) => a.display_order - b.display_order)
      .map((image) => image.url),
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
  // The product's shared gallery is the variant-less images only. Variant-owned
  // images (variant_id set) are attached to their variant instead, so they never
  // leak into the product-level gallery or the featured/card image.
  const galleryImages = [...images]
    .filter((image) => image.variant_id == null)
    .sort((a, b) => a.display_order - b.display_order)
    .map((image) => image.url);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    shortDescription: row.short_description,
    description: row.description,
    featuredImage: resolveProductImage(row.featured_image, galleryImages),
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

/** Map an orders row's shipment columns to the domain ShipmentTracking. */
export function mapShipmentRow(row: Tables<"orders">): ShipmentTracking {
  return {
    courierPartner: row.courier_partner ?? "",
    trackingNumber: row.tracking_number ?? "",
    trackingUrl: row.tracking_url ?? "",
    shipmentStatus: row.shipment_status as ShipmentStatus,
    shippedAt: row.shipped_at,
    estimatedDelivery: row.estimated_delivery,
    deliveredAt: row.delivered_at,
    shippingNotes: row.shipping_notes ?? "",
  };
}

export function mapTrackingEventRow(row: Tables<"order_tracking_events">): TrackingEvent {
  return {
    id: row.id,
    status: row.status as ShipmentStatus | null,
    message: row.message,
    createdAt: row.created_at,
  };
}
