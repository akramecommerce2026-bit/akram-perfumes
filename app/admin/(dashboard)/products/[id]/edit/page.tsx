import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { toProductFormValues } from "@/lib/admin/product-form-defaults";
import { adminProductService } from "@/services/admin-product-service";
import { productService } from "@/services/product-service";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    adminProductService.getById(id),
    productService.getCategories(),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      categories={categories}
      defaultValues={toProductFormValues(product)}
    />
  );
}
