import nodemailer from "nodemailer";
import type { FormDefinition } from "@/lib/forms/types";
import { renderDgsEmailHtml, type EmailSection } from "./email-template.ts";

function configured() {
  return Boolean(
    process.env.DGS_SMTP_HOST &&
      process.env.DGS_SMTP_USER &&
      process.env.DGS_SMTP_PASSWORD,
  );
}

export async function sendNativeFormNotification(input: {
  definition: FormDefinition;
  route: string;
  fields: Record<string, string>;
  leadId?: string;
}) {
  if (!configured()) return { sent: false, reason: "smtp-not-configured" };

  const transporter = nodemailer.createTransport({
    host: process.env.DGS_SMTP_HOST,
    port: Number(process.env.DGS_SMTP_PORT || 587),
    secure: process.env.DGS_SMTP_SECURE === "true",
    auth: {
      user: process.env.DGS_SMTP_USER,
      pass: process.env.DGS_SMTP_PASSWORD,
    },
  });

  const recipient =
    process.env.DGS_FORM_NOTIFICATION_TO ||
    process.env.DGS_CAREER_NOTIFICATION_TO ||
    process.env.DGS_SMTP_USER!;

  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER!;
  const replyTo = input.fields.email || undefined;

  // Extract contact fields
  const submitterName =
    input.fields.name ||
    input.fields.full_name ||
    input.fields.your_name ||
    input.fields.first_name
      ? `${input.fields.first_name || ""} ${input.fields.last_name || ""}`.trim()
      : "New Lead";
  const submitterEmail = input.fields.email || "";
  const submitterPhone = input.fields.phone || input.fields.mobile || "";
  const submitterCompany =
    input.fields.company ||
    input.fields.organization ||
    input.fields.company_name ||
    input.fields.website ||
    "";

  // Dynamic Subject: [DGS Lead] SEO Audit — Rahul Mehta — ABC Pvt Ltd
  const companySnippet = submitterCompany ? ` — ${submitterCompany}` : "";
  const nameSnippet = submitterName && submitterName !== "New Lead" ? ` — ${submitterName}` : "";
  const subject = `[DGS Lead] ${input.definition.title}${nameSnippet}${companySnippet}`;

  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.dgeniussolutions.com";
  const cmsLeadUrl = `${siteOrigin}/admin/leads/`;

  // Filter visible fields
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

  const sections: EmailSection[] = [
    {
      title: "Lead Overview",
      fields: [
        { label: "Form Title", value: input.definition.title, isBadge: true, badgeColor: "#4f46e5" },
        { label: "Submitted From Page", value: input.route, isLink: true, href: `${siteOrigin}${input.route}` },
        ...(submitterName ? [{ label: "Contact Name", value: submitterName }] : []),
        ...(submitterEmail ? [{ label: "Email Address", value: submitterEmail, isLink: true, href: `mailto:${submitterEmail}` }] : []),
        ...(submitterPhone ? [{ label: "Phone Number", value: submitterPhone, isLink: true, href: `tel:${submitterPhone}` }] : []),
        ...(submitterCompany ? [{ label: "Company / Website", value: submitterCompany }] : []),
      ],
    },
    {
      title: "Submitted Form Data",
      fields: visibleFields,
    },
  ];

  const html = renderDgsEmailHtml({
    kicker: "NEW BUSINESS LEAD",
    title: input.definition.title,
    subtitle: `${submitterName}${submitterCompany ? ` &bull; ${submitterCompany}` : ""} &bull; ${input.route}`,
    statusBadge: {
      text: "NEW LEAD",
      color: "#ffffff",
      bg: "#10b981",
    },
    sections,
    ctaText: "View Lead in DGS CMS",
    ctaUrl: cmsLeadUrl,
    note: "Submitted through native DGS form submission system. Stored in MySQL CMS Leads table.",
  });

  const plainTextLines = input.definition.fields
    .filter((field) => !field.hidden && field.type !== "captcha")
    .map((field) => `${field.label}: ${input.fields[field.name] || ""}`);

  const plainText = [
    `D'GENIUS SOLUTIONS — NEW BUSINESS LEAD`,
    `=====================================`,
    `Form: ${input.definition.title}`,
    `Page: ${input.route}`,
    `Lead: ${submitterName}`,
    `Email: ${submitterEmail}`,
    `Phone: ${submitterPhone}`,
    `Company: ${submitterCompany}`,
    "",
    "SUBMISSION DETAILS:",
    "-------------------",
    ...plainTextLines,
    "",
    `CMS Lead Inbox: ${cmsLeadUrl}`,
  ].join("\n");

  await transporter.sendMail({
    from,
    to: recipient,
    replyTo,
    subject,
    text: plainText,
    html,
  });

  return { sent: true };
}
