import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Money } from "@/types/money";

/**
 * Price — the one place the storefront states what something costs.
 *
 * Supersedes PriceDisplay and the copy of this logic that lived inline in the
 * product card. The discount is always computed from the two Money values rather
 * than passed in, so a percentage can never disagree with the prices beside it.
 *
 * `size` changes the type scale only; the anatomy — price, struck original,
 * saving — is identical everywhere, which is what makes a card and a PDP read as
 * the same shop.
 */

type PriceSize = "sm" | "md" | "lg";

const priceClasses: Record<PriceSize, string> = {
  sm: "text-base font-bold",
  md: "text-xl font-bold",
  lg: "text-3xl font-bold tracking-tight",
};

const compareClasses: Record<PriceSize, string> = {
  sm: "text-[13px]",
  md: "text-sm",
  lg: "text-lg",
};

interface PriceProps {
  price: Money | null;
  comparePrice?: Money | null;
  size?: PriceSize;
  /** Spell out the saving in currency as well as percent (PDP). */
  showSavings?: boolean;
  className?: string;
}

export function Price({
  price,
  comparePrice,
  size = "sm",
  showSavings = false,
  className,
}: PriceProps) {
  if (!price) {
    return <p className={cn("text-sm text-muted-foreground", className)}>Unavailable</p>;
  }

  const isDiscounted = Boolean(comparePrice && comparePrice.amount > price.amount);
  const savings = isDiscounted && comparePrice ? comparePrice.amount - price.amount : 0;
  const percent =
    isDiscounted && comparePrice ? Math.round((savings / comparePrice.amount) * 100) : 0;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span className={cn(priceClasses[size], "text-foreground")}>{formatMoney(price)}</span>

      {isDiscounted && comparePrice && (
        <>
          <span className={cn(compareClasses[size], "text-muted-foreground line-through")}>
            {formatMoney(comparePrice)}
          </span>
          <span className={cn(compareClasses[size], "font-semibold text-destructive")}>
            {showSavings
              ? `Save ${formatMoney({ amount: savings, currency: price.currency })} (${percent}%)`
              : `${percent}% off`}
          </span>
        </>
      )}
    </div>
  );
}
