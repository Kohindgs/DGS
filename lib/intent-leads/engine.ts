import { randomUUID, createHash } from "node:crypto";
import * as cheerio from "cheerio";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "../cms/db";
import { fetchWithTimeout } from "../net/fetch-with-timeout";
import {
  sendIntentLeadsDigestEmail,
  type IntentLeadEmailItem,
} from "../notifications/intent-lead-email";

declare global {
  var __dgsIntentLeadTablesEnsured: boolean | undefined;
}

export const INTENT_LEADS_ACCESS_PIN = "0215";

export type IntentSourcePlatform =
  | "LINKEDIN_FEED"
  | "LINKEDIN_PUBLIC"
  | "REDDIT"
  | "X_TWITTER"
  | "WEB_FORUM"
  | "GOOGLE_SERP_INTENT";

export type IntentServiceCategory =
  | "SEO"
  | "WEB_DEV"
  | "AI_VIDEO"
  | "AEO_GEO"
  | "PAID_MEDIA"
  | "BRANDING";

export type IntentRegion = "INDIA" | "UAE_DUBAI" | "USA" | "UK" | "GLOBAL";

export type IntentClassification =
  | "BUYER_SEEKING_SERVICE"
  | "HIGH_INTENT_DISCUSSION"
  | "SELLER_PROMOTION"
  | "JOB_SEEKER"
  | "LOW_INTENT_NOISE";

export type FreshnessTier = "1H_12H" | "24H" | "3D";

export type IntentLeadSignal = {
  id: string;
  url_hash: string;
  source_platform: IntentSourcePlatform;
  post_url: string;
  post_title: string | null;
  post_text: string;
  author_name: string | null;
  author_role: string | null;
  author_profile_url: string | null;
  company_name: string | null;
  contact_hint: string | null;
  service_category: IntentServiceCategory;
  target_region: IntentRegion;
  discovery_query: string | null;
  intent_classification: IntentClassification;
  intent_score: number;
  urgency_level: "HIGH" | "MEDIUM" | "LOW";
  ai_reasoning: string | null;
  suggested_reply: string | null;
  suggested_dm: string | null;
  recommended_dgs_url: string | null;
  status: "NEW" | "CONTACTED" | "ARCHIVED" | "DISMISSED";
  crm_lead_id: string | null;
  notified_at: string | null;
  published_at: string | null;
  age_hours: number | null;
  freshness_tier: FreshnessTier;
  discovered_at: string;
  updated_at: string;
};

export type IntentDiscoveryRun = {
  id: string;
  run_type: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number;
  status: "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED";
  queries_executed: number;
  raw_candidates_found: number;
  qualified_leads_added: number;
  rejected_noise_count: number;
  emails_sent: number;
  summary_text: string | null;
  error_message: string | null;
  metadata_json: any;
  created_at: string;
};

export type GoogleBuyerIntentQuery = {
  query_text: string;
  page_url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  service_category: IntentServiceCategory;
  target_region: IntentRegion;
  buyer_intent_tier: "HIGH_COMMERCIAL" | "EVALUATION" | "SOLUTION_AWARE";
  recommended_action: string;
};

export type LinkedInFeedPresetSearch = {
  id: string;
  serviceCategory: IntentServiceCategory;
  label: string;
  region: IntentRegion;
  booleanQuery: string;
  linkedinSearch24hUrl: string;
  linkedinSearchWeekUrl: string;
  googleDork24hUrl: string;
  googleDork3dUrl: string;
  redditSearch24hUrl: string;
};

/**
 * Canonical live D'Genius Solutions service URLs
 */
const DGS_SERVICE_URLS: Record<IntentServiceCategory, string> = {
  SEO: "https://www.dgeniussolutions.com/services/seo/",
  AEO_GEO: "https://www.dgeniussolutions.com/services/aeo-geo-aio/",
  WEB_DEV: "https://www.dgeniussolutions.com/services/website-development/",
  AI_VIDEO: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
  PAID_MEDIA: "https://www.dgeniussolutions.com/services/digital-marketing/",
  BRANDING: "https://www.dgeniussolutions.com/services/branding/",
};

export const LINKEDIN_FEED_PRESET_SEARCHES: LinkedInFeedPresetSearch[] = [
  {
    id: "li-seo-agency",
    serviceCategory: "SEO",
    label: "Looking for SEO Agency / Technical SEO Partner",
    region: "GLOBAL",
    booleanQuery: `"looking for" AND ("SEO agency" OR "SEO consultant" OR "SEO partner" OR "technical SEO") -job -jobs -internship -recruiting`,
    // datePosted=%22past-24h%22 filters LinkedIn content search to strictly the last 24 hours!
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" OR "recommend an SEO"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" OR "recommend an SEO"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("SEO agency" OR "SEO company" OR "SEO consultant") -hiring -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("SEO agency" OR "SEO company" OR "SEO consultant") -hiring -jobs`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("SEO agency" OR "SEO consultant")`)}&sort=new&t=day`,
  },
  {
    id: "li-web-dev",
    serviceCategory: "WEB_DEV",
    label: "Looking for Website Development / Redesign / AMC",
    region: "GLOBAL",
    booleanQuery: `("looking for" OR "recommend") AND ("website development" OR "web design agency" OR "website redesign" OR "Next.js agency" OR "website maintenance") -job -recruiter`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "web development agency" OR "website redesign"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "web development agency" OR "website redesign"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("web design agency" OR "website redesign" OR "website development company") -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("web design agency" OR "website redesign" OR "website development company") -jobs`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "need") ("website redesign" OR "web development agency")`)}&sort=new&t=day`,
  },
  {
    id: "li-ai-video",
    serviceCategory: "AI_VIDEO",
    label: "Looking for AI Video Production / Brand Film Studio",
    region: "GLOBAL",
    booleanQuery: `("looking for" OR "recommend" OR "need") AND ("AI video" OR "video production agency" OR "brand film" OR "commercial video production")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "video production agency" OR "AI video"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "video production agency" OR "AI video"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("video production agency" OR "AI video production" OR "ad film production")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("video production agency" OR "AI video production" OR "ad film production")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("video production agency" OR "AI video production")`)}&sort=new&t=day`,
  },
  {
    id: "li-aeo-dubai",
    serviceCategory: "AEO_GEO",
    label: "Looking for AEO / GEO / AI Search & Dubai SEO",
    region: "UAE_DUBAI",
    booleanQuery: `("looking for" OR "recommend" OR "agency") AND ("AEO" OR "Answer Engine Optimization" OR "Generative Engine Optimization" OR "SEO Dubai")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"SEO agency Dubai" OR "Answer Engine Optimization" OR "GEO agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"SEO agency Dubai" OR "Answer Engine Optimization" OR "GEO agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE" OR "looking for") ("SEO agency" OR "digital marketing agency" OR "AEO")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE" OR "looking for") ("SEO agency" OR "digital marketing agency" OR "AEO")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("Dubai" OR "UAE") ("SEO agency" OR "marketing agency" OR "website")`)}&sort=new&t=day`,
  },
  {
    id: "li-paid-media",
    serviceCategory: "PAID_MEDIA",
    label: "Looking for Performance Marketing / Paid Ads Agency",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("performance marketing agency" OR "Google Ads agency" OR "Meta Ads agency" OR "lead generation agency")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "performance marketing agency" OR "digital marketing agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "performance marketing agency" OR "digital marketing agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("performance marketing agency" OR "digital marketing agency") ("Mumbai" OR "India" OR "Dubai")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("performance marketing agency" OR "digital marketing agency") ("Mumbai" OR "India" OR "Dubai")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("performance marketing agency" OR "Google Ads agency")`)}&sort=new&t=day`,
  },
  {
    id: "li-branding-social",
    serviceCategory: "BRANDING",
    label: "Looking for Branding, Content & Social Media Agency",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("branding agency" OR "social media agency" OR "creative agency") -job -internship`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "branding agency" OR "social media agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "branding agency" OR "social media agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("branding agency" OR "social media marketing agency") -hiring`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("branding agency" OR "social media marketing agency") -hiring`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("branding agency" OR "social media agency")`)}&sort=new&t=day`,
  },
];

type DiscoveryQuerySpec = {
  query: string;
  platform: IntentSourcePlatform;
  serviceCategory: IntentServiceCategory;
  region: IntentRegion;
};

const DISCOVERY_QUERY_POOL: DiscoveryQuerySpec[] = [
  // Public LinkedIn Posts (Filtered with df=d / freshness: last 24h–72h)
  {
    query: `site:linkedin.com/posts "looking for" "SEO agency" OR "SEO consultant" -hiring -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "SEO",
    region: "GLOBAL",
  },
  {
    query: `site:linkedin.com/posts "looking for" "website development" OR "web design agency" OR "website redesign" -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "WEB_DEV",
    region: "GLOBAL",
  },
  {
    query: `site:linkedin.com/posts "looking for" "video production agency" OR "AI video" OR "brand film"`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "AI_VIDEO",
    region: "GLOBAL",
  },
  {
    query: `site:linkedin.com/posts "looking for" "digital marketing agency" OR "performance marketing" Mumbai OR India OR Dubai`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "PAID_MEDIA",
    region: "INDIA",
  },
  {
    query: `site:linkedin.com/posts "recommend" "SEO agency" OR "marketing agency" Dubai OR UAE`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "AEO_GEO",
    region: "UAE_DUBAI",
  },
  {
    query: `site:linkedin.com/posts "looking for" "branding agency" OR "social media agency" -intern -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "BRANDING",
    region: "INDIA",
  },
  // X / Twitter Buyer-Intent Posts
  {
    query: `site:x.com "looking for" ("SEO agency" OR "web design agency" OR "video production agency")`,
    platform: "X_TWITTER",
    serviceCategory: "SEO",
    region: "GLOBAL",
  },
];

