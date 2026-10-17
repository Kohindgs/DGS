import { randomUUID, createHash } from "node:crypto";
import * as cheerio from "cheerio";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "../cms/db";
import { createCmsLead } from "../cms/leads";
import { fetchWithTimeout } from "../net/fetch-with-timeout";
import {
  sendIntentLeadsDigestEmail,
  type IntentLeadEmailItem,
} from "../notifications/intent-lead-email";

declare global {
  var __dgsIntentLeadTablesEnsured: boolean | undefined;
}

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
  status: "NEW" | "CONTACTED" | "CONVERTED_TO_LEAD" | "DISMISSED";
  crm_lead_id: string | null;
  notified_at: string | null;
  published_at: string | null;
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
  linkedinSearchUrl: string;
  googleDorkUrl: string;
  redditSearchUrl: string;
};

const DGS_SERVICE_URLS: Record<IntentServiceCategory, string> = {
  SEO: "https://www.dgeniussolutions.com/services/seo-aeo-geo/",
  AEO_GEO: "https://www.dgeniussolutions.com/services/aeo-agency-dubai/",
  WEB_DEV: "https://www.dgeniussolutions.com/services/website-development-amc/",
  AI_VIDEO: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
  PAID_MEDIA: "https://www.dgeniussolutions.com/services/performance-marketing/",
  BRANDING: "https://www.dgeniussolutions.com/services/branding-social-media/",
};

export const LINKEDIN_FEED_PRESET_SEARCHES: LinkedInFeedPresetSearch[] = [
  {
    id: "li-seo-agency",
    serviceCategory: "SEO",
    label: "Looking for SEO Agency / Consultant",
    region: "GLOBAL",
    booleanQuery: `"looking for" AND ("SEO agency" OR "SEO consultant" OR "SEO partner" OR "technical SEO") -job -jobs -internship -recruiting`,
    linkedinSearchUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" OR "recommend an SEO"`)}&sortBy=%22date_posted%22`,
    googleDorkUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("SEO agency" OR "SEO company" OR "SEO consultant") -hiring -jobs`)}&tbs=qdr:m`,
    redditSearchUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("SEO agency" OR "SEO consultant")`)}&sort=new`,
  },
  {
    id: "li-web-dev",
    serviceCategory: "WEB_DEV",
    label: "Looking for Website Redesign / Web Development Agency",
    region: "GLOBAL",
    booleanQuery: `("looking for" OR "recommend") AND ("website development" OR "web design agency" OR "website redesign" OR "Next.js agency") -job -recruiter`,
    linkedinSearchUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "web development agency" OR "website redesign"`)}&sortBy=%22date_posted%22`,
    googleDorkUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("web design agency" OR "website redesign" OR "website development company") -jobs`)}&tbs=qdr:m`,
    redditSearchUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "need") ("website redesign" OR "web development agency")`)}&sort=new`,
  },
  {
    id: "li-ai-video",
    serviceCategory: "AI_VIDEO",
    label: "Looking for AI Video Production / Ad Creative Studio",
    region: "GLOBAL",
    booleanQuery: `("looking for" OR "recommend" OR "need") AND ("AI video" OR "video production agency" OR "brand film" OR "commercial video production")`,
    linkedinSearchUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "video production agency" OR "AI video"`)}&sortBy=%22date_posted%22`,
    googleDorkUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("video production agency" OR "AI video production" OR "ad film production")`)}&tbs=qdr:m`,
    redditSearchUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("video production agency" OR "AI video production")`)}&sort=new`,
  },
  {
    id: "li-aeo-dubai",
    serviceCategory: "AEO_GEO",
    label: "Looking for AEO / GEO / AI Search Visibility (Dubai & Global)",
    region: "UAE_DUBAI",
    booleanQuery: `("looking for" OR "recommend" OR "agency") AND ("AEO" OR "Answer Engine Optimization" OR "Generative Engine Optimization" OR "SEO Dubai")`,
    linkedinSearchUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"SEO agency Dubai" OR "Answer Engine Optimization" OR "GEO agency"`)}&sortBy=%22date_posted%22`,
    googleDorkUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE" OR "looking for") ("SEO agency" OR "digital marketing agency" OR "AEO")`)}&tbs=qdr:m`,
    redditSearchUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("Dubai" OR "UAE") ("SEO agency" OR "marketing agency" OR "website")`)}&sort=new`,
  },
  {
    id: "li-paid-media",
    serviceCategory: "PAID_MEDIA",
    label: "Looking for Performance Marketing / Paid Ads Agency",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("performance marketing agency" OR "Google Ads agency" OR "Meta Ads agency" OR "lead generation agency")`,
    linkedinSearchUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "performance marketing agency" OR "digital marketing agency"`)}&sortBy=%22date_posted%22`,
    googleDorkUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("performance marketing agency" OR "digital marketing agency") ("Mumbai" OR "India" OR "Dubai")`)}&tbs=qdr:m`,
    redditSearchUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("performance marketing agency" OR "Google Ads agency")`)}&sort=new`,
  },
  {
    id: "li-branding-social",
    serviceCategory: "BRANDING",
    label: "Looking for Branding & Social Media Agency",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("branding agency" OR "social media agency" OR "creative agency") -job -internship`,
    linkedinSearchUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "branding agency" OR "social media agency"`)}&sortBy=%22date_posted%22`,
    googleDorkUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("branding agency" OR "social media marketing agency") -hiring`)}&tbs=qdr:m`,
    redditSearchUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("branding agency" OR "social media agency")`)}&sort=new`,
  },
];

