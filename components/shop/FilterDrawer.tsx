"use client";

import { Drawer } from "@base-ui/react/drawer";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/components/shop/ProductFilters";
import type { ShopFilterState } from "@/components/shop/filter-state";
import type { Category } from "@/types/category";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: ShopFilterState;
  categories: readonly Category[];
  onChange: (patch: Partial<ShopFilterState>) => void;
  onClear: () => void;
  resultCount: number;
}

export function FilterDrawer({
  open,
  onOpenChange,
  state,
  categories,
  onChange,
  onClear,
  resultCount,
}: FilterDrawerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
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
            <Drawer.Viewport className="fixed inset-0 z-50 flex justify-start">
              <Drawer.Popup
                className="flex h-full w-full max-w-sm flex-col border-r border-border bg-popover text-popover-foreground shadow-xl outline-none"
                render={
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { x: "-100%", opacity: 0.9999 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { x: "-100%", opacity: 0.9999 }}
                    transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                }
              >
                <div className="flex items-center justify-between border-b border-border px-gutter py-4">
                  <Drawer.Title className="font-heading text-lg font-semibold">Filters</Drawer.Title>
                  <Drawer.Close aria-label="Close filters" render={<Button variant="ghost" size="icon" />}>
                    <X className="size-5" aria-hidden="true" />
                  </Drawer.Close>
                </div>

                <div className="flex-1 overflow-y-auto px-gutter py-6">
                  <ProductFilters
                    state={state}
                    categories={categories}
                    onChange={onChange}
                    onClear={onClear}
                  />
                </div>

                <div className="border-t border-border px-gutter py-4">
                  <Button
                    className="h-11 w-full rounded-full"
                    onClick={() => onOpenChange(false)}
                  >
                    Show {resultCount} {resultCount === 1 ? "result" : "results"}
                  </Button>
                </div>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        )}
      </AnimatePresence>
    </Drawer.Root>
  );
}
