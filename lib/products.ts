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

const INR = "INR" as const;

export const productRecords: readonly ProductRecord[] = [
  {
    id: "prod_bin_sheikh",
    name: "Bin Sheikh",
    slug: "bin-sheikh",
    categoryId: "cat_perfumes",
    shortDescription: "Rich oriental oud wrapped in warm spice and soft amber.",
    description:
      "A masterpiece crafted with rich oriental notes, refined elegance, and exceptional longevity. Premium oud at its heart, wrapped in warm spice and soft amber.",
    featuredImage: "/signature/bin-sheikh.webp",
    galleryImages: ["/hero/slide-1.webp", "/hero/slide-2.webp", "/hero/slide-3.webp"],
    rating: 4.9,
    reviewCount: 214,
    fragranceFamily: "oud",
    gender: "unisex",
    occasions: ["signature", "evening", "festive"],
    notes: { top: ["Bergamot", "Saffron"], heart: ["Oud", "Rose"], base: ["Amber", "Musk"] },
    profile: { concentration: "Extrait de Parfum", longevity: 5, projection: 5, seasons: ["autumn", "winter"] },
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
    shortDescription: "Rose, saffron and sandalwood in a concentrated oil.",
    description:
      "A pure oil-based attar of rose, saffron and sandalwood — concentrated, long-lasting, and made to be worn close to the skin.",
    featuredImage: "/collections/attars.webp",
    galleryImages: [],
    rating: 4.8,
    reviewCount: 132,
    fragranceFamily: "oud",
    gender: "unisex",
    occasions: ["signature", "evening"],
    notes: { top: ["Rose"], heart: ["Saffron"], base: ["Sandalwood"] },
    profile: { concentration: "Pure Attar Oil", longevity: 5, projection: 4, seasons: ["autumn", "winter"] },
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
    shortDescription: "Bright citrus over deep oud, patchouli and tobacco.",
    description:
      "A modern, citrusy oud — bright lemon over deep oud, patchouli and warm tobacco. Refined for everyday luxury.",
    featuredImage: "/collections/perfumes.webp",
    galleryImages: [],
    rating: 4.8,
    reviewCount: 176,
    fragranceFamily: "fresh",
    gender: "men",
    occasions: ["everyday", "office"],
    notes: { top: ["Lemon", "Mint"], heart: ["Oud", "Patchouli"], base: ["Tobacco"] },
    profile: { concentration: "Eau de Parfum", longevity: 4, projection: 4, seasons: ["spring", "summer"] },
    isFeatured: true,
    isSignature: false,
    createdAt: "2026-03-18T09:00:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "prod_amber_nuit",
    name: "Amber Nuit",
    slug: "amber-nuit",
    categoryId: "cat_perfumes",
    shortDescription: "Warm amber and vanilla made for the evening.",
    description:
      "A sensual oriental of glowing amber, vanilla and benzoin — enveloping, cosy and unmistakably evening.",
    featuredImage: "/hero/slide-3.webp",
    galleryImages: [],
    rating: 4.7,
    reviewCount: 143,
    fragranceFamily: "oriental",
    gender: "women",
    occasions: ["evening", "festive"],
    notes: { top: ["Plum"], heart: ["Amber", "Jasmine"], base: ["Vanilla", "Benzoin"] },
    profile: { concentration: "Eau de Parfum", longevity: 5, projection: 4, seasons: ["autumn", "winter"] },
    isFeatured: true,
    isSignature: false,
    createdAt: "2026-03-02T09:00:00.000Z",
    updatedAt: "2026-06-18T09:00:00.000Z",
  },
  {
    id: "prod_musk_ghazal",
    name: "Musk Al Ghazal",
    slug: "musk-al-ghazal",
    categoryId: "cat_attars",
    shortDescription: "Soft white musk — clean, powdery and intimate.",
    description:
      "A whisper-soft white musk attar, powdery and skin-like, layered with a touch of rose and sandalwood.",
    featuredImage: "/hero/slide-1.webp",
    galleryImages: [],
    rating: 4.9,
    reviewCount: 98,
    fragranceFamily: "musk",
    gender: "women",
    occasions: ["everyday", "office"],
    notes: { top: ["White Musk"], heart: ["Rose"], base: ["Sandalwood"] },
    profile: { concentration: "Pure Attar Oil", longevity: 4, projection: 3, seasons: ["spring", "summer"] },
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-04-14T09:00:00.000Z",
    updatedAt: "2026-06-05T09:00:00.000Z",
  },
  {
    id: "prod_rose_taifi",
    name: "Rose Taifi",
    slug: "rose-taifi",
    categoryId: "cat_attars",
    shortDescription: "Taifi rose in its purest, most opulent oil form.",
    description:
      "The legendary Taif rose, distilled into a deep, honeyed oil — velvety petals over a warm resinous base.",
    featuredImage: "/hero/slide-2.webp",
    galleryImages: [],
    rating: 4.8,
    reviewCount: 120,
    fragranceFamily: "floral",
    gender: "women",
    occasions: ["evening", "festive"],
    notes: { top: ["Taifi Rose"], heart: ["Geranium"], base: ["Oud", "Amber"] },
    profile: { concentration: "Pure Attar Oil", longevity: 5, projection: 4, seasons: ["autumn", "winter"] },
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-02-22T09:00:00.000Z",
    updatedAt: "2026-05-28T09:00:00.000Z",
  },
  {
    id: "prod_sandal_mystique",
    name: "Sandal Mystique",
    slug: "sandal-mystique",
    categoryId: "cat_perfumes",
    shortDescription: "Creamy sandalwood with a whisper of warm spice.",
    description:
      "Smooth, creamy sandalwood laced with cardamom and cedar — a serene, meditative woody signature.",
    featuredImage: "/collections/perfumes.webp",
    galleryImages: [],
    rating: 4.6,
    reviewCount: 74,
    fragranceFamily: "woody",
    gender: "unisex",
    occasions: ["everyday", "office"],
    notes: { top: ["Cardamom"], heart: ["Sandalwood"], base: ["Cedar", "Musk"] },
    profile: { concentration: "Eau de Parfum", longevity: 4, projection: 3, seasons: ["autumn", "winter"] },
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-01-30T09:00:00.000Z",
    updatedAt: "2026-05-10T09:00:00.000Z",
  },
  {
    id: "prod_citrus_majlis",
    name: "Citrus Majlis",
    slug: "citrus-majlis",
    categoryId: "cat_perfumes",
    shortDescription: "Sparkling citrus for bright, active days.",
    description:
      "An effervescent burst of bergamot, grapefruit and neroli over clean musk — crisp, energetic and endlessly wearable.",
    featuredImage: "/hero/slide-1.webp",
    galleryImages: [],
    rating: 4.5,
    reviewCount: 52,
    fragranceFamily: "fresh",
    gender: "men",
    occasions: ["everyday", "office"],
    notes: { top: ["Bergamot", "Grapefruit"], heart: ["Neroli"], base: ["White Musk"] },
    profile: { concentration: "Eau de Toilette", longevity: 3, projection: 3, seasons: ["spring", "summer"] },
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-04-26T09:00:00.000Z",
    updatedAt: "2026-06-22T09:00:00.000Z",
  },
  {
    id: "prod_oud_incense",
    name: "Oud Incense",
    slug: "oud-incense",
    categoryId: "cat_incense",
    shortDescription: "Hand-rolled bakhoor for a warm, resinous home.",
    description:
      "Hand-rolled bakhoor and oud incense to perfume your home with a warm, resinous trail.",
    featuredImage: "/collections/incense.webp",
    galleryImages: [],
    rating: 4.7,
    reviewCount: 88,
    fragranceFamily: "woody",
    gender: "unisex",
    occasions: ["everyday", "festive"],
    notes: { top: ["Resin"], heart: ["Oud"], base: ["Sandalwood"] },
    profile: { concentration: "Bakhoor", longevity: 4, projection: 5, seasons: ["autumn", "winter"] },
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-05-15T09:00:00.000Z",
  },
  {
    id: "prod_bakhoor_malaki",
    name: "Bakhoor Malaki",
    slug: "bakhoor-malaki",
    categoryId: "cat_incense",
    shortDescription: "A royal bakhoor blend for special gatherings.",
    description:
      "A regal bakhoor of aged oud, rose and amber resins — rich, smoky and ceremonial, made for special occasions.",
    featuredImage: "/collections/incense.webp",
    galleryImages: [],
    rating: 4.7,
    reviewCount: 45,
    fragranceFamily: "oud",
    gender: "unisex",
    occasions: ["festive", "signature"],
    notes: { top: ["Rose"], heart: ["Aged Oud"], base: ["Amber Resin"] },
    profile: { concentration: "Bakhoor", longevity: 5, projection: 5, seasons: ["autumn", "winter"] },
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-05-02T09:00:00.000Z",
    updatedAt: "2026-06-12T09:00:00.000Z",
  },
  {
    id: "prod_solid_balm",
    name: "Solid Perfume Balm",
    slug: "solid-perfume-balm",
    categoryId: "cat_solid_perfumes",
    shortDescription: "Travel-ready solid balm, mess-free and pocket-sized.",
    description:
      "A travel-ready solid perfume balm — mess-free, pocket-sized, and crafted for reapplication on the go.",
    featuredImage: "/collections/solid-perfumes.webp",
    galleryImages: [],
    rating: 4.6,
    reviewCount: 61,
    fragranceFamily: "musk",
    gender: "unisex",
    occasions: ["everyday", "office"],
    notes: { top: ["Citrus"], heart: ["Musk"], base: ["Vanilla"] },
    profile: { concentration: "Solid Balm", longevity: 3, projection: 2, seasons: ["spring", "summer"] },
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-05-22T09:00:00.000Z",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "prod_velvet_solid",
    name: "Velvet Rose Solid",
    slug: "velvet-rose-solid",
    categoryId: "cat_solid_perfumes",
    shortDescription: "A floral solid balm that travels beautifully.",
    description:
      "A velvety rose-and-peony solid perfume in a slim compact — a discreet floral you can carry anywhere.",
    featuredImage: "/collections/solid-perfumes.webp",
    galleryImages: [],
    rating: 4.6,
    reviewCount: 39,
    fragranceFamily: "floral",
    gender: "women",
    occasions: ["everyday"],
    notes: { top: ["Peony"], heart: ["Rose"], base: ["White Musk"] },
    profile: { concentration: "Solid Balm", longevity: 3, projection: 2, seasons: ["spring", "summer"] },
    isFeatured: false,
    isSignature: false,
    createdAt: "2026-06-08T09:00:00.000Z",
    updatedAt: "2026-06-25T09:00:00.000Z",
  },
];

