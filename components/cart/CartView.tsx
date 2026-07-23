"use client";

import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useCart } from "@/components/cart/cart-context";

export function CartView() {
  const { items, itemCount, totals, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start xl:grid-cols-[1fr_24rem]">
      <section aria-label="Cart items" className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Clear cart
          </button>
        </div>

        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.variantId} className="py-6">
              <CartLineItem item={item} />
            </li>
          ))}
        </ul>

        <Link
          href="/shop"
          className="group mt-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
          Continue Shopping
        </Link>
      </section>

      <aside aria-label="Order summary" className="lg:sticky lg:top-28">
        <CartSummary totals={totals} />
      </aside>
    </div>
  );
}
