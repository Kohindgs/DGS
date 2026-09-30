import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { getAssessmentVersion, updateDraftVersion } from "@/lib/cms/assessments";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";

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
  if (!id) return NextResponse.json({ error: "Version ID required" }, { status: 400 });

  const version = await getAssessmentVersion(id);
  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  return NextResponse.json({ success: true, version });
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
  if (!id) return NextResponse.json({ error: "Version ID required" }, { status: 400 });

  try {
    const body = await request.json();
    const version = await getAssessmentVersion(id);
    if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

    if (version.status === "approved") {
      return NextResponse.json(
        { error: "Approved assessment versions are immutable. Create a new version to modify." },
        { status: 400 }
      );
    }

    await updateDraftVersion(id, body.testData || body.test_data, body.promptNotes);

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.version.update",
      resource: "assessment_version",
      resource_id: id,
      summary: `Updated draft assessment version #${version.version_number} for ${version.jd_title || "JD"}`,
      after_state: { versionId: id, versionNumber: version.version_number },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update version" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Version ID required" }, { status: 400 });

  try {
    const version = await getAssessmentVersion(id);
    if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

    if (!isCmsDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Check if there are associated attempts or historical candidate results
    // Or if the version is approved/part of immutable audit history:
    // ARCHIVE / SOFT DELETE definition while preserving results.
    // If safe to fully remove unused draft version: perform transactional deletion.
    const { rows: attemptRows } = await cmsQuery(
      `SELECT COUNT(*) as cnt FROM assessment_attempts a 
       JOIN assessment_assignments ass ON a.assignment_id = ass.id
       WHERE a.assessment_key = ? OR ass.assessment_key = ?`,
      [id, id]
    );
    const hasAttempts = Number((attemptRows?.[0] as any)?.cnt || 0) > 0;
    const shouldArchive = version.status === "approved" || hasAttempts;

    if (shouldArchive) {
      await cmsExecute("UPDATE assessment_versions SET status = 'archived' WHERE id = ?", [id]);
      await logAuditEvent({
        user_id: currentUser.id,
        actor_email: currentUser.email,
        role: currentUser.role,
        action: "assessment.version.archive",
        resource: "assessment_version",
        resource_id: id,
        summary: `Archived assessment version #${version.version_number} for ${version.jd_title || "JD"} to preserve audit history and results`,
        after_state: { status: "archived" },
      });
      return NextResponse.json({ success: true, action: "archived" });
    }

    await cmsExecute("DELETE FROM assessment_versions WHERE id = ?", [id]);

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.version.delete",
      resource: "assessment_version",
      resource_id: id,
      summary: `Deleted unused draft assessment version #${version.version_number} for ${version.jd_title || "JD"}`,
    });

    return NextResponse.json({ success: true, action: "deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete version" }, { status: 500 });
  }
}
