import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { runFullWebsiteAudit } from "@/lib/audit/audit-runner";

export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "audits", "run")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const report = await runFullWebsiteAudit("manual");
    return NextResponse.json({ ok: true, report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Audit run failed" }, { status: 500 });
  }
}
