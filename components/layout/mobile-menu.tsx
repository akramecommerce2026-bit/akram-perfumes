"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "@base-ui/react/drawer";
import { Collapsible } from "@base-ui/react/collapsible";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { NavActions } from "@/components/layout/nav-actions";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Drawer.Portal keepMounted>
            <Drawer.Backdrop
              render={
                <motion.div
                  className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                />
              }
            />
            <Drawer.Viewport className="fixed inset-0 z-50 flex justify-end">
              <Drawer.Popup
                className="flex h-full w-full max-w-sm flex-col border-l border-border bg-popover text-popover-foreground outline-none"
                render={
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0.9999 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0.9999 }}
                    transition={{
                      duration: shouldReduceMotion ? 0.15 : 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                }
              >
                <Drawer.Title className="sr-only">Site navigation</Drawer.Title>

                <div className="flex items-center justify-between border-b border-border px-gutter py-4">
                  <Logo />
                  <Drawer.Close
                    aria-label="Close menu"
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <X className="size-5" aria-hidden="true" />
                  </Drawer.Close>
                </div>

                <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-gutter py-6">
                  <ul className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const active = isActivePath(pathname, item.href);

                      if (item.type === "mega") {
                        const subLinks = item.sections.flatMap((section) => section.links);

                        return (
                          <li key={item.href}>
                            <Collapsible.Root>
                              <div className="flex items-center justify-between rounded-lg">
                                <NextLink
                                  href={item.href}
                                  onClick={() => onOpenChange(false)}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                    "flex-1 rounded-lg px-3 py-3 text-base font-medium",
                                    active ? "text-foreground" : "text-foreground/80",
                                  )}
                                >
                                  {item.label}
                                </NextLink>
                                <Collapsible.Trigger
                                  aria-label={`Toggle ${item.label} categories`}
                                  className="group rounded-full p-3 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                                >
                                  <ChevronDown
                                    className="size-4 transition-transform duration-200 group-data-panel-open:rotate-180"
                                    aria-hidden="true"
                                  />
                                </Collapsible.Trigger>
                              </div>
                              <Collapsible.Panel className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out [&[hidden]:not([hidden='until-found'])]:hidden data-starting-style:h-0 data-ending-style:h-0 motion-reduce:transition-none">
                                <ul className="flex flex-col gap-1 py-1 pl-6">
                                  {subLinks.map((link) => (
                                    <li key={link.href}>
                                      <NextLink
                                        href={link.href}
                                        onClick={() => onOpenChange(false)}
                                        className="block rounded-lg px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                                      >
                                        {link.label}
                                      </NextLink>
                                    </li>
                                  ))}
                                </ul>
                              </Collapsible.Panel>
                            </Collapsible.Root>
                          </li>
                        );
                      }

                      return (
                        <li key={item.href}>
                          <NextLink
                            href={item.href}
                            onClick={() => onOpenChange(false)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "block rounded-lg px-3 py-3 text-base font-medium transition-colors",
                              active ? "text-foreground" : "text-foreground/80 hover:text-foreground",
                            )}
                          >
                            {item.label}
                          </NextLink>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-t border-border px-gutter py-6">
                  <NavActions onNavigate={() => onOpenChange(false)} />
                </div>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        )}
      </AnimatePresence>
    </Drawer.Root>
  );
}
