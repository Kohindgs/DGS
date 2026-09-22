import path from "node:path";
import nodemailer from "nodemailer";
import { renderDgsEmailHtml, type EmailSection } from "./email-template.ts";

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
) {
  if (!smtpConfigured()) return { sent: false, reason: "smtp-not-configured" };

  const transporter = nodemailer.createTransport({
    host: process.env.DGS_SMTP_HOST,
    port: Number(process.env.DGS_SMTP_PORT || 587),
    secure: process.env.DGS_SMTP_SECURE === "true",
    auth: {
      user: process.env.DGS_SMTP_USER,
      pass: process.env.DGS_SMTP_PASSWORD,
    },
  });

  const to =
    process.env.DGS_CAREER_NOTIFICATION_TO || "hr@dgeniussolutions.com";
  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER!;
  const candidatePrefix = safeFileNamePart(input.name);

  // Dynamic Subject: [DGS Careers] Generative AI Artist — Priya Shah — 2 Years Experience
  const expSnippet = input.experience ? ` — ${input.experience}` : "";
  const subject = `[DGS Careers] ${input.position} — ${input.name}${expSnippet}`;

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
  const cmsLeadUrl = `${siteOrigin}/admin/leads/`;
  const resumeDownloadUrl = input.leadId
    ? `${siteOrigin}/api/admin/leads/${input.leadId}/resume`
    : undefined;
  const portfolioDownloadUrl = input.leadId && input.portfolioName
    ? `${siteOrigin}/api/admin/leads/${input.leadId}/portfolio`
    : undefined;

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
      "Confidential candidate submission. Candidate documents are stored in private protected storage.",
  });

  const plainText = [
    `D'GENIUS SOLUTIONS — NEW CAREER APPLICATION`,
    `=============================================`,
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
    `CMS Lead Inbox: ${cmsLeadUrl}`,
    resumeDownloadUrl ? `Download CV: ${resumeDownloadUrl}` : "",
    portfolioDownloadUrl ? `Download Portfolio: ${portfolioDownloadUrl}` : "",
    largeFileNotice ? `\n${largeFileNotice}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from,
    to,
    replyTo: input.email,
    subject,
    text: plainText,
    html,
    attachments,
  });

  return {
    sent: true,
    attachmentsCount: attachments.length,
    combinedSizeBytes: combinedSize,
  };
}
