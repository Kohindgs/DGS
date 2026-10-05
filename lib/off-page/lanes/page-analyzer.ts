/**
 * V8.12.6 live page analyzer.
 *
 * Fetches a real external URL and extracts observable facts only:
 * HTTP status, final URL, title, meta description, language, outbound links,
 * links to the monitored DGS domain (with their observed rel), and textual signals
 * used by the lane validators. Nothing here is guessed or synthesized.
 */
import { linkTypeFromObservedRels, type LinkTypeStatus } from "../types";

export const MONITORED_HOSTS = new Set(["dgeniussolutions.com", "www.dgeniussolutions.com"]);

export const BRAND_TERMS = [
  "d'genius solutions",
  "d’genius solutions",
  "d genius solutions",
  "dgenius solutions",
  "dgeniussolutions",
  "kohin bellara",
  "sneha bellara",
];

const UA = "Mozilla/5.0 (compatible; DGS-OpportunityVerifier/1.0; +https://www.dgeniussolutions.com/)";
const MAX_HTML_BYTES = 1_500_000;

export interface ObservedLink {
  href: string;
  host: string;
  rel: string;
  anchor: string;
}

export interface PageAnalysis {
  url: string;
  fetched: boolean;
  httpStatus: number | null;
  finalUrl: string | null;
  error?: string;
  contentType?: string;
  title: string;
  metaDescription: string;
  lang: string;
  /** Lowercased visible text (truncated). */
  text: string;
  hasForm: boolean;
  formCount: number;
  outboundLinks: ObservedLink[];
  dgsLinks: ObservedLink[];
  /** Link type derived from observed rel attributes of DGS links; UNKNOWN when none observed. */
  dgsLinkType: LinkTypeStatus;
  brandMentioned: boolean;
  noindex: boolean;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;|&#8217;/g, "’")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

export function isMonitoredHost(host: string): boolean {
  return MONITORED_HOSTS.has(host.toLowerCase());
}

/** Extracts all <a href> links (absolute http/https) with observed rel and anchor text. */
export function extractLinks(html: string, baseUrl: string): ObservedLink[] {
  const out: ObservedLink[] = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const hrefM = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!hrefM) continue;
    const rawHref = decodeEntities((hrefM[1] ?? hrefM[2] ?? hrefM[3] ?? "").trim());
    if (!rawHref || rawHref.startsWith("#") || /^(mailto|tel|javascript):/i.test(rawHref)) continue;
    let abs: URL;
    try {
      abs = new URL(rawHref, baseUrl);
    } catch {
      continue;
    }
    if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;
    const relM = attrs.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const rel = (relM ? relM[1] ?? relM[2] ?? relM[3] ?? "" : "").toLowerCase().trim();
    const anchor = decodeEntities(m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 300);
    out.push({ href: abs.toString(), host: abs.hostname.toLowerCase(), rel, anchor });
  }
  return out;
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Fetches a live page (GET) and extracts observable facts. Never throws. */
export async function analyzePage(url: string, timeoutMs = 12000): Promise<PageAnalysis> {
  const base: PageAnalysis = {
    url,
    fetched: false,
    httpStatus: null,
    finalUrl: null,
    title: "",
    metaDescription: "",
    lang: "",
    text: "",
    hasForm: false,
    formCount: 0,
    outboundLinks: [],
    dgsLinks: [],
    dgsLinkType: "UNKNOWN",
    brandMentioned: false,
    noindex: false,
  };
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "Accept-Language": "en" },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err: any) {
    return { ...base, error: `FETCH_FAILED: ${String(err?.message || err).slice(0, 160)}` };
  }

  base.fetched = true;
  base.httpStatus = res.status;
  base.finalUrl = res.url || url;
  base.contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    return { ...base, error: `HTTP_${res.status}` };
  }
  if (base.contentType && !/html|xml/i.test(base.contentType)) {
    return { ...base, error: `NON_HTML_CONTENT: ${base.contentType}` };
  }

  let html = "";
  try {
    const buf = await res.arrayBuffer();
    html = new TextDecoder("utf-8").decode(buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf);
  } catch (err: any) {
    return { ...base, error: `READ_FAILED: ${String(err?.message || err).slice(0, 120)}` };
  }

  const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descM =
    html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const langM = html.match(/<html[^>]*\blang=["']?([a-zA-Z-]+)/i);
  const robotsM = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["']/i);

  const finalUrl = base.finalUrl || url;
  const links = extractLinks(html, finalUrl);
  let pageHost = "";
  try {
    pageHost = new URL(finalUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {}

  const outbound = links.filter((l) => l.host.replace(/^www\./, "") !== pageHost);
  // Internal links on our own site are not backlinks.
  const dgsLinks = isMonitoredHost(`www.${pageHost}`) || isMonitoredHost(pageHost) ? [] : links.filter((l) => isMonitoredHost(l.host));
  const text = htmlToText(html).slice(0, 200_000);
  const formCount = (html.match(/<form\b/gi) || []).length;

  return {
    ...base,
    title: decodeEntities((titleM?.[1] || "").replace(/\s+/g, " ").trim()).slice(0, 500),
    metaDescription: decodeEntities((descM?.[1] || "").trim()).slice(0, 500),
    lang: (langM?.[1] || "").toLowerCase(),
    text,
    hasForm: formCount > 0,
    formCount,
    outboundLinks: outbound,
    dgsLinks,
    dgsLinkType: linkTypeFromObservedRels(dgsLinks.map((l) => l.rel)),
    brandMentioned: BRAND_TERMS.some((t) => text.includes(t)),
    noindex: /noindex/i.test(robotsM?.[1] || ""),
  };
}

/** HEAD (fallback GET) status check for a single URL. Returns 0 when unreachable. */
export async function checkUrlStatus(url: string, timeoutMs = 8000): Promise<number> {
  try {
    const r = await fetch(url, { method: "HEAD", headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
    if (r.status === 405 || r.status === 403 || r.status === 501) {
      const g = await fetch(url, { method: "GET", headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
      return g.status;
    }
    return r.status;
  } catch {
    return 0;
  }
}

/** Runs async tasks with bounded concurrency. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}
