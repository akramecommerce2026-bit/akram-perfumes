"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-context";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { formatMoney } from "@/lib/money";
import type { CartItem } from "@/types/cart";

interface CartLineItemProps {
  item: CartItem;
  /** Fires after navigating away (e.g. close the drawer). */
  onNavigate?: () => void;
}

export function CartLineItem({ item, onNavigate }: CartLineItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4"
    >
      <Link
        href={`/shop/${item.productSlug}`}
        onClick={onNavigate}
        className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted sm:w-24"
      >
        <Image src={item.featuredImage} alt={item.productName} fill sizes="96px" className="object-cover" />
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <Link href={`/shop/${item.productSlug}`} onClick={onNavigate}>
              <h3 className="font-heading text-base font-semibold text-foreground transition-colors hover:text-accent">
                {item.productName}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground">
              {item.variantName} &middot; {formatMoney(item.unitPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            aria-label={`Remove ${item.productName} (${item.variantName})`}
            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <QuantitySelector
            value={item.quantity}
            onChange={(quantity) => updateQuantity(item.variantId, quantity)}
          />
          <span className="font-medium text-foreground">{formatMoney(item.subtotal)}</span>
        </div>
      </div>
    </motion.div>
  );
}
