import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import {
  createOutreachFromOpportunity,
  updateOutreachDraft,
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

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");

  const sql = stage && stage !== "ALL"
    ? `SELECT * FROM off_page_outreach WHERE stage = ? ORDER BY updated_at DESC LIMIT 200`
    : `SELECT * FROM off_page_outreach ORDER BY updated_at DESC LIMIT 200`;

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
      assignedStaff: body.assigned_staff || "Kohin Bellara - CEO D'Genius Solutions",
      contactName: body.contact_name,
      email: body.email,
      linkedin: body.linkedin,
      pitchType: body.pitch_type,
      pitchSubject: body.pitch_subject,
      pitchBody: body.pitch_body,
      stage: body.stage || "DRAFT",
      sourceModule: body.source_module || "OPPORTUNITIES",
      sourceRecordId: body.source_record_id || body.opportunity_id,
      targetDomain: body.target_domain,
      targetUrl: body.target_url || body.submission_url,
      targetPage: body.target_page || body.recommended_dgs_target_page,
      publication: body.publication,
      createdBy: currentUser.email,
      notes: body.notes,
    });

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "create",
      resource: "off_page_outreach",
      resource_id: result.id,
      summary: `Created outreach draft for ${body.publication || body.target_domain || "opportunity"}`,
      status: "success",
    });

    return NextResponse.json({ ok: true, id: result.id, stage: body.stage || "DRAFT" });
  } catch (err: any) {
    console.error("Failed creating outreach draft:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, stage, notes, live_url } = body;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // Update draft content fields if supplied
    await updateOutreachDraft({
      id,
      pitchSubject: body.pitch_subject,
      pitchBody: body.pitch_body,
      contactName: body.contact_name,
      email: body.email,
      linkedin: body.linkedin,
      targetPage: body.target_page,
      assignedStaff: body.assigned_staff,
      notes: body.notes,
      stage: stage,
    });

    // Advance stage and handle stage-specific transitions (e.g. creating backlinks for LIVE)
    if (stage) {
      await updateOutreachStage(id, stage, notes, live_url);
    }

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "edit",
      resource: "off_page_outreach",
      resource_id: id,
      summary: `Updated outreach ${id} (stage=${stage || "unchanged"})`,
      status: "success",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed updating outreach stage/draft:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
