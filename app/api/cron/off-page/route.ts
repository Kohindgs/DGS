import { NextResponse } from "next/server";
import { runDailyOffPageAutomation } from "@/lib/off-page/automation";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";

export const dynamic = "force-dynamic";

/**
 * Scheduled Cron Endpoint for Daily Off-Page Automation.
 * Protected by DGS_CRON_SECRET bearer token or query parameter.
 */
export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}

async function handleCron(req: Request) {
  const cronSecret = process.env.DGS_CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Cron secret not configured on server" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get("secret");

  const providedSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : querySecret;

  if (!providedSecret || providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing cron secret" }, { status: 401 });
  }

  await ensureOffPageTablesExist();

  try {
    const result = await runDailyOffPageAutomation("SCHEDULED_CRON");
    return NextResponse.json({
      ok: result.status === "SUCCESS",
      ...result,
    });
  } catch (err: any) {
    console.error("Cron execution error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
