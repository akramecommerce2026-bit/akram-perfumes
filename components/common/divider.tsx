import { cn } from "@/lib/utils";

/**
 * Divider — a hairline rule.
 *
 * `gold` fades in from both ends rather than running edge to edge; a full-width
 * gold rule shouts, a fading one separates. Reserved for moments that deserve
 * emphasis (footer, section joins); everything else takes the grey default.
 */
export function Divider({
  gold = false,
  className,
}: {
  gold?: boolean;
  className?: string;
}) {
  return (
    <div
      role="separator"
      className={cn(
        "h-px w-full",
        gold
          ? "bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_45%,transparent),transparent)]"
          : "bg-border",
        className,
      )}
    />
  );
}
