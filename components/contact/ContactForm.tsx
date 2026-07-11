"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitContactAction } from "@/lib/contact-actions";

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    startTransition(async () => {
      const result = await submitContactAction(values);
      if (result.ok) {
        setSent(true);
        form.reset();
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="flex size-14 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-accent">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-xl font-semibold text-foreground">Message sent</h3>
          <p className="text-sm text-muted-foreground">
            Thank you for reaching out. Our team will get back to you within one business day.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => setSent(false)} className="rounded-full">
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Name
          <input name="name" required autoComplete="name" placeholder="Your name" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Email
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Phone <span className="font-normal text-muted-foreground">(optional)</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="Phone number" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Subject
          <input name="subject" required placeholder="How can we help?" className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Message
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Write your message…"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </label>
      <Button type="submit" disabled={isPending} className="h-11 rounded-full">
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}
