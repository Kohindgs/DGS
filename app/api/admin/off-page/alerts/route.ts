import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import type { OffPageAlert } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();

  try {
    const { rows: alerts } = await cmsQuery<OffPageAlert>(
      `SELECT * FROM off_page_alerts ORDER BY created_at DESC LIMIT 50`
    );

    const { rows: runs } = await cmsQuery(
      `SELECT * FROM off_page_automation_runs ORDER BY started_at DESC LIMIT 20`
    );

    return NextResponse.json({ ok: true, alerts, automationRuns: runs });
  } catch (err: any) {
    console.error("Failed fetching alerts:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (id) {
      await cmsExecute(`UPDATE off_page_alerts SET is_read = 1 WHERE id = ?`, [id]);
    } else {
      await cmsExecute(`UPDATE off_page_alerts SET is_read = 1 WHERE is_read = 0`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed updating alerts:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
