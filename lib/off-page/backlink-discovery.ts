import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { getProvider } from "./providers/registry";
import type { BacklinkDiscoveryRun, OffPageBacklink } from "./types";

export interface BacklinkDiscoveryResult {
  runId: string;
  provider: string;
  queriesRun: number;
  candidatesFound: number;
  linksVerifiedLive: number;
  duplicatesSkipped: number;
  insertedCount: number;
  newBacklinks: Partial<OffPageBacklink>[];
  status: "COMPLETED" | "FAILED";
  errors: string[];
}

/**
 * Executes a live backlink discovery run.
 * Searches external providers for brand mentions, fetches each candidate page,
 * scans HTML for actual outbound <a> tags pointing to dgeniussolutions.com.
 * Newly proven backlinks are saved directly into off_page_backlinks.
 */
export async function executeBacklinkDiscovery(options?: {
  provider?: "google_news" | "gdelt" | "all";
  queries?: string[];
}): Promise<BacklinkDiscoveryResult> {
  await ensureOffPageTablesExist();

  const runId = randomUUID();
  const provider = options?.provider || "google_news";
  const startedAt = new Date();
  const errors: string[] = [];

  // Log start of discovery run
  await cmsExecute(
    `INSERT INTO off_page_backlink_discovery_runs (
      run_id, provider, started_at, status
    ) VALUES (?, ?, NOW(), 'RUNNING')`,
    [runId, provider]
  );

  const defaultQueries = [
    `"dgeniussolutions.com"`,
    `"dgenius solutions"`,
    `"d'genius solutions"`,
  ];
  const activeQueries = options?.queries && options.queries.length > 0 ? options.queries : defaultQueries;

  let candidates: Array<{ url: string; title: string; query: string }> = [];

  try {
    if (provider === "google_news" || provider === "all") {
      const p = getProvider("google-news-rss");
      for (const q of activeQueries) {
        try {
          const items = await p.discover({
            queries: [q],
            categories: ["DIGITAL_PR"],
            regions: ["GLOBAL"],
            limit: 10,
          });
          for (const item of items) {
            candidates.push({ url: item.url, title: item.site_name, query: q });
          }
        } catch (e: any) {
          errors.push(`Google News RSS query '${q}' error: ${e.message}`);
        }
      }
    }

    if (provider === "gdelt" || provider === "all") {
      const p = getProvider("gdelt");
      try {
        const items = await p.discover({
          categories: ["DIGITAL_PR"],
          regions: ["GLOBAL"],
          limit: 10,
        });
        for (const item of items) {
          candidates.push({ url: item.url, title: item.site_name, query: "gdelt_pr" });
        }
      } catch (e: any) {
        errors.push(`GDELT discovery error: ${e.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Discovery provider fetch failed: ${err.message}`);
  }

  // Dedupe candidates list
  const uniqueCandidateUrls = new Map<string, { url: string; title: string; query: string }>();
  for (const c of candidates) {
    if (c.url && !uniqueCandidateUrls.has(c.url)) {
      uniqueCandidateUrls.set(c.url, c);
    }
  }

  const candidateList = Array.from(uniqueCandidateUrls.values());
  let linksVerifiedLive = 0;
  let duplicatesSkipped = 0;
  let insertedCount = 0;
  const newBacklinks: Partial<OffPageBacklink>[] = [];

  // Crawl each candidate URL live to inspect HTML for real backlink to DGS
  for (const candidate of candidateList.slice(0, 15)) {
    try {
      // Check if already in off_page_backlinks
      const { rows: existing } = await cmsQuery<{ id: string }>(
        `SELECT id FROM off_page_backlinks WHERE source_url = ? LIMIT 1`,
        [candidate.url]
      );
      if (existing[0]) {
        duplicatesSkipped++;
        continue;
      }

      // Fetch live candidate HTML
      const res = await fetch(candidate.url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; DGS-BacklinkDiscovery/1.0; +https://www.dgeniussolutions.com/)",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;
      const html = await res.text();

      // Look for <a> tags pointing to dgeniussolutions.com
      const aTagRegex = /<a\b[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      let backlinkFound = false;
      let targetUrl = "";
      let anchorText = "";
      let rel = "dofollow";

      while ((match = aTagRegex.exec(html)) !== null) {
        const href = match[1].trim();
        if (href.includes("dgeniussolutions.com")) {
          backlinkFound = true;
          targetUrl = href;
          anchorText = match[2].replace(/<[^>]+>/g, "").trim() || "D'Genius Solutions";
          const relMatch = match[0].match(/rel=['"]([^'"]+)['"]/i);
          rel = relMatch ? relMatch[1].toLowerCase() : "dofollow";
          break;
        }
      }

      if (backlinkFound) {
        linksVerifiedLive++;
        const newBlId = randomUUID();
        const sourceDomain = new URL(candidate.url).hostname.replace(/^www\./, "");
        const isDofollow = !rel.includes("nofollow") && !rel.includes("sponsored") && !rel.includes("ugc");
        const isNofollow = rel.includes("nofollow");
        const isSponsored = rel.includes("sponsored");
        const isUgc = rel.includes("ugc");

        await cmsExecute(
          `INSERT INTO off_page_backlinks (
            id, source_domain, source_url, source_page_title, target_url, target_page_type,
            anchor_text, anchor_classification, link_rel, dofollow, nofollow, ugc, sponsored,
            first_seen_at, last_seen_at, last_checked_at, status, team_status, verified_status,
            mismatch_status, http_status, source_indexable, source_region, topical_category,
            source_type, notes, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, 'TARGET_LANDING',
            ?, 'BRANDED', ?, ?, ?, ?, ?,
            NOW(), NOW(), NOW(), 'LIVE', 'LIVE', 'LIVE',
            'MATCH', 200, 1, 'GLOBAL', 'Digital Marketing',
            'backlink_discovery', ?, NOW(), NOW()
          )`,
          [
            newBlId,
            sourceDomain,
            candidate.url,
            candidate.title.slice(0, 500),
            targetUrl || "https://www.dgeniussolutions.com/",
            anchorText.slice(0, 500),
            rel,
            isDofollow ? 1 : 0,
            isNofollow ? 1 : 0,
            isUgc ? 1 : 0,
            isSponsored ? 1 : 0,
            `Discovered via query: ${candidate.query}`,
          ]
        );

        insertedCount++;
        newBacklinks.push({
          id: newBlId,
          source_domain: sourceDomain,
          source_url: candidate.url,
          target_url: targetUrl,
          anchor_text: anchorText,
          status: "LIVE",
          verified_status: "LIVE",
          team_status: "LIVE",
        });
      }
    } catch (crawlErr: any) {
      // Continue next candidate on crawl error
    }
  }

  const finalStatus: "COMPLETED" | "FAILED" = errors.length > 0 && candidateList.length === 0 ? "FAILED" : "COMPLETED";

  // Update run log
  await cmsExecute(
    `UPDATE off_page_backlink_discovery_runs SET
      completed_at = NOW(),
      queries_run = ?,
      candidates_found = ?,
      links_verified_live = ?,
      duplicates_skipped = ?,
      inserted_count = ?,
      status = ?,
      errors = ?
     WHERE run_id = ?`,
    [
      activeQueries.length,
      candidateList.length,
      linksVerifiedLive,
      duplicatesSkipped,
      insertedCount,
      finalStatus,
      errors.slice(0, 5).join("; ") || null,
      runId,
    ]
  );

  return {
    runId,
    provider,
    queriesRun: activeQueries.length,
    candidatesFound: candidateList.length,
    linksVerifiedLive,
    duplicatesSkipped,
    insertedCount,
    newBacklinks,
    status: finalStatus,
    errors,
  };
}
