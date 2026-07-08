"use client";

import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const card: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <motion.article
      variants={card}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-shadow duration-500 hover:shadow-lg"
    >
      {/* Gold accent line that grows in on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
      />

      <span className="flex size-12 items-center justify-center rounded-full bg-accent/12 text-accent transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transition-none">
        <Icon className="size-6" aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.article>
  );
}
