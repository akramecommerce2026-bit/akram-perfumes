import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { navItems } from "@/lib/navigation";

const supportLinks = [
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "FAQs", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const contactDetails = [
  { label: "hello@example.com", href: "mailto:hello@example.com" },
  { label: "+1 (000) 000-0000", href: "tel:+10000000000" },
  { label: "@akramperfumes", href: "https://instagram.com" },
];

interface FooterColumnProps {
  title: string;
  links: { label: string; href: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterCard({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

export function Footer() {
  const quickLinks = navItems.map(({ label, href }) => ({ label, href }));

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <Container>
        <div className="grid gap-12 py-section-sm sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <FooterCard>
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Crafted fragrances for the modern connoisseur.
            </p>
          </FooterCard>

          <FooterColumn title="Quick Links" links={quickLinks} />
          <FooterColumn title="Customer Support" links={supportLinks} />

          <FooterCard>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Sign up for updates on new arrivals and collections.
            </p>
            <form className="flex gap-2">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="Email address"
                className="h-10 w-full min-w-0 rounded-full border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
              />
              <Button type="submit" size="sm" className="shrink-0 rounded-full">
                Subscribe
              </Button>
            </form>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
              {contactDetails.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterCard>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Akram Perfumes. All rights reserved.</p>
          <ul className="flex gap-4">
            <li>
              <Link href="/privacy-policy" className="hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-foreground">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
