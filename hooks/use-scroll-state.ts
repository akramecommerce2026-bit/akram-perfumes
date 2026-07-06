"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";

const GLASS_THRESHOLD = 80;
const HIDE_DELTA = 4;

interface ScrollState {
  scrolled: boolean;
  hidden: boolean;
}

export function useScrollState(): ScrollState {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > GLASS_THRESHOLD);

    if (shouldReduceMotion) {
      setHidden(false);
      lastY.current = latest;
      return;
    }

    const delta = latest - lastY.current;
    if (latest <= GLASS_THRESHOLD) {
      setHidden(false);
    } else if (Math.abs(delta) > HIDE_DELTA) {
      setHidden(delta > 0);
    }
    lastY.current = latest;
  });

  return { scrolled, hidden };
}
