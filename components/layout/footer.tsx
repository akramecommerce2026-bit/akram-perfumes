import Link from "next/link";
import type { CSSProperties } from "react";
import { CreditCard, Mail, MapPin, Phone, ShieldCheck, Smartphone, Wallet } from "lucide-react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { productService } from "@/services/product-service";
import { BUSINESS, SOCIAL_LINKS } from "@/lib/site";

const companyLinks = [
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Track Order", href: "/track" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/contact#faq" },
];

/**
 * Payment methods checkout presents, as icon chips.
 *
 * Deliberately generic lucide glyphs and text, not card-brand logos: Visa,
 * Mastercard, UPI and Razorpay marks are third-party trademarks we hold no
 * licence to redraw or ship. This says what checkout accepts without borrowing
 * anyone's mark.
 */
const paymentMethods = [
  { label: "Razorpay", icon: ShieldCheck },
  { label: "UPI", icon: Smartphone },
  { label: "Cards", icon: CreditCard },
  { label: "Wallets", icon: Wallet },
];

/*
 * The footer runs a dark colour context. Rather than rewrite every child to a
 * light palette, the theme variables are overridden on the <footer> element
 * itself — local inline style, so no global CSS and no token definitions change.
 * Every inherited `text-foreground` / `text-muted-foreground` / `border-border`
 * (including the Logo's own default) resolves light here and nowhere else. The
 * gold `--accent` is left as-is: it was chosen to read on both grounds.
 */
const footerTheme = {
  "--foreground": "oklch(0.97 0.012 85)",
  "--muted-foreground": "oklch(0.82 0.022 82)",
  "--border": "oklch(1 0 0 / 0.16)",
} as CSSProperties;

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold tracking-[0.18em] text-foreground uppercase">
      {children}
    </h3>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[14px] text-muted-foreground transition-colors duration-200 hover:text-accent"
    >
      {children}
    </Link>
  );
}

/**
 * An original geometric watermark — two overlapping squares forming an
 * eight-point star inside concentric rings, in the spirit of girih tilework.
 * Drawn here in SVG, oversized in the lower-right corner at a whisper of opacity:
 * decorative only, clipped by the footer's overflow, invisible to assistive tech
 * and never in front of a link.
 */
function CornerOrnament() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute -right-16 -bottom-20 size-[360px] text-accent opacity-[0.07] sm:size-[440px]"
    >
      <g stroke="currentColor" strokeWidth="1.25">
        <circle cx="100" cy="100" r="94" />
        <circle cx="100" cy="100" r="72" />
        <circle cx="100" cy="100" r="34" />
        <rect x="34" y="34" width="132" height="132" />
        <rect x="34" y="34" width="132" height="132" transform="rotate(45 100 100)" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="100"
            x2="100"
            y2="6"
            transform={`rotate(${i * 45} 100 100)`}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Storefront footer.
 *
 * A Server Component so the collections column can read the live category list —
 * the same source the homepage and nav use, so a category added in the admin
 * appears here too rather than drifting into a hardcoded copy.
 */
export async function Footer() {
  const categories = await productService.getCategories();

  return (
    <footer
      style={footerTheme}
      className="relative mt-auto overflow-hidden bg-[oklch(0.25_0.072_18)] text-foreground"
    >
      <CornerOrnament />

      <Container className="relative">
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:gap-12 lg:py-20">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-xs text-[14px] leading-relaxed text-muted-foreground">
              Crafted fragrances for the modern connoisseur — attars, perfumes and more, made in
              Madurai.
            </p>
            <ul className="flex flex-col gap-3 text-[14px] text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="leading-relaxed">{BUSINESS.addressOneLine}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <a href={BUSINESS.phoneHref} className="transition-colors duration-200 hover:text-accent">
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <a href={BUSINESS.emailHref} className="transition-colors duration-200 hover:text-accent">
                  {BUSINESS.email}
                </a>
              </li>
            </ul>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] tracking-wide text-muted-foreground transition-colors duration-200 hover:text-accent"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections — authored in the admin */}
          <div className="flex flex-col gap-4">
            <ColumnHeading>Collections</ColumnHeading>
            <ul className="flex flex-col gap-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <FooterLink href={`/collections/${category.slug}`}>{category.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <ColumnHeading>Company</ColumnHeading>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <ColumnHeading>The Akram Letter</ColumnHeading>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              New arrivals and collections, once in a while. No noise.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Thin gold divider — the one place the brand colour spans full width. */}
        <div className="h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_55%,transparent),transparent)]" />

        <div className="flex flex-col items-center justify-between gap-5 py-7 text-[13px] text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} Akram Perfumes. All Rights Reserved.</p>

          <ul className="flex flex-wrap items-center justify-center gap-2.5">
            {paymentMethods.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground"
              >
                <Icon className="size-3.5 text-accent" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
