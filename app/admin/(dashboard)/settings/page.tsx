import type { Metadata } from "next";

import { SettingsView } from "@/components/admin/settings/SettingsView";
import { getEmailProvider, isEmailConfigured } from "@/lib/email/service";
import { requireAdmin } from "@/lib/auth/admin-session";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { settingsService } from "@/services/admin-settings-service";

export const metadata: Metadata = {
  title: "Settings — Akram Perfumes Admin",
};

export default async function AdminSettingsPage() {
  const [admin, settings] = await Promise.all([
    requireAdmin(),
    settingsService.getStoreSettings(),
  ]);

  return (
    <SettingsView
      settings={settings}
      adminEmail={admin.email}
      razorpayConfigured={isRazorpayConfigured()}
      emailProvider={getEmailProvider().name}
      emailConfigured={isEmailConfigured()}
    />
  );
}
