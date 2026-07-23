import type { LucideIcon } from "lucide-react";

import { Surface } from "@/components/common/surface";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * One promise in the Why Choose grid.
 *
 * Takes its border, hover and lift from Surface, so it cannot drift from the
 * product and category cards. The gold rule that wipes in along the top edge is
 * the card's own idea — it is the only decoration here, and it is CSS, so the
 * card's text is never waiting on JS to become visible.
 */
export function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <Surface
      as="article"
      interactive
      className="group relative flex flex-col gap-4 overflow-hidden p-8"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-(--animate-duration-enter) ease-lux group-hover:scale-x-100 motion-reduce:transition-none"
      />

      <span className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform duration-(--animate-duration-enter) ease-lux group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
        <Icon className="size-6" aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </Surface>
  );
}
