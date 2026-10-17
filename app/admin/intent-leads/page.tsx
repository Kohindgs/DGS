import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import {
  listIntentLeadSignals,
  listIntentDiscoveryRuns,
  getGoogleSearchBuyerIntentRadar,
  getOrCreateIngestToken,
  LINKEDIN_FEED_PRESET_SEARCHES,
} from "@/lib/intent-leads/engine";
import IntentLeadsClientView from "@/components/admin/intent-leads/IntentLeadsClientView";

export const dynamic = "force-dynamic";

export default async function AdminIntentLeadsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const ready = isCmsDatabaseConfigured();
  const [signals, runs, googleBuyerQueries, ingestToken] = ready
    ? await Promise.all([
        listIntentLeadSignals({ limit: 150 }),
        listIntentDiscoveryRuns(15),
        getGoogleSearchBuyerIntentRadar(),
        getOrCreateIngestToken(),
      ])
    : [[], [], [], "dgs_li_unconfigured"];

  return (
    <IntentLeadsClientView
      initialSignals={signals}
      initialRuns={runs}
      initialGoogleBuyerQueries={googleBuyerQueries}
      ingestToken={ingestToken}
      presetSearches={LINKEDIN_FEED_PRESET_SEARCHES}
    />
  );
}
