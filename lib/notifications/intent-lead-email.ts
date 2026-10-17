import nodemailer from "nodemailer";
import { renderDgsEmailHtml, type EmailSection } from "./email-template";
import { formatAuditDate } from "../utils/date";
import { getGoogleUpdateRecipients } from "./google-update-email";

function smtpConfigured() {
  return Boolean(
    process.env.DGS_SMTP_HOST &&
      process.env.DGS_SMTP_USER &&
      process.env.DGS_SMTP_PASSWORD,
  );
}

export type IntentLeadEmailItem = {
  id: string;
  sourcePlatform: string;
  postUrl: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  serviceCategory: string;
  targetRegion: string;
  intentScore: number;
  urgencyLevel: string;
  postSnippet: string;
  aiReasoning: string;
  suggestedReply: string;
  recommendedDgsUrl: string;
};

export async function sendIntentLeadsDigestEmail(input: {
  runType: string;
  leads: IntentLeadEmailItem[];
  totalChecked: number;
}): Promise<{ sent: boolean; messageId?: string; reason?: string }> {
  if (!smtpConfigured()) {
    return { sent: false, reason: "smtp-not-configured" };
  }

  if (!input.leads || input.leads.length === 0) {
    return { sent: false, reason: "no-qualified-leads" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.DGS_SMTP_HOST,
    port: Number(process.env.DGS_SMTP_PORT || 587),
    secure: process.env.DGS_SMTP_SECURE === "true",
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: process.env.DGS_SMTP_USER,
      pass: process.env.DGS_SMTP_PASSWORD,
    },
  });

  const recipients = getGoogleUpdateRecipients();
  const recipientString = recipients.join(", ");
  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER!;

  const topLead = input.leads[0];
  const subject = `[DGS Buyer-Intent Leads] ${input.leads.length} New Qualified Prospect${input.leads.length > 1 ? "s" : ""} (${topLead.serviceCategory} • ${topLead.sourcePlatform})`;

  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.dgeniussolutions.com";
  const dashboardUrl = `${siteOrigin}/admin/intent-leads/`;

  const sections: EmailSection[] = [
    {
      title: "Discovery Digest Overview",
      fields: [
        {
          label: "Qualified Buyer Leads",
          value: `${input.leads.length} High-Intent Prospect${input.leads.length > 1 ? "s" : ""}`,
          isBadge: true,
          badgeColor: "#059669",
        },
        {
          label: "Discovery Trigger",
          value: input.runType.toUpperCase(),
        },
        {
          label: "Candidates Evaluated",
          value: `${input.totalChecked} posts / threads analyzed (Job seekers & competing agency promotions filtered out)`,
        },
        {
          label: "Detected At",
          value: formatAuditDate(new Date()),
        },
      ],
    },
  ];

  for (let i = 0; i < Math.min(input.leads.length, 6); i++) {
    const item = input.leads[i];
    const badgeColor =
      item.intentScore >= 85
        ? "#dc2626"
        : item.intentScore >= 70
          ? "#ea580c"
          : "#2563eb";

    sections.push({
      title: `#${i + 1} [${item.serviceCategory}] ${item.authorName || "Active Buyer"} (${item.sourcePlatform})`,
      fields: [
        {
          label: "Buyer Intent Score",
          value: `${item.intentScore}/100 (${item.urgencyLevel} URGENCY)`,
          isBadge: true,
          badgeColor,
        },
        {
          label: "Prospect / Author",
          value: [item.authorName, item.authorRole, item.companyName]
            .filter(Boolean)
            .join(" • ") || "View on source platform",
        },
        {
          label: "Region & Service",
          value: `${item.targetRegion} • ${item.serviceCategory}`,
        },
        {
          label: "Original Post / Request",
          value: item.postSnippet.slice(0, 360),
        },
        {
          label: "AI Qualification Note",
          value: item.aiReasoning,
        },
        {
          label: "Ready-to-Send Reply / DM",
          value: item.suggestedReply,
        },
        {
          label: "Source Post Link",
          value: item.postUrl,
        },
      ],
    });
  }

  const html = renderDgsEmailHtml({
    kicker: "DGS BUYER-INTENT RADAR • V8.13",
    statusBadge: {
      text: `${input.leads.length} NEW QUALIFIED LEADS`,
      color: "#ffffff",
      bg: "#2563eb",
    },
    title: `${input.leads.length} New Buyer-Intent Lead${input.leads.length > 1 ? "s" : ""} Discovered`,
    subtitle:
      "Prospects actively looking for SEO, Website Development, AI Video Production, AEO/GEO, or Digital Marketing services on LinkedIn, Reddit, X & Google.",
    sections,
    ctaText: "Open Buyer-Intent Leads Dashboard",
    ctaUrl: dashboardUrl,
    note:
      "D'Genius Solutions Automated Buyer-Intent Lead Engine (V8.13.0). Non-buyer posts, job seekers, and agency self-promotions are automatically filtered out.",
  });

  try {
    const info = await transporter.sendMail({
      from,
      to: recipientString,
      subject,
      html,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.warn("[INTENT-LEAD-EMAIL] Failed to send digest email:", err?.message || err);
    return { sent: false, reason: String(err?.message || "smtp-send-failed") };
  }
}
