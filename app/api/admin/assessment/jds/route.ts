import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsQuery, cmsExecute } from "@/lib/cms/db";
import {
  listAssessmentJds,
  getAssessmentJd,
  createAssessmentJd,
  updateAssessmentJd,
  duplicateAssessmentJd,
} from "@/lib/cms/assessments";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const jds = await listAssessmentJds();
  return NextResponse.json({ jds });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (body.action === "duplicate" && body.id) {
      const duplicated = await duplicateAssessmentJd(body.id);
      await logAuditEvent({
        user_id: currentUser.id,
        actor_email: currentUser.email,
        role: currentUser.role,
        action: "assessment.jd.duplicate",
        resource: "assessment_jd",
        resource_id: duplicated.id,
        summary: `Duplicated JD ${duplicated.role_title}`,
        after_state: { originalId: body.id, title: duplicated.role_title },
      });
      return NextResponse.json({ success: true, jd: duplicated });
    }

    if (!body.title || !body.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const jd = await createAssessmentJd({
      title: body.title,
      level: body.level || "mid",
      department: body.department || "SEO & Digital",
      content: body.content,
    });

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.jd.create",
      resource: "assessment_jd",
      resource_id: jd.id,
      summary: `Created JD ${jd.role_title}`,
      after_state: { title: jd.role_title, department: jd.department },
    });

    return NextResponse.json({ success: true, jd });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create JD" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "JD ID is required" }, { status: 400 });
    }

    await updateAssessmentJd(body.id, {
      title: body.title,
      level: body.level,
      department: body.department,
      content: body.content,
      status: body.status,
    });

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.jd.update",
      resource: "assessment_jd",
      resource_id: body.id,
      summary: `Updated JD ${body.title || body.id}`,
      after_state: { title: body.title },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update JD" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "JD ID is required" }, { status: 400 });

  try {
    const jd = await getAssessmentJd(id);
    if (!jd) return NextResponse.json({ error: "JD not found" }, { status: 404 });

    // Check if versions or candidate applications exist for this JD
    const { rows: verRows } = await cmsQuery(
      "SELECT COUNT(*) as cnt FROM assessment_versions WHERE jd_id = ?",
      [id]
    );
    const { rows: pipeRows } = await cmsQuery(
      "SELECT COUNT(*) as cnt FROM hr_pipeline WHERE position_id = ?",
      [id]
    );
    const hasLinkedRecords =
      Number((verRows?.[0] as any)?.cnt || 0) > 0 ||
      Number((pipeRows?.[0] as any)?.cnt || 0) > 0;

    if (hasLinkedRecords) {
      await cmsExecute("UPDATE assessment_jds SET status = 'archived' WHERE id = ?", [id]);
      await logAuditEvent({
        user_id: currentUser.id,
        actor_email: currentUser.email,
        role: currentUser.role,
        action: "assessment.jd.archive",
        resource: "assessment_jd",
        resource_id: id,
        summary: `Archived JD ${jd.role_title} to preserve historical candidate and version references`,
        after_state: { status: "archived" },
      });
      return NextResponse.json({ success: true, action: "archived" });
    }

    await cmsExecute("DELETE FROM assessment_jds WHERE id = ?", [id]);
    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.jd.delete",
      resource: "assessment_jd",
      resource_id: id,
      summary: `Permanently deleted unused JD ${jd.role_title}`,
    });
    return NextResponse.json({ success: true, action: "deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete JD" }, { status: 500 });
  }
}