type DiscoveryQuerySpec = {
  query: string;
  platform: IntentSourcePlatform;
  serviceCategory: IntentServiceCategory;
  region: IntentRegion;
};

const DISCOVERY_QUERY_POOL: DiscoveryQuerySpec[] = [
  // Public LinkedIn Posts
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
    query: `site:linkedin.com/posts "looking for" "video production" OR "AI video" OR "ad film" agency`,
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
  // Reddit Buyer-Intent Threads
  {
    query: `site:reddit.com ("looking for" OR "recommend") ("SEO agency" OR "SEO company" OR "technical SEO")`,
    platform: "REDDIT",
    serviceCategory: "SEO",
    region: "GLOBAL",
  },
  {
    query: `site:reddit.com ("looking for" OR "need") ("web development agency" OR "website redesign" OR "Next.js agency")`,
    platform: "REDDIT",
    serviceCategory: "WEB_DEV",
    region: "GLOBAL",
  },
  {
    query: `site:reddit.com ("looking for" OR "recommend") ("AI video production" OR "video production agency" OR "explainer video")`,
    platform: "REDDIT",
    serviceCategory: "AI_VIDEO",
    region: "GLOBAL",
  },
  {
    query: `site:reddit.com ("Answer Engine Optimization" OR "AEO agency" OR "GEO agency" OR "SEO agency Dubai")`,
    platform: "REDDIT",
    serviceCategory: "AEO_GEO",
    region: "UAE_DUBAI",
  },
  // X / Twitter & Startup Forums
  {
    query: `site:x.com "looking for" ("SEO agency" OR "web design agency" OR "video production")`,
    platform: "X_TWITTER",
    serviceCategory: "SEO",
    region: "GLOBAL",
  },
  {
    query: `site:indiehackers.com OR site:quora.com "recommend" ("SEO agency" OR "web development agency" OR "marketing agency")`,
    platform: "WEB_FORUM",
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
      discovered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ils_status_score (status, intent_score DESC, discovered_at DESC),
      INDEX idx_ils_platform (source_platform, discovered_at DESC),
      INDEX idx_ils_service (service_category, status),
      INDEX idx_ils_classification (intent_classification, intent_score DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

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
    // Strip tracking params
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
};

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
    if (
      host === "google.com" ||
      host === "bing.com" ||
      host === "duckduckgo.com" ||
      host === "yahoo.com" ||
      host === "wikipedia.org"
    ) {
      return false;
    }

    // Filter out LinkedIn job boards / directory pages that aren't posts or articles
    if (host.includes("linkedin.com")) {
      if (path.startsWith("/jobs") || path.startsWith("/company/") || path.startsWith("/school/")) {
        return false;
      }
      return true;
    }
    return true;
  } catch {
    return false;
  }
}

