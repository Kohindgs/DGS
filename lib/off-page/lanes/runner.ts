/**
 * V8.12.6 lane runner.
 *
 * Provider results -> normalize URL -> exact dedupe -> live fetch -> lane validator
 * -> spam/paid/geo -> relevance -> (semantic dedupe at ingest) -> QUALIFIED | DISCOVERED | REJECTED.
 * Only QUALIFIED records enter the manager "Needs Review" queue. Every count returned is measured.
 */
import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "../db";
import { ingestDiscoveredOpportunity, normalizeOpportunityUrl } from "../discovery";
import { getProvider } from "../providers/registry";
import { BraveSearchDiscoveryProvider, getBraveApiKey, getBraveUsageToday } from "../providers/brave";
import type { CandidateOpportunity } from "../providers/types";
import type { RegionCode } from "../types";
import { recordVerifiedBacklink } from "../backlink-discovery";
import { getLane, LANES, REGION_PRIORITY, type LaneDefinition, type LaneQuery } from "./config";
import { analyzePage, mapLimit } from "./page-analyzer";
import { validateForLane } from "./validator";

export const LANE_QUERY_SETTINGS_KEY = "discovery_lane_queries";
export const COMPETITOR_DOMAINS_SETTINGS_KEY = "competitor_domains";

export interface LaneRunResult {
  run_id: string;
  lane: string;
  label: string;
  status: "COMPLETED" | "NOT_CONFIGURED" | "FAILED" | "PARTIAL";
  provider_status: Record<string, string>;
  queries_run: number;
  results_returned: number;
  unique_candidates: number;
  already_tracked: number;
  pages_fetched: number;
  qualified_inserted: number;
  discovered_inserted: number;
  rejected: number;
  semantic_or_exact_duplicates: number;
  backlinks_found: number;
  rejection_reasons: Record<string, number>;
  inserted_ids: string[];
  errors: string[];
  message: string;
  started_at: string;
  completed_at: string;
}

async function getSetting(key: string): Promise<string | null> {
  try {
    const { rows } = await cmsQuery<{ key_value: string }>(`SELECT key_value FROM off_page_settings WHERE key_name = ? LIMIT 1`, [key]);
    return rows[0]?.key_value ?? null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string, description: string): Promise<void> {
  const { rows } = await cmsQuery<{ id: string }>(`SELECT id FROM off_page_settings WHERE key_name = ? LIMIT 1`, [key]);
  if (rows.length > 0) {
    await cmsExecute(`UPDATE off_page_settings SET key_value = ?, updated_at = NOW() WHERE key_name = ?`, [value, key]);
  } else {
    await cmsExecute(
      `INSERT INTO off_page_settings (id, key_name, key_value, description, updated_at) VALUES (?, ?, ?, ?, NOW())`,
      [`set_${key}`.slice(0, 64), key, value, description]
    );
  }
}

/** Returns the effective query list for each lane (admin overrides merged over defaults). */
export async function getLaneQueryConfig(): Promise<Record<string, LaneQuery[]>> {
  const out: Record<string, LaneQuery[]> = {};
  for (const l of LANES) out[l.id] = l.defaultQueries;
  const raw = await getSetting(LANE_QUERY_SETTINGS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      for (const [laneId, qs] of Object.entries(parsed || {})) {
        if (!getLane(laneId) || !Array.isArray(qs)) continue;
        out[laneId] = (qs as any[])
          .filter((x) => x && typeof x.query === "string" && x.query.trim())
          .map((x) => ({ query: String(x.query).trim().slice(0, 200), region: (["INDIA", "UAE", "USA", "GLOBAL"].includes(x.region) ? x.region : "GLOBAL") as RegionCode }));
      }
    } catch {
      // ignore malformed override
    }
  }
  return out;
}

export async function getCompetitorDomains(): Promise<string[]> {
  const raw = await getSetting(COMPETITOR_DOMAINS_SETTINGS_KEY);
  if (!raw) return [];
  return raw
    .split(/[\s,]+/)
    .map((d) => d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""))
    .filter((d) => d && d.includes(".") && !d.includes("dgeniussolutions"));
}

