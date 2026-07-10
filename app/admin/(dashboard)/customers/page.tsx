import { CustomersManager } from "@/components/admin/customers/CustomersManager";
import { adminCustomerService } from "@/services/admin-customer-service";
import {
  CUSTOMER_SORTS,
  CUSTOMER_STATUS_FILTERS,
  DEFAULT_CUSTOMER_PAGE_SIZE,
} from "@/services/repositories/admin-customer-repository";
import type {
  AdminCustomerQuery,
  AdminCustomerSort,
  AdminCustomerStatusFilter,
} from "@/types/admin-customer";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = first(params.status);
  const sort = first(params.sort);

  const query: AdminCustomerQuery = {
    search: first(params.search),
    status: CUSTOMER_STATUS_FILTERS.includes(status as AdminCustomerStatusFilter)
      ? (status as AdminCustomerStatusFilter)
      : "all",
    sort: CUSTOMER_SORTS.includes(sort as AdminCustomerSort) ? (sort as AdminCustomerSort) : "recent",
    page: Math.max(1, Number(first(params.page)) || 1),
    pageSize: DEFAULT_CUSTOMER_PAGE_SIZE,
  };

  const result = await adminCustomerService.list(query);

  return (
    <CustomersManager
      items={result.items}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      query={query}
    />
  );
}