export const variantRecords: readonly ProductVariant[] = [
  // Bin Sheikh — volume variants (the flagship example); 6ml is on sale
  { id: "var_bs_3ml", productId: "prod_bin_sheikh", variantName: "3ml Sample", price: { amount: 19900, currency: INR }, stockQuantity: 0, sku: "AKR-BSK-003", weight: { value: 18, unit: "g" }, status: "inactive", displayOrder: 0 },
  { id: "var_bs_6ml", productId: "prod_bin_sheikh", variantName: "6ml", price: { amount: 49900, currency: INR }, comparePrice: { amount: 59900, currency: INR }, stockQuantity: 120, sku: "AKR-BSK-006", weight: { value: 30, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_bs_8ml", productId: "prod_bin_sheikh", variantName: "8ml", price: { amount: 64900, currency: INR }, stockQuantity: 90, sku: "AKR-BSK-008", weight: { value: 38, unit: "g" }, status: "active", displayOrder: 2 },
  { id: "var_bs_12ml", productId: "prod_bin_sheikh", variantName: "12ml", price: { amount: 89900, currency: INR }, stockQuantity: 75, sku: "AKR-BSK-012", weight: { value: 52, unit: "g" }, status: "active", displayOrder: 3 },
  { id: "var_bs_30ml", productId: "prod_bin_sheikh", variantName: "30ml", price: { amount: 179900, currency: INR }, stockQuantity: 40, sku: "AKR-BSK-030", weight: { value: 110, unit: "g" }, status: "active", displayOrder: 4 },
  { id: "var_bs_50ml", productId: "prod_bin_sheikh", variantName: "50ml", price: { amount: 249900, currency: INR }, stockQuantity: 30, sku: "AKR-BSK-050", weight: { value: 165, unit: "g" }, status: "active", displayOrder: 5 },
  { id: "var_bs_100ml", productId: "prod_bin_sheikh", variantName: "100ml", price: { amount: 399900, currency: INR }, stockQuantity: 18, sku: "AKR-BSK-100", weight: { value: 300, unit: "g" }, status: "active", displayOrder: 6 },

  // Royal Attar — mixes volumes and a roll-on format (variant name is free-form)
  { id: "var_ra_6ml", productId: "prod_royal_attar", variantName: "6ml", price: { amount: 39900, currency: INR }, stockQuantity: 60, sku: "AKR-RYA-006", weight: { value: 28, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_ra_12ml", productId: "prod_royal_attar", variantName: "12ml", price: { amount: 69900, currency: INR }, stockQuantity: 45, sku: "AKR-RYA-012", weight: { value: 50, unit: "g" }, status: "active", displayOrder: 2 },
  { id: "var_ra_roll", productId: "prod_royal_attar", variantName: "8ml Roll-On", price: { amount: 84900, currency: INR }, stockQuantity: 25, sku: "AKR-RYA-008R", weight: { value: 42, unit: "g" }, status: "active", displayOrder: 3 },

  // White Oud — 50ml on sale
  { id: "var_wo_50ml", productId: "prod_white_oud", variantName: "50ml", price: { amount: 219900, currency: INR }, comparePrice: { amount: 259900, currency: INR }, stockQuantity: 35, sku: "AKR-WHO-050", weight: { value: 165, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_wo_100ml", productId: "prod_white_oud", variantName: "100ml", price: { amount: 359900, currency: INR }, stockQuantity: 20, sku: "AKR-WHO-100", weight: { value: 300, unit: "g" }, status: "active", displayOrder: 2 },

  // Amber Nuit — 50ml on sale
  { id: "var_an_50ml", productId: "prod_amber_nuit", variantName: "50ml", price: { amount: 209900, currency: INR }, comparePrice: { amount: 259900, currency: INR }, stockQuantity: 28, sku: "AKR-AMN-050", weight: { value: 165, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_an_100ml", productId: "prod_amber_nuit", variantName: "100ml", price: { amount: 349900, currency: INR }, stockQuantity: 16, sku: "AKR-AMN-100", weight: { value: 300, unit: "g" }, status: "active", displayOrder: 2 },

  // Musk Al Ghazal
  { id: "var_mg_6ml", productId: "prod_musk_ghazal", variantName: "6ml", price: { amount: 34900, currency: INR }, stockQuantity: 80, sku: "AKR-MSK-006", weight: { value: 28, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_mg_12ml", productId: "prod_musk_ghazal", variantName: "12ml", price: { amount: 59900, currency: INR }, stockQuantity: 55, sku: "AKR-MSK-012", weight: { value: 50, unit: "g" }, status: "active", displayOrder: 2 },

  // Rose Taifi
  { id: "var_rt_6ml", productId: "prod_rose_taifi", variantName: "6ml", price: { amount: 44900, currency: INR }, stockQuantity: 50, sku: "AKR-RST-006", weight: { value: 28, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_rt_12ml", productId: "prod_rose_taifi", variantName: "12ml", price: { amount: 79900, currency: INR }, stockQuantity: 32, sku: "AKR-RST-012", weight: { value: 50, unit: "g" }, status: "active", displayOrder: 2 },

  // Sandal Mystique
  { id: "var_sm_50ml", productId: "prod_sandal_mystique", variantName: "50ml", price: { amount: 199900, currency: INR }, stockQuantity: 30, sku: "AKR-SDL-050", weight: { value: 165, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_sm_100ml", productId: "prod_sandal_mystique", variantName: "100ml", price: { amount: 329900, currency: INR }, stockQuantity: 14, sku: "AKR-SDL-100", weight: { value: 300, unit: "g" }, status: "active", displayOrder: 2 },

  // Citrus Majlis — 50ml on sale
  { id: "var_cm_50ml", productId: "prod_citrus_majlis", variantName: "50ml", price: { amount: 169900, currency: INR }, comparePrice: { amount: 199900, currency: INR }, stockQuantity: 42, sku: "AKR-CTM-050", weight: { value: 165, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_cm_100ml", productId: "prod_citrus_majlis", variantName: "100ml", price: { amount: 289900, currency: INR }, stockQuantity: 22, sku: "AKR-CTM-100", weight: { value: 300, unit: "g" }, status: "active", displayOrder: 2 },

  // Oud Incense — non-volume variant names (stick counts, bakhoor weight)
  { id: "var_oi_40", productId: "prod_oud_incense", variantName: "40 Sticks", price: { amount: 29900, currency: INR }, stockQuantity: 200, sku: "AKR-INC-040", weight: { value: 90, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_oi_80", productId: "prod_oud_incense", variantName: "80 Sticks", price: { amount: 49900, currency: INR }, stockQuantity: 150, sku: "AKR-INC-080", weight: { value: 170, unit: "g" }, status: "active", displayOrder: 2 },
  { id: "var_oi_bkr", productId: "prod_oud_incense", variantName: "Bakhoor 50g", price: { amount: 89900, currency: INR }, stockQuantity: 80, sku: "AKR-INC-BKR50", weight: { value: 50, unit: "g" }, status: "active", displayOrder: 3 },

  // Bakhoor Malaki
  { id: "var_bm_50g", productId: "prod_bakhoor_malaki", variantName: "50g", price: { amount: 99900, currency: INR }, stockQuantity: 60, sku: "AKR-BKM-050", weight: { value: 50, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_bm_100g", productId: "prod_bakhoor_malaki", variantName: "100g", price: { amount: 169900, currency: INR }, stockQuantity: 34, sku: "AKR-BKM-100", weight: { value: 100, unit: "g" }, status: "active", displayOrder: 2 },

  // Solid Perfume Balm — product + refill
  { id: "var_sb_tin", productId: "prod_solid_balm", variantName: "8g Tin", price: { amount: 59900, currency: INR }, stockQuantity: 100, sku: "AKR-SOL-008", weight: { value: 8, unit: "g" }, status: "active", displayOrder: 1 },
  { id: "var_sb_refill", productId: "prod_solid_balm", variantName: "8g Refill", price: { amount: 39900, currency: INR }, stockQuantity: 70, sku: "AKR-SOL-008R", weight: { value: 8, unit: "g" }, status: "active", displayOrder: 2 },

  // Velvet Rose Solid — currently sold out (demonstrates availability filter + badge)
  { id: "var_vs_tin", productId: "prod_velvet_solid", variantName: "8g Tin", price: { amount: 54900, currency: INR }, stockQuantity: 0, sku: "AKR-VRS-008", weight: { value: 8, unit: "g" }, status: "active", displayOrder: 1 },
];
