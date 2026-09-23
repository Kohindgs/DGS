import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { getCandidateDetails, deleteCandidateRecord } from "@/lib/cms/assessments";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "hr", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Candidate ID required" }, { status: 400 });

  const candidate = await getCandidateDetails(id);
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  let documents: any[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      const { rows } = await cmsQuery(
        `SELECT id, document_type, filename, file_size, mime_type, created_at
         FROM hr_documents
         WHERE pipeline_id = ?
         ORDER BY created_at DESC`,
        [id]
      );
      documents = rows || [];
    } catch {}
  }

  return NextResponse.json({ success: true, candidate, documents });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "hr", "edit")) {
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

    const notes = body.interview_notes !== undefined ? body.interview_notes : candidate.interview_notes;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await cmsExecute(
      "UPDATE hr_pipeline SET interview_notes = ?, updated_at = ? WHERE id = ?",
      [notes, now, id]
    );

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "hr.candidate.update",
      resource: "hr_pipeline",
      resource_id: id,
      summary: `Updated candidate notes for ${candidate.candidate_name}`,
      after_state: { interview_notes: notes },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update candidate" }, { status: 500 });
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

  // REQ-32: Superadmin only
  if (currentUser.role !== "superadmin") {
    return NextResponse.json(
      { error: "Forbidden: Only Superadmin can delete candidate records." },
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
