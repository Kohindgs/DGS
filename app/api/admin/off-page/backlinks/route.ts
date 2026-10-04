import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { calculateLinkDecayMetrics, seedBacklinksIfEmpty } from "@/lib/off-page/backlinks";
import { classifyAnchorText } from "@/lib/off-page/scoring";
import type { OffPageBacklink } from "@/lib/off-page/types";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();
  await seedBacklinksIfEmpty();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const region = searchParams.get("region");
  const anchorClass = searchParams.get("anchor");
  const query = searchParams.get("q")?.toLowerCase();

  const conditions: string[] = [];
  const params: any[] = [];

  if (status && status !== "ALL") {
    conditions.push("status = ?");
    params.push(status);
  }
  if (region && region !== "ALL") {
    conditions.push("source_region = ?");
    params.push(region);
  }
  if (anchorClass && anchorClass !== "ALL") {
    conditions.push("anchor_classification = ?");
    params.push(anchorClass);
  }
  if (query) {
    conditions.push("(LOWER(source_domain) LIKE ? OR LOWER(source_url) LIKE ? OR LOWER(anchor_text) LIKE ?)");
    const qStr = `%${query}%`;
    params.push(qStr, qStr, qStr);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM off_page_backlinks ${whereClause} ORDER BY authority_score DESC, created_at DESC LIMIT 200`;

  try {
    const { rows } = await cmsQuery<OffPageBacklink>(sql, params);
    const decay = await calculateLinkDecayMetrics();
    return NextResponse.json({ ok: true, backlinks: rows, total: rows.length, decay });
  } catch (err: any) {
    console.error("Failed fetching backlinks:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const sourceDomain = new URL(body.source_url).hostname;
    const anchorClass = classifyAnchorText(body.anchor_text, body.target_url);

    const id = `lnk_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await cmsExecute(
      `INSERT INTO off_page_backlinks (
        id, source_domain, source_url, source_page_title, target_url, target_page_type,
        anchor_text, anchor_classification, link_rel, dofollow, nofollow, first_seen_at,
        last_seen_at, last_checked_at, status, http_status, source_country, source_region,
        source_language, topical_category, authority_score, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), 'LIVE', 200, ?, ?, 'en', ?, ?, ?, NOW(), NOW())`,
      [
        id,
        sourceDomain,
        body.source_url,
        body.source_page_title || null,
        body.target_url,
        body.target_page_type || "SERVICE_PAGE",
        body.anchor_text,
        anchorClass,
        body.link_rel || "dofollow",
        body.link_rel !== "nofollow" ? 1 : 0,
        body.link_rel === "nofollow" ? 1 : 0,
        body.source_country || "India",
        body.source_region || "INDIA",
        body.topical_category || "Agency Directory",
        body.authority_score || 85,
        body.notes || null,
      ]
    );

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "create",
      resource: "off_page_backlink",
      resource_id: id,
      summary: `Added live backlink from ${sourceDomain}`,
      status: "success",
    });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error("Failed adding backlink:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, status, notes } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await cmsExecute(
      `UPDATE off_page_backlinks SET status = IFNULL(?, status), notes = IFNULL(?, notes), updated_at = NOW() WHERE id = ?`,
      [status, notes, id]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed updating backlink:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
