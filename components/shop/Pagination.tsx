"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const buttonBase = cn(
  "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition-colors",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

/** Builds a compact page list with ellipses for large catalogues. */
function buildPages(page: number, pageCount: number): (number | "ellipsis")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const current of sorted) {
    if (current - previous > 1) result.push("ellipsis");
    result.push(current);
    previous = current;
  }
  return result;
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = buildPages(page, pageCount);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-2", className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={cn(buttonBase, "border-border text-foreground hover:border-accent disabled:pointer-events-none disabled:opacity-40")}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">
            &hellip;
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              buttonBase,
              entry === page
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-foreground hover:border-accent",
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className={cn(buttonBase, "border-border text-foreground hover:border-accent disabled:pointer-events-none disabled:opacity-40")}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
