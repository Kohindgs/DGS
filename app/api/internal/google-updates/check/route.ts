import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { checkAndRecordGoogleUpdates } from "@/lib/google-updates/monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request, hasAdmin: boolean): boolean {
  if (hasAdmin) return true;

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const validTokens = [
      process.env.DGS_CRON_SECRET,
      process.env.DGS_INTERNAL_API_SECRET,
      process.env.DGS_ADMIN_SESSION_SECRET,
    ].filter(Boolean) as string[];

    if (validTokens.length > 0 && validTokens.includes(token)) {
      return true;
    }
  }

  // Also check x-cron-secret header
  const cronHeader = request.headers.get("x-cron-secret");
  if (cronHeader) {
    const validTokens = [
      process.env.DGS_CRON_SECRET,
      process.env.DGS_INTERNAL_API_SECRET,
      process.env.DGS_ADMIN_SESSION_SECRET,
    ].filter(Boolean) as string[];

    if (validTokens.length > 0 && validTokens.includes(cronHeader.trim())) {
      return true;
    }
  }

  return false;
}

export async function POST(request: Request) {
  const hasAdmin = await hasAdminSession();
  if (!isAuthorized(request, hasAdmin)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const runType = hasAdmin ? "manual" : "cron";
    const result = await checkAndRecordGoogleUpdates({ runType });

    return NextResponse.json({
      ok: true,
      message: `Google updates check completed (${result.runId}). Detected: ${result.detectedCount}, New: ${result.newCount}, Updated: ${result.updatedCount}, Active Rollouts: ${result.activeRolloutsCount}`,
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

export async function GET(request: Request) {
  return POST(request);
}
