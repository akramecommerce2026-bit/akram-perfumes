import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { navItems } from "@/lib/navigation";
import { BUSINESS, SOCIAL_LINKS } from "@/lib/site";

const supportLinks = [
  { label: "Track Order", href: "/track" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/contact#faq" },
  { label: "All Products", href: "/shop" },
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
              Crafted fragrances for the modern connoisseur — attars, perfumes and more, made in
              Madurai.
            </p>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{BUSINESS.addressOneLine}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <a href={BUSINESS.phoneHref} className="transition-colors hover:text-foreground">
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <a href={BUSINESS.emailHref} className="transition-colors hover:text-foreground">
                  {BUSINESS.email}
                </a>
              </li>
            </ul>
          </FooterCard>

          <FooterColumn title="Quick Links" links={quickLinks} />
          <FooterColumn title="Customer Support" links={supportLinks} />

          <FooterCard>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Sign up for updates on new arrivals and collections.
            </p>
            <NewsletterForm />
            <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social.label}
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
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-foreground">
                Track Order
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