export async function ensureIntentLeadTables(): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  if (global.__dgsIntentLeadTablesEnsured) return;

  await cmsExecute(`
    CREATE TABLE IF NOT EXISTS intent_lead_signals (
      id VARCHAR(64) PRIMARY KEY,
      url_hash VARCHAR(64) NOT NULL UNIQUE,
      source_platform VARCHAR(40) NOT NULL DEFAULT 'LINKEDIN_PUBLIC',
      post_url TEXT NOT NULL,
      post_title VARCHAR(500) NULL,
      post_text TEXT NOT NULL,
      author_name VARCHAR(255) NULL,
      author_role VARCHAR(255) NULL,
      author_profile_url VARCHAR(500) NULL,
      company_name VARCHAR(255) NULL,
      contact_hint VARCHAR(255) NULL,
      service_category VARCHAR(64) NOT NULL DEFAULT 'SEO',
      target_region VARCHAR(40) NOT NULL DEFAULT 'GLOBAL',
      discovery_query VARCHAR(500) NULL,
      intent_classification VARCHAR(64) NOT NULL DEFAULT 'BUYER_SEEKING_SERVICE',
      intent_score INT NOT NULL DEFAULT 70,
      urgency_level VARCHAR(24) NOT NULL DEFAULT 'MEDIUM',
      ai_reasoning TEXT NULL,
      suggested_reply TEXT NULL,
      suggested_dm TEXT NULL,
      recommended_dgs_url VARCHAR(500) NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'NEW',
      crm_lead_id VARCHAR(64) NULL,
      notified_at DATETIME NULL,
      published_at DATETIME NULL,
      age_hours INT NULL,
      freshness_tier VARCHAR(24) NOT NULL DEFAULT '24H',
      discovered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ils_status_score (status, intent_score DESC, discovered_at DESC),
      INDEX idx_ils_platform (source_platform, discovered_at DESC),
      INDEX idx_ils_service (service_category, status),
      INDEX idx_ils_classification (intent_classification, intent_score DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  for (const colSql of [
    "ALTER TABLE intent_lead_signals ADD COLUMN age_hours INT NULL AFTER published_at",
    "ALTER TABLE intent_lead_signals ADD COLUMN freshness_tier VARCHAR(24) NOT NULL DEFAULT '24H' AFTER age_hours",
  ]) {
    try {
      await cmsExecute(colSql);
    } catch {}
  }

  await cmsExecute(`
    CREATE TABLE IF NOT EXISTS intent_lead_discovery_runs (
      id VARCHAR(64) PRIMARY KEY,
      run_type VARCHAR(32) NOT NULL DEFAULT 'CRON',
      started_at DATETIME NOT NULL,
      completed_at DATETIME NULL,
      duration_ms INT NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
      queries_executed INT NOT NULL DEFAULT 0,
      raw_candidates_found INT NOT NULL DEFAULT 0,
      qualified_leads_added INT NOT NULL DEFAULT 0,
      rejected_noise_count INT NOT NULL DEFAULT 0,
      emails_sent INT NOT NULL DEFAULT 0,
      summary_text TEXT NULL,
      error_message TEXT NULL,
      metadata_json JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ildr_started (started_at DESC),
      INDEX idx_ildr_status (status, started_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await cmsExecute(`
    CREATE TABLE IF NOT EXISTS intent_lead_settings (
      setting_key VARCHAR(64) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  global.__dgsIntentLeadTablesEnsured = true;
}

export async function getOrCreateIngestToken(): Promise<string> {
  if (!isCmsDatabaseConfigured()) return "dgs_li_local_dev_token";
  await ensureIntentLeadTables();

  const { rows } = await cmsQuery<{ setting_value: string }>(
    `SELECT setting_value FROM intent_lead_settings WHERE setting_key = 'linkedin_companion_token' LIMIT 1`
  );
  if (rows.length > 0 && rows[0].setting_value) {
    return rows[0].setting_value;
  }

  const secretSeed = process.env.DGS_CRON_SECRET || process.env.DGS_MYSQL_PASSWORD || "dgs-v8130";
  const token =
    "dgs_li_" +
    createHash("sha256")
      .update(`dgs-linkedin-companion:${secretSeed}`)
      .digest("hex")
      .slice(0, 28);

  await cmsExecute(
    `INSERT IGNORE INTO intent_lead_settings (setting_key, setting_value) VALUES ('linkedin_companion_token', ?)`,
    [token]
  );
  return token;
}

function normalizeUrlForHash(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.trim());
    for (const p of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "trk",
      "rcm",
      "originalSubdomain",
    ]) {
      u.searchParams.delete(p);
    }
    return u.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}

export function computeUrlHash(url: string, fallbackText = ""): string {
  const norm = normalizeUrlForHash(url) || fallbackText.slice(0, 200).toLowerCase();
  return createHash("sha256").update(norm).digest("hex");
}

function decodeBingRedirectUrl(href: string): string {
  if (!href) return href;
  if (!href.includes("/ck/a?")) return href;
  try {
    const u = new URL(href);
    let rawU = u.searchParams.get("u") || "";
    if (rawU.startsWith("a1")) rawU = rawU.slice(2);
    const decoded = Buffer.from(rawU, "base64").toString("utf8");
    if (decoded.startsWith("http")) return decoded;
  } catch {}
  return href;
}

type RawSocialResult = {
  title: string;
  url: string;
  snippet: string;
  platform: IntentSourcePlatform;
  publishedAt: string | null;
  ageHours: number;
  freshnessTier: FreshnessTier;
};

export function classifyFreshnessTier(ageHours: number): FreshnessTier | "STALE" {
  if (ageHours <= 12) return "1H_12H";
  if (ageHours <= 24) return "24H";
  if (ageHours <= 72) return "3D";
  return "STALE";
}

/**
 * Extracts relative age in hours from SERP or LinkedIn text (e.g., "4 hours ago", "2h", "1 day ago").
 * Returns null if an explicit stale marker ("2 weeks ago", "1 month ago", "2024", "2025") is detected.
 */
export function parseFreshnessHoursFromText(text: string): number | null {
  const lower = text.toLowerCase();

  // Reject anything explicitly weeks, months, or years old
  if (/\b(\d+\s*(week|weeks|w|month|months|mo|year|years|yr)s?\s*ago)\b/i.test(lower)) {
    return 999;
  }
  const dayMatch = lower.match(/\b(\d+)\s*(?:day|days|d)\s*ago\b/i);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    return days * 24;
  }
  const hourMatch = lower.match(/\b(\d+)\s*(?:hour|hours|hr|hrs|h)\s*ago\b/i);
  if (hourMatch) {
    return Math.max(1, Number(hourMatch[1]));
  }
  const minMatch = lower.match(/\b(\d+)\s*(?:minute|minutes|min|mins|m)\s*ago\b/i);
  if (minMatch) {
    return 1;
  }
  if (/\b(just now|today|few hours ago)\b/i.test(lower)) {
    return 2;
  }
  if (/\b(yesterday)\b/i.test(lower)) {
    return 24;
  }
  return null;
}

function detectPlatformFromUrl(url: string, fallback: IntentSourcePlatform): IntentSourcePlatform {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin.com")) return "LINKEDIN_PUBLIC";
  if (lower.includes("reddit.com")) return "REDDIT";
  if (lower.includes("x.com") || lower.includes("twitter.com")) return "X_TWITTER";
  return fallback;
}

function isValidSocialLeadUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const path = parsed.pathname.toLowerCase();

    if (host.includes("dgeniussolutions")) return false;

    const isAllowedPlatform =
      host === "linkedin.com" ||
      host.endsWith(".linkedin.com") ||
      host === "reddit.com" ||
      host.endsWith(".reddit.com") ||
      host === "x.com" ||
      host === "twitter.com" ||
      host === "indiehackers.com" ||
      host === "quora.com" ||
      host === "news.ycombinator.com";

    if (!isAllowedPlatform) return false;

    if (host.includes("linkedin.com")) {
      if (
        path.startsWith("/jobs") ||
        path.startsWith("/company/") ||
        path.startsWith("/school/") ||
        path.startsWith("/learning")
      ) {
        return false;
      }
      return (
        path.startsWith("/posts") ||
        path.startsWith("/feed/update") ||
        path.startsWith("/pulse") ||
        path.startsWith("/in/")
      );
    }

    if (host.includes("reddit.com")) {
      if (
        /\/r\/(capcut|piracy|cracked|movies|television|gaming|memes|anime|music|videos|davinciresolve|premiere|aftereffects|youtubers|newtubers)/i.test(
          path
        )
      ) {
        return false;
      }
      return path.includes("/comments/");
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Searches DuckDuckGo with strict `df=d` (Past 24 Hours) or `df=w` (filtered to <=72h)
 */
async function searchDuckDuckGoSocial(
  query: string,
  defaultPlatform: IntentSourcePlatform,
  limit = 10
): Promise<RawSocialResult[]> {
  // df=d enforces Past 24 Hours on DuckDuckGo HTML
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&df=d`;
  const res = await fetchWithTimeout(searchUrl, {
    timeoutMs: 9000,
    maxRetries: 0,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) return [];
  const html = res.text;
  const $ = cheerio.load(html);
  const results: RawSocialResult[] = [];
  const seen = new Set<string>();

  $(".result").each((_, el) => {
    if (results.length >= limit) return;
    const title = $(el).find(".result__title").text().trim().replace(/\s+/g, " ");
    let href = $(el).find(".result__title a").attr("href") || "";

    if (href && href.includes("uddg=")) {
      try {
        const u = new URL("https://duckduckgo.com" + href);
        href = decodeURIComponent(u.searchParams.get("uddg") || href);
      } catch {}
    }

    if (!href || !href.startsWith("http")) return;
    if (!isValidSocialLeadUrl(href)) return;
    if (seen.has(href)) return;

    const snippet = $(el).find(".result__snippet").text().trim().replace(/\s+/g, " ");
    if (!snippet && !title) return;

    const parsedAge = parseFreshnessHoursFromText(`${title} ${snippet}`);
    const ageHours = parsedAge !== null ? parsedAge : 18; // df=d guarantees past 24h unless marked otherwise
    if (ageHours > 72) return; // Strictly reject anything older than 3 days (72h)

    seen.add(href);
    const tier = classifyFreshnessTier(ageHours);
    if (tier === "STALE") return;

    results.push({
      title,
      url: href,
      snippet,
      platform: detectPlatformFromUrl(href, defaultPlatform),
      publishedAt: new Date(Date.now() - ageHours * 3600_000).toISOString(),
      ageHours,
      freshnessTier: tier,
    });
  });

  return results;
}

/**
 * Searches Bing with strict Past 24 Hours (`ex1:"ez1"`) filter
 */
async function searchBingSocial(
  query: string,
  defaultPlatform: IntentSourcePlatform,
  limit = 10
): Promise<RawSocialResult[]> {
  // filters=ex1:"ez1" enforces Past 24 Hours on Bing
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&filters=ex1%3a%22ez1%22`;
  const res = await fetchWithTimeout(url, {
    timeoutMs: 9000,
    maxRetries: 0,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) return [];
  const html = res.text;
  const $ = cheerio.load(html);
  const results: RawSocialResult[] = [];
  const seen = new Set<string>();

  $("li.b_algo").each((_, el) => {
    if (results.length >= limit) return;
    const title = $(el).find("h2 a").text().trim().replace(/\s+/g, " ");
    let href = $(el).find("h2 a").attr("href") || "";
    href = decodeBingRedirectUrl(href);

    if (!href || !href.startsWith("http")) return;
    if (!isValidSocialLeadUrl(href)) return;
    if (seen.has(href)) return;

    const snippet = $(el).find(".result__snippet, .b_caption p").text().trim().replace(/\s+/g, " ");
    if (!snippet && !title) return;

    const parsedAge = parseFreshnessHoursFromText(`${title} ${snippet}`);
    const ageHours = parsedAge !== null ? parsedAge : 18;
    if (ageHours > 72) return;

    seen.add(href);
    const tier = classifyFreshnessTier(ageHours);
    if (tier === "STALE") return;

    results.push({
      title,
      url: href,
      snippet,
      platform: detectPlatformFromUrl(href, defaultPlatform),
      publishedAt: new Date(Date.now() - ageHours * 3600_000).toISOString(),
      ageHours,
      freshnessTier: tier,
    });
  });

  return results;
}

/**
 * Queries Reddit's live JSON feed sorted by `new` (`t=week` filtered by exact `created_utc` <= 72 hours).
 * Every Reddit post has an exact Unix timestamp (`created_utc`), so we can verify 1h–12h, 24h, or <=72h (3 days) precision!
 */
async function searchRedditJsonApi(
  serviceCategory: IntentServiceCategory,
  region: IntentRegion,
  limit = 20
): Promise<RawSocialResult[]> {
  const queryMap: Record<IntentServiceCategory, string> = {
    SEO: `("looking for" OR "recommend" OR "hire" OR "need") ("SEO agency" OR "SEO consultant" OR "SEO company" OR "SEO help" OR "local SEO")`,
    WEB_DEV: `("looking for" OR "recommend" OR "need" OR "hire") ("website redesign" OR "web development" OR "web design" OR "website built" OR "shopify developer")`,
    AI_VIDEO: `("looking for" OR "recommend" OR "hire") ("video production" OR "AI video" OR "explainer video" OR "product video" OR "ad video")`,
    AEO_GEO: `("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AI search" OR "SEO Dubai" OR "marketing agency Dubai" OR "rank in ChatGPT")`,
    PAID_MEDIA: `("looking for" OR "recommend" OR "hire") ("Google Ads" OR "performance marketing" OR "Meta ads" OR "Facebook ads agency" OR "PPC agency")`,
    BRANDING: `("looking for" OR "recommend" OR "hire") ("branding agency" OR "social media agency" OR "creative agency" OR "social media manager")`,
  };

  const q = queryMap[serviceCategory] || queryMap.SEO;
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&t=week&limit=${limit}`;

  try {
    const res = await fetchWithTimeout(url, {
      timeoutMs: 8000,
      maxRetries: 0,
      headers: {
        "User-Agent": "DGS-BuyerIntentRadar/8.13 (https://www.dgeniussolutions.com)",
        Accept: "application/json",
      },
    });
    if (!res.ok || !res.text) return [];
    const data: any = JSON.parse(res.text);
    const children = data?.data?.children || [];
    const results: RawSocialResult[] = [];
    const nowSec = Math.floor(Date.now() / 1000);

    for (const child of children) {
      const post = child?.data;
      if (!post || !post.permalink) continue;

      const createdUtc = Number(post.created_utc || 0);
      if (!createdUtc) continue;

      const ageHours = Math.max(1, Math.round((nowSec - createdUtc) / 3600));
      // STRICT FRESHNESS REQUIREMENT: Reject any post older than 72 hours (3 days)!
      if (ageHours > 72) continue;

      const tier = classifyFreshnessTier(ageHours);
      if (tier === "STALE") continue;

      const title = String(post.title || "").trim();
      const selftext = String(post.selftext || "").trim();
      const author = String(post.author || "").trim();
      const subreddit = String(post.subreddit_name_prefixed || "r/business").trim();
      const fullUrl = `https://www.reddit.com${post.permalink}`;
      if (!isValidSocialLeadUrl(fullUrl)) continue;

      results.push({
        title: `${title} (${subreddit} by u/${author})`,
        url: fullUrl,
        snippet: selftext ? selftext.slice(0, 800) : title,
        platform: "REDDIT",
        publishedAt: new Date(createdUtc * 1000).toISOString(),
        ageHours,
        freshnessTier: tier,
      });
    }
    return results;
  } catch {
    return [];
  }
}

export type EvaluatedLeadCandidate = {
  classification: IntentClassification;
  intentScore: number;
  urgencyLevel: "HIGH" | "MEDIUM" | "LOW";
  serviceCategory: IntentServiceCategory;
  targetRegion: IntentRegion;
  authorName: string | null;
  authorRole: string | null;
  companyName: string | null;
  contactHint: string | null;
  aiReasoning: string;
  suggestedReply: string;
  suggestedDm: string;
  recommendedDgsUrl: string;
};

/**
 * Strict Buyer-Intent Pre-Filter + Scoring.
 * Rejects cold discussions, job seekers, and competing agency self-promotions.
 * Requires genuine buyer-intent signals (actively seeking an agency, consultant, quote, or service partner).
 */
export function evaluateCandidateHeuristically(input: {
  title: string;
  text: string;
  url: string;
  defaultService?: IntentServiceCategory;
  defaultRegion?: IntentRegion;
  authorName?: string | null;
  authorRole?: string | null;
  ageHours?: number;
}): EvaluatedLeadCandidate {
  const combined = `${input.title || ""} ${input.text || ""}`.trim();
  const lower = combined.toLowerCase();

  let authorName = input.authorName || null;
  let authorRole = input.authorRole || null;
  if (!authorName && input.url.includes("linkedin.com")) {
    const m = input.title.match(/^([^|–-]+?)(?:\s+on LinkedIn|\s*[|–-])/i);
    if (m && m[1] && m[1].length < 60) {
      authorName = m[1].trim().replace(/['"]+/g, "");
    }
  }
  if (!authorName && input.url.includes("reddit.com")) {
    const m = input.title.match(/by\s+(u\/[A-Za-z0-9_-]+)/i);
    if (m && m[1]) authorName = m[1];
  }

  const emailMatch = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const contactHint = emailMatch
    ? emailMatch[0]
    : /dm me|drop your portfolio|comment below|send portfolio|inbox me|send me a dm|rip my inbox/i.test(combined)
      ? "Requested DM / Portfolio in Post"
      : null;

  const hasExplicitB2bServiceMention =
    /\b(seo|search engine optimization|aeo|answer engine|generative engine|web development|web design|website redesign|website development|next\.?js|wordpress|shopify|video production|ai video|brand film|ad film|explainer video|performance marketing|google ads|meta ads|facebook ads|ppc|digital marketing|marketing agency|branding agency|social media agency|social media manager|creative agency|website maintenance|website amc)\b/i.test(
      lower
    );

  let serviceCategory: IntentServiceCategory = input.defaultService || "SEO";
  if (/\b(aeo|answer engine|generative engine|ai overview|llm seo|chatgpt ranking|seo agency dubai|digital marketing dubai)\b/i.test(lower)) {
    serviceCategory = "AEO_GEO";
  } else if (/\b(ai video|video production|brand film|ad film|explainer video|commercial video|product video)\b/i.test(lower)) {
    serviceCategory = "AI_VIDEO";
  } else if (/\b(web development|website redesign|web design|next\.?js|wordpress|shopify|website amc|website maintenance|landing page|build a website)\b/i.test(lower)) {
    serviceCategory = "WEB_DEV";
  } else if (/\b(google ads|meta ads|facebook ads|performance marketing|paid media|ppc|lead generation agency|roas)\b/i.test(lower)) {
    serviceCategory = "PAID_MEDIA";
  } else if (/\b(branding agency|brand identity|social media agency|social media management|social media manager|creative agency)\b/i.test(lower)) {
    serviceCategory = "BRANDING";
  } else if (/\b(seo|search engine optimization|backlink|organic traffic|search ranking|local seo)\b/i.test(lower)) {
    serviceCategory = "SEO";
  }

  let targetRegion: IntentRegion = input.defaultRegion || "GLOBAL";
  if (/\b(dubai|uae|abu dhabi|sharjah|mena|middle east)\b/i.test(lower)) {
    targetRegion = "UAE_DUBAI";
  } else if (/\b(mumbai|india|navi mumbai|bangalore|bengaluru|delhi|gurgaon|pune|hyderabad|chennai)\b/i.test(lower)) {
    targetRegion = "INDIA";
  } else if (/\b(uk|london|united kingdom|manchester)\b/i.test(lower)) {
    targetRegion = "UK";
  } else if (/\b(usa|united states|new york|austin|california|san francisco|chicago)\b/i.test(lower)) {
    targetRegion = "USA";
  }

  // Reject Job Seekers & Freelancers pitching themselves ("for hire", "[for hire]", "hire me")
  const isJobSeeker =
    /\b(open to work|#opentowork|\[for hire\]|for hire:|looking for a job|looking for a full-time|looking for an internship|my resume|hire me|applying for|seeking a role|i offer seo|i am a freelance|i am an seo|i can build your)\b/i.test(
      lower
    ) ||
    /\b(we are hiring a full-time|job opening|years of experience required|send your cv to hr)\b/i.test(
      lower
    );

  // Reject Competing Agencies Promoting Themselves or Consumer Entertainment
  const isSellerPromo =
    (/\b(we help brands|our agency|contact us today for|book a free consultation with us|dm me for seo|we offer seo|our seo services|case study: how we)\b/i.test(
      lower
    ) &&
      !/\b(looking for an agency|recommend an agency|anyone know a good|need a reliable)\b/i.test(
        lower
      )) ||
    /\b(capcut|cracked|watch tv show|season 1|prime video|netflix|torrent)\b/i.test(lower);

  // Strict High-Intent Buyer Phrases (Must not be cold!)
  const strongBuyerPhrases = [
    "looking for",
    "anyone recommend",
    "can anyone recommend",
    "recommendations for",
    "recommend a",
    "recommend an",
    "need an agency",
    "need a good",
    "looking to hire",
    "searching for a",
    "drop your portfolio",
    "send your portfolio",
    "who is the best",
    "help with our",
    "redesign our",
    "need help with",
    "any recommendations",
    "looking for a vendor",
    "rfp",
    "which agency",
    "hiring an agency",
    "hire an agency",
    "hire an seo",
    "hire a web",
    "suggestions for",
    "anyone worked with",
    "how to find a good",
    "need seo",
    "need a website",
    "[hiring]",
  ];
  const matchedBuyerPhrases = strongBuyerPhrases.filter((p) => lower.includes(p));

  const hasActiveCommercialQuestion =
    (combined.includes("?") || /\b(recommend|looking|hire|agency|consultant|partner|quote|budget)\b/i.test(lower)) &&
    /\b(agency|consultant|partner|company|freelancer|studio|redesign|audit|quote|budget|hire|looking for)\b/i.test(lower);

  let classification: IntentClassification = "LOW_INTENT_NOISE";
  let score = 25;

  if (!hasExplicitB2bServiceMention) {
    classification = "LOW_INTENT_NOISE";
    score = 15;
  } else if (isJobSeeker) {
    classification = "JOB_SEEKER";
    score = 15;
  } else if (isSellerPromo) {
    classification = "SELLER_PROMOTION";
    score = 20;
  } else if (matchedBuyerPhrases.length > 0 && hasActiveCommercialQuestion) {
    classification = "BUYER_SEEKING_SERVICE";
    score = 78 + Math.min(18, matchedBuyerPhrases.length * 6);
    if (contactHint) score = Math.min(99, score + 6);
    if (targetRegion === "INDIA" || targetRegion === "UAE_DUBAI") {
      score = Math.min(99, score + 4);
    }
    if (input.ageHours && input.ageHours <= 12) {
      score = Math.min(99, score + 4); // Ultra-fresh 1h-12h boost
    }
  } else {
    // Reject cold general chatter! Only high-intent buyer leads are accepted.
    classification = "LOW_INTENT_NOISE";
    score = 40;
  }

  const urgencyLevel: "HIGH" | "MEDIUM" | "LOW" =
    score >= 82 || (input.ageHours !== undefined && input.ageHours <= 12)
      ? "HIGH"
      : score >= 70
        ? "MEDIUM"
        : "LOW";

  const recommendedDgsUrl = DGS_SERVICE_URLS[serviceCategory];
  const firstName = authorName && !authorName.startsWith("u/") ? authorName.split(" ")[0] : "there";

  const servicePitchMap: Record<IntentServiceCategory, string> = {
    SEO: "technical SEO, high-intent organic growth, and AI search visibility (AEO/GEO)",
    AEO_GEO: "Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and regional search dominance across Dubai & global markets",
    WEB_DEV: "high-conversion Next.js/custom website engineering, redesigns, and proactive Website AMC",
    AI_VIDEO: "generative AI video production, commercial brand films, and high-performing ad creatives",
    PAID_MEDIA: "ROI-focused performance marketing across Google Ads, Meta, and LinkedIn",
    BRANDING: "full-funnel brand strategy, identity systems, and executive social media growth",
  };

  const pitch = servicePitchMap[serviceCategory];

  const suggestedReply = `Hi ${firstName} — saw your post looking for ${serviceCategory.replace("_", " ")} support. At D'Genius Solutions, we specialize in ${pitch}. Happy to share relevant case studies and a quick roadmap tailored to your goals: ${recommendedDgsUrl}`;

  const suggestedDm = `Hi ${firstName}, I came across your recent post looking for ${serviceCategory.replace("_", " ")}. We lead ${pitch} for growth-focused brands at D'Genius Solutions (${recommendedDgsUrl}). Would you be open to a quick 10-minute chat this week, or can I send over our relevant work samples here?`;

  const freshnessNote =
    input.ageHours !== undefined
      ? `Posted ~${input.ageHours}h ago.`
      : "Fresh post.";

  const aiReasoning =
    classification === "BUYER_SEEKING_SERVICE"
      ? `${freshnessNote} Verified buyer-intent signal (${matchedBuyerPhrases.slice(0, 2).join(", ")}) actively seeking ${serviceCategory} in ${targetRegion}.${contactHint ? ` Contact cue: ${contactHint}.` : ""}`
      : `Filtered out (${classification} — cold or non-buyer post).`;

  return {
    classification,
    intentScore: score,
    urgencyLevel,
    serviceCategory,
    targetRegion,
    authorName,
    authorRole,
    companyName: null,
    contactHint,
    aiReasoning,
    suggestedReply,
    suggestedDm,
    recommendedDgsUrl,
  };
}

export async function qualifyWithGeminiIfAvailable(
  input: {
    title: string;
    text: string;
    url: string;
    platform: IntentSourcePlatform;
    ageHours?: number;
  },
  heuristic: EvaluatedLeadCandidate
): Promise<EvaluatedLeadCandidate> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "").trim();
  if (!apiKey || apiKey.length < 10) return heuristic;
  if (heuristic.intentScore < 70) return heuristic;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are the strict Buyer-Intent Lead Qualifier for D'Genius Solutions (https://www.dgeniussolutions.com), a digital agency offering:
- SEO (/services/seo/)
- AEO / GEO / AI Search Optimization (/services/aeo-geo-aio/)
- Website Development & Website Maintenance AMC (/services/website-development/ & /services/website-maintenance-amc/)
- AI Video Production & Commercial Brand Films (/services/ai-video-production-agency/)
- Digital & Performance Marketing (/services/digital-marketing/)
- Branding & Social Media Marketing (/services/branding/ & /services/social-media-marketing/)

STRICT RULE: We ONLY want warm/hot BUYER-INTENT leads (people/businesses actively asking for agency recommendations, looking to hire an agency/consultant/partner, or needing help with their company's SEO, website, video production, or marketing).
Reject cold general chatter, reject freelancers pitching themselves ("[For Hire]"), reject job seekers, and reject competing agencies promoting their own services.

POST PLATFORM: ${input.platform} (Age: ~${input.ageHours ?? 12} hours old)
POST URL: ${input.url}
POST TITLE: ${input.title}
POST TEXT: ${input.text.slice(0, 1200)}

Return ONLY valid JSON:
{
  "classification": "BUYER_SEEKING_SERVICE" | "SELLER_PROMOTION" | "JOB_SEEKER" | "LOW_INTENT_NOISE",
  "intentScore": number (0 to 100, give 75-98 ONLY if genuine buyer/prospect seeking service/advice on hiring),
  "urgencyLevel": "HIGH" | "MEDIUM" | "LOW",
  "serviceCategory": "SEO" | "WEB_DEV" | "AI_VIDEO" | "AEO_GEO" | "PAID_MEDIA" | "BRANDING",
  "targetRegion": "INDIA" | "UAE_DUBAI" | "USA" | "UK" | "GLOBAL",
  "authorName": string or null,
  "authorRole": string or null,
  "companyName": string or null,
  "aiReasoning": "1-2 sentence explanation of the prospect's specific requirement and why they have buyer intent",
  "suggestedReply": "Warm, consultative comment reply (max 280 chars) referencing their exact requirement",
  "suggestedDm": "Personalized direct message (max 450 chars)"
}`;

  try {
    const res = await fetchWithTimeout(endpoint, {
      method: "POST",
      timeoutMs: 8500,
      maxRetries: 0,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.15,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok || !res.text) return heuristic;
    const data: any = JSON.parse(res.text);
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return heuristic;

    const parsed = JSON.parse(rawText);
    const serviceCategory: IntentServiceCategory =
      parsed.serviceCategory && DGS_SERVICE_URLS[parsed.serviceCategory as IntentServiceCategory]
        ? (parsed.serviceCategory as IntentServiceCategory)
        : heuristic.serviceCategory;

    return {
      classification: parsed.classification || heuristic.classification,
      intentScore:
        typeof parsed.intentScore === "number"
          ? Math.max(0, Math.min(100, Math.round(parsed.intentScore)))
          : heuristic.intentScore,
      urgencyLevel:
        parsed.urgencyLevel === "HIGH" || parsed.urgencyLevel === "MEDIUM" || parsed.urgencyLevel === "LOW"
          ? parsed.urgencyLevel
          : heuristic.urgencyLevel,
      serviceCategory,
      targetRegion: parsed.targetRegion || heuristic.targetRegion,
      authorName: parsed.authorName || heuristic.authorName,
      authorRole: parsed.authorRole || heuristic.authorRole,
      companyName: parsed.companyName || heuristic.companyName,
      contactHint: heuristic.contactHint,
      aiReasoning: parsed.aiReasoning || heuristic.aiReasoning,
      suggestedReply: parsed.suggestedReply || heuristic.suggestedReply,
      suggestedDm: parsed.suggestedDm || heuristic.suggestedDm,
      recommendedDgsUrl: DGS_SERVICE_URLS[serviceCategory],
    };
  } catch {
    return heuristic;
  }
}

/**
 * Saves a qualified signal exclusively to `intent_lead_signals` (NEVER touches the public `leads` form table).
 */
export async function upsertIntentLeadSignal(input: {
  sourcePlatform: IntentSourcePlatform;
  postUrl: string;
  postTitle?: string | null;
  postText: string;
  discoveryQuery?: string | null;
  authorName?: string | null;
  authorRole?: string | null;
  authorProfileUrl?: string | null;
  publishedAt?: string | null;
  ageHours?: number;
  freshnessTier?: FreshnessTier;
  evaluated: EvaluatedLeadCandidate;
}): Promise<{ inserted: boolean; id: string }> {
  if (!isCmsDatabaseConfigured()) {
    return { inserted: false, id: randomUUID() };
  }
  await ensureIntentLeadTables();

  const ageHours = input.ageHours ?? 6;
  // Strictly enforce <= 72 hours (3 days max)
  if (ageHours > 72) {
    return { inserted: false, id: "skipped_stale" };
  }
  const freshnessTier: FreshnessTier =
    input.freshnessTier || (ageHours <= 12 ? "1H_12H" : ageHours <= 24 ? "24H" : "3D");

  const urlHash = computeUrlHash(input.postUrl, input.postText);

  const { rows: existing } = await cmsQuery<{ id: string }>(
    `SELECT id FROM intent_lead_signals WHERE url_hash = ? LIMIT 1`,
    [urlHash]
  );

  if (existing.length > 0) {
    return { inserted: false, id: existing[0].id };
  }

  const id = `ils_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const publishedDate = input.publishedAt ? new Date(input.publishedAt) : new Date(Date.now() - ageHours * 3600_000);

  await cmsExecute(
    `INSERT INTO intent_lead_signals (
      id, url_hash, source_platform, post_url, post_title, post_text,
      author_name, author_role, author_profile_url, company_name, contact_hint,
      service_category, target_region, discovery_query,
      intent_classification, intent_score, urgency_level,
      ai_reasoning, suggested_reply, suggested_dm, recommended_dgs_url,
      status, published_at, age_hours, freshness_tier
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?)`,
    [
      id,
      urlHash,
      input.sourcePlatform,
      input.postUrl,
      (input.postTitle || "").slice(0, 490) || null,
      input.postText.slice(0, 4000),
      input.evaluated.authorName || input.authorName || null,
      input.evaluated.authorRole || input.authorRole || null,
      input.authorProfileUrl || null,
      input.evaluated.companyName || null,
      input.evaluated.contactHint || null,
      input.evaluated.serviceCategory,
      input.evaluated.targetRegion,
      input.discoveryQuery ? input.discoveryQuery.slice(0, 490) : null,
      input.evaluated.classification,
      input.evaluated.intentScore,
      input.evaluated.urgencyLevel,
      input.evaluated.aiReasoning,
      input.evaluated.suggestedReply,
      input.evaluated.suggestedDm,
      input.evaluated.recommendedDgsUrl,
      publishedDate,
      ageHours,
      freshnessTier,
    ]
  );

  return { inserted: true, id };
}

/**
 * Executes a Fresh Buyer-Intent Lead Discovery Run (strictly 1h–12h, 24h, and <=3 days old,
 * and strictly high-intent buyers — zero cold posts, zero form submissions).
 * Automatically sends an email notification whenever new buyer-intent leads are fetched.
 */
export async function runIntentLeadDiscovery(options?: {
  runType?: "CRON" | "MANUAL" | "SERVICE_FILTER";
  serviceFilter?: IntentServiceCategory;
  sendEmailDigest?: boolean;
}): Promise<{
  runId: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  queriesExecuted: number;
  rawCandidatesFound: number;
  qualifiedLeadsAdded: number;
  rejectedNoiseCount: number;
  emailsSent: number;
  durationMs: number;
  summaryText: string;
}> {
  const startedAt = new Date();
  const startMs = startedAt.getTime();
  const BUDGET_MS = 32_000;
  const runId = `ildr_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
  const runType = options?.runType || "CRON";

  if (isCmsDatabaseConfigured()) {
    await ensureIntentLeadTables();
    // Auto-prune any leads older than 4 days that are still untouched so the vault stays 100% fresh
    await cmsExecute(
      `DELETE FROM intent_lead_signals WHERE status = 'NEW' AND discovered_at < DATE_SUB(NOW(), INTERVAL 4 DAY)`
    ).catch(() => {});

    await cmsExecute(
      `INSERT INTO intent_lead_discovery_runs (id, run_type, started_at, status) VALUES (?, ?, ?, 'RUNNING')`,
      [runId, runType, startedAt]
    );
  }

  let queriesExecuted = 0;
  let rawCandidatesFound = 0;
  let qualifiedLeadsAdded = 0;
  let rejectedNoiseCount = 0;
  let emailsSent = 0;
  const newlyInsertedForEmail: IntentLeadEmailItem[] = [];

  try {
    const targetCategories: IntentServiceCategory[] = options?.serviceFilter
      ? [options.serviceFilter]
      : ["SEO", "WEB_DEV", "AI_VIDEO", "AEO_GEO", "PAID_MEDIA", "BRANDING"];

    // 1. Fresh Reddit Buyer-Intent Search (Exact created_utc <= 72h, prioritizing 1h-12h and 24h)
    for (const cat of targetCategories.slice(0, 4)) {
      if (Date.now() - startMs > BUDGET_MS - 8000) break;
      const redditResults = await searchRedditJsonApi(cat, "GLOBAL", 20);
      queriesExecuted++;
      rawCandidatesFound += redditResults.length;

      for (const r of redditResults) {
        const heuristic = evaluateCandidateHeuristically({
          title: r.title,
          text: r.snippet,
          url: r.url,
          defaultService: cat,
          ageHours: r.ageHours,
        });

        if (heuristic.classification !== "BUYER_SEEKING_SERVICE" || heuristic.intentScore < 72) {
          rejectedNoiseCount++;
          continue;
        }

        const evaluated =
          Date.now() - startMs < BUDGET_MS - 9000 && newlyInsertedForEmail.length < 4
            ? await qualifyWithGeminiIfAvailable(
                { title: r.title, text: r.snippet, url: r.url, platform: "REDDIT", ageHours: r.ageHours },
                heuristic
              )
            : heuristic;

        if (evaluated.classification !== "BUYER_SEEKING_SERVICE" || evaluated.intentScore < 72) {
          rejectedNoiseCount++;
          continue;
        }

        const upserted = await upsertIntentLeadSignal({
          sourcePlatform: "REDDIT",
          postUrl: r.url,
          postTitle: r.title,
          postText: r.snippet,
          discoveryQuery: `Fresh <72h buyer search (${cat})`,
          publishedAt: r.publishedAt,
          ageHours: r.ageHours,
          freshnessTier: r.freshnessTier,
          evaluated,
        });

        if (upserted.inserted) {
          qualifiedLeadsAdded++;
          newlyInsertedForEmail.push({
            id: upserted.id,
            sourcePlatform: `REDDIT (${r.ageHours}h ago)`,
            postUrl: r.url,
            authorName: evaluated.authorName || "Active Service Buyer",
            authorRole: evaluated.authorRole || `Posted ${r.ageHours}h ago`,
            companyName: evaluated.companyName || "",
            serviceCategory: evaluated.serviceCategory,
            targetRegion: evaluated.targetRegion,
            intentScore: evaluated.intentScore,
            urgencyLevel: evaluated.urgencyLevel,
            postSnippet: `${r.title} — ${r.snippet}`.slice(0, 350),
            aiReasoning: evaluated.aiReasoning,
            suggestedReply: evaluated.suggestedReply,
            recommendedDgsUrl: evaluated.recommendedDgsUrl,
          });
        }
      }
    }

    // 2. Public LinkedIn & X Fresh 24h Search
    const pool = options?.serviceFilter
      ? DISCOVERY_QUERY_POOL.filter((q) => q.serviceCategory === options.serviceFilter)
      : DISCOVERY_QUERY_POOL;
    const hourOffset = new Date().getUTCHours() % Math.max(1, pool.length);
    const orderedQueries = [...pool.slice(hourOffset), ...pool.slice(0, hourOffset)].slice(0, 4);

    for (const spec of orderedQueries) {
      if (Date.now() - startMs > BUDGET_MS - 6000) break;

      let webResults = await searchDuckDuckGoSocial(spec.query, spec.platform, 10).catch(() => []);
      if (webResults.length === 0 && Date.now() - startMs < BUDGET_MS - 6000) {
        webResults = await searchBingSocial(spec.query, spec.platform, 10).catch(() => []);
      }
      queriesExecuted++;
      rawCandidatesFound += webResults.length;

      for (const r of webResults) {
        const heuristic = evaluateCandidateHeuristically({
          title: r.title,
          text: r.snippet,
          url: r.url,
          defaultService: spec.serviceCategory,
          defaultRegion: spec.region,
          ageHours: r.ageHours,
        });

        if (heuristic.classification !== "BUYER_SEEKING_SERVICE" || heuristic.intentScore < 72) {
          rejectedNoiseCount++;
          continue;
        }

        const evaluated =
          Date.now() - startMs < BUDGET_MS - 9000 && newlyInsertedForEmail.length < 5
            ? await qualifyWithGeminiIfAvailable(
                { title: r.title, text: r.snippet, url: r.url, platform: r.platform, ageHours: r.ageHours },
                heuristic
              )
            : heuristic;

        if (evaluated.classification !== "BUYER_SEEKING_SERVICE" || evaluated.intentScore < 72) {
          rejectedNoiseCount++;
          continue;
        }

        const upserted = await upsertIntentLeadSignal({
          sourcePlatform: r.platform,
          postUrl: r.url,
          postTitle: r.title,
          postText: r.snippet || r.title,
          discoveryQuery: spec.query,
          publishedAt: r.publishedAt,
          ageHours: r.ageHours,
          freshnessTier: r.freshnessTier,
          evaluated,
        });

        if (upserted.inserted) {
          qualifiedLeadsAdded++;
          newlyInsertedForEmail.push({
            id: upserted.id,
            sourcePlatform: `${r.platform} (~${r.ageHours}h old)`,
            postUrl: r.url,
            authorName: evaluated.authorName || "LinkedIn Prospect",
            authorRole: evaluated.authorRole || `Posted ~${r.ageHours}h ago`,
            companyName: evaluated.companyName || "",
            serviceCategory: evaluated.serviceCategory,
            targetRegion: evaluated.targetRegion,
            intentScore: evaluated.intentScore,
            urgencyLevel: evaluated.urgencyLevel,
            postSnippet: `${r.title} — ${r.snippet}`.slice(0, 350),
            aiReasoning: evaluated.aiReasoning,
            suggestedReply: evaluated.suggestedReply,
            recommendedDgsUrl: evaluated.recommendedDgsUrl,
          });
        }
      }
    }

    // 3. Always send Email Notification when new Buyer-Intent Leads are fetched!
    if (options?.sendEmailDigest !== false && newlyInsertedForEmail.length > 0) {
      const sortedLeads = newlyInsertedForEmail.sort((a, b) => b.intentScore - a.intentScore);
      const emailRes = await sendIntentLeadsDigestEmail({
        runType,
        leads: sortedLeads,
        totalChecked: rawCandidatesFound,
      });
      if (emailRes.sent) {
        emailsSent = 1;
        for (const item of sortedLeads) {
          await cmsExecute(
            `UPDATE intent_lead_signals SET notified_at = NOW() WHERE id = ?`,
            [item.id]
          ).catch(() => {});
        }
      }
    }

    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startMs);
    const summaryText = `Executed ${queriesExecuted} fresh (<72h) queries across LinkedIn, Reddit & Web. Evaluated ${rawCandidatesFound} recent posts, qualified ${qualifiedLeadsAdded} warm buyer-intent leads, rejected ${rejectedNoiseCount} cold/job-seeker posts.${emailsSent ? " Email alert sent!" : ""}`;

    if (isCmsDatabaseConfigured()) {
      await cmsExecute(
        `UPDATE intent_lead_discovery_runs
         SET completed_at = ?, duration_ms = ?, status = 'SUCCESS',
             queries_executed = ?, raw_candidates_found = ?,
             qualified_leads_added = ?, rejected_noise_count = ?,
             emails_sent = ?, summary_text = ?
         WHERE id = ?`,
        [
          completedAt,
          durationMs,
          queriesExecuted,
          rawCandidatesFound,
          qualifiedLeadsAdded,
          rejectedNoiseCount,
          emailsSent,
          summaryText,
          runId,
        ]
      );
    }

    return {
      runId,
      status: "SUCCESS",
      queriesExecuted,
      rawCandidatesFound,
      qualifiedLeadsAdded,
      rejectedNoiseCount,
      emailsSent,
      durationMs,
      summaryText,
    };
  } catch (err: any) {
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startMs);
    const errorMsg = String(err?.message || err);

    if (isCmsDatabaseConfigured()) {
      await cmsExecute(
        `UPDATE intent_lead_discovery_runs
         SET completed_at = ?, duration_ms = ?, status = 'FAILED',
             queries_executed = ?, raw_candidates_found = ?,
             qualified_leads_added = ?, rejected_noise_count = ?,
             error_message = ?
         WHERE id = ?`,
        [
          completedAt,
          durationMs,
          queriesExecuted,
          rawCandidatesFound,
          qualifiedLeadsAdded,
          rejectedNoiseCount,
          errorMsg.slice(0, 1000),
          runId,
        ]
      ).catch(() => {});
    }

    return {
      runId,
      status: "FAILED",
      queriesExecuted,
      rawCandidatesFound,
      qualifiedLeadsAdded,
      rejectedNoiseCount,
      emailsSent: 0,
      durationMs,
      summaryText: `Discovery failed: ${errorMsg}`,
    };
  }
}

/**
 * Ingests posts captured from the user's personal LinkedIn feed/search via the browser bookmarklet
 * (Zero LinkedIn credentials or cookies ever shared with the server).
 * Enforces strict freshness (1h–12h, 24h, <=3 days) and automatically emails you when leads are fetched!
 */
export async function ingestLinkedInFeedPosts(
  posts: Array<{
    postUrl?: string;
    authorName?: string;
    authorRole?: string;
    authorProfileUrl?: string;
    postText: string;
    publishedAt?: string;
    ageText?: string;
  }>,
  sendDigest = true
): Promise<{
  received: number;
  qualifiedAdded: number;
  skippedNoise: number;
  duplicates: number;
  addedSignals: Array<{
    id: string;
    authorName: string | null;
    serviceCategory: IntentServiceCategory;
    intentScore: number;
    classification: IntentClassification;
    ageHours: number;
  }>;
}> {
  await ensureIntentLeadTables();

  let qualifiedAdded = 0;
  let skippedNoise = 0;
  let duplicates = 0;
  const addedSignals: Array<{
    id: string;
    authorName: string | null;
    serviceCategory: IntentServiceCategory;
    intentScore: number;
    classification: IntentClassification;
    ageHours: number;
  }> = [];
  const emailItems: IntentLeadEmailItem[] = [];

  for (const post of posts.slice(0, 40)) {
    const text = String(post.postText || "").trim();
    if (text.length < 25) continue;

    // Parse post age from LinkedIn timestamp badge ("3h", "1d", "2w")
    const parsedAge = parseFreshnessHoursFromText(`${post.ageText || ""} ${text.slice(0, 120)}`);
    const ageHours = parsedAge !== null ? parsedAge : 4;
    if (ageHours > 72) {
      skippedNoise++;
      continue;
    }

    const freshnessTier = classifyFreshnessTier(ageHours);
    if (freshnessTier === "STALE") {
      skippedNoise++;
      continue;
    }

    const postUrl =
      post.postUrl && post.postUrl.startsWith("http")
        ? post.postUrl
        : `https://www.linkedin.com/feed/#dgs-post-${computeUrlHash("", text).slice(0, 12)}`;

    const heuristic = evaluateCandidateHeuristically({
      title: `${post.authorName || "LinkedIn Member"} on LinkedIn`,
      text,
      url: postUrl,
      authorName: post.authorName || null,
      authorRole: post.authorRole || null,
      ageHours,
    });

    if (heuristic.classification !== "BUYER_SEEKING_SERVICE" || heuristic.intentScore < 72) {
      skippedNoise++;
      continue;
    }

    const evaluated =
      addedSignals.length < 5
        ? await qualifyWithGeminiIfAvailable(
            {
              title: `${post.authorName || "LinkedIn Member"} (${post.authorRole || ""})`,
              text,
              url: postUrl,
              platform: "LINKEDIN_FEED",
              ageHours,
            },
            heuristic
          )
        : heuristic;

    if (evaluated.classification !== "BUYER_SEEKING_SERVICE" || evaluated.intentScore < 72) {
      skippedNoise++;
      continue;
    }

    const upserted = await upsertIntentLeadSignal({
      sourcePlatform: "LINKEDIN_FEED",
      postUrl,
      postTitle: `${evaluated.authorName || post.authorName || "LinkedIn Feed Post"}${evaluated.authorRole ? ` — ${evaluated.authorRole}` : ""}`,
      postText: text,
      authorName: evaluated.authorName || post.authorName || null,
      authorRole: evaluated.authorRole || post.authorRole || null,
      authorProfileUrl: post.authorProfileUrl || null,
      discoveryQuery: "Personal LinkedIn Feed Companion",
      publishedAt: post.publishedAt || new Date(Date.now() - ageHours * 3600_000).toISOString(),
      ageHours,
      freshnessTier,
      evaluated,
    });

    if (upserted.inserted) {
      qualifiedAdded++;
      addedSignals.push({
        id: upserted.id,
        authorName: evaluated.authorName || post.authorName || null,
        serviceCategory: evaluated.serviceCategory,
        intentScore: evaluated.intentScore,
        classification: evaluated.classification,
        ageHours,
      });
      emailItems.push({
        id: upserted.id,
        sourcePlatform: `LINKEDIN_FEED (${ageHours}h old)`,
        postUrl,
        authorName: evaluated.authorName || post.authorName || "LinkedIn Connection",
        authorRole: evaluated.authorRole || post.authorRole || "",
        companyName: evaluated.companyName || "",
        serviceCategory: evaluated.serviceCategory,
        targetRegion: evaluated.targetRegion,
        intentScore: evaluated.intentScore,
        urgencyLevel: evaluated.urgencyLevel,
        postSnippet: text.slice(0, 350),
        aiReasoning: evaluated.aiReasoning,
        suggestedReply: evaluated.suggestedReply,
        recommendedDgsUrl: evaluated.recommendedDgsUrl,
      });
    } else {
      duplicates++;
    }
  }

  // Send immediate email stating the new buyer-intent lead(s) have been fetched into the PIN-protected CMS vault!
  if (sendDigest && emailItems.length > 0) {
    const emailRes = await sendIntentLeadsDigestEmail({
      runType: "LINKEDIN_FEED_FETCHED",
      leads: emailItems,
      totalChecked: posts.length,
    }).catch(() => ({ sent: false }));

    if (emailRes.sent) {
      for (const item of emailItems) {
        await cmsExecute(
          `UPDATE intent_lead_signals SET notified_at = NOW() WHERE id = ?`,
          [item.id]
        ).catch(() => {});
      }
    }
  }

  return {
    received: posts.length,
    qualifiedAdded,
    skippedNoise,
    duplicates,
    addedSignals,
  };
}

export async function getGoogleSearchBuyerIntentRadar(): Promise<GoogleBuyerIntentQuery[]> {
  if (!isCmsDatabaseConfigured()) return [];

  try {
    const { rows } = await cmsQuery<{
      query_text: string;
      page_url: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>(
      `SELECT query_text, page_url, clicks, impressions, ctr, position
       FROM gsc_page_query_metrics
       WHERE period_type = '28d'
       ORDER BY impressions DESC
       LIMIT 250`
    );

    let sourceRows = rows;
    if (!sourceRows || sourceRows.length === 0) {
      const { rows: fallbackRows } = await cmsQuery<{
        query_text: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }>(
        `SELECT query_text, clicks, impressions, ctr, position
         FROM gsc_query_metrics
         WHERE period_type = '28d'
         ORDER BY impressions DESC
         LIMIT 200`
      );
      sourceRows = (fallbackRows || []).map((r) => ({
        ...r,
        page_url: "https://www.dgeniussolutions.com/",
      }));
    }

    const buyerQueries: GoogleBuyerIntentQuery[] = [];

    for (const r of sourceRows) {
      const q = String(r.query_text || "").trim();
      const lower = q.toLowerCase();
      if (!q) continue;
      if (/^(d\s*genius|dgenius|d'genius)(\s+solutions)?$/i.test(q)) continue;

      const isHighCommercial =
        /\b(agency|company|services|consultant|studio|partner|hire|cost|pricing|best|top|near me|mumbai|dubai|uae|india)\b/i.test(
          lower
        );

      // Only include queries with commercial/service intent (no cold informational queries)
      if (
        !isHighCommercial &&
        !/\b(seo|aeo|geo|website|web design|web development|amc|video|marketing|branding|social media)\b/i.test(lower)
      ) {
        continue;
      }

      let serviceCategory: IntentServiceCategory = "SEO";
      if (/\b(aeo|answer engine|generative engine|geo|dubai)\b/i.test(lower)) {
        serviceCategory = "AEO_GEO";
      } else if (/\b(video|ai video|film|production|animation)\b/i.test(lower)) {
        serviceCategory = "AI_VIDEO";
      } else if (/\b(website|web design|web development|amc|redesign|nextjs|wordpress)\b/i.test(lower)) {
        serviceCategory = "WEB_DEV";
      } else if (/\b(performance marketing|ppc|google ads|meta ads|lead gen|digital marketing)\b/i.test(lower)) {
        serviceCategory = "PAID_MEDIA";
      } else if (/\b(brand|branding|social media|creative)\b/i.test(lower)) {
        serviceCategory = "BRANDING";
      }

      let targetRegion: IntentRegion = "GLOBAL";
      if (/\b(dubai|uae|abu dhabi)\b/i.test(lower)) targetRegion = "UAE_DUBAI";
      else if (/\b(mumbai|india|navi mumbai|thane|pune|delhi|bangalore)\b/i.test(lower)) targetRegion = "INDIA";

      const pos = Number(r.position || 0);
      const impressions = Number(r.impressions || 0);
      const clicks = Number(r.clicks || 0);

      let recommendedAction = "Monitor SERP CTR & ensure conversion CTA is above the fold.";
      if (pos > 3 && pos <= 15 && impressions >= 5) {
        recommendedAction = `Striking-distance buyer query (Pos #${pos.toFixed(1)}). Publish a LinkedIn post & FAQ block targeting "${q}".`;
      } else if (pos <= 3) {
        recommendedAction = `Top-3 buyer ranking (Pos #${pos.toFixed(1)}). High-intent Google traffic active on ${r.page_url}.`;
      } else if (pos > 15) {
        recommendedAction = `Emerging buyer search (Pos #${pos.toFixed(1)}). Strengthen internal links to ${r.page_url}.`;
      }

      buyerQueries.push({
        query_text: q,
        page_url: r.page_url || DGS_SERVICE_URLS[serviceCategory],
        clicks,
        impressions,
        ctr: Number((Number(r.ctr || 0) * 100).toFixed(2)),
        position: Number(pos.toFixed(1)),
        service_category: serviceCategory,
        target_region: targetRegion,
        buyer_intent_tier: isHighCommercial ? "HIGH_COMMERCIAL" : "SOLUTION_AWARE",
        recommended_action: recommendedAction,
      });
    }

    return buyerQueries.sort((a, b) => {
      if (a.buyer_intent_tier !== b.buyer_intent_tier) {
        return a.buyer_intent_tier === "HIGH_COMMERCIAL" ? -1 : 1;
      }
      return b.impressions - a.impressions;
    });
  } catch {
    return [];
  }
}

export async function listIntentLeadSignals(filters?: {
  status?: string;
  platform?: string;
  serviceCategory?: string;
  freshness?: string;
  limit?: number;
}): Promise<IntentLeadSignal[]> {
  if (!isCmsDatabaseConfigured()) return [];
  await ensureIntentLeadTables();

  const where: string[] = [
    "intent_classification = 'BUYER_SEEKING_SERVICE'",
    "(age_hours IS NULL OR age_hours <= 72)",
  ];
  const params: any[] = [];

  if (filters?.status && filters.status !== "ALL") {
    where.push("status = ?");
    params.push(filters.status);
  } else {
    where.push("status != 'DISMISSED'");
  }

  if (filters?.platform && filters.platform !== "ALL") {
    where.push("source_platform = ?");
    params.push(filters.platform);
  }

  if (filters?.serviceCategory && filters.serviceCategory !== "ALL") {
    where.push("service_category = ?");
    params.push(filters.serviceCategory);
  }

  if (filters?.freshness === "1H_12H") {
    where.push("age_hours <= 12");
  } else if (filters?.freshness === "24H") {
    where.push("age_hours <= 24");
  } else if (filters?.freshness === "3D") {
    where.push("age_hours <= 72");
  }

  const limit = Math.min(200, Math.max(10, Number(filters?.limit || 100)));
  params.push(limit);

  const sql = `
    SELECT *
    FROM intent_lead_signals
    WHERE ${where.join(" AND ")}
    ORDER BY
      CASE status WHEN 'NEW' THEN 0 WHEN 'CONTACTED' THEN 1 ELSE 2 END ASC,
      COALESCE(age_hours, 12) ASC,
      intent_score DESC,
      discovered_at DESC
    LIMIT ?
  `;

  const { rows } = await cmsQuery<IntentLeadSignal>(sql, params);
  return rows;
}

export async function listIntentDiscoveryRuns(limit = 15): Promise<IntentDiscoveryRun[]> {
  if (!isCmsDatabaseConfigured()) return [];
  await ensureIntentLeadTables();
  const { rows } = await cmsQuery<IntentDiscoveryRun>(
    `SELECT * FROM intent_lead_discovery_runs ORDER BY started_at DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function updateIntentSignalStatus(
  id: string,
  status: "NEW" | "CONTACTED" | "ARCHIVED" | "DISMISSED"
): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  await ensureIntentLeadTables();
  await cmsExecute(`UPDATE intent_lead_signals SET status = ? WHERE id = ?`, [status, id]);
}
