import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Money } from "@/types/money";

interface ProductPriceProps {
  /** Starting ("from") price — the lowest active variant price. */
  price: Money | null;
  /** Original price shown struck through when the item is discounted. */
  comparePrice?: Money | null;
  /** Prefix the price with "From" (multi-variant products). */
  showFromLabel?: boolean;
  className?: string;
}

export function ProductPrice({
  price,
  comparePrice,
  showFromLabel = true,
  className,
}: ProductPriceProps) {
  if (!price) {
    return <span className={cn("text-sm text-muted-foreground", className)}>Unavailable</span>;
  }

  const isDiscounted = Boolean(comparePrice && comparePrice.amount > price.amount);

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      {showFromLabel && <span className="text-xs text-muted-foreground">From</span>}
      <span className="text-base font-semibold text-foreground">{formatMoney(price)}</span>
      {isDiscounted && comparePrice && (
        <span className="text-sm text-muted-foreground line-through">{formatMoney(comparePrice)}</span>
      )}
    </div>
  );
}
