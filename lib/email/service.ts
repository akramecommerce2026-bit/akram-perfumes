import "server-only";

/**
 * Transactional email abstraction.
 *
 * A single seam (`EmailProvider`) so the app is provider-agnostic. No provider
 * is configured yet, so `sendEmail` uses `LogEmailProvider` (records the intent
 * server-side). To go live, implement an `EmailProvider` for your service
 * (Resend / SES / Postmark, …) and return it from `getEmailProvider()` when its
 * env keys are present — every call site and template stays unchanged.
 */
export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

/** Fallback provider: records the email server-side without sending. */
class LogEmailProvider implements EmailProvider {
  readonly name = "log";
  async send(message: EmailMessage): Promise<void> {
    console.info(`[email:${this.name}] → ${message.to} :: ${message.subject}`);
  }
}

let provider: EmailProvider | null = null;

/** Resolve the active provider. Swap this for a real provider once configured. */
export function getEmailProvider(): EmailProvider {
  if (!provider) {
    // e.g. `if (process.env.RESEND_API_KEY) provider = new ResendEmailProvider();`
    provider = new LogEmailProvider();
  }
  return provider;
}

export function isEmailConfigured(): boolean {
  return getEmailProvider().name !== "log";
}

/** Best-effort send — never throws into the caller's flow (email is non-critical). */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!message.to) return false;
  try {
    await getEmailProvider().send(message);
    return true;
  } catch (error) {
    console.error("[email] send failed:", error);
    return false;
  }
}
