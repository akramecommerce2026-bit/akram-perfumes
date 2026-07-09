import { ProductsManager } from "@/components/admin/products/ProductsManager";
import { DEFAULT_ADMIN_PAGE_SIZE } from "@/services/repositories/admin-product-repository";
import { adminProductService } from "@/services/admin-product-service";
import { productService } from "@/services/product-service";
import type { AdminProductQuery, ProductStatus } from "@/types/admin-product";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const status = first(params.status);
  const sort = first(params.sort);
  const query: AdminProductQuery = {
    search: first(params.search),
    categoryId: first(params.category),
    status: status === "active" || status === "draft" ? (status as ProductStatus) : "all",
    sort: sort === "oldest" ? "oldest" : "newest",
    page: Math.max(1, Number(first(params.page)) || 1),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };

  const [result, categories] = await Promise.all([
    adminProductService.list(query),
    productService.getCategories(),
  ]);

  return (
    <ProductsManager
      items={result.items}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      categories={categories}
      query={query}
    />
  );
}
