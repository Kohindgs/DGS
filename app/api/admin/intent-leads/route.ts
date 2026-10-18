import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import {
  INTENT_LEADS_ACCESS_PIN,
  listIntentLeadSignals,
  listIntentDiscoveryRuns,
  getGoogleSearchBuyerIntentRadar,
  getOrCreateIngestToken,
  runIntentLeadDiscovery,
  updateIntentSignalStatus,
  ingestLinkedInFeedPosts,
  LINKEDIN_FEED_PRESET_SEARCHES,
  type IntentServiceCategory,
} from "@/lib/intent-leads/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyPinHeaderOrParam(request: Request, bodyPin?: string): boolean {
  const headerPin = request.headers.get("x-dgs-intent-pin") || "";
  const { searchParams } = new URL(request.url);
  const queryPin = searchParams.get("pin") || "";
  const supplied = String(headerPin || queryPin || bodyPin || "").trim();
  return supplied === INTENT_LEADS_ACCESS_PIN;
}

export async function GET(request: Request) {
  const pinValid = verifyPinHeaderOrParam(request);
  const adminValid = await hasAdminSession().catch(() => false);

  if (!adminValid && !pinValid) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!pinValid) {
    return NextResponse.json(
      { ok: false, locked: true, message: "Passcode required to unlock Private Buyer-Intent Vault" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "ALL";
  const platform = searchParams.get("platform") || "ALL";
  const serviceCategory = searchParams.get("serviceCategory") || "ALL";
  const freshness = searchParams.get("freshness") || "ALL";

  const [signals, runs, googleBuyerQueries, ingestToken] = await Promise.all([
    listIntentLeadSignals({ status, platform, serviceCategory, freshness, limit: 150 }),
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
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "discover");
    const pinValid = verifyPinHeaderOrParam(request, body.pin);
    const adminValid = await hasAdminSession().catch(() => false);

    if (!adminValid && !pinValid) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    if (action === "unlock") {
      if (!pinValid) {
        return NextResponse.json(
          { ok: false, locked: true, message: "Invalid passcode. Please enter your 6-digit private vault passcode." },
          { status: 403 }
        );
      }

      const [signals, runs, googleBuyerQueries, ingestToken] = await Promise.all([
        listIntentLeadSignals({ limit: 150 }),
        listIntentDiscoveryRuns(15),
        getGoogleSearchBuyerIntentRadar(),
        getOrCreateIngestToken(),
      ]);

      return NextResponse.json({
        ok: true,
        unlocked: true,
        signals,
        runs,
        googleBuyerQueries,
        ingestToken,
        presetSearches: LINKEDIN_FEED_PRESET_SEARCHES,
      });
    }

    if (!pinValid) {
      return NextResponse.json(
        { ok: false, locked: true, message: "Vault is locked. Enter your 6-digit passcode to continue." },
        { status: 403 }
      );
    }

    if (action === "discover") {
      const serviceFilter =
        body.serviceCategory && body.serviceCategory !== "ALL"
          ? (body.serviceCategory as IntentServiceCategory)
          : undefined;
      const result = await runIntentLeadDiscovery({
        runType: "MANUAL",
        serviceFilter,
        sendEmailDigest: body.sendEmailDigest !== false,
      });
      return NextResponse.json({
        ok: result.status !== "FAILED",
        result,
      });
    }

    if (action === "update-status") {
      const id = String(body.id || "");
      const status = body.status as "NEW" | "CONTACTED" | "ARCHIVED" | "DISMISSED";
      if (!id || !status) {
        return NextResponse.json({ ok: false, message: "Missing id or status" }, { status: 400 });
      }
      await updateIntentSignalStatus(id, status);
      return NextResponse.json({ ok: true, id, status });
    }

    if (action === "manual-paste-ingest") {
      const posts = Array.isArray(body.posts) ? body.posts : [];
      const res = await ingestLinkedInFeedPosts(posts, true);
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
