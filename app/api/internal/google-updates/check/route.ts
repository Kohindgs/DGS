import { NextResponse } from "next/server";
import { checkAndRecordGoogleUpdates } from "@/lib/google-updates/monitor";
import { recordCronRun } from "@/lib/cms/cron-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const startedAt = new Date();
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
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const isHardFailure = result.status === "FAILED";
    const httpStatus = isHardFailure ? 500 : 200;

    await recordCronRun({
      jobName: "google-search-update-monitor",
      endpoint: "/api/internal/google-updates/check",
      triggerSource: "github_actions",
      startedAt,
      completedAt,
      durationMs,
      status: result.status,
      httpStatus,
      recordsChecked: 3,
      recordsProcessed: result.detectedCount,
      recordsFailed: result.errors.length,
      errorSummary: result.errors.length > 0 ? result.errors.join(" | ") : null,
      metadata: {
        runId: result.runId,
        partialFailure: result.partialFailure,
        sources: result.sources,
        sourceHealth: result.sourceHealth,
        activeRolloutsCount: result.activeRolloutsCount,
        notifiedCount: result.notifiedCount,
      },
    });

    if (isHardFailure) {
      return NextResponse.json(
        {
          ok: false,
          status: result.status,
          partialFailure: false,
          updatesFound: 0,
          sources: result.sources,
          durationMs,
          message: `Google updates check failed across all sources: ${result.errors.join("; ")}`,
          result,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: result.status,
      partialFailure: result.partialFailure,
      updatesFound: result.detectedCount,
      newUpdates: result.newCount,
      updatedItems: result.updatedCount,
      activeRolloutsCount: result.activeRolloutsCount,
      sources: result.sources,
      durationMs,
      message: `Google updates automated check completed (${result.runId}). Status: ${result.status}, Detected: ${result.detectedCount}, New: ${result.newCount}, Updated: ${result.updatedCount}, Active Rollouts: ${result.activeRolloutsCount}`,
      result,
    });
  } catch (err: any) {
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const errorMessage = String(err?.message || "Failed to check Google updates");
    const errorCode = err?.code ? String(err.code) : null;

    await recordCronRun({
      jobName: "google-search-update-monitor",
      endpoint: "/api/internal/google-updates/check",
      triggerSource: "github_actions",
      startedAt,
      completedAt,
      durationMs,
      status: "FAILED",
      httpStatus: 500,
      errorCode,
      errorSummary: errorMessage,
    });

    console.error(
      JSON.stringify({
        event: "CRON_ENDPOINT_ERROR",
        jobName: "google-search-update-monitor",
        endpoint: "/api/internal/google-updates/check",
        errorCode,
        errorMessage,
        durationMs,
        timestamp: completedAt.toISOString(),
      }),
    );

    return NextResponse.json(
      { ok: false, message: errorMessage, errorCode, durationMs },
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
