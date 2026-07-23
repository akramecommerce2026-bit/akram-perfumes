"use client";

import Link from "next/link";
import { Drawer } from "@base-ui/react/drawer";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShoppingBag, X } from "lucide-react";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useCart } from "@/components/cart/cart-context";
import { storefrontButton } from "@/components/common/button";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, itemCount, totals, isDrawerOpen, openDrawer, closeDrawer } = useCart();
  const shouldReduceMotion = useReducedMotion();
  const freeShipping = totals.shipping.amount === 0;

  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}>
      <AnimatePresence>
        {isDrawerOpen && (
          <Drawer.Portal keepMounted>
            <Drawer.Backdrop
              render={
                <motion.div
                  className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                />
              }
            />
            <Drawer.Viewport className="fixed inset-0 z-50 flex justify-end">
              <Drawer.Popup
                className="flex h-full w-full max-w-md flex-col border-l border-border bg-popover text-popover-foreground outline-none"
                render={
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0.9999 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0.9999 }}
                    transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                }
              >
                <div className="flex items-center justify-between border-b border-border px-gutter py-4">
                  <Drawer.Title className="flex items-center gap-2 text-lg font-semibold">
                    <ShoppingBag className="size-5 text-accent" aria-hidden="true" />
                    Your Cart
                    {itemCount > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({itemCount})
                      </span>
                    )}
                  </Drawer.Title>
                  <Drawer.Close aria-label="Close cart" render={<Button variant="ghost" size="icon" />}>
                    <X className="size-5" aria-hidden="true" />
                  </Drawer.Close>
                </div>

                {items.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center px-gutter py-10">
                    <EmptyCart onContinue={closeDrawer} />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto px-gutter py-6">
                      <motion.ul layout className="flex flex-col gap-6">
                        <AnimatePresence initial={false} mode="popLayout">
                          {items.map((item) => (
                            <li key={item.variantId}>
                              <CartLineItem item={item} onNavigate={closeDrawer} />
                            </li>
                          ))}
                        </AnimatePresence>
                      </motion.ul>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-border px-gutter py-5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="text-lg font-semibold text-foreground">
                          {formatMoney(totals.subtotal)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {freeShipping
                          ? "Free shipping included · taxes calculated at checkout."
                          : "Shipping & taxes calculated at checkout."}
                      </p>
                      <Link
                        href="/checkout"
                        onClick={closeDrawer}
                        className={cn(storefrontButton({ variant: "primary", size: "lg", block: true }), "group")}
                      >
                        Proceed to Checkout
                        <ArrowRight
                          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                      <Link
                        href="/cart"
                        onClick={closeDrawer}
                        className="text-center text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        View Cart
                      </Link>
                      <button
                        type="button"
                        onClick={closeDrawer}
                        className="text-center text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </>
                )}
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        )}
      </AnimatePresence>
    </Drawer.Root>
  );
}
