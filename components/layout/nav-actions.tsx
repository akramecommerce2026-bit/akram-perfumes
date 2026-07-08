"use client";

import type { LucideIcon } from "lucide-react";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";

import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavAction {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  badge?: number;
}

interface NavActionsProps {
  className?: string;
}

export function NavActions({ className }: NavActionsProps) {
  const { itemCount, openDrawer } = useCart();

  const actions: NavAction[] = [
    { label: "Search", icon: Search },
    { label: "Wishlist", icon: Heart },
    { label: "Cart", icon: ShoppingBag, onClick: openDrawer, badge: itemCount },
    { label: "Account", icon: User },
  ];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {actions.map(({ label, icon: Icon, onClick, badge }) => (
        <motion.div key={label} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={badge ? `${label} (${badge} items)` : label}
            onClick={onClick}
            className="relative rounded-full"
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            {typeof badge === "number" && badge > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground"
              >
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
