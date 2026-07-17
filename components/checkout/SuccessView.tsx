import Link from "next/link";
import { Check, Mail, Package } from "lucide-react";

import { storefrontButton } from "@/components/common/button";
import { cn } from "@/lib/utils";

interface SuccessViewProps {
  orderNumber: string;
}

/**
 * Order confirmation.
 *
 * A Server Component. The success mark used to spring in with motion, which put
 * the confirmation of a completed payment behind JS — the one screen that must
 * render even if everything else on the page fails. The mark still lands with a
 * gentle pop, via CSS.
 */
export function SuccessView({ orderNumber }: SuccessViewProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-8 py-16 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-(--animate-duration-enter) motion-safe:fill-mode-both ease-lux">
      <div className="relative flex size-24 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-(--animate-duration-enter) motion-safe:fill-mode-both"
        />
        <span className="relative flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-(--animate-duration-base) motion-safe:delay-150 motion-safe:fill-mode-both">
          <Check className="size-8" strokeWidth={2.5} aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Order Confirmed</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Thank you for your order
        </h1>
        <p className="text-muted-foreground">
          We&rsquo;ve received your order and are preparing it with care. A confirmation has been sent
          to your email.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Package className="size-4 text-accent" aria-hidden="true" />
          Order Number
        </div>
        <p className="text-2xl font-semibold tracking-wide text-foreground">
          {orderNumber}
        </p>
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="size-3.5" aria-hidden="true" />
          Keep this number for tracking &amp; support.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/shop"
          className={cn(storefrontButton({ variant: "primary", size: "lg", block: false }))}
        >
          Continue Shopping
        </Link>
        <Link
          href={`/track/${encodeURIComponent(orderNumber)}`}
          className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}
