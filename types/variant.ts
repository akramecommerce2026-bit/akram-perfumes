import type { Money } from "@/types/money";

export type VariantStatus = "active" | "inactive";

export type WeightUnit = "g" | "kg" | "ml" | "l";

export interface VariantWeight {
  readonly value: number;
  readonly unit: WeightUnit;
}

/**
 * A single purchasable variant of a product.
 *
 * Deliberately named `variantName` — never "size" — so the model stays flexible
 * across volumes ("6ml"), formats ("Roll-On", "Spray"), bundles ("Combo Pack")
 * and any future variant type the client introduces from the Admin Panel.
 *
 * Variants are never hardcoded: they are data, owned by the product they belong
 * to, and fully managed (add / edit / delete / reorder / enable / disable) from
 * the Admin Panel.
 */
export interface ProductVariant {
  readonly id: string;
  readonly productId: string;
  readonly variantName: string;
  readonly price: Money;
  /** Original price before discount — present only when the variant is on sale. */
  readonly comparePrice?: Money;
  readonly stockQuantity: number;
  readonly sku: string;
  readonly weight?: VariantWeight;
  readonly status: VariantStatus;
  /** Controls the order variants are shown in; lower comes first. */
  readonly displayOrder: number;
}
