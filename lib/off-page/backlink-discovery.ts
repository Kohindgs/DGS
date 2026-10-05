import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { getProvider } from "./providers/registry";
import { BraveSearchDiscoveryProvider, resolveBraveApiKey } from "./providers/brave";
import { WebSearchDiscoveryProvider } from "./providers/web-search";
import { analyzePage, mapLimit, type PageAnalysis } from "./lanes/page-analyzer";
import { ingestDiscoveredOpportunity } from "./discovery";
import type { OffPageBacklink } from "./types";

export interface BacklinkDiscoveryResult {
  runId: string;
  provider: string;
  queriesRun: number;
  candidatesFound: number;
  candidatesCrawled: number;
  linksVerifiedLive: number;
  unlinkedMentionsFound: number;
  duplicatesSkipped: number;
  insertedCount: number;
  newBacklinks: Partial<OffPageBacklink>[];
  providerStatus: Record<string, string>;
  status: "COMPLETED" | "FAILED";
  errors: string[];
  message: string;
}

/**
 * Records a backlink that was OBSERVED on a live page (real <a href> to the monitored domain).
 * Link type is derived from the observed rel attribute only. Returns null when already tracked.
 */
export async function recordVerifiedBacklink(params: {
  analysis: PageAnalysis;
  sourceTitle?: string;
  sourceType: string;
  note: string;
}): Promise<Partial<OffPageBacklink> | null> {
  const a = params.analysis;
  const sourceUrl = a.finalUrl || a.url;
  if (a.dgsLinks.length === 0) return null;

  const { rows: existing } = await cmsQuery<{ id: string }>(
    `SELECT id FROM off_page_backlinks WHERE source_url = ? OR source_url = ? LIMIT 1`,
    [sourceUrl, a.url]
  );
  if (existing[0]) return null;

  const link = a.dgsLinks[0];
  const rel = link.rel || "";
  const isNofollow = /nofollow/i.test(rel);
  const isSponsored = /sponsored/i.test(rel);
  const isUgc = /ugc/i.test(rel);
  const isDofollow = !isNofollow && !isSponsored && !isUgc; // observed: no restricting rel on a real <a>
  const sourceDomain = new URL(sourceUrl).hostname.replace(/^www\./, "");
  const id = randomUUID();

  await cmsExecute(
    `INSERT INTO off_page_backlinks (
      id, source_domain, source_url, source_page_title, target_url, target_page_type,
      anchor_text, anchor_classification, link_rel, dofollow, nofollow, ugc, sponsored, unknown_link_type,
      first_seen_at, last_seen_at, last_checked_at, status, team_status, verified_status,
      mismatch_status, http_status, source_indexable, source_region, topical_category,
      source_type, notes, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, 'TARGET_LANDING',
      ?, 'BRANDED', ?, ?, ?, ?, ?, 0,
      NOW(), NOW(), NOW(), 'LIVE', 'NOT_REPORTED', 'LIVE',
      'MATCH', ?, ?, 'GLOBAL', 'Digital Marketing',
      ?, ?, NOW(), NOW()
    )`,
    [
      id,
      sourceDomain,
      sourceUrl,
      (params.sourceTitle || a.title || sourceDomain).slice(0, 500),
      link.href,
      (link.anchor || "(no anchor text)").slice(0, 500),
      rel || "none",
      isDofollow ? 1 : 0,
      isNofollow ? 1 : 0,
      isUgc ? 1 : 0,
      isSponsored ? 1 : 0,
      a.httpStatus ?? 200,
      a.noindex ? 0 : 1,
      params.sourceType,
      `${params.note} | Observed <a href="${link.href}" rel="${rel || "(none)"}"> on live page.`.slice(0, 2000),
    ]
  );

  return {
    id,
    source_domain: sourceDomain,
    source_url: sourceUrl,
    target_url: link.href,
    anchor_text: link.anchor,
    status: "LIVE",
    verified_status: "LIVE",
  } as Partial<OffPageBacklink>;
}

/**
 * Executes a live backlink & brand mention discovery run.
 * Searches real providers (Native Web Search, Brave web search when configured, Google News RSS, GDELT)
 * for brand mentions, fetches each candidate page, and records:
 * 1. Backlink ONLY when the live HTML contains an <a href> whose host is dgeniussolutions.com.
 * 2. Unlinked brand mention when the page mentions the brand but lacks a hyperlink.
 */
