import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { regenerateSingleQuestion } from "@/lib/assessments/gemini-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { questionType, originalQuestion, recommendation, roleContext, difficulty } = body;

    if (!questionType || !originalQuestion || !recommendation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const revisedQuestion = await regenerateSingleQuestion({
      questionType,
      originalQuestion,
      recommendation,
      roleContext: roleContext || "Digital Marketing & Agency Roles",
      difficulty: difficulty || "moderate",
    });

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "assessment.question.regenerate",
      resource: "assessment_question",
      resource_id: originalQuestion.id || "question",
      summary: `Regenerated question: ${recommendation}`,
      after_state: {
        recommendation,
        questionType,
        revisedPrompt: revisedQuestion.question || revisedQuestion.prompt,
      },
    });

    return NextResponse.json({ success: true, revisedQuestion });
  } catch (err: any) {
    console.error("Error regenerating question:", err);
    return NextResponse.json({ error: err.message || "Question regeneration failed" }, { status: 500 });
  }
}
