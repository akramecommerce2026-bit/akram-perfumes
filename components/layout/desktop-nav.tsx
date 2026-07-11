"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuLink({ href, ...props }: NavigationMenu.Link.Props & { href: string }) {
  return <NavigationMenu.Link render={<NextLink href={href} />} {...props} />;
}

const baseLinkClassName =
  "relative flex h-10 items-center px-3 text-sm font-medium tracking-wide transition-colors";

const menuLinkItemClassName =
  "block rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground";

interface IndicatorRect {
  left: number;
  width: number;
}

export function DesktopNav() {
  const pathname = usePathname();
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const itemRefs = React.useRef(new Map<string, HTMLLIElement>());
  const [indicator, setIndicator] = React.useState<IndicatorRect | null>(null);

  React.useEffect(() => {
    function measure() {
      const activeItem = navItems.find((item) => isActivePath(pathname, item.href));
      const el = activeItem ? itemRefs.current.get(activeItem.href) : undefined;
      const list = listRef.current;
      if (el && list) {
        const listRect = list.getBoundingClientRect();
        const itemRect = el.getBoundingClientRect();
        setIndicator({ left: itemRect.left - listRect.left, width: itemRect.width });
      } else {
        setIndicator(null);
      }
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  return (
    <NavigationMenu.Root aria-label="Primary" className="hidden lg:block">
      <NavigationMenu.List ref={listRef} className="relative flex items-center gap-1">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <NavigationMenu.Item
              key={item.href}
              ref={(el: HTMLLIElement | null) => {
                if (el) itemRefs.current.set(item.href, el);
                else itemRefs.current.delete(item.href);
              }}
            >
              {item.type === "mega" ? (
                <>
                  <NavigationMenu.Trigger
                    className={cn(
                      baseLinkClassName,
                      "gap-1 bg-transparent",
                      active ? "text-foreground" : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    {item.label}
                    <NavigationMenu.Icon className="transition-transform duration-200 data-popup-open:rotate-180">
                      <ChevronDown className="size-3.5" aria-hidden="true" />
                    </NavigationMenu.Icon>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="grid w-max grid-cols-2 gap-x-10 gap-y-2 p-6 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none">
                    {item.sections.map((section) => (
                      <div key={section.title} className="flex flex-col gap-1">
                        <p className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {section.title}
                        </p>
                        {section.links.map((link) => (
                          <MenuLink key={link.href} href={link.href} className={menuLinkItemClassName}>
                            {link.label}
                          </MenuLink>
                        ))}
                      </div>
                    ))}
                  </NavigationMenu.Content>
                </>
              ) : (
                <MenuLink
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    baseLinkClassName,
                    active ? "text-foreground" : "text-foreground/70 hover:text-foreground",
                  )}
                >
                  {item.label}
                </MenuLink>
              )}
            </NavigationMenu.Item>
          );
        })}

        {indicator && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 h-px bg-accent"
            initial={false}
            animate={{ left: indicator.left, width: indicator.width, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          sideOffset={16}
          collisionPadding={16}
          className="z-30 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none"
        >
          <NavigationMenu.Popup className="relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg outline-none transition-[opacity,transform,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none">
            <NavigationMenu.Viewport className="relative h-full w-full overflow-hidden" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
