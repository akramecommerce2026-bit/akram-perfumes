"use client";

import { Menu, PanelLeft, Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdminTopBarProps {
  adminName: string;
  adminInitials: string;
  dateLabel: string;
  onOpenMobileNav: () => void;
  onToggleCollapse: () => void;
}

export function AdminTopBar({
  adminName,
  adminInitials,
  dateLabel,
  onOpenMobileNav,
  onToggleCollapse,
}: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      {/* Mobile: open drawer */}
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* Tablet/desktop: collapse rail */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label="Toggle sidebar"
        className="hidden size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:flex"
      >
        <PanelLeft className="size-5" aria-hidden="true" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-muted-foreground lg:block">{dateLabel}</span>

        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground",
            )}
          >
            {adminInitials}
          </span>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium text-foreground">{adminName}</span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
