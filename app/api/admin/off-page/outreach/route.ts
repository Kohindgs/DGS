import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import {
  createOutreachFromOpportunity,
  seedOutreachIfEmpty,
  updateOutreachStage,
} from "@/lib/off-page/outreach";
import type { OffPageOutreach } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();
  await seedOutreachIfEmpty();

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");

  const sql = stage && stage !== "ALL"
    ? `SELECT * FROM off_page_outreach WHERE stage = ? ORDER BY updated_at DESC LIMIT 150`
    : `SELECT * FROM off_page_outreach ORDER BY updated_at DESC LIMIT 150`;

  try {
    const { rows } = await cmsQuery<OffPageOutreach>(sql, stage && stage !== "ALL" ? [stage] : []);
    return NextResponse.json({ ok: true, outreach: rows, total: rows.length });
  } catch (err: any) {
    console.error("Failed fetching outreach CRM:", err);
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
    const result = await createOutreachFromOpportunity({
      opportunityId: body.opportunity_id,
      assignedStaff: body.assigned_staff || currentUser.email,
      contactName: body.contact_name,
      email: body.email,
      linkedin: body.linkedin,
      pitchType: body.pitch_type,
    });

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "create",
      resource: "off_page_outreach",
      resource_id: result.id,
      summary: `Created outreach CRM task for opportunity ${body.opportunity_id}`,
      status: "success",
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err: any) {
    console.error("Failed creating outreach:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, stage, notes, live_url } = await req.json();
    if (!id || !stage) return NextResponse.json({ error: "ID and stage required" }, { status: 400 });

    await updateOutreachStage(id, stage, notes, live_url);

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "edit",
      resource: "off_page_outreach",
      resource_id: id,
      summary: `Advanced outreach ${id} to stage=${stage}`,
      status: "success",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed updating outreach stage:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
