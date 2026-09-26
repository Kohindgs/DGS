import { NextResponse } from "next/server";
import { checkAndRecordGoogleUpdates } from "@/lib/google-updates/monitor";

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

  // Strict dedicated cron authentication only. No admin sessions or fallback tokens.
  if (!token || token !== cronSecret.trim()) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Invalid or missing DGS_CRON_SECRET bearer token." },
      { status: 401 },
    );
  }

  try {
    const result = await checkAndRecordGoogleUpdates({ runType: "cron" });

    return NextResponse.json({
      ok: true,
      message: `Google updates automated check completed (${result.runId}). Detected: ${result.detectedCount}, New: ${result.newCount}, Updated: ${result.updatedCount}, Active Rollouts: ${result.activeRolloutsCount}`,
      result,
    });
  } catch (err: any) {
    console.error("Automated google-updates check failed:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to check Google updates" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Method Not Allowed. Use POST." },
    {
      status: 405,
      headers: { Allow: "POST" },
    },
  );
}
