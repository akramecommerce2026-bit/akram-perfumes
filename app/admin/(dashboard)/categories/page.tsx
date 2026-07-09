import { CategoriesManager } from "@/components/admin/categories/CategoriesManager";
import { DEFAULT_CATEGORY_PAGE_SIZE } from "@/services/repositories/admin-category-repository";
import { adminCategoryService } from "@/services/admin-category-service";
import type { AdminCategoryQuery } from "@/types/admin-category";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = first(params.sort);

  const query: AdminCategoryQuery = {
    search: first(params.search),
    sort: sort === "oldest" || sort === "name" ? sort : "newest",
    page: Math.max(1, Number(first(params.page)) || 1),
    pageSize: DEFAULT_CATEGORY_PAGE_SIZE,
  };

  const result = await adminCategoryService.list(query);

  return (
    <CategoriesManager
      items={result.items}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      query={query}
    />
  );
}
