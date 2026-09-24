import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { isPageSpeedConfigured } from "@/lib/seo/pagespeed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const auditRunId = searchParams.get("auditRunId");

  const cfg = isPageSpeedConfigured();

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({
      configured: cfg.configured,
      keySource: cfg.keySource,
      totalJobs: 0,
      completedJobs: 0,
      queuedJobs: 0,
      runningJobs: 0,
      failedJobs: 0,
    });
  }

  try {
    const whereSql = auditRunId ? `WHERE audit_run_id = ?` : ``;
    const params = auditRunId ? [auditRunId] : [];

    const { rows } = await cmsQuery<any>(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN status = 'QUEUED' THEN 1 ELSE 0 END) as queued,
         SUM(CASE WHEN status = 'RUNNING' THEN 1 ELSE 0 END) as running,
         SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
       FROM pagespeed_jobs ${whereSql}`,
      params
    );

    const r = rows[0] || {};
    return NextResponse.json({
      configured: cfg.configured,
      keySource: cfg.keySource,
      totalJobs: Number(r.total || 0),
      completedJobs: Number(r.completed || 0),
      queuedJobs: Number(r.queued || 0),
      runningJobs: Number(r.running || 0),
      failedJobs: Number(r.failed || 0),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to query PageSpeed status" }, { status: 500 });
  }
}
