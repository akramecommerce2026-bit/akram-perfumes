import { z } from "zod";

import { FRAGRANCE_FAMILIES, GENDERS } from "@/types/product-attributes";
import type { FragranceFamily, Gender } from "@/types/product-attributes";

const genderValues = GENDERS as readonly [Gender, ...Gender[]];
const familyValues = FRAGRANCE_FAMILIES as readonly [FragranceFamily, ...FragranceFamily[]];

const optionalText = (max: number) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`).optional().or(z.literal(""));

/** A single variant row. Prices are entered in rupees (converted to paise on save). */
export const variantSchema = z
  .object({
    id: z.string().optional(),
    variantName: z.string().trim().min(1, "Size is required").max(40, "Too long"),
    price: z.coerce.number({ message: "Price is required" }).nonnegative("Must be ≥ 0"),
    comparePrice: z.coerce.number().nonnegative("Must be ≥ 0").nullable().optional(),
    sku: z.string().trim().min(1, "SKU is required").max(40, "Too long"),
    stock: z.coerce.number().int("Whole number").nonnegative("Must be ≥ 0"),
    lowStockThreshold: z.coerce.number().int("Whole number").nonnegative("Must be ≥ 0"),
    active: z.boolean(),
  })
  .refine(
    (v) => v.comparePrice == null || v.comparePrice === 0 || v.comparePrice >= v.price,
    { message: "MRP must be greater than or equal to the selling price", path: ["comparePrice"] },
  );

export const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  alt: z.string().optional(),
  isPrimary: z.boolean(),
  displayOrder: z.number().int(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120, "Too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(140, "Too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  shortDescription: optionalText(300),
  description: optionalText(6000),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().trim().min(1, "Brand is required").max(80, "Too long"),
  gender: z.enum(genderValues),
  concentration: optionalText(80),
  fragranceFamily: z.enum(familyValues),
  isFeatured: z.boolean(),
  active: z.boolean(),
  topNotes: z.array(z.string().trim().min(1)),
  heartNotes: z.array(z.string().trim().min(1)),
  baseNotes: z.array(z.string().trim().min(1)),
  images: z.array(imageSchema),
  metaTitle: optionalText(70),
  metaDescription: optionalText(180),
  keywords: z.array(z.string().trim().min(1)),
  ogImage: z.string().url().optional().or(z.literal("")),
  variants: z.array(variantSchema).min(1, "Add at least one variant"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
export type ImageFormValue = z.infer<typeof imageSchema>;

/** Convert a rupee amount from the form into integer paise for storage. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert integer paise from storage into a rupee number for the form. */
export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/** Slugify a product name for the auto-generated slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
