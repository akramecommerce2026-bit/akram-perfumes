"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";

import { useCart } from "@/components/cart/cart-context";
import { useSearch } from "@/components/search/search-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavActionsProps {
  className?: string;
  /** Called after navigating via a link — used to close the mobile drawer. */
  onNavigate?: () => void;
}

interface ActionConfig {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

export function NavActions({ className, onNavigate }: NavActionsProps) {
  const { itemCount, openDrawer } = useCart();
  const { openSearch } = useSearch();
  const { count: wishlistCount } = useWishlist();

  const actions: ActionConfig[] = [
    { label: "Search", icon: Search, onClick: openSearch },
    { label: "Wishlist", icon: Heart, href: "/wishlist", badge: wishlistCount },
    {
      label: "Cart",
      icon: ShoppingBag,
      onClick: () => {
        onNavigate?.();
        openDrawer();
      },
      badge: itemCount,
    },
    { label: "Account", icon: User, href: "/account" },
  ];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {actions.map(({ label, icon: Icon, href, onClick, badge }) => {
        const content = (
          <>
            <Icon className="size-[18px]" aria-hidden="true" />
            {typeof badge === "number" && badge > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground"
              >
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </>
        );
        const ariaLabel = badge ? `${label} (${badge} items)` : label;

        return (
          <motion.div key={label} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
            {href ? (
              <Link
                href={href}
                onClick={onNavigate}
                aria-label={ariaLabel}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative rounded-full")}
              >
                {content}
              </Link>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label={ariaLabel}
                onClick={onClick}
                className="relative rounded-full"
              >
                {content}
              </Button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
