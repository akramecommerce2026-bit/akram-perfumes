import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * EmptyState — nothing here yet.
 *
 * One component for every empty view (cart, wishlist, no search results), because
 * they are the same moment: say what is missing, then offer the way out. The
 * dashed well signals "a thing belongs here" without pretending to be a card.
 */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** The way out. A Button, generally. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <span className="flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent [&_svg]:size-6">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
