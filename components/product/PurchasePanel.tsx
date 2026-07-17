"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { useCart } from "@/components/cart/cart-context";
import { Price } from "@/components/common/price";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { VariantSelector } from "@/components/product/VariantSelector";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const LOW_STOCK_THRESHOLD = 5;

/**
 * Stateful purchase panel. Owns the selected variant + quantity; selecting a
 * variant instantly updates price, compare price, stock, SKU and the add-to-cart
 * payload — no navigation. Cart/checkout wiring is intentionally isolated behind
 * the two handlers so the upcoming cart module plugs in without touching layout.
 */
export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const [selectedId, setSelectedId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedId) ?? product.variants[0],
    [product.variants, selectedId],
  );

  if (!selectedVariant) {
    return <p className="text-sm text-muted-foreground">This product is currently unavailable.</p>;
  }

  const stock = selectedVariant.stockQuantity;
  const isSoldOut = stock <= 0;
  const isLowStock = !isSoldOut && stock <= LOW_STOCK_THRESHOLD;

  function selectVariant(variantId: string) {
    setSelectedId(variantId);
    setQuantity(1);
    setAdded(false);
  }

  function handleAddToCart() {
    if (isSoldOut || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    openDrawer();
    window.setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (isSoldOut || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Price
          price={selectedVariant.price}
          comparePrice={selectedVariant.comparePrice}
          size="lg"
          showSavings
        />
        <p className="flex items-center gap-2 text-sm">
          {isSoldOut ? (
            <span className="font-medium text-muted-foreground">Currently sold out</span>
          ) : (
            <>
              <Check className="size-4 text-accent" aria-hidden="true" />
              <span className={cn("font-medium", isLowStock ? "text-accent" : "text-foreground")}>
                {isLowStock ? `Only ${stock} left in stock` : "In stock"}
              </span>
            </>
          )}
        </p>
      </div>

      <VariantSelector variants={product.variants} selectedId={selectedVariant.id} onSelect={selectVariant} />

      <p className="text-xs text-muted-foreground">
        SKU: <span className="font-medium text-foreground">{selectedVariant.sku}</span>
      </p>

      <div className="flex items-center gap-3">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={Math.max(1, stock)}
          className={cn(isSoldOut && "pointer-events-none opacity-50")}
        />
        <button
          type="button"
          onClick={() => setWishlisted((value) => !value)}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Heart className={cn("size-5", wishlisted && "fill-accent text-accent")} aria-hidden="true" />
        </button>
        <span className="text-sm text-muted-foreground">
          {isSoldOut ? "Unavailable" : wishlisted ? "In your wishlist" : "Add to wishlist"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300",
            "hover:shadow-gold disabled:pointer-events-none disabled:opacity-50",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          {added ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Added to Bag
            </>
          ) : isSoldOut ? (
            "Sold Out"
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isSoldOut}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-all duration-300",
            "hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          Buy Now
        </button>
      </div>

      <ul className="mt-1 flex flex-col gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
        <li className="flex items-center gap-3">
          <Truck className="size-4 shrink-0 text-accent" aria-hidden="true" />
          Free delivery over ₹999 &middot; estimated 3–5 business days
        </li>
        <li className="flex items-center gap-3">
          <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden="true" />
          Secure checkout &middot; 100% authentic guarantee
        </li>
        <li className="flex items-center gap-3">
          <RotateCcw className="size-4 shrink-0 text-accent" aria-hidden="true" />
          Easy 7-day returns
        </li>
      </ul>
    </div>
  );
}
