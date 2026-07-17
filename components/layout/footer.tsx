import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

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
 * The methods Razorpay Checkout actually presents, named in text.
 *
 * Deliberately not card-brand logos: those are third-party trademarks, and we
 * hold no licence to redraw or ship them. Naming the methods is honest about
 * what checkout accepts without borrowing anyone's mark.
 */
const paymentMethods = ["UPI", "Cards", "Net Banking", "Wallets"];

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
      className="text-[14px] text-muted-foreground transition-colors duration-200 hover:text-accent-foreground"
    >
      {children}
    </Link>
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
    <footer className="mt-auto border-t border-border bg-card text-card-foreground">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:gap-12 lg:py-16">
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
                <a
                  href={BUSINESS.phoneHref}
                  className="transition-colors duration-200 hover:text-accent-foreground"
                >
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <a
                  href={BUSINESS.emailHref}
                  className="transition-colors duration-200 hover:text-accent-foreground"
                >
                  {BUSINESS.email}
                </a>
              </li>
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

          {/* Newsletter + socials */}
          <div className="flex flex-col gap-4">
            <ColumnHeading>The Akram Letter</ColumnHeading>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              New arrivals and collections, once in a while. No noise.
            </p>
            <NewsletterForm />
            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] tracking-wide text-muted-foreground transition-colors duration-200 hover:text-accent-foreground"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* A hairline of gold rather than grey — the one place the brand colour
            spans the full width. */}
        <div className="h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_45%,transparent),transparent)]" />

        <div className="flex flex-col items-center justify-between gap-5 py-7 text-[13px] text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} Akram Perfumes. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] tracking-wide">
              <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
              Secured by Razorpay
            </span>
            <span aria-hidden="true" className="text-border">
              |
            </span>
            <ul className="flex flex-wrap items-center gap-2">
              {paymentMethods.map((method) => (
                <li
                  key={method}
                  className="rounded border border-border px-2 py-1 text-[11px] font-medium tracking-wide text-muted-foreground"
                >
                  {method}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
