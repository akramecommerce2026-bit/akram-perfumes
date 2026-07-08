/**
 * Shared product attribute taxonomies (gender, fragrance family, occasion).
 *
 * Defined as string-literal unions with label maps so the same values power the
 * product records, the Shop filters and any future Admin dropdowns — a single
 * source of truth that maps cleanly to Supabase enum/lookup columns later.
 */

export type Gender = "men" | "women" | "unisex";

export type FragranceFamily = "oriental" | "woody" | "floral" | "fresh" | "musk" | "oud";

export type Occasion = "everyday" | "office" | "evening" | "festive" | "signature";

export const GENDER_LABELS: Record<Gender, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};

export const FRAGRANCE_FAMILY_LABELS: Record<FragranceFamily, string> = {
  oriental: "Oriental",
  woody: "Woody",
  floral: "Floral",
  fresh: "Fresh",
  musk: "Musk",
  oud: "Oud",
};

export const OCCASION_LABELS: Record<Occasion, string> = {
  everyday: "Everyday",
  office: "Office",
  evening: "Evening",
  festive: "Festive",
  signature: "Signature",
};

export const GENDERS: readonly Gender[] = ["men", "women", "unisex"];

export const FRAGRANCE_FAMILIES: readonly FragranceFamily[] = [
  "oriental",
  "woody",
  "floral",
  "fresh",
  "musk",
  "oud",
];

export const OCCASIONS: readonly Occasion[] = [
  "everyday",
  "office",
  "evening",
  "festive",
  "signature",
];
