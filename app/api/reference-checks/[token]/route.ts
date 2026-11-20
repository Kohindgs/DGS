import { NextRequest, NextResponse } from "next/server";
import {
  getReferenceCheckByToken,
  saveReferenceCheckSubmission,
} from "@/lib/reference-checks/db";
import { generateComparisonFeedback } from "@/lib/reference-checks/comparison-engine";
import { sendHrReferenceCompletedNotification } from "@/lib/reference-checks/email-service";
import type { PublicReferenceCheckView, ReferenceAnswer } from "@/lib/reference-checks/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const record = await getReferenceCheckByToken(token);
  if (!record) {
    return NextResponse.json(
      { ok: false, message: "Reference check link is invalid or no longer active." },
      { status: 404 }
    );
  }

  const expired =
    Boolean(record.token_expires_at) &&
    new Date(record.token_expires_at as string).getTime() < Date.now() &&
    record.status === "pending";

  const publicView: PublicReferenceCheckView = {
    id: record.id,
    candidateName: record.candidate_name,
    candidatePosition: record.candidate_position,
    lastCompany: record.last_company,
    lastDesignation: record.last_designation,
    lastEmploymentDates: record.last_employment_dates,
    pocName: record.poc_name,
    pocDesignation: record.poc_designation,
    status: record.status,
    questions: (record.questions || []).filter((q) => q.enabled !== false).slice(0, 10),
    submittedAt: record.submitted_at,
    expired,
  };

  return NextResponse.json({ ok: true, referenceCheck: publicView });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const record = await getReferenceCheckByToken(token);
  if (!record) {
    return NextResponse.json(
      { ok: false, message: "Reference check link is invalid." },
      { status: 404 }
    );
  }

  if (record.status === "submitted") {
    return NextResponse.json(
      { ok: false, message: "This reference check has already been submitted. Thank you!" },
      { status: 409 }
    );
  }

  try {
    const body = await request.json();
    const rawResponses = Array.isArray(body.responses) ? body.responses : [];
    const activeQuestions = (record.questions || []).filter((q) => q.enabled !== false).slice(0, 10);

    const sanitizedResponses: ReferenceAnswer[] = [];
    for (const q of activeQuestions) {
      const match = rawResponses.find((r: any) => r && r.questionId === q.id);
      if (!match || (match.yesNo !== "Yes" && match.yesNo !== "No")) {
        return NextResponse.json(
          {
            ok: false,
            message: `Please select Yes or No for Question ${q.id.toUpperCase()}.`,
          },
          { status: 400 }
        );
      }
      sanitizedResponses.push({
        questionId: q.id,
        yesNo: match.yesNo,
        comment: match.comment ? String(match.comment).trim().slice(0, 800) : undefined,
      });
    }

    const pocConfirmedTitle = body.pocConfirmedTitle
      ? String(body.pocConfirmedTitle).trim().slice(0, 200)
      : undefined;
    const pocConfirmedDates = body.pocConfirmedDates
      ? String(body.pocConfirmedDates).trim().slice(0, 200)
      : undefined;
    const additionalComments = body.additionalComments
      ? String(body.additionalComments).trim().slice(0, 1500)
      : undefined;

    const comparisonFeedback = await generateComparisonFeedback({
      record,
      responses: sanitizedResponses,
      pocConfirmedTitle,
      pocConfirmedDates,
      additionalComments,
    });

    const updated = await saveReferenceCheckSubmission({
      id: record.id,
      responses: sanitizedResponses,
      comparisonFeedback,
    });

    if (updated) {
      void sendHrReferenceCompletedNotification(updated);
    }

    return NextResponse.json({
      ok: true,
      status: "submitted",
      submittedAt: updated?.submitted_at || new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[api/reference-checks/[token] POST] Error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to save reference response." },
      { status: 500 }
    );
  }
}
