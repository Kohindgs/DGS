import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import {
  revalidateOpportunityUrls,
  runOpportunityDiscoverySuite,
  getDiscoveryRunHistory,
} from "@/lib/off-page/discovery";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const runs = await getDiscoveryRunHistory(25);
    return NextResponse.json({ ok: true, runs });
  } catch (err: any) {
    console.error("Failed fetching discovery run history:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const providerId = body.providerId;
    const queries = body.queries;
    const limit = body.limit || 8;

    const discovery = await runOpportunityDiscoverySuite({
      providerId,
      queries,
      limit,
    });
    const revalRes = await revalidateOpportunityUrls(25);

    return NextResponse.json({
      ok: true,
      discovery,
      provider: discovery.provider,
      providerStatus: discovery.provider_status,
      queriesQueued: discovery.queries_queued,
      queriesCompleted: discovery.queries_completed,
      resultsReturned: discovery.results_returned,
      urlsValidated: discovery.urls_validated,
      duplicatesRejected: discovery.duplicates_rejected,
      paidDisallowedRejected: discovery.paid_disallowed_rejected,
      spamRejected: discovery.spam_rejected,
      newOpportunitiesAdded: discovery.new_records_added,
      insertedCount: discovery.new_records_added,
      errors: discovery.errors,
      message: discovery.message,
      revalidation: revalRes,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Discovery run error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
