import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { generateTestFromJD } from "@/lib/assessments/gemini-engine";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

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
    const jdId = String(body.jd_id || "");
    const difficulty = body.difficulty || "mid";
    const mcqCount = Number(body.mcq_count || 5);
    const shortCount = Number(body.short_count || 2);
    const longCount = Number(body.long_count || 1);
    const focusAreas = String(body.focus_areas || "");
    const customPrompt = String(body.custom_prompt || "");

    const { rows: jdRows } = await cmsQuery<{ id: string; role_title: string; jd_text: string }>(
      "SELECT id, role_title, jd_text FROM assessment_jds WHERE id = ? LIMIT 1",
      [jdId]
    );

    if (!jdRows || jdRows.length === 0) {
      return NextResponse.json({ error: "Job Description not found" }, { status: 404 });
    }

    const jd = jdRows[0];
    const testData = await generateTestFromJD(jd.jd_text, {
      difficulty,
      mcqCount,
      shortCount,
      longCount,
      focusAreas,
      customPrompt,
    });

    // Determine version number
    const { rows: verRows } = await cmsQuery<{ max_ver: number }>(
      "SELECT COALESCE(MAX(version_number), 0) as max_ver FROM assessment_versions WHERE jd_id = ?",
      [jdId]
    );
    const nextVersion = (verRows[0]?.max_ver || 0) + 1;

    const versionId = randomUUID();
    await cmsExecute(
      `INSERT INTO assessment_versions (
        id, jd_id, version_number, difficulty, status, focus_areas, admin_prompt_notes, test_data
      ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)`,
      [
        versionId,
        jdId,
        nextVersion,
        difficulty,
        JSON.stringify(focusAreas),
        JSON.stringify({ difficulty, mcq_count: mcqCount, short_count: shortCount, long_count: longCount, custom_prompt: customPrompt }),
        JSON.stringify(testData),
      ]
    );

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.generate",
      resource: "assessment",
      resource_id: versionId,
      summary: `Generated draft assessment version #${nextVersion} for ${jd.role_title}`,
    });

    return NextResponse.json({ ok: true, versionId, versionNumber: nextVersion, testData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate assessment" }, { status: 500 });
  }
}
