import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Money } from "@/types/money";

interface PriceDisplayProps {
  price: Money;
  comparePrice?: Money | null;
  className?: string;
}

/** Prominent PDP price with struck compare price and a savings badge. */
export function PriceDisplay({ price, comparePrice, className }: PriceDisplayProps) {
  const isDiscounted = Boolean(comparePrice && comparePrice.amount > price.amount);
  const savings = isDiscounted && comparePrice ? comparePrice.amount - price.amount : 0;
  const percent = isDiscounted && comparePrice ? Math.round((savings / comparePrice.amount) * 100) : 0;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-2", className)}>
      <span className="font-heading text-3xl font-semibold text-foreground">{formatMoney(price)}</span>
      {isDiscounted && comparePrice && (
        <>
          <span className="text-lg text-muted-foreground line-through">{formatMoney(comparePrice)}</span>
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            Save {formatMoney({ amount: savings, currency: price.currency })} ({percent}% off)
          </span>
        </>
      )}
    </div>
  );
}
