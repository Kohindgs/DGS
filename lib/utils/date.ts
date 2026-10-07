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

export function formatDateTimeIST(value: unknown, fallback: string = "—"): string {
  if (value == null || value === "") return fallback;
  const d = value instanceof Date ? value : new Date(String(value));
  if (isNaN(d.getTime())) return fallback;

  try {
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const parts = formatter.formatToParts(d);
    let day = "";
    let month = "";
    let year = "";
    let hour = "";
    let minute = "";
    let dayPeriod = "";

    for (const part of parts) {
      if (part.type === "day") day = part.value;
      else if (part.type === "month") month = part.value;
      else if (part.type === "year") year = part.value;
      else if (part.type === "hour") hour = part.value;
      else if (part.type === "minute") minute = part.value;
      else if (part.type === "dayPeriod") dayPeriod = part.value.toUpperCase();
    }

    return `${day} ${month} ${year} · ${hour}:${minute} ${dayPeriod} IST`;
  } catch {
    const istMs = d.getTime() + 5.5 * 60 * 60 * 1000;
    const istDate = new Date(istMs);
    const day = istDate.getUTCDate();
    const month = MONTH_NAMES[istDate.getUTCMonth()];
    const year = istDate.getUTCFullYear();
    let hours = istDate.getUTCHours();
    const mins = String(istDate.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} · ${hours}:${mins} ${ampm} IST`;
  }
}

