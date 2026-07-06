"use client";

import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Menu } from "lucide-react";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { NavActions } from "@/components/layout/nav-actions";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useScrollState } from "@/hooks/use-scroll-state";

export function Navbar() {
  const { scrolled, hidden } = useScrollState();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40"
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 -z-10 border-b border-border bg-background/75 shadow-sm backdrop-blur-xl"
          initial={false}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <Container>
          <div className="flex h-16 items-center justify-between md:h-20">
            <Logo />
            <DesktopNav />
            <div className="flex items-center gap-1">
              <NavActions className="hidden md:flex" />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
                className="lg:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </Container>
      </motion.header>
      <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} />
    </MotionConfig>
  );
}
