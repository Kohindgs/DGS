import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import { runDailyOffPageAutomation } from "@/lib/off-page/automation";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";

export const dynamic = "force-dynamic";

/**
 * GET: Fetches recent automation runs and active automation settings.
 */
export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();

  try {
    const { rows: runs } = await cmsQuery(
      `SELECT id, run_type, status, started_at, completed_at, summary, error_message
       FROM off_page_automation_runs
       ORDER BY started_at DESC
       LIMIT 20`
    );

    const { rows: settings } = await cmsQuery(
      `SELECT key_name, key_value FROM off_page_settings`
    );

    return NextResponse.json({
      ok: true,
      runs,
      settings,
    });
  } catch (err: any) {
    console.error("Failed fetching automation runs:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * POST: Manually executes the full off-page automation suite.
 */
export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();

  try {
    const body = await req.json().catch(() => ({}));
    const runType = body.runType || "MANUAL_CMS_TRIGGER";

    const result = await runDailyOffPageAutomation(runType);

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "OFF_PAGE_AUTOMATION_EXECUTE",
      resource: "off_page_automation_runs",
      resource_id: result.runId,
      summary: `Executed off-page automation (${runType}): ${result.status}`,
      after_state: result.summary,
      status: result.status === "SUCCESS" ? "success" : "failure",
    });

    return NextResponse.json({
      ok: result.status === "SUCCESS",
      ...result,
    });
  } catch (err: any) {
    console.error("Automation execution error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
