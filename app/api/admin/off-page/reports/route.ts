import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { generateMonthlyOffPageReport } from "@/lib/off-page/reports";
import type { OffPageMonthlyReport } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  if (month) {
    let { rows } = await cmsQuery<OffPageMonthlyReport>(
      `SELECT * FROM off_page_monthly_reports WHERE report_month = ? LIMIT 1`,
      [month]
    );

    if (rows.length === 0) {
      const generated = await generateMonthlyOffPageReport(month);
      return NextResponse.json({ ok: true, report: generated });
    }

    return NextResponse.json({ ok: true, report: rows[0] });
  }

  // Otherwise list all reports, generate current if none exist
  let { rows: allReports } = await cmsQuery<OffPageMonthlyReport>(
    `SELECT id, report_month, report_title, report_type, summary_metrics, created_at 
     FROM off_page_monthly_reports 
     ORDER BY report_month DESC`
  );

  if (allReports.length === 0) {
    const defaultRep = await generateMonthlyOffPageReport("2026-09");
    allReports = [defaultRep];
  }

  return NextResponse.json({ ok: true, reports: allReports });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { month } = await req.json();
    const report = await generateMonthlyOffPageReport(month);

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "create",
      resource: "off_page_report",
      resource_id: report.id,
      summary: `Generated monthly off-page report for ${month || "previous month"}`,
      status: "success",
    });

    return NextResponse.json({ ok: true, report });
  } catch (err: any) {
    console.error("Failed generating report:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
