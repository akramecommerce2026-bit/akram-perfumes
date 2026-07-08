"use client";

import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { cn } from "@/lib/utils";

interface SelectableCardProps {
  value: string;
  checked: boolean;
  register: UseFormRegisterReturn;
  title: string;
  description: string;
  /** Optional leading visual (icon) and trailing content (e.g. price). */
  icon?: ReactNode;
  trailing?: ReactNode;
}

/**
 * A radio option rendered as a selectable card. Shared by the delivery and
 * payment groups so their selection/focus/hover styling stays identical. Native
 * radio input keeps it keyboard- and screen-reader-accessible.
 */
export function SelectableCard({
  value,
  checked,
  register,
  title,
  description,
  icon,
  trailing,
}: SelectableCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        checked
          ? "border-accent bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] shadow-sm"
          : "border-border hover:border-accent/60",
      )}
    >
      <input type="radio" value={value} {...register} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          checked ? "border-accent" : "border-border",
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-accent" />}
      </span>

      {icon && <span className="shrink-0 text-accent">{icon}</span>}

      <span className="flex flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>

      {trailing && <span className="shrink-0 text-right">{trailing}</span>}
    </label>
  );
}
