import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`).optional().or(z.literal(""));

/**
 * An image is either an uploaded/absolute URL or a site-relative path
 * (`/signature/bin-sheikh.webp`), so bundled art and Storage uploads both pass.
 */
const imageField = z
  .string()
  .trim()
  .max(500, "Too long")
  .refine(
    (value) => value === "" || value.startsWith("/") || /^https?:\/\//.test(value),
    "Enter an image URL or a path starting with /",
  )
  .optional()
  .or(z.literal(""));

/**
 * The button may point anywhere on the storefront (`/shop?collection=bin-sheikh`)
 * or at an external page, so both relative paths and absolute URLs are allowed.
 */
const linkField = z
  .string()
  .trim()
  .max(300, "Too long")
  .refine(
    (value) => value === "" || value.startsWith("/") || /^https?:\/\//.test(value),
    "Enter a URL or a path starting with /",
  )
  .optional()
  .or(z.literal(""));

export const signatureCollectionSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required").max(80, "Too long"),
    subtitle: optionalText(60),
    description: optionalText(500),
    backgroundImage: imageField,
    collectionImage: imageField,
    buttonText: optionalText(40),
    buttonUrl: linkField,
    displayOrder: z.coerce
      .number({ message: "Display order is required" })
      .int("Must be a whole number")
      .min(0, "Must be 0 or more")
      .max(999, "Too large"),
    active: z.boolean(),
  })
  // A label without a destination is exactly the dead button this module replaces.
  .superRefine((values, ctx) => {
    if (values.buttonText && !values.buttonUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["buttonUrl"],
        message: "Add the link this button should open.",
      });
    }
    if (values.buttonUrl && !values.buttonText) {
      ctx.addIssue({
        code: "custom",
        path: ["buttonText"],
        message: "Add the label for this button.",
      });
    }
  });

export type SignatureCollectionFormValues = z.infer<typeof signatureCollectionSchema>;
