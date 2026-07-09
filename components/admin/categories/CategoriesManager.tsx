"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Select } from "@/components/admin/ui/form-fields";
import { useToast } from "@/components/admin/ui/toast";
import { deleteCategoryAction } from "@/lib/admin/category-actions";
import { cn } from "@/lib/utils";
import type { AdminCategoryListItem, AdminCategoryQuery } from "@/types/admin-category";

interface CategoriesManagerProps {
  items: readonly AdminCategoryListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: AdminCategoryQuery;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function CategoriesManager({ items, total, page, pageSize, totalPages, query }: CategoriesManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [search, setSearch] = useState(query.search ?? "");
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function pushWith(updates: Record<string, string | undefined>, resetPage = true) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) sp.delete(key);
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

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(deleteTarget.id);
      if (result.ok) {
        toast({ title: "Category deleted", variant: "success" });
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast({ title: "Cannot delete category", description: result.error, variant: "error" });
        setDeleteTarget(null);
      }
    });
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Categories</h1>
          <p className="text-sm text-muted-foreground">{total} categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden="true" /> Add Category
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category name…"
            className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <Select
          aria-label="Sort"
          value={query.sort ?? "newest"}
          onChange={(e) => pushWith({ sort: e.target.value })}
          className="sm:w-40"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name (A–Z)</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No categories found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.slug}</td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-1">{item.description || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{item.productCount}</td>
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
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/categories/${item.id}/edit`}
                        aria-label={`Edit ${item.name}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        disabled={item.productCount > 0}
                        title={item.productCount > 0 ? "Category contains products" : "Delete category"}
                        aria-label={`Delete ${item.name}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
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
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name ?? "category"}?`}
        description="It will be hidden from the storefront (soft delete) and can be restored from the database if needed."
        confirmLabel="Delete"
        destructive
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
