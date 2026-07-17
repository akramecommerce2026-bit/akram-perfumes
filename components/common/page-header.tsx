import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Small gold line above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * The masthead every storefront page opens with.
 *
 * One component rather than nine copies of the same markup: the type scale, the
 * gold eyebrow and the spacing under it are decisions that should be made once.
 * Sits one step above SectionHeading (3xl/4xl against 2xl/3xl) because a page
 * title should outrank the sections beneath it.
 */
export function PageHeader({ eyebrow, title, description, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-8 lg:mb-10", className)}>
      {eyebrow && (
        <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description && (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
