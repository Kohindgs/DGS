import nodemailer from "nodemailer";
import { renderDgsEmailHtml } from "../notifications/email-template.ts";
import { getGlobalFormNotificationRecipient } from "../notifications/config.ts";
import type { ReferenceCheckRecord } from "./types.ts";

export type EmailDispatchResult = {
  sent: boolean;
  sender: string;
  recipient: string;
  messageId?: string;
  error?: string;
};

function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com").replace(/\/+$/, "");
}

export function getHrEmailConfig() {
  const hrEmail = (
    process.env.DGS_HR_EMAIL ||
    process.env.DGS_HR_SMTP_USER ||
    "hr@dgeniussolutions.com"
  ).trim();

  const smtpUser = (process.env.DGS_HR_SMTP_USER || process.env.DGS_SMTP_USER || "").trim();
  const smtpPass = (process.env.DGS_HR_SMTP_PASSWORD || process.env.DGS_SMTP_PASSWORD || "").trim();
  const smtpHost = (process.env.DGS_HR_SMTP_HOST || process.env.DGS_SMTP_HOST || "").trim();
  const smtpPort = Number(process.env.DGS_HR_SMTP_PORT || process.env.DGS_SMTP_PORT || 465);
  const smtpSecure =
    (process.env.DGS_HR_SMTP_SECURE ?? process.env.DGS_SMTP_SECURE ?? "true") === "true";

  const configured = Boolean(smtpHost && smtpUser && smtpPass);

  return {
    configured,
    hrEmail,
    fromHeader: `"D'Genius Solutions HR" <${hrEmail}>`,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
  };
}

export async function sendReferenceCheckRequestEmail(params: {
  candidateName: string;
  candidatePosition?: string | null;
  lastCompany: string;
  lastDesignation: string;
  lastEmploymentDates?: string | null;
  pocName: string;
  pocDesignation: string;
  pocEmail: string;
  secureToken: string;
  questionsCount: number;
}): Promise<EmailDispatchResult> {
  const cfg = getHrEmailConfig();
  if (!cfg.configured) {
    return {
      sent: false,
      sender: cfg.hrEmail,
      recipient: params.pocEmail,
      error: "SMTP is not configured on the server.",
    };
  }

  const refUrl = `${getSiteOrigin()}/ref-check/${encodeURIComponent(params.secureToken)}/`;
  const roleLabel = params.candidatePosition ? ` for ${params.candidatePosition}` : "";

  const html = renderDgsEmailHtml({
    kicker: "Human Resources • Confidential Reference Verification",
    title: `Employment Reference Request: ${params.candidateName}`,
    subtitle: `Dear ${params.pocName} (${params.pocDesignation}), we kindly request 2 minutes of your time to verify ${params.candidateName}'s employment with ${params.lastCompany}.`,
    statusBadge: {
      text: "CONFIDENTIAL",
      color: "#c4b5fd",
      bg: "#312e81",
    },
    sections: [
      {
        title: "Candidate Employment Claim to Verify",
        fields: [
          { label: "Candidate Full Name", value: params.candidateName },
          { label: "Organization", value: params.lastCompany },
          { label: "Last Stated Designation", value: params.lastDesignation },
          {
            label: "Stated Tenure",
            value: params.lastEmploymentDates || "Please verify during submission",
          },
          {
            label: "DGS Role Applied For",
            value: params.candidatePosition || "Hiring Assessment",
          },
        ],
      },
      {
        title: "Quick Verification Details",
        fields: [
          { label: "Point of Contact", value: `${params.pocName} — ${params.pocDesignation}` },
          {
            label: "Questionnaire Length",
            value: `${Math.min(10, params.questionsCount)} concise Yes/No & short-reply questions (< 2 mins)`,
          },
          { label: "HR Sender", value: cfg.hrEmail },
        ],
      },
    ],
    note: `Your candid feedback is strictly confidential and used solely by the D'Genius Solutions hiring team${roleLabel}. No account login or password is required—simply click the button below.`,
    ctaText: "Complete Reference Check Now",
    ctaUrl: refUrl,
  });

  const text = [
    `Dear ${params.pocName} (${params.pocDesignation}),`,
    "",
    `${params.candidateName} is under consideration for a position at D'Genius Solutions and referenced their prior employment at ${params.lastCompany} as ${params.lastDesignation} (${params.lastEmploymentDates || "recent tenure"}).`,
    "",
    `Please complete a short ${Math.min(10, params.questionsCount)}-question Yes/No reference verification form (under 2 minutes, strictly confidential) at:`,
    refUrl,
    "",
    "Thank you for your time and assistance.",
    `Human Resources Team — D'Genius Solutions (${cfg.hrEmail})`,
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort,
      secure: cfg.smtpSecure,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    });

    const info = await transporter.sendMail({
      from: cfg.fromHeader,
      replyTo: cfg.hrEmail,
      to: params.pocEmail,
      subject: `[Confidential] Reference Check for ${params.candidateName} (${params.lastCompany}) — D'Genius Solutions HR`,
      html,
      text,
    });

    return {
      sent: true,
      sender: cfg.hrEmail,
      recipient: params.pocEmail,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("[reference-email] Failed sending POC email:", err);
    return {
      sent: false,
      sender: cfg.hrEmail,
      recipient: params.pocEmail,
      error: err?.message || "SMTP send error",
    };
  }
}

