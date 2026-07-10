"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";

import { CustomerAvatar } from "@/components/admin/customers/Avatar";
import { CustomerStatusBadge } from "@/components/admin/customers/StatusBadge";
import { Select } from "@/components/admin/ui/form-fields";
import { formatMoney } from "@/lib/money";
import type { AdminCustomerListItem, AdminCustomerQuery } from "@/types/admin-customer";

interface CustomersManagerProps {
  items: readonly AdminCustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: AdminCustomerQuery;
}

const SORT_LABELS: Record<NonNullable<AdminCustomerQuery["sort"]>, string> = {
  recent: "Recently joined",
  name: "Name (A–Z)",
  spent: "Highest spend",
  orders: "Most orders",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function CustomersManager({ items, total, page, pageSize, totalPages, query }: CustomersManagerProps) {
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
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Customers</h1>
        <p className="text-sm text-muted-foreground">{total} customers</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <Select
          aria-label="Filter by status"
          value={query.status ?? "all"}
          onChange={(e) => pushWith({ status: e.target.value })}
          className="capitalize sm:w-40"
        >
          <option value="all">All customers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deleted">Deleted</option>
        </Select>
        <Select
          aria-label="Sort"
          value={query.sort ?? "recent"}
          onChange={(e) => pushWith({ sort: e.target.value })}
          className="sm:w-44"
        >
          {(Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[]).map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3">Last Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No customers found. Customer profiles appear here after the first orders.
                </td>
              </tr>
            ) : (
              items.map((customer) => (
                <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CustomerAvatar name={customer.fullName} />
                      <div className="flex flex-col overflow-hidden">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="truncate font-medium text-foreground hover:text-accent"
                        >
                          {customer.fullName}
                        </Link>
                        <span className="truncate text-xs text-muted-foreground">{customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{customer.phone || "—"}</td>
                  <td className="px-4 py-3 text-foreground">{customer.totalOrders}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatMoney(customer.totalSpent)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(customer.lastOrderAt)}</td>
                  <td className="px-4 py-3"><CustomerStatusBadge status={customer.status} /></td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      aria-label={`View ${customer.fullName}`}
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
