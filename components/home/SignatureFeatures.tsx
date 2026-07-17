"use client";

import { motion, type Variants } from "framer-motion";
import { Clock, Flame, Leaf, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  { icon: Flame, title: "Premium Oud", description: "A deep, resinous oud at its beating heart." },
  { icon: Clock, title: "Long Lasting Performance", description: "Hours of rich, evolving sillage." },
  { icon: Sparkles, title: "Crafted for Every Occasion", description: "From daybreak to evening soirée." },
  { icon: Leaf, title: "Premium Ingredients", description: "Rare essences, sourced and blended with care." },
];

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function SignatureFeatures() {
  return (
    <motion.ul
      variants={list}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="flex flex-col gap-5"
    >
      {features.map(({ icon: Icon, title, description }) => (
        <motion.li key={title} variants={item} className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}
