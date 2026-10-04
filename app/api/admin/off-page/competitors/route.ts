import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedCompetitorsIfEmpty } from "@/lib/off-page/authority-engine";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();
  await seedCompetitorsIfEmpty();

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");

  const compSql = region && region !== "ALL"
    ? `SELECT * FROM off_page_competitor_domains WHERE region = ? ORDER BY estimated_referring_domains DESC`
    : `SELECT * FROM off_page_competitor_domains ORDER BY region, estimated_referring_domains DESC`;

  const gapSql = region && region !== "ALL"
    ? `SELECT * FROM off_page_competitor_gaps WHERE region = ? ORDER BY quality_score DESC LIMIT 100`
    : `SELECT * FROM off_page_competitor_gaps ORDER BY quality_score DESC LIMIT 100`;

  try {
    const { rows: competitors } = await cmsQuery(compSql, region && region !== "ALL" ? [region] : []);
    const { rows: gaps } = await cmsQuery(gapSql, region && region !== "ALL" ? [region] : []);

    return NextResponse.json({ ok: true, competitors, gaps });
  } catch (err: any) {
    console.error("Failed fetching competitors:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { competitor_name, domain, region, primary_niche, estimated_referring_domains } = await req.json();
    if (!competitor_name || !domain) {
      return NextResponse.json({ error: "Name and domain are required" }, { status: 400 });
    }

    const id = `cmp_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await cmsExecute(
      `INSERT INTO off_page_competitor_domains (id, competitor_name, domain, region, primary_niche, tracked_since, estimated_referring_domains, status, created_at)
       VALUES (?, ?, ?, ?, ?, NOW(), ?, 'ACTIVE', NOW())`,
      [id, competitor_name, domain.toLowerCase().trim(), region || "GLOBAL", primary_niche || "Digital Agency", estimated_referring_domains || 0]
    );

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "create",
      resource: "off_page_competitor",
      resource_id: id,
      summary: `Added competitor ${competitor_name} (${domain})`,
      status: "success",
    });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error("Failed creating competitor:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
