import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { LINKEDIN_FEED_PRESET_SEARCHES } from "@/lib/intent-leads/engine";
import IntentLeadsClientView from "@/components/admin/intent-leads/IntentLeadsClientView";

export const dynamic = "force-dynamic";

export default async function AdminIntentLeadsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  // Vault starts locked; data is fetched only after the user enters PIN 0215
  return (
    <IntentLeadsClientView
      presetSearches={LINKEDIN_FEED_PRESET_SEARCHES}
    />
  );
}
