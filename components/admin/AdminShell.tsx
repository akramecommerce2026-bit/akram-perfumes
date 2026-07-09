"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  adminName: string;
  adminInitials: string;
  dateLabel: string;
  children: ReactNode;
}

/**
 * Responsive admin chrome: a persistent, collapsible sidebar on tablet/desktop
 * (md+) and an off-canvas drawer on mobile. Owns the only client state the
 * layout needs (collapse + drawer open), keeping the sidebar/top-bar reusable.
 */
export function AdminShell({ adminName, adminInitials, dateLabel, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-dvh bg-background">
      {/* Persistent sidebar (md+) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border transition-[width] duration-300 md:block",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <AdminSidebar collapsed={collapsed} />
      </aside>

      {/* Content column, offset by the sidebar width */}
      <div className={cn("flex min-h-dvh flex-col transition-[padding] duration-300", collapsed ? "md:pl-20" : "md:pl-64")}>
        <AdminTopBar
          adminName={adminName}
          adminInitials={adminInitials}
          dateLabel={dateLabel}
          onOpenMobileNav={() => setMobileOpen(true)}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden">
            <motion.div
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border shadow-xl"
              initial={shouldReduceMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: shouldReduceMotion ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