export async function sendHrReferenceCompletedNotification(
  record: ReferenceCheckRecord
): Promise<EmailDispatchResult> {
  const cfg = getHrEmailConfig();
  const hrRecipient = (process.env.DGS_HR_EMAIL || getGlobalFormNotificationRecipient()).trim();
  if (!cfg.configured) {
    return { sent: false, sender: cfg.hrEmail, recipient: hrRecipient, error: "SMTP not configured" };
  }

  const feedback = record.comparison_feedback;
  const verdict = feedback?.overallVerdict || "SUBMITTED";
  const badgeColor =
    verdict === "VERIFIED_HIGH_CONFIDENCE"
      ? { bg: "#064e3b", color: "#6ee7b7", text: "VERIFIED" }
      : verdict === "MINOR_DISCREPANCY"
      ? { bg: "#78350f", color: "#fcd34d", text: "MINOR DISCREPANCY" }
      : { bg: "#7f1d1d", color: "#fca5a5", text: "RED FLAG" };

  const adminUrl = `${getSiteOrigin()}/admin/reference-checks/`;

  const html = renderDgsEmailHtml({
    kicker: "HR Reference Check Completed",
    title: `${record.candidate_name} — Feedback Received`,
    subtitle: `${record.poc_name} (${record.poc_designation} at ${record.last_company}) has submitted the reference verification.`,
    statusBadge: badgeColor,
    sections: [
      {
        title: "Comparison Summary (CV vs Referee Response)",
        fields: [
          { label: "Candidate", value: record.candidate_name },
          { label: "Last Company Checked", value: `${record.last_company} (${record.last_designation})` },
          { label: "Referee POC", value: `${record.poc_name} (${record.poc_email})` },
          { label: "Match Score", value: `${feedback?.matchScore ?? "--"}%` },
          {
            label: "Rehire Eligible",
            value: feedback?.rehireEligible === false ? "NO (Flagged)" : "Yes",
          },
          {
            label: "AI Discrepancy Feedback",
            value: feedback?.executiveSummary || "Submitted in CMS.",
          },
        ],
      },
    ],
    note: feedback?.recommendation || "Open DGS CMS Reference Checks to inspect the full question-by-question comparison.",
    ctaText: "View Full Feedback in CMS",
    ctaUrl: adminUrl,
  });

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort,
      secure: cfg.smtpSecure,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    });

    const info = await transporter.sendMail({
      from: cfg.fromHeader,
      replyTo: cfg.hrEmail,
      to: hrRecipient,
      subject: `[DGS HR] Reference Check Submitted: ${record.candidate_name} (${feedback?.matchScore ?? 0}% Match)`,
      html,
    });

    return {
      sent: true,
      sender: cfg.hrEmail,
      recipient: hrRecipient,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.warn("[reference-email] Failed notifying HR on completion:", err?.message || err);
    return {
      sent: false,
      sender: cfg.hrEmail,
      recipient: hrRecipient,
      error: err?.message || "SMTP error",
    };
  }
}