function sortByRegionPriority(qs: LaneQuery[]): LaneQuery[] {
  return [...qs].sort((a, b) => (REGION_PRIORITY[a.region] ?? 9) - (REGION_PRIORITY[b.region] ?? 9));
}

/** Runs a single lane end-to-end against live providers. */
export async function runDiscoveryLane(
  laneId: string,
  opts?: { maxQueries?: number; perQuery?: number; maxValidate?: number; runId?: string }
): Promise<LaneRunResult> {
  await ensureOffPageTablesExist();
  const lane = getLane(laneId);
  const startedAt = new Date();
  const runId = opts?.runId || `lane_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const errors: string[] = [];
  const providerStatus: Record<string, string> = {};
  const rejectionReasons: Record<string, number> = {};
  const insertedIds: string[] = [];

  const result: LaneRunResult = {
    run_id: runId,
    lane: laneId,
    label: lane?.label || laneId,
    status: "COMPLETED",
    provider_status: providerStatus,
    queries_run: 0,
    results_returned: 0,
    unique_candidates: 0,
    already_tracked: 0,
    pages_fetched: 0,
    qualified_inserted: 0,
    discovered_inserted: 0,
    rejected: 0,
    semantic_or_exact_duplicates: 0,
    backlinks_found: 0,
    rejection_reasons: rejectionReasons,
    inserted_ids: insertedIds,
    errors,
    message: "",
    started_at: startedAt.toISOString(),
    completed_at: "",
  };

  if (!lane) {
    result.status = "FAILED";
    errors.push(`Unknown lane: ${laneId}`);
    result.message = `Unknown lane ${laneId}`;
    result.completed_at = new Date().toISOString();
    return result;
  }

  await cmsExecute(
    `INSERT INTO off_page_discovery_runs (run_id, provider, started_at, status) VALUES (?, ?, NOW(), 'RUNNING')`,
    [runId, `LANE:${lane.id}`]
  ).catch(() => {});

  const maxQueries = Math.min(Math.max(opts?.maxQueries ?? 4, 1), 12);
  const perQuery = Math.min(Math.max(opts?.perQuery ?? 10, 1), 20);
  const maxValidate = Math.min(Math.max(opts?.maxValidate ?? 40, 1), 120);

  const queryConfig = await getLaneQueryConfig();
  const competitorDomains = await getCompetitorDomains();
  let queries = sortByRegionPriority(queryConfig[lane.id] || []);

  if (lane.validator === "COMPETITOR_GAP") {
    if (competitorDomains.length === 0) {
      result.status = "NOT_CONFIGURED";
      result.message = "COMPETITOR LINK GAP — NOT CONFIGURED. Add competitor domains in Off-Page Settings.";
      errors.push(result.message);
      await finishRun(result);
      return result;
    }
    if (queries.length === 0) {
      queries = competitorDomains.slice(0, 4).map((d) => ({ query: `"${d}" -site:${d} resources OR directory OR "write for us"`, region: "GLOBAL" as RegionCode }));
    }
  }
  queries = queries.slice(0, maxQueries);

  // ---- 1. Collect provider results (live) ----
  const candidates: CandidateOpportunity[] = [];
  for (const p of lane.providers) {
    if (p === "BRAVE_SEARCH") {
      if (!getBraveApiKey()) {
        providerStatus.BRAVE_SEARCH = "NOT_CONFIGURED";
        continue;
      }
      const usage = await getBraveUsageToday();
      if (usage.used >= usage.quota) {
        providerStatus.BRAVE_SEARCH = `QUOTA_EXHAUSTED (${usage.used}/${usage.quota})`;
        continue;
      }
      const brave = new BraveSearchDiscoveryProvider();
      const res = await brave.discoverQueries(
        queries.map((q) => ({ query: q.query, region: q.region, category: lane.category, lane: lane.id })),
        perQuery
      );
      result.queries_run += res.queriesRun;
      errors.push(...res.errors);
      providerStatus.BRAVE_SEARCH = res.queriesRun > 0 ? "ACTIVE" : res.errors.length ? "ERROR" : "NO_QUERIES";
      candidates.push(...res.candidates);
    } else if (p === "GOOGLE_NEWS_RSS") {
      const gn = getProvider("google-news-rss");
      for (const q of queries) {
        try {
          const items = await gn.discover({ queries: [q.query], regions: [q.region], categories: [lane.category], limit: perQuery });
          result.queries_run++;
          candidates.push(...items.map((i) => ({ ...i, source_type: "google_news_rss", lane: lane.id })));
        } catch (e: any) {
          errors.push(`Google News RSS [${q.query}]: ${e?.message}`);
        }
      }
      providerStatus.GOOGLE_NEWS_RSS = "ACTIVE";
    } else if (p === "GDELT") {
      const gd = getProvider("gdelt-doc");
      for (const q of queries) {
        try {
          const items = await gd.discover({ queries: [q.query], regions: [q.region], categories: [lane.category], limit: perQuery });
          result.queries_run++;
          candidates.push(...items.map((i) => ({ ...i, category: lane.category, source_type: "gdelt", lane: lane.id })));
        } catch (e: any) {
          errors.push(`GDELT [${q.query}]: ${e?.message}`);
        }
      }
      providerStatus.GDELT = "ACTIVE";
    }
  }
  result.results_returned = candidates.length;

  const anyProviderUsable = Object.values(providerStatus).some((s) => s === "ACTIVE");
  if (!anyProviderUsable) {
    result.status = "NOT_CONFIGURED";
    result.message = `${lane.label}: no usable live provider (${Object.entries(providerStatus).map(([k, v]) => `${k}=${v}`).join(", ") || "none"}). Nothing was fabricated.`;
    await finishRun(result);
    return result;
  }

  // ---- 2. Normalize + in-run dedupe ----
  const byNorm = new Map<string, CandidateOpportunity>();
  for (const c of candidates) {
    const n = normalizeOpportunityUrl(c.url);
    if (!byNorm.has(n)) byNorm.set(n, c);
  }
  result.unique_candidates = byNorm.size;

  // ---- 3. Exact dedupe against DB ----
  const fresh: Array<{ norm: string; cand: CandidateOpportunity }> = [];
  for (const [norm, cand] of byNorm) {
    const { rows } = await cmsQuery<{ exact_submission_url: string }>(
      `SELECT exact_submission_url FROM off_page_opportunities WHERE domain = ?`,
      [cand.domain.toLowerCase().replace(/^www\./, "")]
    );
    if (rows.some((r) => normalizeOpportunityUrl(r.exact_submission_url) === norm)) {
      result.already_tracked++;
      continue;
    }
    fresh.push({ norm, cand });
  }

  // ---- 4. Live fetch + lane validation (bounded) ----
  const toValidate = fresh.slice(0, maxValidate);
  const verdicts = await mapLimit(toValidate, 5, async ({ cand }) => {
    const analysis = await analyzePage(cand.url, 12000);
    const verdict = await validateForLane(analysis, lane, {
      queryRegion: cand.region,
      competitorDomains,
      brokenLinkCheckLimit: 20,
    });
    return { cand, analysis, verdict };
  });
  result.pages_fetched = verdicts.filter((v) => v.analysis.fetched).length;

  // ---- 5. Persist ----
  for (const { cand, analysis, verdict } of verdicts) {
    // A page that already links to DGS is a backlink, not an opportunity -> backlink pipeline.
    if (analysis.dgsLinks.length > 0) {
      try {
        const rec = await recordVerifiedBacklink({
          analysis,
          sourceTitle: analysis.title || cand.title,
          sourceType: `lane_${lane.id.toLowerCase()}`,
          note: `Observed during lane ${lane.id} (query: ${cand.discovery_query})`,
        });
        if (rec) result.backlinks_found++;
      } catch (e: any) {
        errors.push(`backlink record ${cand.url}: ${e?.message}`);
      }
      continue;
    }

    if (verdict.decision === "REJECTED") {
      result.rejected++;
      for (const r of verdict.reasons) {
        const key = r.split(":")[0];
        rejectionReasons[key] = (rejectionReasons[key] || 0) + 1;
      }
      continue;
    }

    const evidenceParts = [
      cand.evidence || "",
      `Live check: HTTP ${analysis.httpStatus} at ${new Date().toISOString()} (final URL ${analysis.finalUrl}).`,
      analysis.title ? `Page title: "${analysis.title}".` : "",
      verdict.signals.length ? `Signals: ${verdict.signals.slice(0, 12).join(", ")}.` : "",
      verdict.brokenLinks?.length
        ? `Dead outbound links: ${verdict.brokenLinks.slice(0, 5).map((b) => `${b.href} [${b.status || "unreachable"}]`).join("; ")}.`
        : "",
      verdict.competitorLinks?.length ? `Competitor links: ${verdict.competitorLinks.slice(0, 5).join("; ")}.` : "",
    ].filter(Boolean);

    let siteName = analysis.title || cand.site_name || cand.domain;
    siteName = siteName.replace(/\s+/g, " ").slice(0, 200);

    const ing = await ingestDiscoveredOpportunity({
      site_name: siteName,
      domain: cand.domain,
      exact_submission_url: analysis.finalUrl || cand.url,
      region: verdict.region,
      country: verdict.region === "INDIA" ? "India" : verdict.region === "UAE" ? "United Arab Emirates" : verdict.region === "USA" ? "United States" : "Global",
      category: lane.category,
      free_status: verdict.freeStatus,
      dofollow_status: verdict.linkType,
      link_type: lane.category,
      submission_type: lane.validator,
      topical_relevance: Math.max(40, verdict.relevance),
      notes: `Lane ${lane.label}.`,
      evidence: evidenceParts.join(" ").slice(0, 4000),
      discovery_provider: cand.discovery_provider,
      discovery_query: cand.discovery_query,
      http_status: analysis.httpStatus,
      verification_status: verdict.decision === "QUALIFIED" ? "VERIFIED_ACTIVE" : "REACHABLE_UNQUALIFIED",
      source_type: cand.source_type || cand.discovery_provider.toLowerCase(),
      status: verdict.decision,
      discovery_lane: lane.id,
      page_title: analysis.title,
      qualification_reason: verdict.reasons.join("; ").slice(0, 1000),
    });

    if (ing.success && ing.id) {
      insertedIds.push(ing.id);
      if (verdict.decision === "QUALIFIED") result.qualified_inserted++;
      else result.discovered_inserted++;
    } else if (ing.error?.includes("DUPLICATE")) {
      result.semantic_or_exact_duplicates++;
    } else if (ing.error?.includes("SPAM")) {
      result.rejected++;
      rejectionReasons.SPAM_FILTER = (rejectionReasons.SPAM_FILTER || 0) + 1;
    } else if (ing.error) {
      errors.push(ing.error);
    }
  }

  // Inserted QUALIFIED may have been demoted by semantic dedupe at ingest -> re-measure from DB.
  if (insertedIds.length > 0) {
    const placeholders = insertedIds.map(() => "?").join(",");
    const { rows } = await cmsQuery<{ status: string; c: any }>(
      `SELECT status, COUNT(*) AS c FROM off_page_opportunities WHERE id IN (${placeholders}) GROUP BY status`,
      insertedIds
    );
    result.qualified_inserted = Number(rows.find((r) => r.status === "QUALIFIED")?.c || 0);
    result.discovered_inserted = Number(rows.find((r) => r.status === "DISCOVERED")?.c || 0);
  }

  result.status = errors.length > 0 && result.pages_fetched === 0 ? "PARTIAL" : "COMPLETED";
  result.message =
    `${lane.label}: ${result.results_returned} provider results, ${result.unique_candidates} unique, ` +
    `${result.already_tracked} already tracked, ${result.pages_fetched} pages fetched live, ` +
    `${result.qualified_inserted} QUALIFIED → Needs Review, ${result.discovered_inserted} raw (DISCOVERED), ` +
    `${result.rejected} rejected, ${result.backlinks_found} existing backlinks recorded.`;
  await finishRun(result);
  return result;
}

async function finishRun(result: LaneRunResult): Promise<void> {
  result.completed_at = new Date().toISOString();
  try {
    await cmsExecute(
      `UPDATE off_page_discovery_runs SET
        completed_at = NOW(), queries_run = ?, results_returned = ?, valid_candidates = ?,
        duplicates_rejected = ?, spam_rejected = ?, inserted_count = ?, errors = ?, status = ?, details = ?
       WHERE run_id = ?`,
      [
        result.queries_run,
        result.results_returned,
        result.qualified_inserted,
        result.already_tracked + result.semantic_or_exact_duplicates,
        result.rejected,
        result.qualified_inserted + result.discovered_inserted,
        result.errors.length ? result.errors.slice(0, 5).join("; ").slice(0, 2000) : null,
        result.status,
        JSON.stringify({ ...result, inserted_ids: result.inserted_ids.slice(0, 200) }),
        result.run_id,
      ]
    );
  } catch (e) {
    console.warn("[lanes] failed to finalize run log", e);
  }
}

/** Lane status overview for the admin UI: config, provider readiness and last run per lane. */
export async function getLaneOverview(): Promise<
  Array<{
    id: string;
    label: string;
    category: string;
    validator: string;
    providers: string[];
    description: string;
    queries: LaneQuery[];
    ready: boolean;
    readiness: string;
    last_run: any | null;
  }>
> {
  await ensureOffPageTablesExist();
  const cfg = await getLaneQueryConfig();
  const competitors = await getCompetitorDomains();
  const braveOk = !!getBraveApiKey();
  const { rows: runs } = await cmsQuery<any>(
    `SELECT r.* FROM off_page_discovery_runs r
     JOIN (SELECT provider, MAX(started_at) AS m FROM off_page_discovery_runs WHERE provider LIKE 'LANE:%' GROUP BY provider) x
       ON x.provider = r.provider AND x.m = r.started_at`
  ).catch(() => ({ rows: [] as any[] }));
  const lastBy: Record<string, any> = {};
  for (const r of runs) lastBy[String(r.provider).replace(/^LANE:/, "")] = r;

  return LANES.map((l: LaneDefinition) => {
    const usable = l.providers.filter((p) => (p === "BRAVE_SEARCH" ? braveOk : true));
    let ready = usable.length > 0;
    let readiness = ready ? `Ready via ${usable.join(", ")}` : "WEB SEARCH (BRAVE) — NOT CONFIGURED";
    if (l.validator === "COMPETITOR_GAP" && competitors.length === 0) {
      ready = false;
      readiness = "NOT CONFIGURED — add competitor domains";
    }
    const last = lastBy[l.id] || null;
    let details: any = null;
    if (last?.details) {
      try {
        details = typeof last.details === "string" ? JSON.parse(last.details) : last.details;
      } catch {}
    }
    return {
      id: l.id,
      label: l.label,
      category: l.category,
      validator: l.validator,
      providers: l.providers,
      description: l.description,
      queries: cfg[l.id] || [],
      ready,
      readiness,
      last_run: last
        ? {
            run_id: last.run_id,
            status: last.status,
            started_at: last.started_at,
            completed_at: last.completed_at,
            message: details?.message || null,
            qualified: details?.qualified_inserted ?? null,
            discovered: details?.discovered_inserted ?? null,
            rejected: details?.rejected ?? null,
            results: details?.results_returned ?? null,
          }
        : null,
    };
  });
}
