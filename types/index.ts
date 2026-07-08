/** Barrel for all domain types — import from `@/types`. */
export type { CurrencyCode, Money } from "@/types/money";
export type { ProductVariant, VariantStatus, VariantWeight, WeightUnit } from "@/types/variant";
export type { Category } from "@/types/category";
export type {
  FragranceFamily,
  Gender,
  Occasion,
} from "@/types/product-attributes";
export {
  FRAGRANCE_FAMILIES,
  FRAGRANCE_FAMILY_LABELS,
  GENDER_LABELS,
  GENDERS,
  OCCASION_LABELS,
  OCCASIONS,
} from "@/types/product-attributes";
export type {
  FragranceNotes,
  PaginatedResult,
  Product,
  ProductQuery,
  ProductRecord,
  ProductSort,
  ProductSummary,
} from "@/types/product";
export type { Cart, CartItem } from "@/types/cart";
export type { Order, OrderItem, OrderStatus } from "@/types/order";
export type { Testimonial } from "@/types/testimonial";
