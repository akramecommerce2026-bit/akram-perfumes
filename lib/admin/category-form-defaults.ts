import type { CategoryFormValues } from "@/lib/admin/category-schema";
import type { AdminCategoryDetail } from "@/types/admin-category";

export function emptyCategoryFormValues(): CategoryFormValues {
  return {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    metaTitle: "",
    metaDescription: "",
    active: true,
  };
}

export function toCategoryFormValues(detail: AdminCategoryDetail): CategoryFormValues {
  return {
    name: detail.name,
    slug: detail.slug,
    description: detail.description,
    imageUrl: detail.imageUrl,
    metaTitle: detail.metaTitle,
    metaDescription: detail.metaDescription,
    active: detail.active,
  };
}
