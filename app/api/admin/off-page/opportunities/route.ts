import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { ingestDiscoveredOpportunity, seedOpportunitiesIfEmpty } from "@/lib/off-page/discovery";
import type { OffPageOpportunity } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();
  await seedOpportunitiesIfEmpty();

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");
  const status = searchParams.get("status");
  const freeStatus = searchParams.get("free_status");
  const query = searchParams.get("q")?.toLowerCase();

  const conditions: string[] = [];
  const params: any[] = [];

  if (region && region !== "ALL") {
    conditions.push("region = ?");
    params.push(region);
  }
  if (category && category !== "ALL") {
    conditions.push("category = ?");
    params.push(category);
  }
  if (priority && priority !== "ALL") {
    conditions.push("priority_tier = ?");
    params.push(priority);
  }
  if (status && status !== "ALL") {
    conditions.push("status = ?");
    params.push(status);
  }
  if (freeStatus && freeStatus !== "ALL") {
    conditions.push("free_status = ?");
    params.push(freeStatus);
  }
  if (query) {
    conditions.push("(LOWER(site_name) LIKE ? OR LOWER(domain) LIKE ? OR LOWER(recommended_service) LIKE ?)");
    const qStr = `%${query}%`;
    params.push(qStr, qStr, qStr);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM off_page_opportunities ${whereClause} ORDER BY priority_score DESC, authority_score DESC LIMIT 300`;

  try {
    const { rows } = await cmsQuery<OffPageOpportunity>(sql, params);
    return NextResponse.json({ ok: true, data: rows, opportunities: rows, total: rows.length });
  } catch (err: any) {
    console.error("Failed querying opportunities:", err);
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
    const result = await ingestDiscoveredOpportunity(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "create",
      resource: "off_page_opportunity",
      resource_id: result.id,
      summary: `Created opportunity ${body.site_name} (${body.domain})`,
      status: "success",
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err: any) {
    console.error("Failed creating opportunity:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, status, assigned_to, notes, priority_tier, free_status } = await req.json();
    if (!id) return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });

    const updates: string[] = ["updated_at = NOW()"];
    const values: any[] = [];

    if (status) {
      updates.push("status = ?");
      values.push(status);
    }
    if (assigned_to !== undefined) {
      updates.push("assigned_to = ?");
      values.push(assigned_to);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      values.push(notes);
    }
    if (priority_tier) {
      updates.push("priority_tier = ?");
      values.push(priority_tier);
    }
    if (free_status) {
      updates.push("free_status = ?");
      values.push(free_status);
    }

    values.push(id);
    await cmsExecute(
      `UPDATE off_page_opportunities SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "edit",
      resource: "off_page_opportunity",
      resource_id: id,
      summary: `Updated opportunity ${id} to status=${status || "unchanged"}`,
      status: "success",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed updating opportunity:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "delete")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await cmsExecute(`DELETE FROM off_page_opportunities WHERE id = ?`, [id]);
  return NextResponse.json({ ok: true });
}
