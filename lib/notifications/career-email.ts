import path from "node:path";
import nodemailer from "nodemailer";
import { renderDgsEmailHtml, type EmailSection } from "./email-template.ts";
import { getGlobalFormNotificationRecipient } from "./config.ts";

function smtpConfigured() {
  return Boolean(
    process.env.DGS_SMTP_HOST &&
      process.env.DGS_SMTP_USER &&
      process.env.DGS_SMTP_PASSWORD,
  );
}

export type CareerApplicationNotificationInput = {
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  company?: string;
  experience: string;
  currentSalary?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  education?: string;
  portfolioUrl?: string;
  resumeName: string;
  resumeBuffer?: Buffer;
  resumeMimeType?: string;
  portfolioName?: string;
  portfolioBuffer?: Buffer;
  portfolioMimeType?: string;
  leadId?: string;
  submissionId?: string;
  route?: string;
};

export type CareerApplicationNotificationResult = {
  sent: boolean;
  recipient?: string;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  attachmentsCount?: number;
  combinedSizeBytes?: number;
  reason?: string;
  error?: string;
};

function safeFileNamePart(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "Candidate";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function sendCareerApplicationEmail(
  input: CareerApplicationNotificationInput,
): Promise<CareerApplicationNotificationResult> {
  const recipient = getGlobalFormNotificationRecipient();

  if (!smtpConfigured()) {
    return {
      sent: false,
      recipient,
      reason: "smtp-not-configured",
      error: "SMTP environment variables are not configured",
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.DGS_SMTP_HOST,
    port: Number(process.env.DGS_SMTP_PORT || 587),
    secure: process.env.DGS_SMTP_SECURE === "true",
    auth: {
      user: process.env.DGS_SMTP_USER,
      pass: process.env.DGS_SMTP_PASSWORD,
    },
  });

  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER!;
  const candidatePrefix = safeFileNamePart(input.name);

  // Dynamic Subject: [DGS Career] Job Application — Priya Shah — Generative AI Artist (Section 10)
  const expSnippet = input.experience ? ` (${input.experience})` : "";
  const subject = `[DGS Career] Job Application — ${input.name} — ${input.position}${expSnippet}`;

  // Attachment sizing & strategy (10 MB safe gateway limit)
  const MAX_COMBINED_ATTACH_BYTES = 10 * 1024 * 1024;
  const resumeSize = input.resumeBuffer?.length || 0;
  const portfolioSize = input.portfolioBuffer?.length || 0;
  const combinedSize = resumeSize + portfolioSize;

  const attachments: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }> = [];

  let largeFileNotice = "";
  const resumeExt = path.extname(input.resumeName) || ".pdf";
  const resumeAttachName = `${candidatePrefix}-CV${resumeExt}`;

  if (combinedSize <= MAX_COMBINED_ATTACH_BYTES) {
    if (input.resumeBuffer) {
      attachments.push({
        filename: resumeAttachName,
        content: input.resumeBuffer,
        contentType: input.resumeMimeType || "application/pdf",
      });
    }
    if (input.portfolioBuffer && input.portfolioName) {
      const portExt = path.extname(input.portfolioName) || ".pdf";
      attachments.push({
        filename: `${candidatePrefix}-Portfolio${portExt}`,
        content: input.portfolioBuffer,
        contentType: input.portfolioMimeType || "application/pdf",
      });
    }
  } else {
    // Large file handling: attach resume if within limit, link portfolio
    if (input.resumeBuffer && resumeSize <= MAX_COMBINED_ATTACH_BYTES) {
      attachments.push({
        filename: resumeAttachName,
        content: input.resumeBuffer,
        contentType: input.resumeMimeType || "application/pdf",
      });
    }
    largeFileNotice = `Note: The combined attachments (${formatBytes(
      combinedSize,
    )}) exceeded the 10 MB email gateway limit. Files are securely archived and accessible in the DGS CMS Lead Inbox.`;
  }

  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.dgeniussolutions.com";
  const cmsLeadUrl = `${siteOrigin}/admin/hr-pipeline/`;
  const resumeDownloadUrl = input.leadId
    ? `${siteOrigin}/api/admin/leads/${input.leadId}/resume`
    : undefined;
  const portfolioDownloadUrl = input.leadId && input.portfolioName
    ? `${siteOrigin}/api/admin/leads/${input.leadId}/portfolio`
    : undefined;

  const submissionDateIso = new Date().toISOString();
  const submissionDateFormatted = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  // Build structured sections for the DGS branded email template
  const sections: EmailSection[] = [
    {
      title: "Candidate Information",
      fields: [
        { label: "Full Name", value: input.name },
        { label: "Email Address", value: input.email, isLink: true, href: `mailto:${input.email}` },
        { label: "Phone Number", value: input.phone, isLink: true, href: `tel:${input.phone}` },
        { label: "Current Location", value: input.location },
        { label: "Current Company", value: input.company || "Not provided / Fresher" },
        { label: "Highest Education", value: input.education || "Not specified" },
      ],
    },
    {
      title: "Application Details",
      fields: [
        { label: "Applied Position", value: input.position, isBadge: true, badgeColor: "#7928ca" },
        { label: "Relevant Experience", value: input.experience },
        { label: "Current Monthly Salary", value: input.currentSalary || "Not disclosed" },
        { label: "Expected Monthly Salary", value: input.expectedSalary || "Negotiable" },
        { label: "Notice Period", value: input.noticePeriod || "Immediate" },
      ],
    },
  ];

  // Creative Requirement / Portfolio section
  if (input.portfolioUrl || input.portfolioName) {
    const portfolioFields = [];
    if (input.portfolioUrl) {
      portfolioFields.push({
        label: "Portfolio URL",
        value: input.portfolioUrl,
        isLink: true,
        href: input.portfolioUrl,
      });
    }
    if (input.portfolioName) {
      portfolioFields.push({
        label: "Portfolio Document",
        value: `${input.portfolioName} (${formatBytes(portfolioSize)}) ${
          attachments.some((a) => a.filename.includes("Portfolio"))
            ? "— Attached as PDF"
            : portfolioDownloadUrl
            ? "— Download from CMS link below"
            : ""
        }`,
        isLink: Boolean(portfolioDownloadUrl),
        href: portfolioDownloadUrl,
      });
    }
    sections.push({
      title: "Creative Requirement / Portfolio",
      fields: portfolioFields,
    });
  }

  // Attachments section
  const attachmentFields = [
    {
      label: "Candidate CV",
      value: `${input.resumeName} (${formatBytes(resumeSize)}) ${
        attachments.some((a) => a.filename.includes("CV"))
          ? "— Attached to email"
          : resumeDownloadUrl
          ? "— Download from CMS link below"
          : ""
      }`,
      isLink: Boolean(resumeDownloadUrl),
      href: resumeDownloadUrl,
    },
  ];
  if (input.portfolioName) {
    attachmentFields.push({
      label: "Candidate Portfolio",
      value: `${input.portfolioName} (${formatBytes(portfolioSize)}) ${
        attachments.some((a) => a.filename.includes("Portfolio"))
          ? "— Attached to email"
          : portfolioDownloadUrl
          ? "— Download from CMS link below"
          : ""
      }`,
      isLink: Boolean(portfolioDownloadUrl),
      href: portfolioDownloadUrl,
    });
  }
  sections.push({
    title: "Document Attachments",
    fields: attachmentFields,
  });

  // Source Metadata Section (Section 11)
  sections.push({
    title: "Application & Source Metadata",
    fields: [
      { label: "Form Title", value: "Career Job Application", isBadge: true, badgeColor: "#7928ca" },
      ...(input.submissionId ? [{ label: "Submission ID", value: input.submissionId }] : []),
      ...(input.leadId ? [{ label: "Lead ID", value: input.leadId }] : []),
      { label: "Source Route", value: input.route || "/career/" },
      { label: "Submission Date (IST)", value: `${submissionDateFormatted} (${submissionDateIso})` },
      { label: "Recipient Inbox", value: recipient, isBadge: true, badgeColor: "#059669" },
    ],
  });

  const html = renderDgsEmailHtml({
    kicker: "NEW CAREER APPLICATION",
    title: input.position,
    subtitle: `${input.name} &bull; ${input.experience} &bull; ${input.location}`,
    statusBadge: {
      text: "RECRUITMENT INBOX",
      color: "#ffffff",
      bg: "#7928ca",
    },
    sections,
    ctaText: "View Candidate in DGS CMS",
    ctaUrl: cmsLeadUrl,
    secondaryCtaText: resumeDownloadUrl ? "Download CV" : undefined,
    secondaryCtaUrl: resumeDownloadUrl,
    note:
      largeFileNotice ||
      "Confidential candidate submission. Candidate documents are stored in private protected storage. Recipient routed exclusively to Kohin.",
  });

  const plainText = [
    `D'GENIUS SOLUTIONS — NEW CAREER APPLICATION`,
    `=============================================`,
    `Subject: ${subject}`,
    `Recipient: ${recipient} (KOHIN ONLY - ZERO CC/BCC)`,
    `Date: ${submissionDateFormatted} IST`,
    `Position: ${input.position}`,
    `Candidate: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Location: ${input.location}`,
    `Company: ${input.company || "Not provided"}`,
    `Education: ${input.education || "Not specified"}`,
    `Experience: ${input.experience}`,
    `Current Salary: ${input.currentSalary || "Not disclosed"}`,
    `Expected Salary: ${input.expectedSalary || "Negotiable"}`,
    `Notice Period: ${input.noticePeriod || "Immediate"}`,
    "",
    input.portfolioUrl ? `Portfolio URL: ${input.portfolioUrl}` : "",
    input.portfolioName ? `Portfolio File: ${input.portfolioName} (${formatBytes(portfolioSize)})` : "",
    `Resume File: ${input.resumeName} (${formatBytes(resumeSize)})`,
    "",
    input.submissionId ? `Submission ID: ${input.submissionId}` : "",
    input.leadId ? `Lead ID: ${input.leadId}` : "",
    `CMS Lead Inbox: ${cmsLeadUrl}`,
    resumeDownloadUrl ? `Download CV: ${resumeDownloadUrl}` : "",
    portfolioDownloadUrl ? `Download Portfolio: ${portfolioDownloadUrl}` : "",
    largeFileNotice ? `\n${largeFileNotice}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const info = await transporter.sendMail({
      from,
      to: recipient,
      // Strictly zero CC and zero BCC per P0 requirement
      cc: undefined,
      bcc: undefined,
      replyTo: input.email,
      subject,
      text: plainText,
      html,
      attachments,
    });

    return {
      sent: true,
      recipient,
      messageId: info.messageId,
      accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : [recipient],
      rejected: Array.isArray(info.rejected) ? info.rejected.map(String) : [],
      attachmentsCount: attachments.length,
      combinedSizeBytes: combinedSize,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[career-email] Failed to dispatch career application email to ${recipient}:`, errMsg);
    return {
      sent: false,
      recipient,
      reason: "smtp-send-error",
      error: errMsg,
      attachmentsCount: attachments.length,
      combinedSizeBytes: combinedSize,
    };
  }
}
