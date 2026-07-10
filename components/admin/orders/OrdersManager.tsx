"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";

import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/orders/StatusBadge";
import { Select } from "@/components/admin/ui/form-fields";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/services/repositories/admin-order-repository";
import { formatMoney } from "@/lib/money";
import type { AdminOrderListItem, AdminOrderQuery } from "@/types/admin-order";

interface OrdersManagerProps {
  items: readonly AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: AdminOrderQuery;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function OrdersManager({ items, total, page, pageSize, totalPages, query }: OrdersManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query.search ?? "");

  function pushWith(updates: Record<string, string | undefined>, resetPage = true) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") sp.delete(key);
      else sp.set(key, value);
    }
    if (resetPage) sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  useEffect(() => {
    const current = query.search ?? "";
    if (search === current) return;
    const timeout = window.setTimeout(() => pushWith({ search: search.trim() || undefined }), 350);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Orders</h1>
        <p className="text-sm text-muted-foreground">{total} orders</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or customer…"
            className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <Select
          aria-label="Filter by status"
          value={query.status ?? "all"}
          onChange={(e) => pushWith({ status: e.target.value })}
          className="capitalize sm:w-40"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by payment"
          value={query.paymentStatus ?? "all"}
          onChange={(e) => pushWith({ payment: e.target.value })}
          className="capitalize sm:w-40"
        >
          <option value="all">All payments</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Sort"
          value={query.sort ?? "newest"}
          onChange={(e) => pushWith({ sort: e.target.value })}
          className="sm:w-36"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Date</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No orders found. Orders placed on the storefront will appear here.
                </td>
              </tr>
            ) : (
              items.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-foreground hover:text-accent">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-foreground">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.itemCount}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatMoney(order.total)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      aria-label={`View ${order.orderNumber}`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Eye className="size-4" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rangeStart}–{rangeEnd} of {total}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => pushWith({ page: String(page - 1) }, false)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => pushWith({ page: String(page + 1) }, false)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
