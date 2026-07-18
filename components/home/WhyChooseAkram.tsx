import { Gem, HeartHandshake, Hourglass, ShieldCheck, Tag, Truck } from "lucide-react";

import { Section } from "@/components/common/section";
import { SectionBackdrop } from "@/components/common/section-backdrop";
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

/**
 * Why Choose — the promises grid.
 *
 * A Server Component now. It was a Client Component to stagger the cards in via
 * motion variants; those variants also meant six cards of copy sat at opacity 0
 * until JS ran. Static content should not be able to fail to appear.
 */
export function WhyChooseAkram() {
  return (
    <Section spacing="lg" className="relative overflow-hidden">
        <SectionBackdrop variant="panels" />

        <SectionHeading
          eyebrow="The Akram Promise"
          title="Why Choose Akram"
          subtitle="Every fragrance is crafted to deliver elegance, confidence, and a memorable experience."
        />

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </Section>
  );
}
