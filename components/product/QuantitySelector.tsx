"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  const buttonClass = cn(
    "flex size-10 items-center justify-center text-foreground transition-colors",
    "hover:text-accent disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
  );

  return (
    <div
      className={cn("inline-flex items-center rounded-full border border-border", className)}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        aria-label="Decrease quantity"
        className={buttonClass}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm font-medium tabular-nums text-foreground">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        aria-label="Increase quantity"
        className={buttonClass}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
