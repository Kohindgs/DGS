import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import {
  listIntentLeadSignals,
  listIntentDiscoveryRuns,
  getGoogleSearchBuyerIntentRadar,
  getOrCreateIngestToken,
  runIntentLeadDiscovery,
  updateIntentSignalStatus,
  convertSignalToCrmLead,
  ingestLinkedInFeedPosts,
  LINKEDIN_FEED_PRESET_SEARCHES,
  type IntentServiceCategory,
} from "@/lib/intent-leads/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "ALL";
  const platform = searchParams.get("platform") || "ALL";
  const serviceCategory = searchParams.get("serviceCategory") || "ALL";

  const [signals, runs, googleBuyerQueries, ingestToken] = await Promise.all([
    listIntentLeadSignals({ status, platform, serviceCategory, limit: 150 }),
    listIntentDiscoveryRuns(15),
    getGoogleSearchBuyerIntentRadar(),
    getOrCreateIngestToken(),
  ]);

  return NextResponse.json({
    ok: true,
    signals,
    runs,
    googleBuyerQueries,
    ingestToken,
    presetSearches: LINKEDIN_FEED_PRESET_SEARCHES,
  });
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "discover");

    if (action === "discover") {
      const serviceFilter =
        body.serviceCategory && body.serviceCategory !== "ALL"
          ? (body.serviceCategory as IntentServiceCategory)
          : undefined;
      const result = await runIntentLeadDiscovery({
        runType: "MANUAL",
        serviceFilter,
        sendEmailDigest: Boolean(body.sendEmailDigest),
      });
      return NextResponse.json({
        ok: result.status !== "FAILED",
        result,
      });
    }

    if (action === "update-status") {
      const id = String(body.id || "");
      const status = body.status as "NEW" | "CONTACTED" | "CONVERTED_TO_LEAD" | "DISMISSED";
      if (!id || !status) {
        return NextResponse.json({ ok: false, message: "Missing id or status" }, { status: 400 });
      }
      await updateIntentSignalStatus(id, status);
      return NextResponse.json({ ok: true, id, status });
    }

    if (action === "convert-to-crm") {
      const id = String(body.id || "");
      if (!id) {
        return NextResponse.json({ ok: false, message: "Missing signal id" }, { status: 400 });
      }
      const { crmLeadId } = await convertSignalToCrmLead(id);
      return NextResponse.json({ ok: true, id, crmLeadId });
    }

    if (action === "manual-paste-ingest") {
      const posts = Array.isArray(body.posts) ? body.posts : [];
      const res = await ingestLinkedInFeedPosts(posts, Boolean(body.sendEmailDigest));
      return NextResponse.json({ ok: true, result: res });
    }

    return NextResponse.json({ ok: false, message: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: String(err?.message || "Failed to process intent lead request") },
      { status: 500 }
    );
  }
}
