import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { toCategoryFormValues } from "@/lib/admin/category-form-defaults";
import { adminCategoryService } from "@/services/admin-category-service";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await adminCategoryService.getById(id);
  if (!category) notFound();

  return <CategoryForm mode="edit" categoryId={category.id} defaultValues={toCategoryFormValues(category)} />;
}
