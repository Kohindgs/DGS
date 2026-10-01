import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { createAssessmentAssignment } from "@/lib/cms/assessments";
import { cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const assessmentKey = searchParams.get("assessmentKey");

    let query = "SELECT * FROM assessment_assignments";
    const params: any[] = [];
    if (assessmentKey) {
      query += " WHERE assessment_key = ?";
      params.push(assessmentKey);
    }
    query += " ORDER BY created_at DESC LIMIT 100";

    const { rows } = await cmsQuery(query, params);
    return NextResponse.json({ success: true, assignments: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const assessmentKey = String(body.assessmentKey || body.assessment_key || "").trim();
    const name = String(body.name || body.candidate_name || "").trim();
    const email = String(body.email || body.candidate_email || "").trim().toLowerCase();
    const phone = String(body.phone || body.candidate_phone || "").trim();
    const experience = body.experience ? String(body.experience).trim() : null;
    const noticePeriod = body.noticePeriod || body.notice_period ? String(body.noticePeriod || body.notice_period).trim() : null;
    const expiresInDays = Number(body.expiresInDays || 7);

    if (!assessmentKey) {
      return NextResponse.json({ error: "Assessment key / version ID is required." }, { status: 400 });
    }
    if (!name || !email) {
      return NextResponse.json({ error: "Candidate name and email are required." }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const assignment = await createAssessmentAssignment({
      assessmentKey,
      name,
      email,
      phone: phone || "N/A",
      experience: experience || undefined,
      noticePeriod: noticePeriod || undefined,
      expiresAt,
    });

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.assignment.create",
      resource: "assessment_assignment",
      resource_id: assignment.id,
      summary: `Created assessment assignment for candidate ${name} (${email})`,
      after_state: { candidate_name: name, candidate_email: email, assessment_key: assessmentKey },
    });

    const assessmentPath = `/assessment/${assessmentKey}?token=${assignment.token}`;

    return NextResponse.json({
      success: true,
      assignmentId: assignment.id,
      token: assignment.token,
      assessmentPath,
      assessmentUrl: `https://www.dgeniussolutions.com${assessmentPath}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create assessment assignment" }, { status: 500 });
  }
}
