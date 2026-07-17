"use client";

import { cn } from "@/lib/utils";

interface HeroPaginationProps {
  count: number;
  index: number;
  onSelect: (index: number) => void;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function HeroPagination({ count, index, onSelect }: HeroPaginationProps) {
  return (
    <div className="flex items-center gap-5">
      <p className="text-sm tabular-nums text-background">
        <span className="font-semibold">{pad(index + 1)}</span>
        <span className="text-background/60"> / {pad(count)}</span>
      </p>

      <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show slide ${i + 1}`}
            onClick={() => onSelect(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background",
              i === index ? "w-7 bg-accent" : "w-2.5 bg-background/40 hover:bg-background/70",
            )}
          />
        ))}
      </div>
    </div>
  );
}
