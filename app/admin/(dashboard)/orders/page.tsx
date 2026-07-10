import { OrdersManager } from "@/components/admin/orders/OrdersManager";
import { adminOrderService } from "@/services/admin-order-service";
import {
  DEFAULT_ORDER_PAGE_SIZE,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/services/repositories/admin-order-repository";
import type { AdminOrderQuery } from "@/types/admin-order";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = first(params.status);
  const payment = first(params.payment);
  const sort = first(params.sort);

  const query: AdminOrderQuery = {
    search: first(params.search),
    status: ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : "all",
    paymentStatus: PAYMENT_STATUSES.includes(payment as PaymentStatus)
      ? (payment as PaymentStatus)
      : "all",
    sort: sort === "oldest" ? "oldest" : "newest",
    page: Math.max(1, Number(first(params.page)) || 1),
    pageSize: DEFAULT_ORDER_PAGE_SIZE,
  };

  const result = await adminOrderService.list(query);

  return (
    <OrdersManager
      items={result.items}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      query={query}
    />
  );
}
