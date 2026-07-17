import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Accordion — a disclosure section.
 *
 * Built on native <details>/<summary> rather than state + a motion component.
 * That buys three things the PDP needs: the content is in the DOM and findable
 * by browser search even while collapsed, it needs no JS (so this stays a Server
 * Component), and it cannot get stuck closed the way a JS-driven panel can.
 *
 * The marker rotates from + to × via `group-open`, which is the whole animation.
 */
interface AccordionProps {
  title: string;
  /** Open on load. Use for the section a visitor most likely wants. */
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function Accordion({ title, defaultOpen = false, children, className }: AccordionProps) {
  return (
    <details
      open={defaultOpen}
      className={cn("group border-b border-border last:border-b-0", className)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-semibold text-foreground">{title}</span>
        <Plus
          aria-hidden="true"
          className="size-4 shrink-0 text-accent transition-transform duration-(--animate-duration-base) ease-lux group-open:rotate-45 motion-reduce:transition-none"
        />
      </summary>
      <div className="pb-6 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}
