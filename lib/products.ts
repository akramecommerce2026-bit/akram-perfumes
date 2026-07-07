import type { ProductRecord } from "@/types/product";
import type { ProductVariant } from "@/types/variant";

/**
 * Temporary mock catalogue data.
 *
 * Stored NORMALIZED — products and variants live in separate arrays joined by
 * `productId`, exactly like the future Supabase `products` and `product_variants`
 * tables. The MockProductRepository reads these arrays; swapping to Supabase
 * only replaces the repository, never the service or UI.
 *
 * Nothing here is imported by components directly — everything flows through
 * the service layer (`@/services/product-service`).
 */

export const productRecords: readonly ProductRecord[] = [
  {
    id: "prod_bin_sheikh",
    name: "Bin Sheikh",
    slug: "bin-sheikh",
    categoryId: "cat_perfumes",
    description:
      "A masterpiece crafted with rich oriental notes, refined elegance, and exceptional longevity. Premium oud at its heart, wrapped in warm spice and soft amber.",
    featuredImage: "/signature/bin-sheikh.webp",
    galleryImages: ["/hero/slide-1.webp", "/hero/slide-2.webp", "/hero/slide-3.webp"],
    isFeatured: true,
    isSignature: true,
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-06-30T09:00:00.000Z",
  },
  {
    id: "prod_royal_attar",
    name: "Royal Attar",
    slug: "royal-attar",
    categoryId: "cat_attars",
    description:
      "A pure oil-based attar of rose, saffron and sandalwood — concentrated, long-lasting, and made to be worn close to the skin.",
    featuredImage: "/collections/attars.webp",
    galleryImages: [],
    isFeatured: true,
    isSignature: false,
    createdAt: "2026-02-03T09:00:00.000Z",
    updatedAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "prod_white_oud",
    name: "White Oud",
    slug: "white-oud",
    categoryId: "cat_perfumes",
    description:
      "A modern, citrusy oud — bright lemon over deep oud, patchouli and warm tobacco. Refined for everyday luxury.",
    featuredImage: "/collections/perfumes.webp",
    galleryImages: [],
    isFeatured: true,
    isSignature: false,
    createdAt: "2026-03-18T09:00:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "prod_oud_incense",
    name: "Oud Incense",
    slug: "oud-incense",
    categoryId: "cat_incense",
    description:
      "Hand-rolled bakhoor and oud incense to perfume your home with a warm, resinous trail.",
    featuredImage: "/collections/incense.webp",
    galleryImages: [],
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-05-15T09:00:00.000Z",
  },
  {
    id: "prod_solid_balm",
    name: "Solid Perfume Balm",
    slug: "solid-perfume-balm",
    categoryId: "cat_solid_perfumes",
    description:
      "A travel-ready solid perfume balm — mess-free, pocket-sized, and crafted for reapplication on the go.",
    featuredImage: "/collections/solid-perfumes.webp",
    galleryImages: [],
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-05-22T09:00:00.000Z",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
];

export const variantRecords: readonly ProductVariant[] = [
  // Bin Sheikh — volume variants (the flagship example)
  { id: "var_bs_3ml", productId: "prod_bin_sheikh", variantName: "3ml Sample", price: { amount: 19900, currency: "INR" }, stockQuantity: 0, sku: "AKR-BSK-003", weight: { value: 18, unit: "g" }, status: "inactive", displayOrder: 0 },
  { id: "var_bs_6ml", productId: "prod_bin_sheikh", variantName: "6ml", price: { amount: 49900, currency: "INR" }, stockQuantity: 120, sku: "AKR-BSK-006", weight: { value: 30, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_bs_8ml", productId: "prod_bin_sheikh", variantName: "8ml", price: { amount: 64900, currency: "INR" }, stockQuantity: 90, sku: "AKR-BSK-008", weight: { value: 38, unit: "g" }, status: "active", displayOrder: 2 },
  { id: "var_bs_12ml", productId: "prod_bin_sheikh", variantName: "12ml", price: { amount: 89900, currency: "INR" }, stockQuantity: 75, sku: "AKR-BSK-012", weight: { value: 52, unit: "g" }, status: "active", displayOrder: 3 },
  { id: "var_bs_30ml", productId: "prod_bin_sheikh", variantName: "30ml", price: { amount: 179900, currency: "INR" }, stockQuantity: 40, sku: "AKR-BSK-030", weight: { value: 110, unit: "g" }, status: "active", displayOrder: 4 },
  { id: "var_bs_50ml", productId: "prod_bin_sheikh", variantName: "50ml", price: { amount: 249900, currency: "INR" }, stockQuantity: 30, sku: "AKR-BSK-050", weight: { value: 165, unit: "g" }, status: "active", displayOrder: 5 },
  { id: "var_bs_100ml", productId: "prod_bin_sheikh", variantName: "100ml", price: { amount: 399900, currency: "INR" }, stockQuantity: 18, sku: "AKR-BSK-100", weight: { value: 300, unit: "g" }, status: "active", displayOrder: 6 },

  // Royal Attar — mixes volumes and a roll-on format (variant name is free-form)
  { id: "var_ra_6ml", productId: "prod_royal_attar", variantName: "6ml", price: { amount: 39900, currency: "INR" }, stockQuantity: 60, sku: "AKR-RYA-006", weight: { value: 28, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_ra_12ml", productId: "prod_royal_attar", variantName: "12ml", price: { amount: 69900, currency: "INR" }, stockQuantity: 45, sku: "AKR-RYA-012", weight: { value: 50, unit: "g" }, status: "active", displayOrder: 2 },
  { id: "var_ra_roll", productId: "prod_royal_attar", variantName: "8ml Roll-On", price: { amount: 84900, currency: "INR" }, stockQuantity: 25, sku: "AKR-RYA-008R", weight: { value: 42, unit: "g" }, status: "active", displayOrder: 3 },

  // White Oud
  { id: "var_wo_50ml", productId: "prod_white_oud", variantName: "50ml", price: { amount: 219900, currency: "INR" }, stockQuantity: 35, sku: "AKR-WHO-050", weight: { value: 165, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_wo_100ml", productId: "prod_white_oud", variantName: "100ml", price: { amount: 359900, currency: "INR" }, stockQuantity: 20, sku: "AKR-WHO-100", weight: { value: 300, unit: "g" }, status: "active", displayOrder: 2 },

  // Oud Incense — non-volume variant names (stick counts, bakhoor weight)
  { id: "var_oi_40", productId: "prod_oud_incense", variantName: "40 Sticks", price: { amount: 29900, currency: "INR" }, stockQuantity: 200, sku: "AKR-INC-040", weight: { value: 90, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_oi_80", productId: "prod_oud_incense", variantName: "80 Sticks", price: { amount: 49900, currency: "INR" }, stockQuantity: 150, sku: "AKR-INC-080", weight: { value: 170, unit: "g" }, status: "active", displayOrder: 2 },
  { id: "var_oi_bkr", productId: "prod_oud_incense", variantName: "Bakhoor 50g", price: { amount: 89900, currency: "INR" }, stockQuantity: 80, sku: "AKR-INC-BKR50", weight: { value: 50, unit: "g" }, status: "active", displayOrder: 3 },

  // Solid Perfume Balm — product + refill
  { id: "var_sb_tin", productId: "prod_solid_balm", variantName: "8g Tin", price: { amount: 59900, currency: "INR" }, stockQuantity: 100, sku: "AKR-SOL-008", weight: { value: 8, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_sb_refill", productId: "prod_solid_balm", variantName: "8g Refill", price: { amount: 39900, currency: "INR" }, stockQuantity: 70, sku: "AKR-SOL-008R", weight: { value: 8, unit: "g" }, status: "active", displayOrder: 2 },
];
