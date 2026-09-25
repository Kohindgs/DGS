/**
 * DGS SEO Intelligence V8.3 - Search & URL Normalization
 * Canonical normalization utilities for GSC queries, site pages, and analytics tracking.
 */

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid",
  "mc_eid",
  "dclid",
  "wbraid",
  "gbraid",
  "ref",
]);

/**
 * Normalizes a search query string for consistent entity identity and deduplication.
 * - Trims and lowercases
 * - Applies Unicode NFKC normalization
 * - Collapses consecutive whitespace to a single space
 * - Normalizes smart quotes and apostrophes to standard single apostrophe (')
 * - Preserves semantic differences (e.g. 'seo agency' and 'seo company' remain distinct)
 */
export function normalizeSearchQuery(input: unknown): string {
  if (input == null) return "";
  const raw = String(input);
  return raw
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC\u0060]/g, "'") // Normalize smart apostrophes
    .replace(/[\u201C\u201D]/g, '"')             // Normalize smart quotes
    .replace(/\s+/g, " ")                        // Collapse duplicate whitespace
    .trim();
}

/**
 * Normalizes a page URL into canonical production form.
 * - Strips fragments and tracking query params
 * - Normalizes protocol to https
 * - Normalizes host to www.dgeniussolutions.com
 * - Normalizes trailing slash for pathnames
 */
export function normalizeSitePageUrl(input: unknown): string {
  const pathKey = canonicalPageKey(input);
  return `https://www.dgeniussolutions.com${pathKey === "/" ? "/" : pathKey}`;
}

/**
 * Extracts canonical site-relative pathname for joins, lookups, and identity keys.
 * Handles absolute URLs, relative paths, port numbers, trailing slashes, fragments, and tracking params.
 * e.g.:
 *   "https://www.dgeniussolutions.com/" -> "/"
 *   "https://dgeniussolutions.com" -> "/"
 *   "/" -> "/"
 *   "/services/seo-services-in-mumbai" -> "/services/seo-services-in-mumbai/"
 *   "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/?utm_source=g" -> "/services/seo-services-in-mumbai/"
 */
export function canonicalPageKey(input: unknown): string {
  if (input == null) return "/";
  let str = String(input).trim();
  if (!str) return "/";

  // Remove fragment
  const hashIdx = str.indexOf("#");
  if (hashIdx !== -1) str = str.slice(0, hashIdx);

  // Extract pathname and search
  let pathname = "/";
  let search = "";

  if (/^https?:\/\//i.test(str)) {
    try {
      const parsed = new URL(str);
      pathname = parsed.pathname || "/";
      search = parsed.search || "";
    } catch {
      // Fallback: strip domain
      str = str.replace(/^https?:\/\/[^/]+/i, "") || "/";
      const qIdx = str.indexOf("?");
      if (qIdx !== -1) {
        pathname = str.slice(0, qIdx) || "/";
        search = str.slice(qIdx);
      } else {
        pathname = str;
      }
    }
  } else {
    // Relative URL
    if (!str.startsWith("/")) str = `/${str}`;
    const qIdx = str.indexOf("?");
    if (qIdx !== -1) {
      pathname = str.slice(0, qIdx) || "/";
      search = str.slice(qIdx);
    } else {
      pathname = str;
    }
  }

  // Clean pathname: collapse duplicate slashes and normalize case
  pathname = pathname.replace(/\/+/g, "/");

  // Keep search params that are NOT tracking parameters
  if (search) {
    try {
      const sp = new URLSearchParams(search);
      const preserved = new URLSearchParams();
      for (const [k, v] of sp.entries()) {
        const lowerK = k.toLowerCase();
        if (!TRACKING_PARAMS.has(lowerK) && !lowerK.startsWith("utm_")) {
          preserved.append(k, v);
        }
      }
      const kept = preserved.toString();
      search = kept ? `?${kept}` : "";
    } catch {
      search = "";
    }
  }

  // Normalization for directory paths: enforce trailing slash unless it's a file with extension
  const hasExt = /\.[a-zA-Z0-9]+$/.test(pathname);
  if (!hasExt && !pathname.endsWith("/")) {
    pathname = `${pathname}/`;
  }

  return `${pathname}${search}`;
}

/**
 * Checks whether two URLs map to the exact same canonical site page.
 */
export function arePagesCanonicallyEqual(urlA: unknown, urlB: unknown): boolean {
  return canonicalPageKey(urlA) === canonicalPageKey(urlB);
}

/**
 * Checks whether two queries are equivalent under search normalization.
 */
export function areQueriesSearchEqual(queryA: unknown, queryB: unknown): boolean {
  return normalizeSearchQuery(queryA) === normalizeSearchQuery(queryB);
}

/**
 * Calculates exact, non-overlapping 28-day current and previous windows
 * taking into account Google Search Console's ~2-3 days reporting latency.
 */
export function getNonOverlapping28DayWindows(referenceDate: Date = new Date()) {
  const msPerDay = 86400000;
  const now = referenceDate;
  const gscLatencyDays = 2; // GSC has ~2-3 days reporting latency
  const endDateObj = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - gscLatencyDays));
  const startDateObj = new Date(endDateObj.getTime() - 27 * msPerDay);
  const prevEndDateObj = new Date(startDateObj.getTime() - 1 * msPerDay);
  const prevStartDateObj = new Date(prevEndDateObj.getTime() - 27 * msPerDay);

  return {
    currentStart: startDateObj.toISOString().slice(0, 10),
    currentEnd: endDateObj.toISOString().slice(0, 10),
    previousStart: prevStartDateObj.toISOString().slice(0, 10),
    previousEnd: prevEndDateObj.toISOString().slice(0, 10),
  };
}
