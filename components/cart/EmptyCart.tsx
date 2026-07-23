import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/common/button";
import { EmptyState } from "@/components/common/empty-state";

interface EmptyCartProps {
  /** Fires when the user chooses to continue shopping (e.g. close the drawer). */
  onContinue?: () => void;
  className?: string;
}

/**
 * The empty cart, on the shared EmptyState — same shape as an empty wishlist or
 * an empty search, because they are the same moment. A Server Component now; it
 * was a Client Component only to fade itself in.
 */
export function EmptyCart({ onContinue, className }: EmptyCartProps) {
  return (
    <EmptyState
      icon={<ShoppingBag strokeWidth={1.5} />}
      title="Your cart is empty"
      description="Discover our signature fragrances and add your favourites to begin."
      action={
        <Button href="/shop" variant="primary" size="lg" onClick={onContinue}>
          Continue Shopping
        </Button>
      }
      className={className}
    />
  );
}
