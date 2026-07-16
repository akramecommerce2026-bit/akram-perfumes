import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

/**
 * Section heading, sized to the storefront's type scale.
 *
 * Entrance is a CSS animation rather than a motion variant. The variant version
 * left every heading on the site stuck at `opacity: 0` in production — headings
 * are content, and content must not depend on JS to become visible. That also
 * means this no longer needs to be a Client Component.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  const enter =
    "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:fill-mode-both";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className={cn(enter, "text-xs font-medium tracking-[0.2em] text-accent uppercase")}>
          {eyebrow}
        </span>
      )}
      <h2 className={cn(enter, "text-2xl font-bold text-foreground sm:text-3xl motion-safe:delay-75")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(enter, "max-w-2xl text-[15px] text-muted-foreground motion-safe:delay-150")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
