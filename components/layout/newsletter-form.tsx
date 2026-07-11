"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Footer newsletter signup. No provider yet — confirms locally without reloading. */
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
      className="flex gap-2"
    >
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        placeholder="Email address"
        className="h-10 w-full min-w-0 rounded-full border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
      />
      <Button type="submit" size="sm" className="shrink-0 rounded-full">
        Subscribe
      </Button>
    </form>
  );
}
