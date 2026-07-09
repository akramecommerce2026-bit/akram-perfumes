import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { emptyCategoryFormValues } from "@/lib/admin/category-form-defaults";

export default function NewCategoryPage() {
  return <CategoryForm mode="create" defaultValues={emptyCategoryFormValues()} />;
}
