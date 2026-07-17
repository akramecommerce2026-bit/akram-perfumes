"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/common/button";
import { Price } from "@/components/common/price";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { VariantSelector } from "@/components/product/VariantSelector";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { toProductSummary } from "@/lib/product-summary";
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

  // The wishlist speaks ProductSummary; the page holds a Product.
  const summary = useMemo(() => toProductSummary(product), [product]);
  const { has } = useWishlist();
  const wishlisted = has(product.id);

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
        <WishlistButton product={summary} size="lg" />
        <span className="text-sm text-muted-foreground">
          {isSoldOut ? "Unavailable" : wishlisted ? "In your wishlist" : "Add to wishlist"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="primary" size="lg" block onClick={handleAddToCart} disabled={isSoldOut}>
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
        </Button>
        <Button variant="accent" size="lg" block onClick={handleBuyNow} disabled={isSoldOut}>
          Buy Now
        </Button>
      </div>

      <ul className="mt-1 flex flex-col gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
        <li className="flex items-center gap-3">
          <Truck className="size-4 shrink-0 text-accent" aria-hidden="true" />
          Free delivery on every order &middot; estimated 3–5 business days
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
