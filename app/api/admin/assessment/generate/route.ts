import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { generateTestFromJD } from "@/lib/assessments/gemini-engine";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

function buildManualDraftTestData(
  roleTitle: string,
  difficulty: string,
  mcqCount: number,
  shortCount: number,
  longCount: number,
  focusAreas?: string
) {
  const mcqs = [];
  for (let i = 1; i <= mcqCount; i++) {
    mcqs.push({
      id: `mcq_${i}`,
      question: `Assessment Question ${i} for ${roleTitle}: What is the primary standard operating procedure for ensuring technical quality and client alignment?`,
      options: [
        "Adhere to verified technical SOP checklist and complete mandatory peer code review before release",
        "Publish directly to live environment without QA testing",
        "Delegate execution to external third-party without internal verification",
        "Bypass documentation and standard tests if client timeline is tight",
      ],
      correctIndex: 0,
      explanation: "Standard agency operating procedures enforce rigorous peer verification, QA validation, and protocol checks prior to deployment.",
      competencyTag: focusAreas || "Core Technical Competency",
    });
  }

  const shortAnswers = [];
  for (let i = 1; i <= shortCount; i++) {
    shortAnswers.push({
      id: `short_${i}`,
      question: `Explain how you would prioritize and resolve a critical bottleneck in ${roleTitle} within a tight turnaround window.`,
      rubric: "Evaluates analytical root cause identification, risk prioritization, and structured stakeholder communication.",
      idealAnswerTraits: ["Root-cause analysis", "Proactive communication", "Risk-weighted prioritization"],
      maxScore: 5,
      competencyTag: "Problem Solving & Execution",
    });
  }

  const longAnswers = [];
  for (let i = 1; i <= longCount; i++) {
    longAnswers.push({
      id: `long_${i}`,
      question: `Case Scenario: An enterprise client experiences an unforeseen 35% decline in organic visibility following a major algorithmic release. Outline your diagnostic sequence, stakeholder reporting strategy, and 30-day technical remediation roadmap.`,
      scenario: "Enterprise client KPI recovery and roadmap execution",
      minWords: 120,
      evaluationCriteria: [
        "Systematic technical audit sequence",
        "Clarity and confidence in executive communication",
        "Feasible, high-impact prioritized remediation timeline",
      ],
      maxScore: 10,
      competencyTag: "Strategic Architecture",
    });
  }

  return {
    role_title: roleTitle,
    role_level: difficulty,
    test_blueprint: {
      psychometric_count: 0,
      mcq_count: mcqCount,
      short_answer_count: shortCount,
      long_answer_count: longCount,
      difficulty,
    },
    psychometric: [],
    mcqs,
    shortAnswers,
    longAnswers,
  };
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
    let jdId = String(body.jd_id || "").trim();
    const difficulty = body.difficulty || "mid";
    const mcqCount = Math.max(1, Number(body.mcq_count || 5));
    const shortCount = Math.max(0, Number(body.short_count ?? 2));
    const longCount = Math.max(0, Number(body.long_count ?? 1));
    const focusAreas = String(body.focus_areas || "");
    const customPrompt = String(body.custom_prompt || "");
    const isManualDraft = Boolean(body.manual_draft || body.isManualDraft);

    // If no JD selected, check if user provided quick role title to auto-create a JD
    let roleTitle = String(body.role_title || "").trim();
    if (!jdId && roleTitle) {
      jdId = randomUUID();
      const defaultJdText = `Role: ${roleTitle}\nLevel: ${difficulty}\nDepartment: Operations\n\nJob Description created automatically via Assessment OS.`;
      await cmsExecute(
        `INSERT INTO assessment_jds (id, role_title, role_level, department, jd_text, status)
         VALUES (?, ?, ?, 'Operations', ?, 'active')`,
        [jdId, roleTitle, difficulty, defaultJdText]
      );
    }

    if (!jdId) {
      return NextResponse.json({ error: "Please select an existing Job Description or provide a Role Title." }, { status: 400 });
    }

    const { rows: jdRows } = await cmsQuery<{ id: string; role_title: string; jd_text: string }>(
      "SELECT id, role_title, jd_text FROM assessment_jds WHERE id = ? LIMIT 1",
      [jdId]
    );

    if (!jdRows || jdRows.length === 0) {
      return NextResponse.json({ error: "Job Description not found" }, { status: 404 });
    }

    const jd = jdRows[0];
    roleTitle = jd.role_title;

    let testData: any;
    let generationMode = "manual_draft";

    if (!isManualDraft) {
      try {
        testData = await generateTestFromJD(jd.jd_text, {
          difficulty,
          mcqCount,
          shortCount,
          longCount,
          focusAreas,
          customPrompt,
        });
        generationMode = "gemini_ai";
      } catch (aiErr: any) {
        console.warn("Gemini generation failed, falling back to structured template:", aiErr.message);
        testData = buildManualDraftTestData(roleTitle, difficulty, mcqCount, shortCount, longCount, focusAreas);
        generationMode = "fallback_manual_draft";
      }
    } else {
      testData = buildManualDraftTestData(roleTitle, difficulty, mcqCount, shortCount, longCount, focusAreas);
      generationMode = "manual_draft";
    }

    // Determine next version number
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
        JSON.stringify({ difficulty, mcq_count: mcqCount, short_count: shortCount, long_count: longCount, custom_prompt: customPrompt, generationMode }),
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
      summary: `Generated draft assessment version #${nextVersion} for ${jd.role_title} (${generationMode})`,
    });

    return NextResponse.json({
      ok: true,
      versionId,
      versionNumber: nextVersion,
      generationMode,
      roleTitle: jd.role_title,
      testData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate assessment" }, { status: 500 });
  }
}
