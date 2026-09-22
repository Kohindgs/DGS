import nodemailer from "nodemailer";
import { renderDgsEmailHtml, type EmailSection } from "./email-template.ts";

function smtpConfigured() {
  return Boolean(
    process.env.DGS_SMTP_HOST &&
      process.env.DGS_SMTP_USER &&
      process.env.DGS_SMTP_PASSWORD,
  );
}

export type GoogleUpdateNotificationInput = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFORMATIONAL";
  summary: string;
  impactAnalysis: string;
  recommendedActions: string[];
  affectedDgsAreas: string[];
};

export async function sendGoogleUpdateAlertEmail(
  input: GoogleUpdateNotificationInput,
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

  const recipient =
    process.env.DGS_SEARCH_UPDATE_NOTIFICATION_TO ||
    "ankur.vishwakarma@dgeniussolutions.com";
  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER!;

  // Dynamic Subject: [DGS Search Alert] [CRITICAL] March 2026 Core Update Detected
  const subject = `[DGS Search Alert] [${input.severity}] ${input.title}`;

  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.dgeniussolutions.com";
  const cmsDashboardUrl = `${siteOrigin}/admin/search-updates/`;

  const badgeColors: Record<string, { color: string; bg: string }> = {
    CRITICAL: { color: "#ffffff", bg: "#dc2626" },
    HIGH: { color: "#ffffff", bg: "#ea580c" },
    MEDIUM: { color: "#ffffff", bg: "#2563eb" },
    INFORMATIONAL: { color: "#ffffff", bg: "#059669" },
  };

  const currentBadge = badgeColors[input.severity] || badgeColors.INFORMATIONAL;

  const sections: EmailSection[] = [
    {
      title: "Update Overview",
      fields: [
        { label: "Update Title", value: input.title },
        { label: "Category", value: input.category, isBadge: true, badgeColor: "#6366f1" },
        {
          label: "Severity",
          value: input.severity,
          isBadge: true,
          badgeColor: currentBadge.bg,
        },
        { label: "Detected / Published", value: input.publishedAt },
        {
          label: "Official Source",
          value: input.source,
          isLink: true,
          href: input.sourceUrl,
        },
      ],
    },
    {
      title: "Summary & Background",
      fields: [{ label: "Official Details", value: input.summary }],
    },
    {
      title: "DGS Impact Assessment",
      fields: [
        { label: "Analysis", value: input.impactAnalysis },
        {
          label: "Monitored Areas",
          value: input.affectedDgsAreas.join(", ") || "All Organic Properties",
        },
      ],
    },
    {
      title: "Safe Action Recommendations",
      fields: input.recommendedActions.map((action, idx) => ({
        label: `Action ${idx + 1}`,
        value: action,
      })),
    },
  ];

  const html = renderDgsEmailHtml({
    kicker: "GOOGLE SEARCH ALGORITHM ALERT",
    title: input.title,
    subtitle: `${input.category} &bull; ${input.source} &bull; Published ${input.publishedAt.slice(0, 10)}`,
    statusBadge: {
      text: input.severity,
      color: currentBadge.color,
      bg: currentBadge.bg,
    },
    sections,
    ctaText: "Open Search Updates in DGS CMS",
    ctaUrl: cmsDashboardUrl,
    secondaryCtaText: "View Official Source",
    secondaryCtaUrl: input.sourceUrl,
    note:
      "CRITICAL POLICY NOTICE: Automated modifications to ranking-protected pages, titles, H1s, or canonicals during active Google rollouts are STRICTLY PROHIBITED. All actions must follow the standard observation and verification protocol.",
  });

  const plainText = [
    `D'GENIUS SOLUTIONS — GOOGLE SEARCH UPDATE ALERT`,
    `==============================================`,
    `Severity: [${input.severity}]`,
    `Title: ${input.title}`,
    `Category: ${input.category}`,
    `Published: ${input.publishedAt}`,
    `Source: ${input.source} (${input.sourceUrl})`,
    "",
    "SUMMARY:",
    input.summary,
    "",
    "DGS IMPACT ASSESSMENT:",
    input.impactAnalysis,
    `Affected Areas: ${input.affectedDgsAreas.join(", ")}`,
    "",
    "SAFE ACTION RECOMMENDATIONS:",
    ...input.recommendedActions.map((a, i) => `  ${i + 1}. ${a}`),
    "",
    "POLICY NOTICE:",
    "Do NOT rewrite ranked content, H1s, titles, or canonicals during rollout. Observe ranking fluctuations first.",
    "",
    `DGS CMS Search Updates Dashboard: ${cmsDashboardUrl}`,
  ].join("\n");

  await transporter.sendMail({
    from,
    to: recipient,
    subject,
    text: plainText,
    html,
  });

  return { sent: true };
}
