"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  Building2,
  CreditCard,
  Loader2,
  Mail,
  Search,
  Share2,
  ShieldCheck,
  Store,
} from "lucide-react";

import { Field, Select, TextInput, Textarea } from "@/components/admin/ui/form-fields";
import { Toggle } from "@/components/admin/ui/Toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/ui/toast";
import { changePasswordAction, updateSettingsAction } from "@/lib/admin/settings-actions";
import { signOutAction } from "@/lib/auth/actions";
import type { StoreSettings } from "@/types/admin-settings";

interface SettingsViewProps {
  settings: StoreSettings;
  adminEmail: string;
  razorpayConfigured: boolean;
  emailProvider: string;
  emailConfigured: boolean;
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-accent">
          {icon}
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function SettingsView({
  settings: initial,
  adminEmail,
  razorpayConfigured,
  emailProvider,
  emailConfigured,
}: SettingsViewProps) {
  const { toast } = useToast();
  const [isSaving, startSaving] = useTransition();
  const [isChangingPw, startChangingPw] = useTransition();
  const [settings, setSettings] = useState<StoreSettings>(initial);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }
  function setBusiness(patch: Partial<StoreSettings["business"]>) {
    setSettings((s) => ({ ...s, business: { ...s.business, ...patch } }));
  }
  function setSocial(patch: Partial<StoreSettings["social"]>) {
    setSettings((s) => ({ ...s, social: { ...s.social, ...patch } }));
  }
  function setSeo(patch: Partial<StoreSettings["seo"]>) {
    setSettings((s) => ({ ...s, seo: { ...s.seo, ...patch } }));
  }
  const num = (value: string) => (value === "" ? 0 : Number(value));

  function onSave() {
    startSaving(async () => {
      const result = await updateSettingsAction(settings);
      if (result.ok) toast({ title: "Settings saved", variant: "success" });
      else toast({ title: "Couldn't save settings", description: result.error, variant: "error" });
    });
  }

