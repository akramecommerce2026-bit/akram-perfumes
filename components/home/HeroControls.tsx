"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface HeroControlsProps {
  onPrev: () => void;
  onNext: () => void;
}

const arrowClass = cn(
  "flex size-11 items-center justify-center rounded-full border border-background/30 bg-foreground/10 text-background backdrop-blur-sm transition-all duration-300",
  "hover:border-accent hover:bg-foreground/25",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background",
);

export function HeroControls({ onPrev, onNext }: HeroControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-x-4 top-1/2 z-20 hidden -translate-y-1/2 justify-between md:flex lg:inset-x-8">
      <button
        type="button"
        aria-label="Previous slide"
        onClick={onPrev}
        className={cn(arrowClass, "pointer-events-auto")}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={onNext}
        className={cn(arrowClass, "pointer-events-auto")}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
