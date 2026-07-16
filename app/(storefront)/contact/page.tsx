import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/common/container";
import { ContactForm } from "@/components/contact/ContactForm";
import { BUSINESS, CONTACT_FAQS, SOCIAL_LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Akram Perfumes",
  description:
    "Get in touch with Akram Perfumes in Madurai. Visit our store, call, email, or send us a message — we're here to help.",
};

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.addressOneLine)}&output=embed`;

export default function ContactPage() {
  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-10 max-w-2xl lg:mb-14">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">We&rsquo;d love to hear from you</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">Contact Us</h1>
          <p className="mt-3 text-muted-foreground">
            Questions about a fragrance, an order, or a bespoke request? Reach out and our team will
            respond within one business day.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          {/* Details column */}
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-5">
              <h2 className="font-heading text-xl font-semibold text-foreground">Visit or reach us</h2>
              <ul className="flex flex-col gap-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                  <span className="not-italic text-muted-foreground">
                    {BUSINESS.addressLines.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0 text-accent" aria-hidden="true" />
                  <a href={BUSINESS.phoneHref} className="text-foreground transition-colors hover:text-accent">
                    {BUSINESS.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="size-5 shrink-0 text-accent" aria-hidden="true" />
                  <a href={BUSINESS.emailHref} className="text-foreground transition-colors hover:text-accent">
                    {BUSINESS.email}
                  </a>
                </li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-semibold text-foreground">Follow us</h2>
              <ul className="flex flex-wrap gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Form column */}
          <div>
            <ContactForm />
          </div>
        </div>

        {/* Map */}
        <section className="mt-12 lg:mt-16">
          <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">Find us on the map</h2>
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <iframe
              title="Akram Perfumes location map"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[16/10] w-full sm:aspect-[21/9]"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12 lg:mt-16">
          <h2 className="mb-6 font-heading text-2xl font-semibold text-foreground">Frequently asked questions</h2>
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {CONTACT_FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-card px-5 py-4 shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
