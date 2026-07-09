import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`).optional().or(z.literal(""));

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80, "Too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(100, "Too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  description: optionalText(500),
  imageUrl: z.string().url().optional().or(z.literal("")),
  metaTitle: optionalText(70),
  metaDescription: optionalText(180),
  active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// Slug generation is shared with products — single source of truth.
export { slugify } from "@/lib/admin/product-schema";
