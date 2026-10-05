import { NextResponse } from "next/server";
import { resolveAssessmentDefinition } from "@/lib/assessments/definitions";
import { getAttempt, submitAssessmentAttempt } from "@/lib/cms/assessments";
import { cmsQuery } from "@/lib/cms/db";
import { calculatePsychometricProfile, PsychometricQuestion, PsychometricProfileResult } from "@/lib/assessments/psychometric";
import { publishNotificationEvent } from "@/lib/notifications/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function countWords(value: unknown) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as {
      attemptId?: string;
      answers?: Record<string, unknown>;
      activity?: unknown[];
    };
    const attemptId = String(input.attemptId || "");
    const attempt = await getAttempt(attemptId);
    if (!attempt || attempt.submitted_at) {
      return NextResponse.json({ ok: false, message: "Assessment attempt is unavailable or already submitted." }, { status: 400 });
    }

    // Attempt to retrieve frozen snapshot from assignment record
    let definition: any = null;
    const { rows: assignRows } = await cmsQuery<any>(
      "SELECT * FROM assessment_assignments WHERE id = ? LIMIT 1",
      [attempt.assignment_id]
    );
    if (assignRows && assignRows[0] && assignRows[0].assignment_snapshot) {
      try {
        const raw = assignRows[0].assignment_snapshot;
        const snapshot = typeof raw === "string" ? JSON.parse(raw) : raw;
        const roleQuestions = Array.isArray(snapshot.role_questions_snapshot) ? snapshot.role_questions_snapshot : [];
        const psychometricQuestions =
          snapshot.psychometric_enabled !== false && Array.isArray(snapshot.psychometric_questions_snapshot)
            ? snapshot.psychometric_questions_snapshot
            : [];
        const practicalTask = snapshot.practical_task_snapshot || null;
        const practicalQuestions = practicalTask
          ? [
              {
                id: "practical_task",
                type: "practical",
                prompt: practicalTask.title || "Practical Agency Task",
                instructions: practicalTask.instructions,
                deliverables: practicalTask.deliverables,
              },
            ]
          : [];

        definition = {
          key: snapshot.assessment_version_id || attempt.assessment_key,
          title: snapshot.title || "Candidate Technical & Psychometric Assessment",
          durationMinutes: snapshot.duration_minutes || assignRows[0].duration_minutes || 75,
          questions: [...roleQuestions, ...psychometricQuestions, ...practicalQuestions],
          roleQuestions,
          psychometricQuestions,
          practicalTask,
        };
      } catch (snapErr) {
        console.warn("Failed parsing snapshot in submit route, falling back to definition resolver:", snapErr);
      }
    }

    if (!definition) {
      definition = await resolveAssessmentDefinition(attempt.assessment_key);
    }
    if (!definition) {
      return NextResponse.json({ ok: false, message: "Assessment configuration missing." }, { status: 400 });
    }

    const startedTime =
      attempt.started_at instanceof Date
        ? attempt.started_at.getTime()
        : new Date(
            String(attempt.started_at).includes("T")
              ? String(attempt.started_at)
              : String(attempt.started_at).replace(" ", "T") + "Z"
          ).getTime();
    const elapsed = Date.now() - startedTime;
    const allowedMs = ((definition.durationMinutes || 75) + 5) * 60 * 1000;
    if (elapsed > allowedMs) {
      return NextResponse.json({ ok: false, message: "Assessment time has expired." }, { status: 408 });
    }

    const answers = input.answers || {};
    const technicalAnswers: Record<string, unknown> = {};
    const psychometricAnswers: Record<string, string | number> = {};
    let practicalSubmission: unknown = null;

    let score = 0;
    let total = 0;

    for (const question of definition.questions) {
      if (question.type === "mcq") {
        total += 1;
        technicalAnswers[question.id] = answers[question.id];
        if (Number(answers[question.id]) === question.correctIndex) {
          score += 1;
        }
      } else if (question.type === "short" || question.type === "long") {
        technicalAnswers[question.id] = answers[question.id] || "";
        if (question.minWords && countWords(answers[question.id]) < question.minWords) {
          return NextResponse.json(
            {
              ok: false,
              message: `Please complete the written question with at least ${question.minWords} words.`,
            },
            { status: 400 }
          );
        }
      } else if (question.type === "psychometric") {
        const val = answers[question.id];
        if (val === undefined || val === null || val === "") {
          return NextResponse.json(
            {
              ok: false,
              message: "Please answer all required psychometric situational questions before submitting.",
            },
            { status: 400 }
          );
        }
        psychometricAnswers[question.id] = val as any;
      } else if (question.type === "practical") {
        practicalSubmission = answers[question.id] || answers["practical_task"] || "";
      }
    }

    // Evaluate deterministic psychometric profile
    const psychometricQuestions = (definition.questions.filter((q: any) => q.type === "psychometric") || []) as PsychometricQuestion[];
    let psychometricProfile: string | null = null;
    let psychometricScoreData: PsychometricProfileResult | null = null;

    if (psychometricQuestions.length > 0) {
      psychometricScoreData = calculatePsychometricProfile(psychometricAnswers, psychometricQuestions);
      psychometricProfile = psychometricScoreData.classification;
    }

    await submitAssessmentAttempt({
      id: attempt.id,
      answers,
      technical_answers: technicalAnswers,
      psychometric_answers: psychometricAnswers,
      psychometric_profile: psychometricProfile,
      psychometric_score_data: psychometricScoreData,
      practical_submission: practicalSubmission,
      activity: Array.isArray(input.activity) ? input.activity : [],
      score,
      total,
    });

    const candidateLabel = attempt.candidate_name || attempt.candidate_email || "Candidate";
    const psychoSummary = psychometricProfile ? ` | Psychometric: ${psychometricProfile}` : "";

    await publishNotificationEvent({
      type: "assessment_submitted",
      severity: score / Math.max(1, total) < 0.5 ? "warning" : "info",
      title: `Assessment Submitted: ${definition.title}`,
      message: `${candidateLabel} scored ${score}/${total} on technical MCQs${psychoSummary}. Review responses in Assessment OS.`,
      resource_type: "assessment_attempt",
      resource_id: attempt.id,
      resource_url: `/admin/assessment/?attemptId=${attempt.id}`,
      recipient_role: "hr",
    }).catch((err) => console.error("Failed to publish assessment notification event", err));

    return NextResponse.json({
      ok: true,
      message: "Assessment submitted successfully. Our recruitment team will review your complete technical and situational responses and reach out regarding next steps.",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Unable to submit assessment." },
      { status: 500 }
    );
  }
}
