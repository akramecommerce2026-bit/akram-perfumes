"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Footer newsletter signup. No provider yet — confirms locally without reloading.
 *
 * Styled for the dark footer: a rounded translucent input over the burgundy and
 * a rounded gold Subscribe (the existing .btn-gold control), matched in height.
 * Used only in the footer, so it carries the footer's dark palette directly.
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm text-foreground">
        <Check className="size-4 text-accent" aria-hidden="true" />
        Thanks for subscribing!
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="flex flex-col gap-2.5 sm:flex-row"
    >
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        placeholder="Email address"
        className="h-11 w-full min-w-0 rounded-full border border-[oklch(1_0_0/0.25)] bg-[oklch(1_0_0/0.06)] px-5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      <button
        type="submit"
        className={cn(
          "btn-gold inline-flex h-11 shrink-0 items-center justify-center rounded-full px-7",
          "text-[13px] font-bold tracking-wide uppercase",
          "transition-[background-image,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        )}
      >
        Subscribe
      </button>
    </form>
  );
}
