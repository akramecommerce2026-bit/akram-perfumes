import { cn } from "@/lib/utils";

export type ProductBadgeTone = "featured" | "sale" | "sold-out" | "neutral";

const toneClasses: Record<ProductBadgeTone, string> = {
  featured: "bg-accent text-accent-foreground",
  sale: "bg-primary text-primary-foreground",
  "sold-out": "bg-muted text-muted-foreground",
  neutral: "bg-background/80 text-foreground ring-1 ring-border",
};

interface ProductBadgeProps {
  label: string;
  tone?: ProductBadgeTone;
  className?: string;
}

export function ProductBadge({ label, tone = "neutral", className }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide uppercase",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
