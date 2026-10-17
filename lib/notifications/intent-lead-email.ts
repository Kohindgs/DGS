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
  const subject = `[DGS Lead Fetched] ${input.leads.length} Fresh Buyer-Intent Lead${input.leads.length > 1 ? "s" : ""} Fetched (${topLead.serviceCategory} • ${topLead.sourcePlatform})`;

  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.dgeniussolutions.com";
  const dashboardUrl = `${siteOrigin}/admin/intent-leads/`;

  const sections: EmailSection[] = [
    {
      title: "Fresh Buyer-Intent Lead Fetch Summary",
      fields: [
        {
          label: "Status",
          value: `${input.leads.length} Fresh High-Intent Lead${input.leads.length > 1 ? "s" : ""} Fetched into CMS Vault`,
          isBadge: true,
          badgeColor: "#059669",
        },
        {
          label: "Freshness Window",
          value: "Strictly 1h–12h, 24h, or <= 3 Days Old (Stale & cold posts excluded)",
        },
        {
          label: "Discovery Trigger",
          value: input.runType.toUpperCase(),
        },
        {
          label: "Fetched At",
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
        : item.intentScore >= 75
          ? "#ea580c"
          : "#2563eb";

    sections.push({
      title: `Lead #${i + 1} Fetched: [${item.serviceCategory}] ${item.authorName || "Active Buyer"} (${item.sourcePlatform})`,
      fields: [
        {
          label: "Buyer Intent Score",
          value: `${item.intentScore}/100 (${item.urgencyLevel} URGENCY • WARM BUYER INTENT)`,
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
          label: "Region & DGS Service",
          value: `${item.targetRegion} • ${item.serviceCategory}`,
        },
        {
          label: "Prospect Requirement",
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
          label: "Direct Post Link",
          value: item.postUrl,
        },
      ],
    });
  }

  const html = renderDgsEmailHtml({
    kicker: "DGS PRIVATE BUYER-INTENT VAULT • V8.13",
    statusBadge: {
      text: `LEAD FETCHED (${input.leads.length})`,
      color: "#ffffff",
      bg: "#059669",
    },
    title: `New Buyer-Intent Lead${input.leads.length > 1 ? "s" : ""} Fetched Into Your Private CMS Vault`,
    subtitle:
      "Fresh (<72h / 24h / 1h–12h) warm buyer-intent leads looking for D'Genius Solutions services have been fetched and saved exclusively in your PIN-protected CMS section.",
    sections,
    ctaText: "Unlock Buyer-Intent Vault in CMS",
    ctaUrl: dashboardUrl,
    note:
      "D'Genius Solutions Private Buyer-Intent Lead Vault (V8.13.0). Stored exclusively in your PIN-protected CMS section (never sent via website lead forms).",
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
