import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { exportReportToCsv, generateMonthlyOffPageReport } from "@/lib/off-page/reports";
import type { OffPageMonthlyReport } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "export")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || "2026-09";

  let { rows } = await cmsQuery<OffPageMonthlyReport>(
    `SELECT * FROM off_page_monthly_reports WHERE report_month = ? LIMIT 1`,
    [month]
  );

  let report = rows[0];
  if (!report) {
    report = await generateMonthlyOffPageReport(month);
  }

  const csv = exportReportToCsv(report);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dgs-offpage-report-${month}.csv"`,
    },
  });
}
