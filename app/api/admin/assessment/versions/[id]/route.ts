import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { getAssessmentVersion, updateDraftVersion } from "@/lib/cms/assessments";
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

    if (version.status === "approved") {
      return NextResponse.json(
        { error: "Cannot delete approved versions as they are part of immutable audit history." },
        { status: 400 }
      );
    }

    if (!isCmsDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    await cmsExecute("DELETE FROM assessment_versions WHERE id = ?", [id]);

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.version.delete",
      resource: "assessment_version",
      resource_id: id,
      summary: `Deleted draft assessment version #${version.version_number} for ${version.jd_title || "JD"}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete version" }, { status: 500 });
  }
}
