import nodemailer from "nodemailer";
import type { FormDefinition } from "../forms/types.ts";
import { renderDgsEmailHtml, type EmailSection } from "./email-template.ts";
import { extractLeadContactFields, type NormalizedContact } from "../forms/contact-fields.ts";
import { getGlobalFormNotificationRecipient } from "./config.ts";

function configured() {
  return Boolean(
    process.env.DGS_SMTP_HOST &&
      process.env.DGS_SMTP_USER &&
      process.env.DGS_SMTP_PASSWORD,
  );
}

export type NativeFormNotificationResult = {
  sent: boolean;
  recipient?: string;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  reason?: string;
  error?: string;
};

export async function sendNativeFormNotification(input: {
  definition: FormDefinition;
  route: string;
  fields: Record<string, string>;
  leadId?: string;
  submissionId?: string;
  contact?: NormalizedContact;
  pageUrl?: string;
  utm?: Record<string, string>;
}): Promise<NativeFormNotificationResult> {
  const recipient = getGlobalFormNotificationRecipient();

  if (!configured()) {
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

  // Extract contact fields
  const contact = input.contact || extractLeadContactFields(input.definition, input.fields);
  const submitterName = contact.name || "New Lead";
  const submitterEmail = contact.email || "";
  const submitterPhone = contact.phone || "";
  const submitterCompany = contact.company || "";
  const replyTo = submitterEmail || undefined;

  // Company snippet for subject
  const companySnippet = submitterCompany ? ` — ${submitterCompany}` : "";
  const nameSnippet = submitterName && submitterName !== "New Lead" ? ` — ${submitterName}` : "";

  // Dynamic Subject Line generation (Section 10 requirement)
  let subjectPrefix = "[DGS Lead]";
  let formSubjectTitle = input.definition.title;

  const routeClean = (input.route || "").toLowerCase().replace(/\/+$/, "");
  const subjectField = (input.fields.subject || "").toLowerCase();

  if (routeClean === "/contact-us") {
    subjectPrefix = "[DGS Contact]";
    formSubjectTitle = "Contact Form";
  } else if (
    Number(input.definition.fluentFormId) === 1 &&
    (subjectField.includes("let's talk") || subjectField.includes("lets talk") || routeClean === "" || routeClean === "/")
  ) {
    subjectPrefix = "[DGS Lead]";
    formSubjectTitle = "Let's Talk";
  }

  const subject = `${subjectPrefix} ${formSubjectTitle}${nameSnippet}${companySnippet}`;

  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.dgeniussolutions.com";
  const cmsLeadUrl = input.leadId
    ? `${siteOrigin}/admin/leads/?leadId=${input.leadId}`
    : `${siteOrigin}/admin/leads/`;

  const submissionDateIso = new Date().toISOString();
  const submissionDateFormatted = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const sourcePageUrl = input.pageUrl || `${siteOrigin}${input.route}`;

  // Filter visible submitted fields
  const visibleFields = input.definition.fields
    .filter((field) => !field.hidden && field.type !== "captcha")
    .map((field) => ({
      label: field.label,
      value: input.fields[field.name] || "—",
      isLink: field.type === "email" || field.type === "url",
      href:
        field.type === "email"
          ? `mailto:${input.fields[field.name]}`
          : input.fields[field.name],
    }));

  // Build metadata fields
  const metadataFields = [
    { label: "Form Title", value: input.definition.title, isBadge: true, badgeColor: "#4f46e5" },
    { label: "Form Key / ID", value: `${input.definition.key} (ID: ${input.definition.fluentFormId})` },
    ...(input.submissionId ? [{ label: "Submission ID", value: input.submissionId }] : []),
    ...(input.leadId ? [{ label: "Lead ID", value: input.leadId }] : []),
    { label: "Submitted Page URL", value: sourcePageUrl, isLink: true, href: sourcePageUrl },
    { label: "Route", value: input.route },
    { label: "Submission Date (IST)", value: `${submissionDateFormatted} (${submissionDateIso})` },
    { label: "Recipient Inbox", value: recipient, isBadge: true, badgeColor: "#059669" },
  ];

  // Include UTM metadata if present
  if (input.utm && Object.keys(input.utm).length > 0) {
    for (const [utmKey, utmVal] of Object.entries(input.utm)) {
      if (utmVal) {
        metadataFields.push({
          label: `UTM ${utmKey.toUpperCase()}`,
          value: utmVal,
        });
      }
    }
  }

  const sections: EmailSection[] = [
    {
      title: "Lead Contact Information",
      fields: [
        ...(submitterName ? [{ label: "Contact Name", value: submitterName }] : []),
        ...(submitterEmail ? [{ label: "Email Address", value: submitterEmail, isLink: true, href: `mailto:${submitterEmail}` }] : []),
        ...(submitterPhone ? [{ label: "Phone Number", value: submitterPhone, isLink: true, href: `tel:${submitterPhone}` }] : []),
        ...(submitterCompany ? [{ label: "Company / Organization", value: submitterCompany }] : []),
      ],
    },
    {
      title: "Submitted Form Data",
      fields: visibleFields,
    },
    {
      title: "Source & Attribution Metadata",
      fields: metadataFields,
    },
  ];

  const html = renderDgsEmailHtml({
    kicker: "NEW INBOUND INQUIRY",
    title: `${formSubjectTitle}`,
    subtitle: `${submitterName}${submitterCompany ? ` &bull; ${submitterCompany}` : ""} &bull; ${input.route}`,
    statusBadge: {
      text: "NEW LEAD",
      color: "#ffffff",
      bg: "#10b981",
    },
    sections,
    ctaText: "View Lead in DGS CMS",
    ctaUrl: cmsLeadUrl,
    note: "Submitted through native DGS form submission system. Saved in MariaDB CMS leads & form_submissions tables before dispatch.",
  });

  const plainTextLines = input.definition.fields
    .filter((field) => !field.hidden && field.type !== "captcha")
    .map((field) => `${field.label}: ${input.fields[field.name] || ""}`);

  const plainText = [
    `D'GENIUS SOLUTIONS — INBOUND FORM NOTIFICATION`,
    `==============================================`,
    `Subject: ${subject}`,
    `Form: ${input.definition.title} (${input.definition.key})`,
    `Page: ${sourcePageUrl}`,
    `Date: ${submissionDateFormatted} IST`,
    `Recipient: ${recipient} (KOHIN ONLY - ZERO CC/BCC)`,
    "",
    "CONTACT INFORMATION:",
    "--------------------",
    `Name: ${submitterName}`,
    `Email: ${submitterEmail}`,
    `Phone: ${submitterPhone}`,
    `Company: ${submitterCompany}`,
    "",
    "SUBMISSION DETAILS:",
    "-------------------",
    ...plainTextLines,
    "",
    input.submissionId ? `Submission ID: ${input.submissionId}` : "",
    input.leadId ? `Lead ID: ${input.leadId}` : "",
    input.utm && Object.keys(input.utm).length > 0
      ? `UTMs: ${JSON.stringify(input.utm)}`
      : "",
    "",
    `CMS Lead Inbox: ${cmsLeadUrl}`,
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
      replyTo,
      subject,
      text: plainText,
      html,
    });

    return {
      sent: true,
      recipient,
      messageId: info.messageId,
      accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : [recipient],
      rejected: Array.isArray(info.rejected) ? info.rejected.map(String) : [],
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[form-email] Failed to dispatch email notification to ${recipient}:`, errMsg);
    return {
      sent: false,
      recipient,
      reason: "smtp-send-error",
      error: errMsg,
    };
  }
}
