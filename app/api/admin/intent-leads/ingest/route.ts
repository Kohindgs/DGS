import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import {
  getOrCreateIngestToken,
  ingestLinkedInFeedPosts,
} from "@/lib/intent-leads/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-DGS-Ingest-Token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const headerToken =
      request.headers.get("x-dgs-ingest-token") ||
      (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const suppliedToken = String(headerToken || body.token || "").trim();

    const expectedToken = await getOrCreateIngestToken();
    const isAdmin = await hasAdminSession().catch(() => false);

    if (!isAdmin && (!suppliedToken || suppliedToken !== expectedToken)) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized LinkedIn Companion ingest token" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const posts = Array.isArray(body.posts) ? body.posts : [];
    if (posts.length === 0) {
      return NextResponse.json(
        { ok: false, message: "No LinkedIn posts supplied in payload" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const result = await ingestLinkedInFeedPosts(posts, Boolean(body.sendEmailDigest));

    return NextResponse.json(
      {
        ok: true,
        message: `Scanned ${result.received} LinkedIn posts: ${result.qualifiedAdded} new buyer-intent leads qualified & saved (${result.skippedNoise} non-buyer/job-seeker posts filtered, ${result.duplicates} already in CRM).`,
        result,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: String(err?.message || "Failed to ingest LinkedIn feed posts") },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
