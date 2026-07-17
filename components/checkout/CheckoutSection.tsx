import type { ReactNode } from "react";

import { Surface } from "@/components/common/surface";

interface CheckoutSectionProps {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Numbered, card-framed step down the checkout's left column.
 *
 * The entrance is CSS and the component is no longer a Client Component. It
 * previously faded itself in with a motion variant, which meant every step of
 * the checkout form — the address, the payment choice — was mounted at opacity 0
 * and depended on JS to be seen. That is the last place in the storefront that
 * should be able to render blank.
 */
export function CheckoutSection({ step, title, description, children }: CheckoutSectionProps) {
  return (
    <Surface
      as="section"
      className="p-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-(--animate-duration-base) motion-safe:fill-mode-both ease-lux sm:p-7"
    >
      <header className="mb-5 flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-sm font-semibold text-accent-foreground">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </header>
      {children}
    </Surface>
  );
}
