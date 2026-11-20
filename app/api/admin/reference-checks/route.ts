import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import {
  createReferenceCheckRecord,
  listReferenceChecks,
} from "@/lib/reference-checks/db";
import {
  getHrEmailConfig,
  sendReferenceCheckRequestEmail,
} from "@/lib/reference-checks/email-service";
import {
  buildCommonQuestions,
  normalizeAndCapQuestions,
} from "@/lib/reference-checks/question-generator";
import type { ReferenceQuestion } from "@/lib/reference-checks/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const isAuth = await hasAdminSession();
  if (!isAuth) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const currentUser = await getCurrentCmsUser().catch(() => null);
  if (currentUser && !hasPermission(currentUser.role, "hr", "view")) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const data = await listReferenceChecks({ status, search });
  return NextResponse.json({
    ok: true,
    records: data.records,
    stats: data.stats,
    hrSender: getHrEmailConfig().hrEmail,
  });
}

export async function POST(request: Request) {
  const isAuth = await hasAdminSession();
  if (!isAuth) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const currentUser = await getCurrentCmsUser().catch(() => null);
  if (currentUser && !hasPermission(currentUser.role, "hr", "create")) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const candidateName = String(body.candidateName || "").trim();
    const lastCompany = String(body.lastCompany || "").trim();
    const lastDesignation = String(body.lastDesignation || "").trim();
    const pocName = String(body.pocName || "").trim();
    const pocDesignation = String(body.pocDesignation || "").trim();
    const pocEmail = String(body.pocEmail || "").trim();
    const pocPhone = body.pocPhone ? String(body.pocPhone).trim() : null;

    if (!candidateName || !lastCompany || !lastDesignation || !pocName || !pocDesignation || !pocEmail) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Candidate Name, Last Company, Last Designation, POC Full Name, POC Designation, and POC Email ID are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pocEmail)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid POC Email ID." },
        { status: 400 }
      );
    }

    const rawQuestions: ReferenceQuestion[] = Array.isArray(body.questions) && body.questions.length > 0
      ? body.questions
      : buildCommonQuestions({
          candidateName,
          lastCompany,
          lastDesignation,
          lastEmploymentDates: String(body.lastEmploymentDates || "Recent tenure"),
        });

    const cappedQuestions = normalizeAndCapQuestions(
      rawQuestions.filter((q) => q && q.enabled !== false)
    );
    if (cappedQuestions.length === 0) {
      return NextResponse.json(
        { ok: false, message: "At least one reference check question is required (max 10)." },
        { status: 400 }
      );
    }

    const record = await createReferenceCheckRecord({
      candidateName,
      candidateEmail: body.candidateEmail || null,
      candidatePhone: body.candidatePhone || null,
      candidatePosition: body.candidatePosition || null,
      lastCompany,
      lastDesignation,
      lastEmploymentDates: body.lastEmploymentDates || null,
      cvFilename: body.cvFilename || null,
      cvTextSummary: body.cvTextSummary || null,
      claimedResponsibilities: Array.isArray(body.claimedResponsibilities)
        ? body.claimedResponsibilities
        : [],
      claimedAchievements: Array.isArray(body.claimedAchievements)
        ? body.claimedAchievements
        : [],
      pocName,
      pocDesignation,
      pocEmail,
      pocPhone,
      questions: cappedQuestions,
      createdBy: currentUser?.email || "hr-admin",
      markSentNow: true,
    });

    const emailResult = await sendReferenceCheckRequestEmail({
      candidateName: record.candidate_name,
      candidatePosition: record.candidate_position,
      lastCompany: record.last_company,
      lastDesignation: record.last_designation,
      lastEmploymentDates: record.last_employment_dates,
      pocName: record.poc_name,
      pocDesignation: record.poc_designation,
      pocEmail: record.poc_email,
      secureToken: record.secure_token,
      questionsCount: record.questions.length,
    });

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com").replace(
      /\/+$/,
      ""
    );
    const publicUrl = `${baseUrl}/ref-check/${encodeURIComponent(record.secure_token)}/`;

    await logAuditEvent({
      user_id: currentUser?.id || null,
      actor_email: currentUser?.email || "hr@dgeniussolutions.com",
      role: currentUser?.role || "admin",
      action: "REFERENCE_CHECK_CREATED",
      resource: "candidate_reference_check",
      resource_id: record.id,
      summary: `Initiated reference check for ${record.candidate_name} (${record.last_company}) to POC ${record.poc_email}`,
      after_state: { status: "pending", emailSent: emailResult.sent },
      status: "success",
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      record,
      emailResult,
      publicUrl,
    });
  } catch (err: any) {
    console.error("[api/admin/reference-checks POST] Error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to create reference check." },
      { status: 500 }
    );
  }
}