  function onChangePassword() {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "error" });
      return;
    }
    startChangingPw(async () => {
      const result = await changePasswordAction(newPassword);
      if (result.ok) {
        toast({ title: "Password updated", variant: "success" });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({ title: "Couldn't update password", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your store configuration and preferences.</p>
        </div>
        <Button type="button" onClick={onSave} disabled={isSaving} className="rounded-full">
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General store */}
        <SettingsCard icon={<Store className="size-5" aria-hidden="true" />} title="General Store">
          <Field label="Store name" htmlFor="storeName">
            <TextInput id="storeName" value={settings.storeName} onChange={(e) => set("storeName", e.target.value)} />
          </Field>
          <Field label="Store logo URL" htmlFor="storeLogo" optional>
            <TextInput
              id="storeLogo"
              value={settings.seo.ogImage}
              placeholder="https://…/logo.png"
              onChange={(e) => setSeo({ ogImage: e.target.value })}
            />
          </Field>
          <Field label="Store description" htmlFor="storeDescription">
            <Textarea id="storeDescription" value={settings.storeDescription} onChange={(e) => set("storeDescription", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Currency" htmlFor="currency">
              <Select id="currency" value={settings.currency} onChange={(e) => set("currency", e.target.value)}>
                <option value="INR">INR (₹)</option>
              </Select>
            </Field>
            <Field label="Time zone" htmlFor="timezone">
              <Select id="timezone" value={settings.timezone} onChange={(e) => set("timezone", e.target.value)}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="UTC">UTC</option>
              </Select>
            </Field>
            <Field label="Language" htmlFor="language">
              <Select id="language" value={settings.language} onChange={(e) => set("language", e.target.value)}>
                <option>English (India)</option>
                <option>English (UK)</option>
                <option>Hindi</option>
              </Select>
            </Field>
          </div>
        </SettingsCard>

        {/* Business information */}
        <SettingsCard icon={<Building2 className="size-5" aria-hidden="true" />} title="Business Information">
          <Field label="Business name" htmlFor="bizName">
            <TextInput id="bizName" value={settings.business.name} onChange={(e) => setBusiness({ name: e.target.value })} />
          </Field>
          <Field label="Address" htmlFor="bizAddress">
            <Textarea id="bizAddress" value={settings.business.address} onChange={(e) => setBusiness({ address: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="bizPhone">
              <TextInput id="bizPhone" value={settings.business.phone} onChange={(e) => setBusiness({ phone: e.target.value })} />
            </Field>
            <Field label="Email" htmlFor="bizEmail">
              <TextInput id="bizEmail" type="email" value={settings.business.email} onChange={(e) => setBusiness({ email: e.target.value })} />
            </Field>
          </div>
        </SettingsCard>

        {/* Store settings */}
        <SettingsCard icon={<CreditCard className="size-5" aria-hidden="true" />} title="Store Settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="GST number" htmlFor="gst" optional>
              <TextInput id="gst" value={settings.gstNumber} placeholder="e.g. 33ABCDE1234F1Z5" onChange={(e) => set("gstNumber", e.target.value)} />
            </Field>
            <Field label="Default tax (%)" htmlFor="tax">
              <TextInput id="tax" type="number" min={0} max={100} value={String(settings.defaultTaxPercent)} onChange={(e) => set("defaultTaxPercent", num(e.target.value))} />
            </Field>
            <Field label="Shipping charge (₹)" htmlFor="ship">
              <TextInput id="ship" type="number" min={0} value={String(settings.shippingCharge)} onChange={(e) => set("shippingCharge", num(e.target.value))} />
            </Field>
            <Field label="Free shipping over (₹)" htmlFor="freeShip">
              <TextInput id="freeShip" type="number" min={0} value={String(settings.freeShippingThreshold)} onChange={(e) => set("freeShippingThreshold", num(e.target.value))} />
            </Field>
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <Toggle
              label="Cash on Delivery"
              description="Allow customers to pay in cash on delivery."
              checked={settings.codEnabled}
              onChange={(checked) => set("codEnabled", checked)}
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Razorpay (online payment)</span>
                <span className="text-xs text-muted-foreground">
                  {razorpayConfigured
                    ? "Active — configured via environment keys."
                    : "Inactive — add Razorpay keys to your environment to enable."}
                </span>
              </div>
              <Toggle checked={razorpayConfigured} onChange={() => {}} disabled />
            </div>
          </div>
        </SettingsCard>

        {/* Social media */}
        <SettingsCard icon={<Share2 className="size-5" aria-hidden="true" />} title="Social Media">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram" htmlFor="ig" optional>
              <TextInput id="ig" value={settings.social.instagram} onChange={(e) => setSocial({ instagram: e.target.value })} />
            </Field>
            <Field label="Facebook" htmlFor="fb" optional>
              <TextInput id="fb" value={settings.social.facebook} onChange={(e) => setSocial({ facebook: e.target.value })} />
            </Field>
            <Field label="WhatsApp" htmlFor="wa" optional>
              <TextInput id="wa" value={settings.social.whatsapp} onChange={(e) => setSocial({ whatsapp: e.target.value })} />
            </Field>
            <Field label="YouTube" htmlFor="yt" optional>
              <TextInput id="yt" value={settings.social.youtube} onChange={(e) => setSocial({ youtube: e.target.value })} />
            </Field>
          </div>
        </SettingsCard>

        {/* SEO */}
        <SettingsCard icon={<Search className="size-5" aria-hidden="true" />} title="SEO Settings">
          <Field label="Meta title" htmlFor="metaTitle">
            <TextInput id="metaTitle" value={settings.seo.metaTitle} onChange={(e) => setSeo({ metaTitle: e.target.value })} />
          </Field>
          <Field label="Meta description" htmlFor="metaDesc">
            <Textarea id="metaDesc" value={settings.seo.metaDescription} onChange={(e) => setSeo({ metaDescription: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="OG image URL" htmlFor="ogImage" optional>
              <TextInput id="ogImage" value={settings.seo.ogImage} onChange={(e) => setSeo({ ogImage: e.target.value })} />
            </Field>
            <Field label="Canonical URL" htmlFor="canonical">
              <TextInput id="canonical" value={settings.seo.canonicalUrl} onChange={(e) => setSeo({ canonicalUrl: e.target.value })} />
            </Field>
          </div>
          <Field label="Robots" htmlFor="robots">
            <Select id="robots" value={settings.seo.robots} onChange={(e) => setSeo({ robots: e.target.value })}>
              <option value="index, follow">index, follow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </Select>
          </Field>
        </SettingsCard>

        {/* Email */}
        <SettingsCard
          icon={<Mail className="size-5" aria-hidden="true" />}
          title="Email Settings"
          description="Transactional email is sent through the app's provider abstraction."
        >
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Provider</span>
              <span className="text-xs text-muted-foreground capitalize">{emailProvider}</span>
            </div>
            <span
              className={
                emailConfigured
                  ? "rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] px-3 py-1 text-xs font-medium text-accent-foreground"
                  : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              {emailConfigured ? "Configured" : "Not configured"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {emailConfigured
              ? "Order and shipment emails are delivered through your configured provider."
              : "Emails are logged server-side until a provider is configured. Implement an EmailProvider in lib/email to go live — no code changes at the call sites."}
          </p>
        </SettingsCard>
      </div>

      {/* Security */}
      <SettingsCard icon={<ShieldCheck className="size-5" aria-hidden="true" />} title="Security">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Field label="Admin email" htmlFor="adminEmail">
              <TextInput id="adminEmail" value={adminEmail} readOnly className="cursor-not-allowed opacity-80" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" htmlFor="newPw">
                <TextInput id="newPw" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </Field>
              <Field label="Confirm password" htmlFor="confirmPw">
                <TextInput id="confirmPw" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </Field>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={onChangePassword}
                disabled={isChangingPw || newPassword.length < 8}
                className="rounded-full"
              >
                {isChangingPw ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : "Update password"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Toggle
              label="Two-factor authentication"
              description="Add a second step at sign-in. Coming soon."
              checked={false}
              onChange={() => {}}
              disabled
            />
            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Session</span>
                <span className="text-xs text-muted-foreground">Sign out of the admin panel on this device.</span>
              </div>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="rounded-full">
                  Log out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
