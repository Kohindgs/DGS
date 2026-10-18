import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import {
  INTENT_LEADS_ACCESS_PIN,
  listIntentLeadSignals,
  listIntentDiscoveryRuns,
  getGoogleSearchBuyerIntentRadar,
  getOrCreateIngestToken,
  getLinkedInSessionStatus,
  saveLinkedInSessionCookie,
  runIntentLeadDiscovery,
  updateIntentSignalStatus,
  ingestLinkedInFeedPosts,
  LINKEDIN_FEED_PRESET_SEARCHES,
  type IntentServiceCategory,
} from "@/lib/intent-leads/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

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
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  if (!pinValid) {
    return NextResponse.json(
      { ok: false, locked: true, message: "Passcode required to unlock Private Buyer-Intent Vault" },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "ALL";
  const platform = searchParams.get("platform") || "ALL";
  const serviceCategory = searchParams.get("serviceCategory") || "ALL";
  const freshness = searchParams.get("freshness") || "ALL";

  const [signals, runs, googleBuyerQueries, ingestToken, linkedinSession] = await Promise.all([
    listIntentLeadSignals({ status, platform, serviceCategory, freshness, limit: 150 }),
    listIntentDiscoveryRuns(15),
    getGoogleSearchBuyerIntentRadar(),
    getOrCreateIngestToken(),
    getLinkedInSessionStatus(),
  ]);

  return NextResponse.json(
    {
      ok: true,
      signals,
      runs,
      googleBuyerQueries,
      ingestToken,
      linkedinSession,
      presetSearches: LINKEDIN_FEED_PRESET_SEARCHES,
    },
    { headers: NO_STORE_HEADERS }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "discover");
    const pinValid = verifyPinHeaderOrParam(request, body.pin);
    const adminValid = await hasAdminSession().catch(() => false);

    if (!adminValid && !pinValid) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (action === "unlock") {
      if (!pinValid) {
        return NextResponse.json(
          { ok: false, locked: true, message: "Invalid passcode. Please enter your 6-digit private vault passcode." },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }

      const [signals, runs, googleBuyerQueries, ingestToken, linkedinSession] = await Promise.all([
        listIntentLeadSignals({ limit: 150 }),
        listIntentDiscoveryRuns(15),
        getGoogleSearchBuyerIntentRadar(),
        getOrCreateIngestToken(),
        getLinkedInSessionStatus(),
      ]);

      return NextResponse.json(
        {
          ok: true,
          unlocked: true,
          signals,
          runs,
          googleBuyerQueries,
          ingestToken,
          linkedinSession,
          presetSearches: LINKEDIN_FEED_PRESET_SEARCHES,
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    if (!pinValid) {
      return NextResponse.json(
        { ok: false, locked: true, message: "Vault is locked. Enter your 6-digit passcode to continue." },
        { status: 403, headers: NO_STORE_HEADERS }
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
      const [signals, runs, linkedinSession] = await Promise.all([
        listIntentLeadSignals({ limit: 150 }),
        listIntentDiscoveryRuns(15),
        getLinkedInSessionStatus(),
      ]);
      return NextResponse.json(
        {
          ok: result.status !== "FAILED",
          result,
          signals,
          runs,
          linkedinSession,
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    if (action === "save-linkedin-session") {
      const cookie = String(body.liAtCookie || "").trim();
      const linkedinSession = await saveLinkedInSessionCookie(cookie);
      let discoveryResult = null;
      if (linkedinSession.connected) {
        discoveryResult = await runIntentLeadDiscovery({
          runType: "MANUAL",
          sendEmailDigest: true,
        });
      }
      const [signals, runs] = await Promise.all([
        listIntentLeadSignals({ limit: 150 }),
        listIntentDiscoveryRuns(15),
      ]);
      return NextResponse.json(
        {
          ok: true,
          linkedinSession,
          result: discoveryResult,
          signals,
          runs,
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    if (action === "update-status") {
      const id = String(body.id || "");
      const status = body.status as "NEW" | "CONTACTED" | "ARCHIVED" | "DISMISSED";
      if (!id || !status) {
        return NextResponse.json({ ok: false, message: "Missing id or status" }, { status: 400, headers: NO_STORE_HEADERS });
      }
      await updateIntentSignalStatus(id, status);
      return NextResponse.json({ ok: true, id, status }, { headers: NO_STORE_HEADERS });
    }

    if (action === "manual-paste-ingest") {
      const posts = Array.isArray(body.posts) ? body.posts : [];
      const res = await ingestLinkedInFeedPosts(posts, true);
      const [signals, runs] = await Promise.all([
        listIntentLeadSignals({ limit: 150 }),
        listIntentDiscoveryRuns(15),
      ]);
      return NextResponse.json({ ok: true, result: res, signals, runs }, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json({ ok: false, message: `Unknown action: ${action}` }, { status: 400, headers: NO_STORE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: String(err?.message || "Failed to process intent lead request") },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
