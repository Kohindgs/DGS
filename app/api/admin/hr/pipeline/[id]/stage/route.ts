import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

const VALID_STAGES = [
  "called",
  "shortlisted",
  "interview_scheduled",
  "interview_done",
  "test_created",
  "test_assigned",
  "test_submitted",
  "selected",
  "offer_sent",
  "offer_accepted",
  "appointment_issued",
  "onboarded",
  "rejected",
];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "hr", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const newStage = String(body.stage || "").toLowerCase();

    if (!VALID_STAGES.includes(newStage)) {
      return NextResponse.json({ error: "Invalid recruitment stage" }, { status: 400 });
    }

    const { rows } = await cmsQuery(
      "SELECT id, candidate_name, stage FROM hr_pipeline WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Candidate not found in HR pipeline" }, { status: 404 });
    }

    const candidate = rows[0] as any;
    const oldStage = candidate.stage;

    await cmsExecute(
      "UPDATE hr_pipeline SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newStage, id]
    );

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "hr.stage_change",
      resource: "hr",
      resource_id: id,
      summary: `Moved candidate ${candidate.candidate_name} from ${oldStage} to ${newStage}`,
      before_state: { stage: oldStage },
      after_state: { stage: newStage },
    });

    return NextResponse.json({ ok: true, stage: newStage });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update candidate stage" }, { status: 500 });
  }
}
