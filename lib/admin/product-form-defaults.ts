import { paiseToRupees, type ProductFormValues } from "@/lib/admin/product-schema";
import type { AdminProductDetail } from "@/types/admin-product";

/** Blank form values for the "new product" screen. */
export function emptyProductFormValues(firstCategoryId: string): ProductFormValues {
  return {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    categoryId: firstCategoryId,
    brand: "Akram Perfumes",
    gender: "unisex",
    concentration: "",
    fragranceFamily: "oriental",
    isFeatured: false,
    isSignature: false,
    active: true,
    topNotes: [],
    heartNotes: [],
    baseNotes: [],
    images: [],
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    ogImage: "",
    variants: [
      { variantName: "", price: 0, comparePrice: null, sku: "", stock: 0, lowStockThreshold: 5, active: true, images: [] },
    ],
  };
}

/** Map a loaded product into editable form values (paise → rupees, etc.). */
export function toProductFormValues(detail: AdminProductDetail): ProductFormValues {
  return {
    name: detail.name,
    slug: detail.slug,
    shortDescription: detail.shortDescription,
    description: detail.description,
    categoryId: detail.categoryId,
    brand: detail.brand,
    gender: detail.gender,
    concentration: detail.concentration,
    fragranceFamily: detail.fragranceFamily,
    isFeatured: detail.isFeatured,
    isSignature: detail.isSignature,
    active: detail.active,
    topNotes: [...detail.notes.top],
    heartNotes: [...detail.notes.heart],
    baseNotes: [...detail.notes.base],
    images: detail.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
    })),
    metaTitle: detail.metaTitle,
    metaDescription: detail.metaDescription,
    keywords: [...detail.keywords],
    ogImage: detail.ogImage,
    variants: detail.variants.map((variant) => ({
      id: variant.id,
      variantName: variant.variantName,
      price: paiseToRupees(variant.price.amount),
      comparePrice: variant.comparePrice ? paiseToRupees(variant.comparePrice.amount) : null,
      sku: variant.sku,
      stock: variant.stock,
      lowStockThreshold: variant.lowStockThreshold,
      active: variant.status === "active",
      images: variant.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        isPrimary: image.isPrimary,
        displayOrder: image.displayOrder,
      })),
    })),
  };
}
