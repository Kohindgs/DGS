import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
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