async function searchDuckDuckGoSocial(
  query: string,
  defaultPlatform: IntentSourcePlatform,
  limit = 10
): Promise<RawSocialResult[]> {
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
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
    seen.add(href);

    const snippet = $(el).find(".result__snippet").text().trim().replace(/\s+/g, " ");
    if (!snippet && !title) return;

    results.push({
      title,
      url: href,
      snippet,
      platform: detectPlatformFromUrl(href, defaultPlatform),
    });
  });

  return results;
}

async function searchBingSocial(
  query: string,
  defaultPlatform: IntentSourcePlatform,
  limit = 10
): Promise<RawSocialResult[]> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
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
    seen.add(href);

    const snippet = $(el).find(".b_caption p").text().trim().replace(/\s+/g, " ");
    if (!snippet && !title) return;

    results.push({
      title,
      url: href,
      snippet,
      platform: detectPlatformFromUrl(href, defaultPlatform),
    });
  });

  return results;
}

async function searchRedditJsonApi(
  serviceCategory: IntentServiceCategory,
  region: IntentRegion,
  limit = 8
): Promise<RawSocialResult[]> {
  const queryMap: Record<IntentServiceCategory, string> = {
    SEO: `("looking for" OR "recommend") AND ("SEO agency" OR "SEO consultant" OR "SEO help")`,
    WEB_DEV: `("looking for" OR "recommend" OR "need") AND ("web development agency" OR "website redesign" OR "web designer")`,
    AI_VIDEO: `("looking for" OR "recommend") AND ("video production agency" OR "AI video" OR "product video")`,
    AEO_GEO: `("Answer Engine Optimization" OR "AEO" OR "GEO" OR "AI search SEO" OR "SEO agency Dubai")`,
    PAID_MEDIA: `("looking for" OR "recommend") AND ("Google Ads agency" OR "performance marketing agency" OR "Meta ads agency")`,
    BRANDING: `("looking for" OR "recommend") AND ("branding agency" OR "creative agency" OR "social media agency")`,
  };

  const q = queryMap[serviceCategory] || queryMap.SEO;
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&t=month&limit=${limit}`;

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

    for (const child of children) {
      const post = child?.data;
      if (!post || !post.permalink) continue;
      const title = String(post.title || "").trim();
      const selftext = String(post.selftext || "").trim();
      const author = String(post.author || "").trim();
      const subreddit = String(post.subreddit_name_prefixed || "r/business").trim();
      const fullUrl = `https://www.reddit.com${post.permalink}`;
      results.push({
        title: `${title} (${subreddit} by u/${author})`,
        url: fullUrl,
        snippet: selftext ? selftext.slice(0, 600) : title,
        platform: "REDDIT",
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
 * Fast deterministic pre-filter + scoring before/alongside Gemini 2.5 qualification.
 * Protects against false positives (job seekers, agency self-promotions).
 */
export function evaluateCandidateHeuristically(input: {
  title: string;
  text: string;
  url: string;
  defaultService?: IntentServiceCategory;
  defaultRegion?: IntentRegion;
  authorName?: string | null;
  authorRole?: string | null;
}): EvaluatedLeadCandidate {
  const combined = `${input.title || ""} ${input.text || ""}`.trim();
  const lower = combined.toLowerCase();

  // Extract author from LinkedIn title if not explicitly provided
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

  // Detect contact hints (email or phone or "DM me")
  const emailMatch = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const contactHint = emailMatch
    ? emailMatch[0]
    : /dm me|drop your portfolio|comment below|send portfolio|inbox me/i.test(combined)
      ? "Requested DM / Portfolio in Comments"
      : null;

  // Detect service category
  let serviceCategory: IntentServiceCategory = input.defaultService || "SEO";
  if (/\b(aeo|answer engine|generative engine|geo|ai overview|llm seo|chatgpt ranking)\b/i.test(lower)) {
    serviceCategory = "AEO_GEO";
  } else if (/\b(ai video|video production|brand film|ad film|explainer video|commercial video|motion graphics)\b/i.test(lower)) {
    serviceCategory = "AI_VIDEO";
  } else if (/\b(web development|website redesign|web design|next\.?js|wordpress|shopify|website amc|landing page)\b/i.test(lower)) {
    serviceCategory = "WEB_DEV";
  } else if (/\b(google ads|meta ads|performance marketing|paid media|ppc|lead generation agency|roas)\b/i.test(lower)) {
    serviceCategory = "PAID_MEDIA";
  } else if (/\b(branding|brand identity|social media agency|social media management|creative agency)\b/i.test(lower)) {
    serviceCategory = "BRANDING";
  } else if (/\b(seo|search engine optimization|backlink|organic traffic|search ranking)\b/i.test(lower)) {
    serviceCategory = "SEO";
  }

  // Detect region
  let targetRegion: IntentRegion = input.defaultRegion || "GLOBAL";
  if (/\b(dubai|uae|abu dhabi|sharjah|mena|middle east)\b/i.test(lower)) {
    targetRegion = "UAE_DUBAI";
  } else if (/\b(mumbai|india|bangalore|bengaluru|delhi|gurgaon|pune|hyderabad|chennai)\b/i.test(lower)) {
    targetRegion = "INDIA";
  } else if (/\b(uk|london|united kingdom|manchester)\b/i.test(lower)) {
    targetRegion = "UK";
  } else if (/\b(usa|united states|new york|austin|california|san francisco|chicago)\b/i.test(lower)) {
    targetRegion = "USA";
  }

  // Check for Job Seeker signals (Negative)
  const isJobSeeker =
    /\b(open to work|#opentowork|looking for a job|looking for a full-time|looking for an internship|my resume|hire me|applying for|seeking a role)\b/i.test(
      lower
    ) ||
    /\b(we are hiring a full-time|job opening|years of experience required|send your cv to hr)\b/i.test(
      lower
    );

  // Check for Competing Agency Self-Promotion (Negative)
  const isSellerPromo =
    /\b(we help brands|our agency|contact us today for|book a free consultation with us|dm me for seo|we offer seo|our seo services|why every business needs)\b/i.test(
      lower
    ) &&
    !/\b(looking for an agency|recommend an agency|anyone know a good|need a reliable)\b/i.test(
      lower
    );

  // Check for Strong Buyer Signals (Positive)
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
    "need help",
    "any recommendations",
    "looking for a vendor",
    "rfp",
    "which agency",
    "best seo agency",
    "best web design",
    "hiring an agency",
    "hire an seo",
    "hire a web",
    "suggestions for",
    "anyone worked with",
    "worth hiring",
    "how to find a good",
    "need seo",
    "need website",
    "need video",
  ];
  const matchedBuyerPhrases = strongBuyerPhrases.filter((p) => lower.includes(p));

  const isQuestionOrRequest =
    combined.includes("?") ||
    /\b(how do i|should i hire|where to find|advice on hiring|seeking|recommend|suggestion|looking|help)\b/i.test(lower);

  let classification: IntentClassification = "HIGH_INTENT_DISCUSSION";
  let score = 64;

  if (isJobSeeker) {
    classification = "JOB_SEEKER";
    score = 18;
  } else if (isSellerPromo) {
    classification = "SELLER_PROMOTION";
    score = 22;
  } else if (matchedBuyerPhrases.length > 0) {
    classification = "BUYER_SEEKING_SERVICE";
    score = 76 + Math.min(20, matchedBuyerPhrases.length * 6);
    if (contactHint) score = Math.min(98, score + 6);
    if (targetRegion === "INDIA" || targetRegion === "UAE_DUBAI") {
      score = Math.min(98, score + 4);
    }
  } else if (
    isQuestionOrRequest &&
    /\b(agency|consultant|freelancer|partner|vendor|quote|cost|budget|seo|website|redesign|video|aeo|geo|marketing)\b/i.test(lower)
  ) {
    classification = "HIGH_INTENT_DISCUSSION";
    score = 72;
  } else if (/\b(agency|consultant|services|seo|website|video|aeo|geo)\b/i.test(lower)) {
    classification = "HIGH_INTENT_DISCUSSION";
    score = 62;
  } else {
    classification = "LOW_INTENT_NOISE";
    score = 35;
  }

  const urgencyLevel: "HIGH" | "MEDIUM" | "LOW" =
    score >= 82 || /\b(urgent|asap|immediately|this week|finalizing)\b/i.test(lower)
      ? "HIGH"
      : score >= 65
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

  const suggestedReply = `Hi ${firstName} — saw your post regarding ${serviceCategory.replace("_", " ")}. At D'Genius Solutions, we specialize in ${pitch}. Happy to share relevant case studies and a quick audit tailored to your goals: ${recommendedDgsUrl}`;

  const suggestedDm = `Hi ${firstName}, I came across your recent post looking for ${serviceCategory.replace("_", " ")} support. We lead ${pitch} for growth-focused brands at D'Genius Solutions (${recommendedDgsUrl}). Would you be open to a quick 10-minute chat this week, or can I send over our relevant work samples here?`;

  const aiReasoning =
    classification === "BUYER_SEEKING_SERVICE"
      ? `Verified buyer-intent signal (${matchedBuyerPhrases.slice(0, 2).join(", ") || "active vendor search"}) seeking ${serviceCategory} in ${targetRegion}.${contactHint ? ` Contact cue: ${contactHint}.` : ""}`
      : classification === "HIGH_INTENT_DISCUSSION"
        ? `Commercial evaluation discussion around ${serviceCategory} (${targetRegion}). Good opportunity for consultative outreach.`
        : `Filtered as ${classification} (non-buyer post).`;

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

/**
 * Refines top candidate leads with Gemini 2.5 Flash when GEMINI_API_KEY is configured.
 * Strictly bounded timeout (8 seconds) so cron and interactive scans never hang.
 */
export async function qualifyWithGeminiIfAvailable(
  input: {
    title: string;
    text: string;
    url: string;
    platform: IntentSourcePlatform;
  },
  heuristic: EvaluatedLeadCandidate
): Promise<EvaluatedLeadCandidate> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "").trim();
  if (!apiKey || apiKey.length < 10) return heuristic;

  // Don't waste tokens on obvious job seekers or noise
  if (heuristic.intentScore < 55) return heuristic;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are the Lead Qualification AI for D'Genius Solutions (https://www.dgeniussolutions.com), a digital growth, SEO/AEO/GEO, Website Development & AMC, AI Video Production, and Branding agency operating in Mumbai (India), Dubai (UAE), and globally.

Analyze this social/web post and determine if the author is a genuine prospective BUYER looking for an agency/service provider, or if they are a seller promoting their own services / a job seeker.

POST PLATFORM: ${input.platform}
POST URL: ${input.url}
POST TITLE: ${input.title}
POST TEXT: ${input.text.slice(0, 1200)}

Return ONLY valid JSON matching this schema:
{
  "classification": "BUYER_SEEKING_SERVICE" | "HIGH_INTENT_DISCUSSION" | "SELLER_PROMOTION" | "JOB_SEEKER" | "LOW_INTENT_NOISE",
  "intentScore": number (0 to 100),
  "urgencyLevel": "HIGH" | "MEDIUM" | "LOW",
  "serviceCategory": "SEO" | "WEB_DEV" | "AI_VIDEO" | "AEO_GEO" | "PAID_MEDIA" | "BRANDING",
  "targetRegion": "INDIA" | "UAE_DUBAI" | "USA" | "UK" | "GLOBAL",
  "authorName": string or null,
  "authorRole": string or null,
  "companyName": string or null,
  "aiReasoning": "1-2 sentence explanation of why this is or isn't a buyer lead",
  "suggestedReply": "Short, high-value public comment reply (max 280 chars) mentioning D'Genius Solutions naturally",
  "suggestedDm": "Personalized LinkedIn/direct message (max 450 chars)"
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
          temperature: 0.2,
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
 * Saves a qualified signal to `intent_lead_signals` (idempotent on `url_hash`).
 * Returns `{ inserted: boolean, id: string, signal: EvaluatedLeadCandidate }`.
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
  evaluated: EvaluatedLeadCandidate;
}): Promise<{ inserted: boolean; id: string }> {
  if (!isCmsDatabaseConfigured()) {
    return { inserted: false, id: randomUUID() };
  }
  await ensureIntentLeadTables();

  const urlHash = computeUrlHash(input.postUrl, input.postText);

  const { rows: existing } = await cmsQuery<{ id: string }>(
    `SELECT id FROM intent_lead_signals WHERE url_hash = ? LIMIT 1`,
    [urlHash]
  );

  if (existing.length > 0) {
    return { inserted: false, id: existing[0].id };
  }

  const id = `ils_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  await cmsExecute(
    `INSERT INTO intent_lead_signals (
      id, url_hash, source_platform, post_url, post_title, post_text,
      author_name, author_role, author_profile_url, company_name, contact_hint,
      service_category, target_region, discovery_query,
      intent_classification, intent_score, urgency_level,
      ai_reasoning, suggested_reply, suggested_dm, recommended_dgs_url,
      status, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?)`,
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
      input.publishedAt || null,
    ]
  );

  return { inserted: true, id };
}

/**
 * Executes a time-bounded Buyer-Intent Lead Discovery Run across LinkedIn Public Posts,
 * Reddit Buyer Threads, X, and Web Forums.
 * Strictly bounded to 32 seconds so cron and manual UI calls always complete cleanly.
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
  const errors: string[] = [];

  try {
    // Select rotating subset of queries so every run covers LinkedIn + Reddit + Web within the 32s budget
    const pool = options?.serviceFilter
      ? DISCOVERY_QUERY_POOL.filter((q) => q.serviceCategory === options.serviceFilter)
      : DISCOVERY_QUERY_POOL;

    const hourOffset = new Date().getUTCHours() % Math.max(1, pool.length);
    const orderedQueries = [...pool.slice(hourOffset), ...pool.slice(0, hourOffset)].slice(0, 5);

    // 1. Run Reddit JSON API search for fresh buyer-intent discussions
    const targetCategories: IntentServiceCategory[] = options?.serviceFilter
      ? [options.serviceFilter]
      : ["SEO", "WEB_DEV", "AI_VIDEO", "AEO_GEO"];

    for (const cat of targetCategories.slice(0, 3)) {
      if (Date.now() - startMs > BUDGET_MS - 8000) break;
      const redditResults = await searchRedditJsonApi(cat, "GLOBAL", 8);
      queriesExecuted++;
      rawCandidatesFound += redditResults.length;

      for (const r of redditResults) {
        const heuristic = evaluateCandidateHeuristically({
          title: r.title,
          text: r.snippet,
          url: r.url,
          defaultService: cat,
        });

        if (
          heuristic.classification === "JOB_SEEKER" ||
          heuristic.classification === "SELLER_PROMOTION" ||
          heuristic.intentScore < 52
        ) {
          rejectedNoiseCount++;
          continue;
        }

        const evaluated =
          Date.now() - startMs < BUDGET_MS - 9000 && newlyInsertedForEmail.length < 3
            ? await qualifyWithGeminiIfAvailable(
                { title: r.title, text: r.snippet, url: r.url, platform: "REDDIT" },
                heuristic
              )
            : heuristic;

        if (
          evaluated.classification === "JOB_SEEKER" ||
          evaluated.classification === "SELLER_PROMOTION" ||
          evaluated.classification === "LOW_INTENT_NOISE" ||
          evaluated.intentScore < 52
        ) {
          rejectedNoiseCount++;
          continue;
        }

        const upserted = await upsertIntentLeadSignal({
          sourcePlatform: "REDDIT",
          postUrl: r.url,
          postTitle: r.title,
          postText: r.snippet,
          discoveryQuery: `Reddit buyer search (${cat})`,
          evaluated,
        });

        if (upserted.inserted) {
          qualifiedLeadsAdded++;
          newlyInsertedForEmail.push({
            id: upserted.id,
            sourcePlatform: "REDDIT",
            postUrl: r.url,
            authorName: evaluated.authorName || "Reddit Founder / Buyer",
            authorRole: evaluated.authorRole || "",
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

    // 2. Run Public LinkedIn & Web Search Dorks (DuckDuckGo + Bing fallback)
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
        });

        if (
          heuristic.classification === "JOB_SEEKER" ||
          heuristic.classification === "SELLER_PROMOTION" ||
          heuristic.intentScore < 52
        ) {
          rejectedNoiseCount++;
          continue;
        }

        const evaluated =
          Date.now() - startMs < BUDGET_MS - 9000 && newlyInsertedForEmail.length < 4
            ? await qualifyWithGeminiIfAvailable(
                { title: r.title, text: r.snippet, url: r.url, platform: r.platform },
                heuristic
              )
            : heuristic;

        if (
          evaluated.classification === "JOB_SEEKER" ||
          evaluated.classification === "SELLER_PROMOTION" ||
          evaluated.classification === "LOW_INTENT_NOISE" ||
          evaluated.intentScore < 52
        ) {
          rejectedNoiseCount++;
          continue;
        }

        const upserted = await upsertIntentLeadSignal({
          sourcePlatform: r.platform,
          postUrl: r.url,
          postTitle: r.title,
          postText: r.snippet || r.title,
          discoveryQuery: spec.query,
          evaluated,
        });

        if (upserted.inserted) {
          qualifiedLeadsAdded++;
          newlyInsertedForEmail.push({
            id: upserted.id,
            sourcePlatform: r.platform,
            postUrl: r.url,
            authorName: evaluated.authorName || "LinkedIn / Web Prospect",
            authorRole: evaluated.authorRole || "",
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

    // 3. Send Email Digest if new high-intent leads were discovered
    if (options?.sendEmailDigest !== false && newlyInsertedForEmail.length > 0) {
      const highIntentForEmail = newlyInsertedForEmail
        .filter((l) => l.intentScore >= 68)
        .sort((a, b) => b.intentScore - a.intentScore);

      if (highIntentForEmail.length > 0) {
        const emailRes = await sendIntentLeadsDigestEmail({
          runType,
          leads: highIntentForEmail,
          totalChecked: rawCandidatesFound,
        });
        if (emailRes.sent) {
          emailsSent = 1;
          const ids = highIntentForEmail.map((l) => l.id);
          for (const id of ids) {
            await cmsExecute(
              `UPDATE intent_lead_signals SET notified_at = NOW() WHERE id = ?`,
              [id]
            ).catch(() => {});
          }
        }
      }
    }

    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startMs);
    const summaryText = `Executed ${queriesExecuted} discovery queries across LinkedIn, Reddit & Web. Evaluated ${rawCandidatesFound} posts, qualified ${qualifiedLeadsAdded} new buyer-intent leads, filtered ${rejectedNoiseCount} job-seeker/promo posts.`;

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
    errors.push(errorMsg);

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
 * Ingests a batch of posts captured directly from the user's personal LinkedIn feed
 * or LinkedIn search results via the DGS LinkedIn Feed Companion Bookmarklet / Extension.
 */
export async function ingestLinkedInFeedPosts(
  posts: Array<{
    postUrl?: string;
    authorName?: string;
    authorRole?: string;
    authorProfileUrl?: string;
    postText: string;
    publishedAt?: string;
  }>,
  sendDigest = false
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
  }> = [];
  const emailItems: IntentLeadEmailItem[] = [];

  for (const post of posts.slice(0, 40)) {
    const text = String(post.postText || "").trim();
    if (text.length < 25) continue;

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
    });

    if (
      heuristic.classification === "JOB_SEEKER" ||
      heuristic.classification === "SELLER_PROMOTION" ||
      heuristic.intentScore < 58
    ) {
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
            },
            heuristic
          )
        : heuristic;

    if (
      evaluated.classification === "JOB_SEEKER" ||
      evaluated.classification === "SELLER_PROMOTION" ||
      evaluated.intentScore < 58
    ) {
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
      publishedAt: post.publishedAt || null,
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
      });
      emailItems.push({
        id: upserted.id,
        sourcePlatform: "LINKEDIN_FEED",
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

  if (sendDigest && emailItems.length > 0) {
    await sendIntentLeadsDigestEmail({
      runType: "LINKEDIN_FEED_SYNC",
      leads: emailItems,
      totalChecked: posts.length,
    }).catch(() => {});
  }

  return {
    received: posts.length,
    qualifiedAdded,
    skippedNoise,
    duplicates,
    addedSignals,
  };
}

/**
 * Queries Google Search Console cached query/page metrics (`gsc_page_query_metrics` & `gsc_query_metrics`)
 * to surface real commercial/buyer-intent searches where people on Google are looking for DGS services.
 */
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
      // Exclude pure brand navigational queries unless paired with a service
      if (/^(d\s*genius|dgenius|d'genius)(\s+solutions)?$/i.test(q)) continue;

      const isHighCommercial =
        /\b(agency|company|services|consultant|studio|partner|hire|cost|pricing|best|top|near me|mumbai|dubai|uae|india)\b/i.test(
          lower
        );

      let serviceCategory: IntentServiceCategory = "SEO";
      if (/\b(aeo|answer engine|generative engine|geo|dubai)\b/i.test(lower)) {
        serviceCategory = "AEO_GEO";
      } else if (/\b(video|ai video|film|production|animation)\b/i.test(lower)) {
        serviceCategory = "AI_VIDEO";
      } else if (/\b(website|web design|web development|amc|redesign|nextjs|wordpress)\b/i.test(lower)) {
        serviceCategory = "WEB_DEV";
      } else if (/\b(performance marketing|ppc|google ads|meta ads|lead gen)\b/i.test(lower)) {
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
        recommendedAction = `Striking-distance buyer query (Pos #${pos.toFixed(1)}). Add FAQ schema & publish a LinkedIn case-study post targeting "${q}".`;
      } else if (pos <= 3) {
        recommendedAction = `Top-3 buyer ranking (Pos #${pos.toFixed(1)}). Ensure instant WhatsApp/audit lead capture is prominent on ${r.page_url}.`;
      } else if (pos > 15) {
        recommendedAction = `Emerging buyer search (Pos #${pos.toFixed(1)}). Build internal links & dedicated comparison section on ${r.page_url}.`;
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
  limit?: number;
}): Promise<IntentLeadSignal[]> {
  if (!isCmsDatabaseConfigured()) return [];
  await ensureIntentLeadTables();

  const where: string[] = [];
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

  const limit = Math.min(200, Math.max(10, Number(filters?.limit || 100)));
  params.push(limit);

  const sql = `
    SELECT *
    FROM intent_lead_signals
    ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY
      CASE status WHEN 'NEW' THEN 0 WHEN 'CONTACTED' THEN 1 WHEN 'CONVERTED_TO_LEAD' THEN 2 ELSE 3 END ASC,
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
  status: "NEW" | "CONTACTED" | "CONVERTED_TO_LEAD" | "DISMISSED"
): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  await ensureIntentLeadTables();
  await cmsExecute(`UPDATE intent_lead_signals SET status = ? WHERE id = ?`, [status, id]);
}

/**
 * Converts a discovered Buyer-Intent Signal into an official CRM Lead in the `leads` table
 * so the sales team can track it through `new -> contacted -> qualified -> won`.
 */
export async function convertSignalToCrmLead(signalId: string): Promise<{ crmLeadId: string }> {
  if (!isCmsDatabaseConfigured()) {
    throw new Error("CMS database is not configured");
  }
  await ensureIntentLeadTables();

  const { rows } = await cmsQuery<IntentLeadSignal>(
    `SELECT * FROM intent_lead_signals WHERE id = ? LIMIT 1`,
    [signalId]
  );
  if (rows.length === 0) {
    throw new Error("Intent lead signal not found");
  }

  const sig = rows[0];
  if (sig.crm_lead_id) {
    return { crmLeadId: sig.crm_lead_id };
  }

  const emailHint =
    sig.contact_hint && sig.contact_hint.includes("@") ? sig.contact_hint : undefined;

  const crmLeadId = await createCmsLead({
    formKey: `intent_${sig.source_platform.toLowerCase()}`,
    route: sig.post_url,
    name: sig.author_name || `${sig.source_platform} Buyer Lead`,
    email: emailHint,
    company: sig.company_name || sig.author_role || undefined,
    payload: {
      intent_signal_id: sig.id,
      source_platform: sig.source_platform,
      service_category: sig.service_category,
      target_region: sig.target_region,
      intent_score: sig.intent_score,
      urgency_level: sig.urgency_level,
      post_url: sig.post_url,
      post_text: sig.post_text,
      ai_reasoning: sig.ai_reasoning,
      suggested_reply: sig.suggested_reply,
      suggested_dm: sig.suggested_dm,
    },
  });

  await cmsExecute(
    `UPDATE intent_lead_signals SET status = 'CONVERTED_TO_LEAD', crm_lead_id = ? WHERE id = ?`,
    [crmLeadId, signalId]
  );

  return { crmLeadId };
}
