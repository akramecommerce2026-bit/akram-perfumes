"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { isRemoteImage } from "@/lib/is-remote-image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Select } from "@/components/admin/ui/form-fields";
import { useToast } from "@/components/admin/ui/toast";
import {
  deleteProductsAction,
  setProductsActiveAction,
} from "@/lib/admin/product-actions";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import type {
  AdminProductListItem,
  AdminProductQuery,
  StockStatus,
} from "@/types/admin-product";

interface ProductsManagerProps {
  items: readonly AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: readonly Category[];
  query: AdminProductQuery;
}

const STOCK_META: Record<StockStatus, { label: string; className: string }> = {
  in_stock: { label: "In stock", className: "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground" },
  low_stock: { label: "Low stock", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  out_of_stock: { label: "Out of stock", className: "bg-destructive/10 text-destructive" },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function ProductsManager(props: ProductsManagerProps) {
  const { items, total, page, pageSize, totalPages, categories, query } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(query.search ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function pushWith(updates: Record<string, string | undefined>, resetPage = true) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") sp.delete(key);
      else sp.set(key, value);
    }
    if (resetPage) sp.delete("page");
    // Selection is page-scoped; clear it when the result set changes.
    setSelected(new Set());
    router.push(`${pathname}?${sp.toString()}`);
  }

  // Debounced search → URL.
  useEffect(() => {
    const current = query.search ?? "";
    if (search === current) return;
    const timeout = window.setTimeout(() => pushWith({ search: search.trim() || undefined }), 350);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(items.map((item) => item.id)));
  }

  function toggleOne(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedIds = useMemo(() => [...selected], [selected]);

  function runBulk(
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast({ title: successMessage, variant: "success" });
        setSelected(new Set());
        router.refresh();
      } else {
        toast({ title: "Action failed", description: result.error, variant: "error" });
      }
    });
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">{total} products in your catalogue</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name…"
            className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <Select
          aria-label="Filter by category"
          value={query.categoryId ?? "all"}
          onChange={(e) => pushWith({ category: e.target.value })}
          className="sm:w-44"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by status"
          value={query.status ?? "all"}
          onChange={(e) => pushWith({ status: e.target.value })}
          className="sm:w-36"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
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

      {/* Bulk toolbar */}
      {someSelected && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-4 py-3">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => runBulk(() => setProductsActiveAction(selectedIds, true), "Products activated")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              <CheckCircle2 className="size-4 text-accent" aria-hidden="true" /> Activate
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runBulk(() => setProductsActiveAction(selectedIds, false), "Products set to draft")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              <XCircle className="size-4 text-muted-foreground" aria-hidden="true" /> Deactivate
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setDeleteOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-60"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-4 rounded border-border accent-[var(--accent)]"
                />
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Created</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No products found. Try adjusting your filters or add a new product.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const stock = STOCK_META[item.stockStatus];
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${item.name}`}
                        checked={selected.has(item.id)}
                        onChange={() => toggleOne(item.id)}
                        className="size-4 rounded border-border accent-[var(--accent)]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                          {item.featuredImage ? (
                            <Image src={item.featuredImage} alt={item.name} fill unoptimized={isRemoteImage(item.featuredImage)} sizes="40px" className="object-cover" />
                          ) : null}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.variantCount} variant{item.variantCount === 1 ? "" : "s"}
                            {item.isFeatured ? " · Featured" : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.sku ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.categoryName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.brand}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {item.price ? formatMoney(item.price) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          item.status === "active"
                            ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", stock.className)}>
                        {stock.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${item.id}/edit`}
                        aria-label={`Edit ${item.name}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
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

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${selected.size} product${selected.size === 1 ? "" : "s"}?`}
        description="The selected products will be removed from your storefront. This is a soft delete and can be restored from the database if needed."
        confirmLabel="Delete"
        destructive
        loading={isPending}
        onConfirm={() =>
          runBulk(async () => {
            const result = await deleteProductsAction(selectedIds);
            if (result.ok) setDeleteOpen(false);
            return result;
          }, "Products deleted")
        }
      />
    </div>
  );
}
