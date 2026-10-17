import { NextResponse } from "next/server";
import { runDailyOffPageAutomation } from "@/lib/off-page/automation";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { recordCronRun } from "@/lib/cms/cron-logger";

export const dynamic = "force-dynamic";

/**
 * Legacy Cron Alias for Daily Off-Page Automation.
 * Strictly requires Authorization: Bearer <DGS_CRON_SECRET>.
 * Query string ?secret= has been removed to prevent secret exposure in access logs.
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Method Not Allowed. Use POST with Authorization: Bearer <DGS_CRON_SECRET>." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(req: Request) {
  const startedAt = new Date();
  const cronSecret = process.env.DGS_CRON_SECRET;
  if (!cronSecret || !cronSecret.trim()) {
    return NextResponse.json({ ok: false, error: "Cron secret not configured on server" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") || "";
  const providedSecret = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!providedSecret || providedSecret !== cronSecret.trim()) {
    return NextResponse.json({ ok: false, error: "Unauthorized: Invalid or missing cron secret" }, { status: 401 });
  }

  try {
    await ensureOffPageTablesExist();
    const result = await runDailyOffPageAutomation("SCHEDULED_CRON");
    const completedAt = new Date();
    const isFailed = result.status === "FAILED";

    await recordCronRun({
      jobName: "off-page-seo-daily-monitor",
      endpoint: "/api/cron/off-page",
      triggerSource: "legacy_cron_alias",
      startedAt,
      completedAt,
      status: isFailed ? "FAILED" : "SUCCESS",
      httpStatus: isFailed ? 500 : 200,
      recordsChecked: Number(result.summary?.recordsEvaluated || 0),
      recordsProcessed: Number(result.summary?.newOpportunitiesAdded || 0),
      recordsFailed: isFailed ? 1 : 0,
      errorSummary: isFailed ? String(result.error || "Off-page automation failed") : null,
      metadata: { runId: result.runId, summary: result.summary },
    });

    return NextResponse.json(
      {
        ok: result.status === "SUCCESS",
        ...result,
      },
      { status: isFailed ? 500 : 200 },
    );
  } catch (err: any) {
    const completedAt = new Date();
    await recordCronRun({
      jobName: "off-page-seo-daily-monitor",
      endpoint: "/api/cron/off-page",
      triggerSource: "legacy_cron_alias",
      startedAt,
      completedAt,
      status: "FAILED",
      httpStatus: 500,
      errorCode: err?.code ? String(err.code) : null,
      errorSummary: String(err?.message || "Internal server error"),
    });
    console.error("Cron execution error:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
