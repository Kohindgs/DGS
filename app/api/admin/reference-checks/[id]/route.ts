import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import {
  deleteReferenceCheckRecord,
  getReferenceCheckById,
  markReferenceCheckSent,
} from "@/lib/reference-checks/db";
import { sendReferenceCheckRequestEmail } from "@/lib/reference-checks/email-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await hasAdminSession();
  if (!isAuth) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const currentUser = await getCurrentCmsUser().catch(() => null);
  if (currentUser && !hasPermission(currentUser.role, "hr", "view")) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const record = await getReferenceCheckById(id);
  if (!record) {
    return NextResponse.json({ ok: false, message: "Reference check not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, record });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await hasAdminSession();
  if (!isAuth) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const currentUser = await getCurrentCmsUser().catch(() => null);
  if (currentUser && !hasPermission(currentUser.role, "hr", "edit")) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const record = await getReferenceCheckById(id);
  if (!record) {
    return NextResponse.json({ ok: false, message: "Reference check not found." }, { status: 404 });
  }

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

  if (emailResult.sent) {
    await markReferenceCheckSent(id);
  }

  return NextResponse.json({ ok: emailResult.sent, emailResult });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await hasAdminSession();
  if (!isAuth) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const currentUser = await getCurrentCmsUser().catch(() => null);
  if (currentUser && !hasPermission(currentUser.role, "hr", "delete")) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await deleteReferenceCheckRecord(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, message: "Reference check not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
