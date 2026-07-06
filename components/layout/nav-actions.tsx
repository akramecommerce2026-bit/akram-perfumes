"use client";

import type { LucideIcon } from "lucide-react";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavAction {
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const actions: NavAction[] = [
  { label: "Search", icon: Search },
  { label: "Wishlist", icon: Heart },
  { label: "Cart", icon: ShoppingBag, badge: 0 },
  { label: "Account", icon: User },
];

interface NavActionsProps {
  className?: string;
}

export function NavActions({ className }: NavActionsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {actions.map(({ label, icon: Icon, badge }) => (
        <motion.div key={label} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
          <Button variant="ghost" size="icon" aria-label={label} className="relative rounded-full">
            <Icon className="size-[18px]" aria-hidden="true" />
            {typeof badge === "number" && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground"
              >
                {badge}
              </span>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
