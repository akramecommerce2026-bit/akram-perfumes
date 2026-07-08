"use client";

import { ChevronDown } from "lucide-react";

import { SORT_OPTIONS } from "@/lib/product-filters";
import { cn } from "@/lib/utils";
import type { ProductSort } from "@/types/product";

interface SortDropdownProps {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
  className?: string;
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor="shop-sort" className="sr-only">
        Sort products
      </label>
      <select
        id="shop-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as ProductSort)}
        className="h-11 w-full appearance-none rounded-full border border-border bg-card pr-10 pl-4 text-sm text-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Sort: {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
