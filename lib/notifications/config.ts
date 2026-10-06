/**
 * Canonical Server-Side Form Notification Configuration
 * 
 * MANDATORY REQUIREMENT:
 * Every active DGS website form notification MUST resolve to kohin@dgeniussolutions.com ONLY.
 * Client payloads must NEVER control or override this destination.
 * Strictly ZERO CC, ZERO BCC.
 */

export const DGS_CANONICAL_FORM_NOTIFICATION_EMAIL = "kohin@dgeniussolutions.com";

/**
 * Returns the server-side global recipient for all form notifications.
 * Defaults strictly to kohin@dgeniussolutions.com.
 */
export function getGlobalFormNotificationRecipient(): string {
  const configured =
    process.env.DGS_FORM_NOTIFICATION_EMAIL ||
    process.env.DGS_FORM_NOTIFICATION_TO;

  if (configured && typeof configured === "string" && configured.trim().includes("@")) {
    return configured.trim();
  }
  return DGS_CANONICAL_FORM_NOTIFICATION_EMAIL;
}
