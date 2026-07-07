import type { Category } from "@/types/category";

/**
 * Temporary mock category data. Replaced by a Supabase-backed repository later
 * without any change to the service or UI layers.
 */
export const categoryRecords: readonly Category[] = [
  {
    id: "cat_attars",
    name: "Attars",
    slug: "attars",
    description: "Pure oil-based fragrances with lasting depth.",
    displayOrder: 1,
  },
  {
    id: "cat_perfumes",
    name: "Perfumes",
    slug: "perfumes",
    description: "Signature eaux de parfum for every occasion.",
    displayOrder: 2,
  },
  {
    id: "cat_incense",
    name: "Incense",
    slug: "incense",
    description: "Bakhoor and oud to perfume your space.",
    displayOrder: 3,
  },
  {
    id: "cat_solid_perfumes",
    name: "Solid Perfumes",
    slug: "solid-perfumes",
    description: "Travel-ready balms crafted for life in motion.",
    displayOrder: 4,
  },
];
