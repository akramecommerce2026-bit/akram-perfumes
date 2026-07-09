import { ProductForm } from "@/components/admin/products/ProductForm";
import { emptyProductFormValues } from "@/lib/admin/product-form-defaults";
import { productService } from "@/services/product-service";

export default async function NewProductPage() {
  const categories = await productService.getCategories();

  return (
    <ProductForm
      mode="create"
      categories={categories}
      defaultValues={emptyProductFormValues(categories[0]?.id ?? "")}
    />
  );
}
