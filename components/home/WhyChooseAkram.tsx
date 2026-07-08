"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import { Gem, HeartHandshake, Hourglass, ShieldCheck, Tag, Truck } from "lucide-react";

import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { FeatureCard, type Feature } from "@/components/home/FeatureCard";

const features: Feature[] = [
  {
    icon: Gem,
    title: "Premium Ingredients",
    description: "Rare oud, florals and spices, sourced and blended for uncompromising quality.",
  },
  {
    icon: Hourglass,
    title: "Long Lasting Performance",
    description: "Extrait-strength compositions that stay with you from morning to midnight.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic Fragrances",
    description: "Every bottle is original, sealed and quality-checked before it reaches you.",
  },
  {
    icon: Truck,
    title: "Fast & Secure Delivery",
    description: "Carefully packaged and shipped quickly, with tracking on every order.",
  },
  {
    icon: Tag,
    title: "Affordable Luxury",
    description: "House-quality perfumery, thoughtfully priced so elegance stays within reach.",
  },
  {
    icon: HeartHandshake,
    title: "Trusted Customer Experience",
    description: "Attentive support and easy returns — a service as refined as the scent.",
  },
];

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

export function WhyChooseAkram() {
  return (
    <MotionConfig reducedMotion="user">
      <Section spacing="lg" className="relative overflow-hidden">
        {/* Subtle gold accent glow on the ivory background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,color-mix(in_oklab,var(--accent)_12%,transparent),transparent_70%)]"
        />

        <SectionHeading
          eyebrow="The Akram Promise"
          title="Why Choose Akram"
          subtitle="Every fragrance is crafted to deliver elegance, confidence, and a memorable experience."
        />

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </motion.div>
      </Section>
    </MotionConfig>
  );
}
