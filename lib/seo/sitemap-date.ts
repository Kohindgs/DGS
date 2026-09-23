export function formatW3CDate(rawDate?: string | Date | null): string | undefined {
  if (!rawDate) return undefined;
  if (rawDate instanceof Date) {
    return isNaN(rawDate.getTime()) ? undefined : rawDate.toISOString().slice(0, 10);
  }
  const str = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    const d = new Date(match[1]);
    if (!isNaN(d.getTime())) return match[1];
  }
  return undefined;
}
