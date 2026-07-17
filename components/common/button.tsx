import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The storefront's button.
 *
 * Separate from components/ui/button on purpose: that one is shared with the
 * admin, and the two areas want different buttons. This is the only button the
 * storefront should use — one shape (rounded-md), one voice (uppercase, tracked,
 * bold), three heights.
 *
 * Renders an <a> when given `href` and a <button> otherwise, so a link that
 * looks like a button is never a button that fakes a link.
 */
export const storefrontButton = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md",
    "text-[13px] font-bold tracking-wide uppercase whitespace-nowrap",
    "transition-[background-image,box-shadow,transform,color] duration-(--animate-duration-base) ease-lux",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    "motion-reduce:transition-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        /** The commitment: Add to Cart, Place Order, Checkout. */
        primary: "bg-foreground text-background hover:bg-foreground/88",
        /** The alternative: equal weight, less finality. */
        outline: "border border-foreground/85 text-foreground hover:bg-foreground hover:text-background",
        /**
         * The metallic gold control (see .btn-gold in globals.css). The strongest
         * thing on the surface it sits on — a product card, a Buy Now. Because it
         * outranks everything around it, one per view is the ceiling; two golds
         * competing is two golds ignored.
         */
        gold: "btn-gold",
        /** Flat gold. For quiet accents that must not outrank a nearby .btn-gold. */
        accent: "bg-accent text-accent-foreground hover:bg-accent/85",
        /** Quiet: filters, drawers, tertiary actions. */
        ghost: "text-foreground hover:bg-muted",
      },
      size: {
        sm: "h-9 px-5",
        md: "h-10 px-6",
        lg: "h-11 px-8",
        /** Square, for icon-only controls; loses the type treatment. */
        icon: "size-10 px-0 [&_svg]:size-5",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

type ButtonVariants = VariantProps<typeof storefrontButton>;

type ButtonAsButton = ButtonVariants &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = ButtonVariants &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string };

export type ButtonProps = (ButtonAsButton | ButtonAsLink) & { children?: ReactNode };

export function Button({ variant, size, block, className, ...props }: ButtonProps) {
  const classes = cn(storefrontButton({ variant, size, block }), className);

  if (typeof props.href === "string") {
    const { href, ...rest } = props as ButtonAsLink;
    return <Link href={href} className={classes} {...rest} />;
  }

  const { type = "button", ...rest } = props as ButtonAsButton;
  return <button type={type} className={classes} {...rest} />;
}
