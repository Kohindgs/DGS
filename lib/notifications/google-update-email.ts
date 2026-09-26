import nodemailer from "nodemailer";
import { renderDgsEmailHtml, type EmailSection } from "./email-template.ts";

export const DEFAULT_GOOGLE_UPDATE_RECIPIENTS: string[] = [
  "kohin@dgeniussolutions.com",
  "ankur.vishwakarma@dgeniussolutions.com",
];

export const DGS_ROLLOUT_SAFEGUARDS: string[] = [
  "STRICT POLICY: Do NOT automatically alter or rewrite ranked page copy, titles, or H1s during an active Google rollout.",
  "Do NOT modify, swap, or remove canonical tags across service or blog pages.",
  "Do NOT change page URLs, slugs, or redirect structures during the rollout window.",
  "Do NOT submit panic-driven backlink disavows or prune existing organic backlink profiles.",
  "Do NOT dismantle structured data schemas or JSON-LD markup in response to short-term SERP turbulence.",
];

export function getGoogleUpdateRecipients(): string[] {
  const envVal = process.env.DGS_SEARCH_UPDATE_NOTIFICATION_TO;
  if (!envVal || !envVal.trim()) {
    return [...DEFAULT_GOOGLE_UPDATE_RECIPIENTS];
  }
  const parsed = envVal
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [...DEFAULT_GOOGLE_UPDATE_RECIPIENTS];
}

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
  externalStatus?: "ACTIVE" | "COMPLETED" | "INVESTIGATING" | "RESOLVED" | null;
  incidentBegin?: string | null;
  incidentEnd?: string | null;
  whatChanged?: string;
  doNotChange?: string[];
  actionRequired?: string;
  monitoringWindow?: string;
  sourceEvidence?: string;
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

  const recipients = getGoogleUpdateRecipients();
  const recipientString = recipients.join(", ");
  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER!;

  // Dynamic Subject: [DGS Search Alert] [CRITICAL] March 2026 Core Update Detected
  const subject = `[DGS Search Alert] [${input.severity}] ${input.title}`;

  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.dgeniussolutions.com";
  const cmsDashboardUrl = `${siteOrigin}/admin/google-updates/`;

  const badgeColors: Record<string, { color: string; bg: string }> = {
    CRITICAL: { color: "#ffffff", bg: "#dc2626" },
    HIGH: { color: "#ffffff", bg: "#ea580c" },
    MEDIUM: { color: "#ffffff", bg: "#2563eb" },
    INFORMATIONAL: { color: "#ffffff", bg: "#059669" },
  };

  const currentBadge = badgeColors[input.severity] || badgeColors.INFORMATIONAL;
  const rolloutStatus = input.externalStatus || "ACTIVE";
  const rolloutBg =
    rolloutStatus === "ACTIVE"
      ? "#dc2626"
      : rolloutStatus === "COMPLETED"
      ? "#059669"
      : currentBadge.bg;

  const safeguards =
    input.doNotChange && input.doNotChange.length > 0
      ? input.doNotChange
      : DGS_ROLLOUT_SAFEGUARDS;

  const sections: EmailSection[] = [
    {
      title: "Update Overview",
      fields: [
        { label: "Update Title", value: input.title },
        { label: "Category", value: input.category, isBadge: true, badgeColor: "#6366f1" },
        {
          label: "Rollout Status",
          value: rolloutStatus,
          isBadge: true,
          badgeColor: rolloutBg,
        },
        {
          label: "Severity",
          value: input.severity,
          isBadge: true,
          badgeColor: currentBadge.bg,
        },
        { label: "Detected / Published", value: input.publishedAt },
        {
          label: "Rollout Window",
          value: input.incidentBegin
            ? `${input.incidentBegin.slice(0, 10)} — ${input.incidentEnd ? input.incidentEnd.slice(0, 10) : "Active (In Progress)"}`
            : input.publishedAt.slice(0, 10),
        },
        {
          label: "Official Source",
          value: input.source,
          isLink: true,
          href: input.sourceUrl,
        },
      ],
    },
    {
      title: "What Changed (Official Summary)",
      fields: [
        {
          label: "Official Explanation",
          value: input.whatChanged || input.summary,
        },
      ],
    },
    {
      title: "DGS Impact Assessment",
      fields: [
        { label: "Potential Impact", value: input.impactAnalysis },
        {
          label: "Action Required",
          value:
            input.actionRequired ||
            "Maintain current ranking baseline; observe search metrics during the rollout window.",
        },
        {
          label: "Monitoring Window",
          value:
            input.monitoringWindow ||
            "14-day pre-rollout baseline + rollout duration + 14-day post-rollout stabilization.",
        },
        {
          label: "Monitored Areas",
          value:
            input.affectedDgsAreas.join(", ") ||
            "All Organic Properties (Homepage, Services, Blogs, Brand Queries)",
        },
      ],
    },
    {
      title: "What DGS Should NOT Change (Safeguards)",
      fields: safeguards.map((rule, idx) => ({
        label: `Safeguard ${idx + 1}`,
        value: rule,
      })),
    },
    {
      title: "Safe Action Recommendations",
      fields: input.recommendedActions.map((action, idx) => ({
        label: `Action ${idx + 1}`,
        value: action,
      })),
    },
    {
      title: "Google Search Console Monitoring Protocol",
      fields: [
        {
          label: "Performance Metrics",
          value:
            "Monitor daily Clicks, Impressions, CTR, and Average Position across Google Search Console.",
        },
        {
          label: "Causation Standard",
          value:
            "Distinguish normal day-to-day rank variance from true update correlation. Label observed shifts as 'Change observed during rollout', not definitive causation, until verified across the full 14-day post-rollout baseline.",
        },
        {
          label: "Protected Brand Queries",
          value:
            "Ensure 'dgenius solutions' brand queries remain anchored to the Homepage (/) as PRIMARY.",
        },
      ],
    },
  ];

  const html = renderDgsEmailHtml({
    kicker: "GOOGLE SEARCH ALGORITHM ALERT",
    title: input.title,
    subtitle: `${input.category} &bull; ${input.source} &bull; Published ${input.publishedAt.slice(0, 10)}`,
    statusBadge: {
      text: rolloutStatus,
      color: "#ffffff",
      bg: rolloutBg,
    },
    sections,
    ctaText: "Open Google Updates in DGS CMS",
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
    `Rollout Status: [${rolloutStatus}]`,
    `Title: ${input.title}`,
    `Category: ${input.category}`,
    `Published: ${input.publishedAt}`,
    `Source: ${input.source} (${input.sourceUrl})`,
    "",
    "WHAT CHANGED:",
    input.whatChanged || input.summary,
    "",
    "DGS IMPACT ASSESSMENT:",
    input.impactAnalysis,
    `Action Required: ${input.actionRequired || "Maintain current baseline; observe metrics."}`,
    `Monitoring Window: ${input.monitoringWindow || "14-day pre/post rollout window"}`,
    `Affected Areas: ${input.affectedDgsAreas.join(", ")}`,
    "",
    "WHAT DGS SHOULD NOT CHANGE (SAFEGUARDS):",
    ...safeguards.map((s, i) => `  ${i + 1}. ${s}`),
    "",
    "SAFE ACTION RECOMMENDATIONS:",
    ...input.recommendedActions.map((a, i) => `  ${i + 1}. ${a}`),
    "",
    "GSC OBSERVATION GUIDANCE:",
    "- Track daily Clicks, Impressions, CTR, and Position.",
    "- Distinguish normal day-to-day rank variance from update correlation.",
    "- Do NOT claim update causation without 14-day post-rollout verification.",
    "",
    `DGS CMS Google Updates Dashboard: ${cmsDashboardUrl}`,
  ].join("\n");

  const info = await transporter.sendMail({
    from,
    to: recipients,
    subject,
    text: plainText,
    html,
  });

  return {
    sent: true,
    recipient: recipientString,
    recipients,
    messageId: info.messageId,
    accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : recipients,
  };
}

