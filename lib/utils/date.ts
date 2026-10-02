/**
 * Safe date normalization helper for database and runtime values.
 * Handles Date objects, ISO strings, MySQL datetime strings, numeric timestamps, null, undefined, and invalid dates.
 * Always returns YYYY-MM-DD or the provided fallback (defaults to "recent").
 */
export function formatAuditDate(value: unknown, fallback: string = "recent"): string {
  if (value == null || value === "") return fallback;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return fallback;
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;

    // Fast check for YYYY-MM-DD prefix (handles ISO strings and MySQL DATETIME strings)
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) return match[1];
    }

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return fallback;
  }

  if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  }

  return fallback;
}

/**
 * Format a date to YYYY-MM-DD or null if invalid or missing.
 */
export function formatDateOnly(value: unknown, fallback: string | null = null): string | null {
  const formatted = formatAuditDate(value, "");
  return formatted ? formatted : fallback;
}

/**
 * Compute the age in days of a date value relative to now (or reference timestamp).
 * Returns null if the date is invalid or missing.
 */
export function getDaysAgo(value: unknown, referenceTimeMs: number = Date.now()): number | null {
  if (value == null || value === "") return null;

  let d: Date;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === "string" || typeof value === "number") {
    d = new Date(value);
  } else {
    return null;
  }

  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((referenceTimeMs - d.getTime()) / 86400000));
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDateUTC(value: unknown, fallback: string = "—"): string {
  if (value == null || value === "") return fallback;
  const d = value instanceof Date ? value : new Date(String(value));
  if (isNaN(d.getTime())) return fallback;
  return `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateTimeUTC(value: unknown, fallback: string = "—"): string {
  if (value == null || value === "") return fallback;
  const d = value instanceof Date ? value : new Date(String(value));
  if (isNaN(d.getTime())) return fallback;
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const mins = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()} ${hours}:${mins} UTC`;
}

