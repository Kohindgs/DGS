import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import {
  LINKEDIN_FEED_PRESET_SEARCHES,
  listIntentLeadSignals,
  listIntentDiscoveryRuns,
  getGoogleSearchBuyerIntentRadar,
  getOrCreateIngestToken,
} from "@/lib/intent-leads/engine";
import IntentLeadsClientView from "@/components/admin/intent-leads/IntentLeadsClientView";

export const dynamic = "force-dynamic";

export default async function AdminIntentLeadsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const [initialSignals, initialRuns, initialGoogleQueries, initialIngestToken] =
    await Promise.all([
      listIntentLeadSignals({ limit: 150 }).catch(() => []),
      listIntentDiscoveryRuns(15).catch(() => []),
      getGoogleSearchBuyerIntentRadar().catch(() => []),
      getOrCreateIngestToken().catch(() => ""),
    ]);

  return (
    <IntentLeadsClientView
      presetSearches={LINKEDIN_FEED_PRESET_SEARCHES}
      initialSignals={initialSignals}
      initialRuns={initialRuns}
      initialGoogleQueries={initialGoogleQueries}
      initialIngestToken={initialIngestToken}
    />
  );
}