export async function sendTestGoogleUpdateEmail(actorEmail?: string): Promise<{
  sent: boolean;
  recipient?: string;
  recipients?: string[];
  timestamp?: string;
  accepted?: string[];
  messageId?: string;
  error?: string;
}> {
  if (!smtpConfigured()) {
    return {
      sent: false,
      error: "SMTP is not configured on server (missing DGS_SMTP_HOST, DGS_SMTP_USER, or DGS_SMTP_PASSWORD)",
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

  const defaultRecipients = getGoogleUpdateRecipients();
  const recipients =
    actorEmail && !defaultRecipients.includes(actorEmail)
      ? [...defaultRecipients, actorEmail]
      : defaultRecipients;
  const recipientString = recipients.join(", ");
  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER!;
  const timestamp = new Date().toISOString();

  const html = renderDgsEmailHtml({
    kicker: "TEST NOTIFICATION — GOOGLE UPDATE MONITOR",
    title: "[DGS TEST ALERT] Google Search Update Monitor Operational Verification",
    subtitle: `Dispatched by ${actorEmail || "Administrator"} · ${timestamp}`,
    statusBadge: {
      text: "TEST VERIFIED",
      color: "#ffffff",
      bg: "#059669",
    },
    sections: [
      {
        title: "Test Alert Overview",
        fields: [
          { label: "Notification Type", value: "TEST_ALERT", isBadge: true, badgeColor: "#059669" },
          { label: "Channel", value: "Transactional SMTP Delivery" },
          { label: "Sender", value: from },
          { label: "Configured Recipients", value: recipientString },
          { label: "Timestamp", value: timestamp },
        ],
      },
      {
        title: "Scheduler & Telemetry Pipeline",
        fields: [
          { label: "Scheduler Cadence", value: "Every 3 hours (17 */3 * * *)" },
          { label: "Scheduler Branch", value: "main" },
          { label: "Official Sources", value: "Google Search Status Dashboard, Search Central Blog, Documentation Updates RSS" },
          { label: "Alert Notification Targets", value: "kohin@dgeniussolutions.com, ankur.vishwakarma@dgeniussolutions.com" },
        ],
      },
      {
        title: "DGS Rollout Safeguards Policy",
        fields: DGS_ROLLOUT_SAFEGUARDS.map((rule, idx) => ({
          label: `Safeguard ${idx + 1}`,
          value: rule,
        })),
      },
    ],
    ctaText: "Open Google Updates in CMS",
    ctaUrl: "https://www.dgeniussolutions.com/admin/google-updates/",
    note: "This is a verified test email sent on behalf of the DGS Admin team to confirm operational SMTP readiness. No real update record was created.",
  });

  const info = await transporter.sendMail({
    from,
    to: recipients,
    subject: `[DGS TEST ALERT] Google Update Monitor Live Delivery Verification`,
    text: `DGS Google Update Monitor Test Alert\nTimestamp: ${timestamp}\nRecipients: ${recipientString}\nStatus: Verified operational.`,
    html,
  });

  return {
    sent: true,
    recipient: recipientString,
    recipients,
    timestamp,
    accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : recipients,
    messageId: info.messageId,
  };
}
