export type EmailSectionField = {
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
  isBadge?: boolean;
  badgeColor?: string;
};

export type EmailSection = {
  title: string;
  fields: EmailSectionField[];
};

export type EmailTemplateOptions = {
  kicker: string;
  title: string;
  subtitle?: string;
  statusBadge?: {
    text: string;
    color: string;
    bg: string;
  };
  sections: EmailSection[];
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  note?: string;
};

export function renderDgsEmailHtml(options: EmailTemplateOptions): string {
  const {
    kicker,
    title,
    subtitle,
    statusBadge,
    sections,
    ctaText,
    ctaUrl,
    secondaryCtaText,
    secondaryCtaUrl,
    note,
  } = options;

  const sectionsHtml = sections
    .map(
      (section) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #12131a; border: 1px solid #232533; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="padding: 12px 18px; background-color: #1a1b26; border-bottom: 1px solid #232533;">
          <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a1a5b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            ${escapeHtml(section.title)}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${section.fields
              .map(
                (f) => `
              <tr>
                <td style="padding: 6px 0; width: 38%; vertical-align: top; font-size: 13px; color: #8e92a4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${escapeHtml(f.label)}
                </td>
                <td style="padding: 6px 0; vertical-align: top; font-size: 13px; color: #e5e7eb; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${
                    f.isLink && f.href
                      ? `<a href="${escapeHtml(f.href)}" target="_blank" rel="noopener noreferrer" style="color: #c084fc; text-decoration: underline; word-break: break-all;">${escapeHtml(f.value)}</a>`
                      : f.isBadge
                      ? `<span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ${f.badgeColor || '#7928ca'}; color: #ffffff;">${escapeHtml(f.value)}</span>`
                      : `<span style="word-break: break-word;">${escapeHtml(f.value)}</span>`
                  }
                </td>
              </tr>`,
              )
              .join("")}
          </table>
        </td>
      </tr>
    </table>
  `,
    )
    .join("");

  const ctaHtml =
    ctaText && ctaUrl
      ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; margin-bottom: 24px;">
      <tr>
        <td align="center" style="padding: 10px 0;">
          <a href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #7928ca 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 4px 14px rgba(121, 40, 202, 0.4);">
            ${escapeHtml(ctaText)} &rarr;
          </a>
          ${
            secondaryCtaText && secondaryCtaUrl
              ? `&nbsp;&nbsp;<a href="${escapeHtml(secondaryCtaUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 20px; background: #232533; color: #e5e7eb; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            ${escapeHtml(secondaryCtaText)}
          </a>`
              : ""
          }
        </td>
      </tr>
    </table>`
      : "";

  const noteHtml = note
    ? `
    <div style="margin-top: 16px; margin-bottom: 20px; padding: 12px 16px; background-color: #1e1b2e; border-left: 3px solid #c084fc; border-radius: 4px; font-size: 12px; line-height: 1.5; color: #d8b4fe; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      ${escapeHtml(note)}
    </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08080c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #08080c; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #0e0f14; border: 1px solid #1f202b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px 20px 28px; background: linear-gradient(180deg, #161722 0%, #0e0f14 100%); border-bottom: 1px solid #1f202b;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #c084fc; margin-bottom: 6px;">
                      D'GENIUS SOLUTIONS &bull; ${escapeHtml(kicker)}
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                      ${escapeHtml(title)}
                    </div>
                    ${
                      subtitle
                        ? `<div style="font-size: 14px; color: #9ca3af; margin-top: 4px; line-height: 1.4;">${escapeHtml(
                            subtitle,
                          )}</div>`
                        : ""
                    }
                  </td>
                  ${
                    statusBadge
                      ? `<td align="right" style="vertical-align: top; padding-left: 12px;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background-color: ${escapeHtml(
                      statusBadge.bg,
                    )}; color: ${escapeHtml(statusBadge.color)};">
                      ${escapeHtml(statusBadge.text)}
                    </span>
                  </td>`
                      : ""
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 28px 12px 28px;">
              ${sectionsHtml}
              ${noteHtml}
              ${ctaHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px 24px 28px; background-color: #0a0b0e; border-top: 1px solid #1a1b24; font-size: 11px; color: #6b7280; line-height: 1.6; text-align: center;">
              <div style="font-weight: 600; color: #9ca3af; margin-bottom: 4px;">
                D'Genius Solutions Pvt. Ltd. &bull; Mumbai HQ
              </div>
              <div>
                Unit 202, Amore Edge, Swami Vivekanand Rd, Govind Dham, Khar West, Mumbai 400052
              </div>
              <div style="margin-top: 6px; color: #4b5563;">
                This automated notification was generated by the DGS Native Platform. Confidential &bull; For internal use only.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
