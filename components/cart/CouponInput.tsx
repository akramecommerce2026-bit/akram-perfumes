"use client";

import { useState, type FormEvent } from "react";
import { Tag } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Coupon field — presentational only for V1. Real validation/redemption lands
 * with the checkout module; here it just captures input and shows a stub notice.
 */
export function CouponInput({ className }: { className?: string }) {
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setNotice("Coupons can be applied at checkout.");
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2", className)}>
      <label htmlFor="coupon-code" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Coupon code
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="coupon-code"
            type="text"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (notice) setNotice(null);
            }}
            placeholder="Enter code"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-border bg-background pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <button
          type="submit"
          className="h-11 shrink-0 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Apply
        </button>
      </div>
      {notice && <p className="text-xs text-muted-foreground">{notice}</p>}
    </form>
  );
}
