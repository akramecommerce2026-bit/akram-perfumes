"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

interface SignatureBottleProps {
  image: string;
  /** The section title — describes the bottle for assistive tech. */
  alt: string;
}

export function SignatureBottle({ image, alt }: SignatureBottleProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 30, mass: 0.4 });
  const scale = useTransform(smooth, [0, 0.5, 1], [0.97, 1.03, 1]);
  const rotate = useTransform(smooth, [0, 1], [1.2, -1.2]); // < 2deg total

  return (
    <div ref={ref} className="relative flex justify-center">
      {/* Gold ambient glow */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-8 -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_42%,transparent),transparent_68%)] blur-3xl"
        animate={shouldReduceMotion ? undefined : { opacity: [0.55, 0.85, 0.55], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative w-full max-w-[520px]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div style={shouldReduceMotion ? undefined : { scale, rotate }}>
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Image
              src={image}
              alt={alt}
              width={1100}
              height={1100}
              sizes="(min-width: 1024px) 520px, 90vw"
              className="h-auto w-full"
            />
          </div>
        </motion.div>

        {/* Soft elegant shadow / floor reflection */}
        <div
          aria-hidden="true"
          className="mx-auto mt-4 h-8 w-[72%] rounded-[50%] bg-[radial-gradient(circle,color-mix(in_oklab,var(--foreground)_28%,transparent),transparent_72%)] blur-lg"
        />
      </motion.div>
    </div>
  );
}