export async function executeBacklinkDiscovery(options?: {
  provider?: "google_news" | "gdelt" | "brave" | "web_search" | "all";
  queries?: string[];
}): Promise<BacklinkDiscoveryResult> {
  await ensureOffPageTablesExist();

  const runId = randomUUID();
  const provider = options?.provider || "all";
  const errors: string[] = [];
  const providerStatus: Record<string, string> = {};

  await cmsExecute(
    `INSERT INTO off_page_backlink_discovery_runs (run_id, provider, started_at, status) VALUES (?, ?, NOW(), 'RUNNING')`,
    [runId, provider]
  );

  const defaultQueries = [`"dgeniussolutions.com"`, `"D'Genius Solutions"`, `"D Genius Solutions"`, `"Kohin Bellara"`, `"Sneha Bellara"`];
  const activeQueries = options?.queries && options.queries.length > 0 ? options.queries : defaultQueries;

  const candidates: Array<{ url: string; title: string; query: string; source: string }> = [];
  let queriesRun = 0;

  // 1. Native Web Search (Active General Search)
  if (provider === "web_search" || provider === "all") {
    try {
      const ws = new WebSearchDiscoveryProvider();
      const res = await ws.discoverQueries(
        activeQueries.map((q) => ({ query: `${q} -site:dgeniussolutions.com`, region: "GLOBAL" as const, category: "UNLINKED_MENTION" as const })),
        20
      );
      queriesRun += res.queriesRun;
      errors.push(...res.errors);
      providerStatus.WEB_SEARCH = res.queriesRun > 0 ? "ACTIVE" : res.errors.length ? "ERROR" : "NO_QUERIES";
      for (const c of res.candidates) candidates.push({ url: c.url, title: c.title || c.site_name, query: c.discovery_query, source: "web_search" });
    } catch (e: any) {
      errors.push(`Web Search error: ${e?.message}`);
      providerStatus.WEB_SEARCH = "ERROR";
    }
  }

  // 2. Brave Search API (when configured)
  if (provider === "brave" || provider === "all") {
    const braveKey = await resolveBraveApiKey();
    if (!braveKey) {
      providerStatus.BRAVE_SEARCH = "NOT_CONFIGURED";
    } else {
      const brave = new BraveSearchDiscoveryProvider();
      const res = await brave.discoverQueries(
        activeQueries.map((q) => ({ query: `${q} -site:dgeniussolutions.com`, region: "GLOBAL" as const, category: "UNLINKED_MENTION" as const })),
        20
      );
      queriesRun += res.queriesRun;
      errors.push(...res.errors);
      providerStatus.BRAVE_SEARCH = res.errors.length && !res.queriesRun ? "ERROR" : "ACTIVE";
      for (const c of res.candidates) candidates.push({ url: c.url, title: c.title || c.site_name, query: c.discovery_query, source: "brave_search" });
    }
  }

  // 3. Google News RSS
  if (provider === "google_news" || provider === "all") {
    const p = getProvider("google-news-rss");
    for (const q of activeQueries) {
      try {
        const items = await p.discover({ queries: [q], categories: ["DIGITAL_PR"], regions: ["GLOBAL"], limit: 10 });
        queriesRun++;
        for (const item of items) candidates.push({ url: item.url, title: item.title || item.site_name, query: q, source: "google_news_rss" });
      } catch (e: any) {
        errors.push(`Google News RSS '${q}': ${e?.message}`);
      }
    }
    providerStatus.GOOGLE_NEWS_RSS = "ACTIVE";
  }

  // 4. GDELT 2.0
  if (provider === "gdelt" || provider === "all") {
    const p = getProvider("gdelt-doc");
    for (const q of activeQueries) {
      try {
        const items = await p.discover({ queries: [q], categories: ["DIGITAL_PR"], regions: ["GLOBAL"], limit: 10 });
        queriesRun++;
        for (const item of items) candidates.push({ url: item.url, title: item.site_name, query: q, source: "gdelt" });
      } catch (e: any) {
        errors.push(`GDELT '${q}': ${e?.message}`);
      }
    }
    providerStatus.GDELT = "ACTIVE";
  }

  const unique = new Map<string, (typeof candidates)[number]>();
  for (const c of candidates) {
    try {
      const host = new URL(c.url).hostname.toLowerCase();
      if (host.endsWith("dgeniussolutions.com")) continue;
    } catch {
      continue;
    }
    if (!unique.has(c.url)) unique.set(c.url, c);
  }
  const candidateList = Array.from(unique.values()).slice(0, 40);

  // Stage candidates into off_page_raw_candidates
  for (const c of candidateList) {
    try {
      const parsed = new URL(c.url);
      const domain = parsed.hostname.toLowerCase().replace(/^www\./, "");
      const rawId = `raw_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      await cmsExecute(
        `INSERT INTO off_page_raw_candidates (
          id, run_id, provider, query, lane, url, domain, title, validation_status, qualification_status, created_at
        ) VALUES (?, ?, ?, ?, 'UNLINKED_MENTIONS', ?, ?, ?, 'PENDING', 'UNQUALIFIED', NOW())`,
        [rawId, runId, c.source, c.query, c.url, domain, (c.title || domain).slice(0, 500)]
      ).catch(() => {});
    } catch {}
  }

  let linksVerifiedLive = 0;
  let unlinkedMentionsFound = 0;
  let duplicatesSkipped = 0;
  let insertedCount = 0;
  let crawled = 0;
  const newBacklinks: Partial<OffPageBacklink>[] = [];

  await mapLimit(candidateList, 5, async (candidate) => {
    try {
      const { rows: existing } = await cmsQuery<{ id: string }>(
        `SELECT id FROM off_page_backlinks WHERE source_url = ? LIMIT 1`,
        [candidate.url]
      );
      if (existing[0]) {
        duplicatesSkipped++;
        return;
      }
      const analysis = await analyzePage(candidate.url, 12000);
      crawled++;

      if (analysis.dgsLinks.length > 0) {
        linksVerifiedLive++;
        const rec = await recordVerifiedBacklink({
          analysis,
          sourceTitle: candidate.title,
          sourceType: "backlink_discovery",
          note: `Discovered via ${candidate.source} query: ${candidate.query}`,
        });
        if (rec) {
          insertedCount++;
          newBacklinks.push(rec);
        } else {
          duplicatesSkipped++;
        }
      } else {
        // Check for unlinked brand mention
        const brandMatch = analysis.brandMentioned;

        if (brandMatch) {
          unlinkedMentionsFound++;
          const domain = new URL(candidate.url).hostname.replace(/^www\./, "");
          await ingestDiscoveredOpportunity({
            site_name: analysis.title || candidate.title || domain,
            domain,
            exact_submission_url: candidate.url,
            region: "GLOBAL",
            country: "Global",
            category: "UNLINKED_MENTION",
            free_status: "FREE",
            dofollow_status: "UNKNOWN",
            link_type: "UNLINKED_MENTION",
            submission_type: "UNLINKED_MENTION",
            topical_relevance: 90,
            notes: `Observed brand mention without link. Discovered via ${candidate.source}.`,
            evidence: `Brand mention detected in live page text. HTTP ${analysis.httpStatus}.`,
            discovery_provider: candidate.source.toUpperCase(),
            discovery_query: candidate.query,
            http_status: analysis.httpStatus,
            verification_status: "VERIFIED_ACTIVE",
            source_type: candidate.source,
            status: "QUALIFIED",
            discovery_lane: "UNLINKED_MENTIONS",
            page_title: analysis.title,
            qualification_reason: "UNLINKED_BRAND_MENTION_CONFIRMED",
          }).catch(() => {});
        }
      }
    } catch (e: any) {
      errors.push(`crawl ${candidate.url}: ${String(e?.message || e).slice(0, 120)}`);
    }
  });

  const finalStatus: "COMPLETED" | "FAILED" = candidateList.length === 0 && errors.length > 0 ? "FAILED" : "COMPLETED";

  await cmsExecute(
    `UPDATE off_page_backlink_discovery_runs SET
      completed_at = NOW(), queries_run = ?, candidates_found = ?, links_verified_live = ?,
      duplicates_skipped = ?, inserted_count = ?, errors = ?, status = ?
     WHERE run_id = ?`,
    [
      queriesRun,
      candidateList.length,
      linksVerifiedLive,
      duplicatesSkipped,
      insertedCount,
      errors.length ? errors.slice(0, 5).join("; ").slice(0, 2000) : null,
      finalStatus,
      runId,
    ]
  ).catch(() => {});

  const msg =
    `Backlink discovery: ${candidateList.length} unique candidates crawled across ${queriesRun} queries, ` +
    `${linksVerifiedLive} real backlinks verified live, ${unlinkedMentionsFound} unlinked mentions qualified, ` +
    `${insertedCount} new backlink records inserted, ${duplicatesSkipped} duplicates skipped.`;

  return {
    runId,
    provider,
    queriesRun,
    candidatesFound: candidateList.length,
    candidatesCrawled: crawled,
    linksVerifiedLive,
    unlinkedMentionsFound,
    duplicatesSkipped,
    insertedCount,
    newBacklinks,
    providerStatus,
    status: finalStatus,
    errors,
    message: msg,
  };
}
