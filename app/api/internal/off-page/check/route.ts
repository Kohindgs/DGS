import { NextResponse } from "next/server";
import { runDailyOffPageAutomation } from "@/lib/off-page/automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cronSecret = process.env.DGS_CRON_SECRET;

  if (!cronSecret || cronSecret.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "DGS_CRON_SECRET is not configured on server" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  // Strict dedicated cron authentication only.
  if (!token || token !== cronSecret.trim()) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Invalid or missing DGS_CRON_SECRET bearer token." },
      { status: 401 },
    );
  }

  try {
    const result = await runDailyOffPageAutomation("cron");

    return NextResponse.json({
      ok: true,
      message: `Off-page SEO automated check completed (${result.runId}). Status: ${result.status}`,
      result,
    });
  } catch (err: any) {
    console.error("Automated off-page check failed:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to execute off-page automation" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Method not allowed. Use POST with Bearer authentication." },
    { status: 405 },
  );
}
