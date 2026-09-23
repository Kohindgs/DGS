import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { getCandidateDetails, deleteCandidateRecord } from "@/lib/cms/assessments";
import { cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Candidate ID required" }, { status: 400 });

  const candidate = await getCandidateDetails(id);
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  return NextResponse.json({ success: true, candidate });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Candidate ID required" }, { status: 400 });

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const candidate = await getCandidateDetails(id);
    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    const reviewStatus = body.review_status || candidate.review_status;
    const reviewerNotes = body.reviewer_notes !== undefined ? body.reviewer_notes : candidate.reviewer_notes;
    const evaluationNotes = body.evaluation_notes ? JSON.stringify(body.evaluation_notes) : (typeof candidate.evaluation_notes === "object" ? JSON.stringify(candidate.evaluation_notes) : candidate.evaluation_notes);

    await cmsExecute(
      `UPDATE assessment_candidates
       SET review_status = ?, reviewer_notes = ?, evaluation_notes = ?
       WHERE assignment_id = ? OR id = ?`,
      [reviewStatus, reviewerNotes, evaluationNotes, id, id]
    );

    if (body.interview_notes !== undefined) {
      await cmsExecute("UPDATE hr_pipeline SET interview_notes = ? WHERE id = ?", [body.interview_notes, id]);
    }

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.candidate.review",
      resource: "assessment_candidate",
      resource_id: id,
      summary: `Updated review status for candidate ${candidate.candidate_name}: ${reviewStatus}`,
      after_state: { reviewStatus, reviewerNotes },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update candidate review" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // REQ-32: Strict Superadmin-only candidate deletion
  if (currentUser.role !== "superadmin") {
    return NextResponse.json(
      { error: "Forbidden: Only Superadmin has permission to permanently delete candidate records." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Candidate ID required" }, { status: 400 });

  try {
    await deleteCandidateRecord(id, currentUser.role, currentUser.email);
    return NextResponse.json({ success: true, message: "Candidate record deleted permanently." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete candidate" }, { status: 500 });
  }
}
