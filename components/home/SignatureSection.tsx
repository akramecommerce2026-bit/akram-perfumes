"use client";

import { MotionConfig, motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/common/container";
import { SignatureBottle } from "@/components/home/SignatureBottle";
import { SignatureContent } from "@/components/home/SignatureContent";

// Deterministic particle field (no Math.random) for SSR-safe markup.
const particles = [
  { left: "12%", top: "24%", size: 5, delay: 0, duration: 11, drift: 16 },
  { left: "30%", top: "68%", size: 4, delay: 1.5, duration: 12, drift: 13 },
  { left: "46%", top: "16%", size: 4, delay: 0.7, duration: 10.5, drift: 18 },
  { left: "68%", top: "72%", size: 5, delay: 2.1, duration: 12.5, drift: 14 },
  { left: "82%", top: "34%", size: 6, delay: 1, duration: 10, drift: 20 },
  { left: "90%", top: "60%", size: 4, delay: 0.4, duration: 11.5, drift: 15 },
] as const;

export function SignatureSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <section id="signature" className="relative overflow-hidden py-section-lg">
        {/* Luxury ivory + soft gold background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_70%)]" />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(45%_45%_at_22%_62%,color-mix(in_oklab,var(--accent)_12%,transparent),transparent_66%)]"
            animate={shouldReduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Subtle texture, softly masked toward the center */}
          <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(70%_70%_at_50%_40%,#000,transparent)]" />

          {!shouldReduceMotion &&
            particles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_90%,white),color-mix(in_oklab,var(--accent)_55%,transparent))] shadow-[0_0_8px_color-mix(in_oklab,var(--accent)_55%,transparent)]"
                style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
                animate={{ y: [0, -p.drift, 0], opacity: [0, 0.8, 0], scale: [0.8, 1, 0.8] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
        </div>

        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <SignatureBottle />
            </div>
            <SignatureContent />
          </div>
        </Container>
      </section>
    </MotionConfig>
  );
}
