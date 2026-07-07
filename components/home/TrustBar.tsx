"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Gem, MapPin, ShieldCheck, Truck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/common/container";

interface TrustItem {
  label: string;
  icon: LucideIcon;
}

const items: TrustItem[] = [
  { label: "Free Shipping", icon: Truck },
  { label: "Secure Payment", icon: ShieldCheck },
  { label: "Premium Quality", icon: Gem },
  { label: "Made in India", icon: MapPin },
  { label: "10,000+ Happy Customers", icon: Users },
];

export function TrustBar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Container className="relative z-20 -mt-10 lg:-mt-14">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-3xl border border-border/60 bg-background/60 px-6 py-6 shadow-lg backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-5 lg:px-8"
      >
        {items.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 text-center lg:flex-row lg:gap-3 lg:text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-foreground sm:text-sm">{label}</span>
          </div>
        ))}
      </motion.div>
    </Container>
  );
}
