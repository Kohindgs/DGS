import { randomUUID, createHash } from "node:crypto";
import dns from "node:dns/promises";
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

export const INTENT_LEADS_ACCESS_PIN = "021514";

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

export type CompanyLegitimacyStatus =
  | "VERIFIED_LIVE_COMPANY"
  | "VERIFIED_DECISION_MAKER"
  | "VERIFIED_ACTIVE_BUSINESS"
  | "UNVERIFIED_SOCIAL_PROFILE";

export type IntentBreakdown = {
  buyingStage: "ACTIVE_VENDOR_SHORTLIST" | "URGENT_PROBLEM_SOLVING" | "BUDGET_APPROVED_HIRING" | "SOLUTION_COMPARISON";
  intentTriggerPhrases: string[];
  painPointsDetected: string[];
  budgetOrScaleSignal: string;
  decisionMakerConfidence: "HIGH (C-Level / Founder / VP)" | "MEDIUM (Marketing / Product Lead)" | "COMMUNITY_BUSINESS_OWNER";
};

export type ConversionPlaybook = {
  companyVerificationNote: string;
  domainLiveHttpStatus: number | null;
  domainHasMxRecords: boolean;
  recommendedHook: string;
  keyValueAngle: string;
  objectionToPreempt: string;
  caseStudyToMention: string;
  closingQuestion: string;
};

export type IntentLeadSignal = {
  id: string;
  url_hash: string;
  content_fingerprint: string | null;
  source_platform: IntentSourcePlatform;
  post_url: string;
  post_title: string | null;
  post_text: string;
  author_name: string | null;
  author_role: string | null;
  author_profile_url: string | null;
  company_name: string | null;
  company_domain: string | null;
  company_legitimacy_status: CompanyLegitimacyStatus;
  company_legitimacy_score: number;
  buyer_persona_type: string;
  contact_hint: string | null;
  service_category: IntentServiceCategory;
  target_region: IntentRegion;
  discovery_query: string | null;
  intent_classification: IntentClassification;
  intent_score: number;
  urgency_level: "HIGH" | "MEDIUM" | "LOW";
  ai_reasoning: string | null;
  intent_breakdown_json: IntentBreakdown | string | null;
  conversion_playbook_json: ConversionPlaybook | string | null;
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
      content_fingerprint VARCHAR(64) NULL,
      source_platform VARCHAR(40) NOT NULL DEFAULT 'LINKEDIN_PUBLIC',
      post_url TEXT NOT NULL,
      post_title VARCHAR(500) NULL,
      post_text TEXT NOT NULL,
      author_name VARCHAR(255) NULL,
      author_role VARCHAR(255) NULL,
      author_profile_url VARCHAR(500) NULL,
      company_name VARCHAR(255) NULL,
      company_domain VARCHAR(255) NULL,
      company_legitimacy_status VARCHAR(40) NOT NULL DEFAULT 'UNVERIFIED_SOCIAL_PROFILE',
      company_legitimacy_score INT NOT NULL DEFAULT 65,
      buyer_persona_type VARCHAR(64) NOT NULL DEFAULT 'Founder / Decision Maker',
      contact_hint VARCHAR(255) NULL,
      service_category VARCHAR(64) NOT NULL DEFAULT 'SEO',
      target_region VARCHAR(40) NOT NULL DEFAULT 'GLOBAL',
      discovery_query VARCHAR(500) NULL,
      intent_classification VARCHAR(64) NOT NULL DEFAULT 'BUYER_SEEKING_SERVICE',
      intent_score INT NOT NULL DEFAULT 70,
      urgency_level VARCHAR(24) NOT NULL DEFAULT 'MEDIUM',
      ai_reasoning TEXT NULL,
      intent_breakdown_json JSON NULL,
      conversion_playbook_json JSON NULL,
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
      INDEX idx_ils_classification (intent_classification, intent_score DESC),
      INDEX idx_ils_content_fp (content_fingerprint)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  for (const colSql of [
    "ALTER TABLE intent_lead_signals ADD COLUMN age_hours INT NULL AFTER published_at",
    "ALTER TABLE intent_lead_signals ADD COLUMN freshness_tier VARCHAR(24) NOT NULL DEFAULT '24H' AFTER age_hours",
    "ALTER TABLE intent_lead_signals ADD COLUMN content_fingerprint VARCHAR(64) NULL AFTER url_hash",
    "ALTER TABLE intent_lead_signals ADD COLUMN company_domain VARCHAR(255) NULL AFTER company_name",
    "ALTER TABLE intent_lead_signals ADD COLUMN company_legitimacy_status VARCHAR(40) NOT NULL DEFAULT 'UNVERIFIED_SOCIAL_PROFILE' AFTER company_domain",
    "ALTER TABLE intent_lead_signals ADD COLUMN company_legitimacy_score INT NOT NULL DEFAULT 65 AFTER company_legitimacy_status",
    "ALTER TABLE intent_lead_signals ADD COLUMN buyer_persona_type VARCHAR(64) NOT NULL DEFAULT 'Founder / Decision Maker' AFTER company_legitimacy_score",
    "ALTER TABLE intent_lead_signals ADD COLUMN intent_breakdown_json JSON NULL AFTER ai_reasoning",
    "ALTER TABLE intent_lead_signals ADD COLUMN conversion_playbook_json JSON NULL AFTER intent_breakdown_json",
    "CREATE INDEX idx_ils_content_fp ON intent_lead_signals (content_fingerprint)",
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

/**
 * Multi-Layer Anti-Repeat Deduplication:
 * 1. Canonical URL Hash (strips tracking params, Reddit query strings, LinkedIn activity suffixes)
 * 2. Content Fingerprint (normalizes author + first 180 alphanumeric chars of post text so cross-posted or re-indexed URLs NEVER repeat)
 */
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
      "ref",
      "share_id",
    ]) {
      u.searchParams.delete(p);
    }
    return `${u.hostname.replace(/^www\./, "")}${u.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}

export function computeUrlHash(url: string, fallbackText = ""): string {
  const norm = normalizeUrlForHash(url) || fallbackText.slice(0, 200).toLowerCase();
  return createHash("sha256").update(norm).digest("hex");
}

export function computeContentFingerprint(authorName: string | null | undefined, postText: string): string {
  const cleanAuthor = String(authorName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const cleanText = String(postText || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 180);
  return createHash("sha256")
    .update(`${cleanAuthor}:${cleanText}`)
    .digest("hex");
}

/**
 * Extracts a company domain from email address, post text URLs, or company name hints,
 * then performs live DNS MX + HTTP HEAD/GET verification to validate company legitimacy.
 */
export async function validateCompanyLegitimacy(input: {
  companyName: string | null;
  companyDomainHint?: string | null;
  contactHint: string | null;
  authorName: string | null;
  authorRole: string | null;
  postText: string;
  sourcePlatform: IntentSourcePlatform;
}): Promise<{
  companyName: string | null;
  companyDomain: string | null;
  legitimacyStatus: CompanyLegitimacyStatus;
  legitimacyScore: number;
  buyerPersonaType: string;
  verificationNote: string;
  domainLiveHttpStatus: number | null;
  domainHasMxRecords: boolean;
}> {
  const combined = `${input.authorRole || ""} ${input.postText || ""}`;

  // 1. Identify Buyer Persona Type
  let buyerPersonaType = "Business Owner / Prospect";
  let personaBonus = 10;
  if (/\b(founder|co-founder|cofounder|ceo|owner|managing director|partner|president|principal)\b/i.test(combined)) {
    buyerPersonaType = "Founder / CEO (Direct Decision Maker)";
    personaBonus = 22;
  } else if (/\b(cmo|vp|head of marketing|marketing director|growth lead|brand manager|director)\b/i.test(combined)) {
    buyerPersonaType = "CMO / Marketing Head (Budget Owner)";
    personaBonus = 18;
  } else if (/\b(cto|head of product|product manager|engineering|operations|coo)\b/i.test(combined)) {
    buyerPersonaType = "Product / Operations Lead";
    personaBonus = 14;
  }

  // 2. Extract company name from role ("Founder at FinScale", "CEO @ Acme")
  let companyName = input.companyName || null;
  if (!companyName && input.authorRole) {
    const roleMatch = input.authorRole.match(/(?:at|@|of|-|\|)\s*([A-Z][A-Za-z0-9&.\s-]{2,35})/);
    if (roleMatch && roleMatch[1]) {
      companyName = roleMatch[1].trim();
    }
  }

  // 3. Extract candidate domain from corporate email or URL in post text
  let candidateDomain: string | null = input.companyDomainHint || null;
  const ignoredDomains = new Set([
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "linkedin.com",
    "reddit.com",
    "x.com",
    "twitter.com",
    "quora.com",
    "indiehackers.com",
    "dgeniussolutions.com",
    "youtube.com",
    "google.com",
  ]);

  if (!candidateDomain && input.contactHint && input.contactHint.includes("@")) {
    const emailDomain = input.contactHint.split("@")[1]?.toLowerCase().trim();
    if (emailDomain && !ignoredDomains.has(emailDomain)) {
      candidateDomain = emailDomain;
    }
  }

  if (!candidateDomain) {
    const urlMatches = input.postText.match(/\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]{3,30}\.(?:com|io|ai|co|ae|in|uk|org|net|app|tech|agency|studio))\b/gi);
    if (urlMatches) {
      for (const raw of urlMatches) {
        const clean = raw
          .replace(/^https?:\/\//i, "")
          .replace(/^www\./i, "")
          .split("/")[0]
          .toLowerCase();
        if (!ignoredDomains.has(clean)) {
          candidateDomain = clean;
          break;
        }
      }
    }
  }

  let domainHasMxRecords = false;
  let domainLiveHttpStatus: number | null = null;

  if (candidateDomain) {
    try {
      const mx = await Promise.race([
        dns.resolveMx(candidateDomain),
        new Promise<null>((r) => setTimeout(() => r(null), 2000)),
      ]);
      if (Array.isArray(mx) && mx.length > 0) {
        domainHasMxRecords = true;
      }
    } catch {}

    try {
      const probe = await fetchWithTimeout(`https://${candidateDomain}`, {
        method: "GET",
        timeoutMs: 3000,
        maxRetries: 0,
      });
      if (probe.httpStatus) {
        domainLiveHttpStatus = probe.httpStatus;
      }
    } catch {}
  }

  // 4. Compute Legitimacy Score & Status
  let legitimacyScore = 58 + personaBonus;
  let legitimacyStatus: CompanyLegitimacyStatus = "UNVERIFIED_SOCIAL_PROFILE";
  const notes: string[] = [];

  if (candidateDomain && (domainLiveHttpStatus || domainHasMxRecords)) {
    legitimacyStatus = "VERIFIED_LIVE_COMPANY";
    legitimacyScore = Math.min(98, legitimacyScore + 20);
    notes.push(
      `Verified domain ${candidateDomain} (${domainLiveHttpStatus ? `HTTP ${domainLiveHttpStatus} live site` : "active DNS"}${domainHasMxRecords ? " + active corporate MX mail servers" : ""}).`
    );
  } else if (buyerPersonaType.includes("Founder") || buyerPersonaType.includes("CMO")) {
    legitimacyStatus = "VERIFIED_DECISION_MAKER";
    legitimacyScore = Math.min(92, legitimacyScore + 12);
    notes.push(`Verified executive role (${buyerPersonaType})${companyName ? ` at ${companyName}` : ""}.`);
  } else if (/\b(revenue|clients|customers|shopify|saas|b2b|ecommerce|store|clinic|real estate|dubai|mumbai|budget)\b/i.test(combined)) {
    legitimacyStatus = "VERIFIED_ACTIVE_BUSINESS";
    legitimacyScore = Math.min(86, legitimacyScore + 8);
    notes.push("Post contains concrete operational business context (existing website/revenue/market operations).");
  } else {
    notes.push(`Active ${input.sourcePlatform} prospect profile; request website URL in first touch.`);
  }

  return {
    companyName,
    companyDomain: candidateDomain,
    legitimacyStatus,
    legitimacyScore,
    buyerPersonaType,
    verificationNote: notes.join(" "),
    domainLiveHttpStatus,
    domainHasMxRecords,
  };
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

export function parseFreshnessHoursFromText(text: string): number | null {
  const lower = text.toLowerCase();
  if (/\b(\d+\s*(week|weeks|w|month|months|mo|year|years|yr)s?\s*ago)\b/i.test(lower)) {
    return 999;
  }
  const dayMatch = lower.match(/\b(\d+)\s*(?:day|days|d)\s*ago\b/i);
  if (dayMatch) {
    return Number(dayMatch[1]) * 24;
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

    const snippet = $(el).find(".result__snippet").text().trim().replace(/\s+/g, " ");
    if (!snippet && !title) return;

    const parsedAge = parseFreshnessHoursFromText(`${title} ${snippet}`);
    const ageHours = parsedAge !== null ? parsedAge : 14;
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

    const snippet = $(el).find(".result__snippet, .b_caption p").text().trim().replace(/\s+/g, " ");
    if (!snippet && !title) return;

    const parsedAge = parseFreshnessHoursFromText(`${title} ${snippet}`);
    const ageHours = parsedAge !== null ? parsedAge : 14;
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

async function searchRedditAtomRss(
  serviceFilter?: IntentServiceCategory,
  limit = 100
): Promise<RawSocialResult[]> {
  const subs =
    "smallbusiness+entrepreneur+startups+SEO+bigseo+digital_marketing+web_design+webdev+ecommerce+PPC+marketing+branding+socialmedia+india+dubai";

  const queryByCategory: Record<IntentServiceCategory, string> = {
    SEO: `"SEO agency" OR "recommend SEO" OR "hire SEO" OR "looking for SEO" OR "SEO consultant" OR "local SEO" OR "SEO help"`,
    WEB_DEV: `"website redesign" OR "web development" OR "web design" OR "looking for web developer" OR "need a website" OR "conversion rate"`,
    AI_VIDEO: `"video production" OR "product video" OR "AI video" OR "explainer video" OR "commercial video"`,
    AEO_GEO: `"Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO" OR "SEO agency Dubai" OR "marketing Dubai"`,
    PAID_MEDIA: `"Google Ads" OR "performance marketing" OR "marketing agency" OR "Meta ads" OR "Facebook ads"`,
    BRANDING: `"branding agency" OR "social media agency" OR "creative agency" OR "social media manager" OR "rebrand"`,
  };

  const combinedQuery = serviceFilter
    ? queryByCategory[serviceFilter]
    : `"SEO agency" OR "website redesign" OR "web development" OR "web design" OR "marketing agency" OR "Google Ads" OR "video production" OR "branding agency" OR "social media agency" OR "local SEO"`;

  const url = `https://www.reddit.com/r/${subs}/search.rss?q=${encodeURIComponent(
    combinedQuery
  )}&restrict_sr=on&sort=new&t=week&limit=${limit}`;

  try {
    const res = await fetchWithTimeout(url, {
      timeoutMs: 10000,
      maxRetries: 0,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok || !res.text) return [];

    const xml = res.text;
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const results: RawSocialResult[] = [];
    const nowMs = Date.now();

    for (const entry of entries) {
      const updatedStr = (entry.match(/<updated>([^<]+)<\/updated>/) || [])[1] || "";
      const publishedStr = (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || updatedStr;
      const tsMs = publishedStr ? new Date(publishedStr).getTime() : 0;
      if (!tsMs || Number.isNaN(tsMs)) continue;

      const ageHours = Math.max(1, Math.round((nowMs - tsMs) / 3600_000));
      if (ageHours > 72) continue;

      const tier = classifyFreshnessTier(ageHours);
      if (tier === "STALE") continue;

      const rawTitle = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
      const title = rawTitle
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();

      const link = (entry.match(/<link href="([^"]+)"/) || [])[1] || "";
      if (!link || !isValidSocialLeadUrl(link)) continue;

      const authorRaw = (entry.match(/<author>\s*<name>([^<]+)<\/name>/) || [])[1] || "";
      const author = authorRaw.replace(/^\/?u\//, "").trim() || "redditor";
      const subLabel = (entry.match(/<category[^>]*label="([^"]+)"/) || [])[1] || "r/smallbusiness";

      const contentHtml = (entry.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [])[1] || "";
      const cleanText = contentHtml
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&#32;/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/submitted by\s+\/u\/[^\s]+\s+to\s+r\/[^\s]+\s*\[link\]\s*\[comments\]/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      results.push({
        title: `${title} (${subLabel} by u/${author})`,
        url: link,
        snippet: cleanText ? cleanText.slice(0, 800) : title,
        platform: "REDDIT",
        publishedAt: new Date(tsMs).toISOString(),
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
  companyDomain: string | null;
  companyLegitimacyStatus: CompanyLegitimacyStatus;
  companyLegitimacyScore: number;
  buyerPersonaType: string;
  contactHint: string | null;
  aiReasoning: string;
  intentBreakdown: IntentBreakdown;
  conversionPlaybook: ConversionPlaybook;
  suggestedReply: string;
  suggestedDm: string;
  recommendedDgsUrl: string;
};

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
    /\b(seo|search engine optimization|aeo|answer engine|generative engine|web development|web design|website redesign|website development|next\.?js|wordpress|shopify|video production|ai video|brand film|ad film|explainer video|performance marketing|google ads|meta ads|facebook ads|ppc|digital marketing|marketing agency|branding agency|social media agency|social media manager|creative agency|website maintenance|website amc|marketing my b2b)\b/i.test(
      lower
    );

  let serviceCategory: IntentServiceCategory = input.defaultService || "SEO";
  if (/\b(aeo|answer engine|generative engine|ai overview|llm seo|chatgpt ranking|seo agency dubai|digital marketing dubai)\b/i.test(lower)) {
    serviceCategory = "AEO_GEO";
  } else if (/\b(ai video|video production|brand film|ad film|explainer video|commercial video|product video)\b/i.test(lower)) {
    serviceCategory = "AI_VIDEO";
  } else if (/\b(web development|website redesign|web design|next\.?js|wordpress|shopify|website amc|website maintenance|landing page|build a website|corporate site redesign)\b/i.test(lower)) {
    serviceCategory = "WEB_DEV";
  } else if (/\b(google ads|meta ads|facebook ads|performance marketing|paid media|ppc|lead generation agency|roas|marketing my b2b)\b/i.test(lower)) {
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
  } else if (/\b(usa|united states|new york|austin|california|san francisco|chicago|canadian|canada)\b/i.test(lower)) {
    targetRegion = "USA";
  }

  const isJobSeeker =
    /\b(open to work|#opentowork|\[for hire\]|for hire:|looking for a job|looking for a full-time|looking for an internship|one-year internship|my resume|20-day job|hire me|applying for|seeking a role|i offer seo|i am a freelance|i am an seo|i can build your|self-taught developer|worried about my future|anxious about my career|starting a marketing agency|second year undergrad|student fund|struggling to turn web design skills into)\b/i.test(
      lower
    ) ||
    /\b(we are hiring a full-time|job opening|years of experience required|send your cv to hr|hiring:\s*retail search director)\b/i.test(
      lower
    );

  const isSellerPromo =
    (/\b(we help brands|our agency|we're a freelancing agency|anyone need a website|helping brands, businesses|contact us today for|book a free consultation with us|dm me for seo|we offer seo|our seo services|case study: how we|showoff saturday|beginner questions)\b/i.test(
      lower
    ) &&
      !/\b(looking for an agency|recommend an agency|anyone know a good|need a reliable)\b/i.test(
        lower
      )) ||
    /\b(capcut|cracked|watch tv show|season 1|prime video|netflix|torrent)\b/i.test(lower);

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
    "need of advice",
    "need advice",
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
    "corporate site redesign",
    "broke our conversion",
    "doubled our bounce rate",
    "losing serious money",
    "conversion performance has been very poor",
    "high cpc spike",
    "small business owner trying to set up",
  ];
  const matchedBuyerPhrases = strongBuyerPhrases.filter((p) => lower.includes(p));

  const hasActiveCommercialQuestion =
    (combined.includes("?") ||
      /\b(recommend|looking|hire|agency|consultant|partner|quote|budget|redesign|advice|struggling|losing serious money|conversion rates)\b/i.test(
        lower
      )) &&
    /\b(agency|consultant|partner|company|freelancer|studio|redesign|audit|quote|budget|hire|looking for|b2b software|small business owner|repair business|conversion rates|conversion performance|cpc spike)\b/i.test(
      lower
    );

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
      score = Math.min(99, score + 4);
    } else if (input.ageHours && input.ageHours <= 24) {
      score = Math.min(99, score + 2);
    }
  } else {
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

  // Extract Pain Points & Budget/Scale Cues for Conversion Playbook
  const painPointsDetected: string[] = [];
  if (/\b(traffic drop|not ranking|zero leads|low impressions|invisible|ai search|chatgpt)\b/i.test(lower)) {
    painPointsDetected.push("Low organic search / AI search visibility & lead flow");
  }
  if (/\b(burned by|previous agency|bad experience|no results|wasted budget|accountability)\b/i.test(lower)) {
    painPointsDetected.push("Frustrated with previous agency/freelancer lack of ROI");
  }
  if (/\b(slow website|outdated|conversion rate|redesign|migration|wordpress|shopify|next\.?js)\b/i.test(lower)) {
    painPointsDetected.push("Website performance / conversion bottleneck requiring modern engineering");
  }
  if (/\b(scale|launch|rebrand|new product|dubai|uae|mumbai|expansion)\b/i.test(lower)) {
    painPointsDetected.push("Active growth expansion / new campaign launch");
  }
  if (painPointsDetected.length === 0) {
    painPointsDetected.push(`Seeking vetted ${serviceCategory.replace("_", " ")} execution partner`);
  }

  const budgetMatch = combined.match(/(\$\s?\d+[kK,]?\d*|AED\s?\d+[kK,]?\d*|INR\s?\d+|₹\s?\d+|\d+\s?lakh)/i);
  const budgetOrScaleSignal = budgetMatch
    ? `Explicit budget mentioned: ${budgetMatch[0]}`
    : contactHint
      ? `Direct portfolio/DM request (${contactHint}) — active vendor shortlisting`
      : "Commercial agency/partner inquiry (Scope & retainer open)";

  const caseStudyMap: Record<IntentServiceCategory, string> = {
    SEO: "D'Genius Technical SEO + Search Console Growth Architecture (/services/seo/)",
    AEO_GEO: "D'Genius AEO/GEO AI Search Citation Engine for Dubai & Global Brands (/services/aeo-geo-aio/)",
    WEB_DEV: "HumaNxt / Better Ceasons / Katherine's Gallery High-Speed Web Engineering & AMC (/services/website-development/)",
    AI_VIDEO: "D'Genius Generative AI Commercial Brand Films & Ad Creatives (/services/ai-video-production-agency/)",
    PAID_MEDIA: "Full-Funnel ROAS & B2B Lead Acquisition Engine (/services/digital-marketing/)",
    BRANDING: "Executive Brand Identity & High-Engagement Social Systems (/services/branding/)",
  };

  const objectionMap: Record<IntentServiceCategory, string> = {
    SEO: "Preempt 'vanity keyword reports' by offering a 5-minute live audit of their commercial buyer-intent gaps.",
    AEO_GEO: "Show how DGS structures entity schema & LLM-ready content for ChatGPT, Perplexity & Google AI Overviews.",
    WEB_DEV: "Highlight Core Web Vitals speed, clean conversion architecture, and reliable post-launch AMC support.",
    AI_VIDEO: "Emphasize agency-grade storyboarding + rapid AI production turnaround vs. slow traditional shoots.",
    PAID_MEDIA: "Focus on qualified pipeline & CAC reduction rather than vanity impressions.",
    BRANDING: "Connect visual identity directly to buyer trust and conversion lift.",
  };

  const intentBreakdown: IntentBreakdown = {
    buyingStage: contactHint ? "ACTIVE_VENDOR_SHORTLIST" : "URGENT_PROBLEM_SOLVING",
    intentTriggerPhrases: matchedBuyerPhrases.slice(0, 4),
    painPointsDetected,
    budgetOrScaleSignal,
    decisionMakerConfidence:
      /\b(founder|ceo|owner|co-founder|partner)\b/i.test(combined)
        ? "HIGH (C-Level / Founder / VP)"
        : "COMMUNITY_BUSINESS_OWNER",
  };

  const conversionPlaybook: ConversionPlaybook = {
    companyVerificationNote: "Pending live DNS/HTTP check",
    domainLiveHttpStatus: null,
    domainHasMxRecords: false,
    recommendedHook: `Reference their exact request (${matchedBuyerPhrases[0] || "partner search"}) and offer 2 concrete observations before pitching.`,
    keyValueAngle: objectionMap[serviceCategory],
    objectionToPreempt: painPointsDetected[0],
    caseStudyToMention: caseStudyMap[serviceCategory],
    closingQuestion: `Would it be helpful if I recorded a 2-minute teardown of your current ${serviceCategory.replace("_", " ")} setup today?`,
  };

  const servicePitchMap: Record<IntentServiceCategory, string> = {
    SEO: "technical SEO, high-intent organic growth, and AI search visibility (AEO/GEO)",
    AEO_GEO: "Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and regional search dominance across Dubai & global markets",
    WEB_DEV: "high-conversion Next.js/custom website engineering, redesigns, and proactive Website AMC",
    AI_VIDEO: "generative AI video production, commercial brand films, and high-performing ad creatives",
    PAID_MEDIA: "ROI-focused performance marketing across Google Ads, Meta, and LinkedIn",
    BRANDING: "full-funnel brand strategy, identity systems, and executive social media growth",
  };

  const pitch = servicePitchMap[serviceCategory];
  const suggestedReply = `Hi ${firstName} — saw your post looking for ${serviceCategory.replace("_", " ")} support. At D'Genius Solutions, we specialize in ${pitch}. Happy to share relevant work and a quick 3-point audit tailored to your goals: ${recommendedDgsUrl}`;
  const suggestedDm = `Hi ${firstName}, I saw your recent post regarding ${serviceCategory.replace("_", " ")}. We lead ${pitch} at D'Genius Solutions (${recommendedDgsUrl}). ${conversionPlaybook.closingQuestion}`;

  const freshnessNote = input.ageHours !== undefined ? `Posted ~${input.ageHours}h ago.` : "Fresh post.";
  const aiReasoning =
    classification === "BUYER_SEEKING_SERVICE"
      ? `${freshnessNote} Active buyer-intent signal (${matchedBuyerPhrases.slice(0, 2).join(", ")}) seeking ${serviceCategory} in ${targetRegion}. Pain point: ${painPointsDetected[0]}.`
      : `Filtered out (${classification}).`;

  return {
    classification,
    intentScore: score,
    urgencyLevel,
    serviceCategory,
    targetRegion,
    authorName,
    authorRole,
    companyName: null,
    companyDomain: null,
    companyLegitimacyStatus: "UNVERIFIED_SOCIAL_PROFILE",
    companyLegitimacyScore: 68,
    buyerPersonaType: "Business Owner / Prospect",
    contactHint,
    aiReasoning,
    intentBreakdown,
    conversionPlaybook,
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
  // Always enrich company legitimacy & DNS/HTTP validation for qualified leads
  if (heuristic.classification === "BUYER_SEEKING_SERVICE" && heuristic.intentScore >= 72) {
    const legitimacy = await validateCompanyLegitimacy({
      companyName: heuristic.companyName,
      contactHint: heuristic.contactHint,
      authorName: heuristic.authorName,
      authorRole: heuristic.authorRole,
      postText: `${input.title} ${input.text}`,
      sourcePlatform: input.platform,
    });
    heuristic.companyName = legitimacy.companyName || heuristic.companyName;
    heuristic.companyDomain = legitimacy.companyDomain;
    heuristic.companyLegitimacyStatus = legitimacy.legitimacyStatus;
    heuristic.companyLegitimacyScore = legitimacy.legitimacyScore;
    heuristic.buyerPersonaType = legitimacy.buyerPersonaType;
    heuristic.conversionPlaybook.companyVerificationNote = legitimacy.verificationNote;
    heuristic.conversionPlaybook.domainLiveHttpStatus = legitimacy.domainLiveHttpStatus;
    heuristic.conversionPlaybook.domainHasMxRecords = legitimacy.domainHasMxRecords;
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "").trim();
  if (!apiKey || apiKey.length < 10) return heuristic;
  if (heuristic.intentScore < 72) return heuristic;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are the Senior B2B Sales Intelligence & Buyer-Intent Qualifier for D'Genius Solutions (https://www.dgeniussolutions.com), offering:
- SEO (/services/seo/)
- AEO / GEO / AI Search Optimization (/services/aeo-geo-aio/)
- Website Development & Website Maintenance AMC (/services/website-development/ & /services/website-maintenance-amc/)
- AI Video Production & Commercial Brand Films (/services/ai-video-production-agency/)
- Digital & Performance Marketing (/services/digital-marketing/)
- Branding & Social Media Marketing (/services/branding/)

Analyze this post and extract deep buyer-intent & conversion intelligence. Reject freelancers pitching themselves ("[For Hire]"), job seekers, and competing agencies promoting themselves.

POST PLATFORM: ${input.platform} (Age: ~${input.ageHours ?? 6}h old)
POST URL: ${input.url}
POST TITLE: ${input.title}
POST TEXT: ${input.text.slice(0, 1200)}

Return ONLY valid JSON:
{
  "classification": "BUYER_SEEKING_SERVICE" | "SELLER_PROMOTION" | "JOB_SEEKER" | "LOW_INTENT_NOISE",
  "intentScore": number (0 to 100),
  "urgencyLevel": "HIGH" | "MEDIUM" | "LOW",
  "serviceCategory": "SEO" | "WEB_DEV" | "AI_VIDEO" | "AEO_GEO" | "PAID_MEDIA" | "BRANDING",
  "targetRegion": "INDIA" | "UAE_DUBAI" | "USA" | "UK" | "GLOBAL",
  "authorName": string or null,
  "authorRole": string or null,
  "companyName": string or null,
  "companyDomain": string or null,
  "aiReasoning": "Clear 1-2 sentence breakdown of their exact buying intent and urgency",
  "painPoints": ["specific pain point 1", "specific pain point 2"],
  "budgetOrScaleSignal": "Any budget, timeline, team size, or scale clue in the post",
  "recommendedHook": "Exact opening angle that will make this prospect reply to D'Genius Solutions",
  "closingQuestion": "Low-friction question to book a 10-min discovery call or send a free teardown",
  "suggestedReply": "Warm, consultative public comment reply (max 280 chars)",
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

    if (parsed.companyDomain && !heuristic.companyDomain) {
      const recheck = await validateCompanyLegitimacy({
        companyName: parsed.companyName || heuristic.companyName,
        companyDomainHint: parsed.companyDomain,
        contactHint: heuristic.contactHint,
        authorName: parsed.authorName || heuristic.authorName,
        authorRole: parsed.authorRole || heuristic.authorRole,
        postText: input.text,
        sourcePlatform: input.platform,
      });
      heuristic.companyDomain = recheck.companyDomain;
      heuristic.companyLegitimacyStatus = recheck.legitimacyStatus;
      heuristic.companyLegitimacyScore = recheck.legitimacyScore;
      heuristic.conversionPlaybook.companyVerificationNote = recheck.verificationNote;
      heuristic.conversionPlaybook.domainLiveHttpStatus = recheck.domainLiveHttpStatus;
      heuristic.conversionPlaybook.domainHasMxRecords = recheck.domainHasMxRecords;
    }

    return {
      ...heuristic,
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
      aiReasoning: parsed.aiReasoning || heuristic.aiReasoning,
      intentBreakdown: {
        ...heuristic.intentBreakdown,
        painPointsDetected:
          Array.isArray(parsed.painPoints) && parsed.painPoints.length > 0
            ? parsed.painPoints
            : heuristic.intentBreakdown.painPointsDetected,
        budgetOrScaleSignal: parsed.budgetOrScaleSignal || heuristic.intentBreakdown.budgetOrScaleSignal,
      },
      conversionPlaybook: {
        ...heuristic.conversionPlaybook,
        recommendedHook: parsed.recommendedHook || heuristic.conversionPlaybook.recommendedHook,
        closingQuestion: parsed.closingQuestion || heuristic.conversionPlaybook.closingQuestion,
      },
      suggestedReply: parsed.suggestedReply || heuristic.suggestedReply,
      suggestedDm: parsed.suggestedDm || heuristic.suggestedDm,
      recommendedDgsUrl: DGS_SERVICE_URLS[serviceCategory],
    };
  } catch {
    return heuristic;
  }
}

/**
 * Saves a qualified signal exclusively to `intent_lead_signals` with strict 3-way deduplication:
 * 1. `url_hash` (canonical URL)
 * 2. `content_fingerprint` (author + normalized post text)
 * 3. Same `author_name` + `service_category` in the last 7 days
 * Guarantees ZERO repeat leads across 30-minute cron runs!
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
  if (ageHours > 72) {
    return { inserted: false, id: "skipped_stale" };
  }
  const freshnessTier: FreshnessTier =
    input.freshnessTier || (ageHours <= 12 ? "1H_12H" : ageHours <= 24 ? "24H" : "3D");

  const resolvedAuthor = input.evaluated.authorName || input.authorName || null;
  const urlHash = computeUrlHash(input.postUrl, input.postText);
  const contentFingerprint = computeContentFingerprint(resolvedAuthor, input.postText);

  // Strict Deduplication Check (URL Hash OR Content Fingerprint OR Same Author + Service within 7 days)
  const { rows: existing } = await cmsQuery<{ id: string }>(
    `SELECT id FROM intent_lead_signals
     WHERE url_hash = ?
        OR content_fingerprint = ?
        OR (author_name IS NOT NULL AND author_name != 'LinkedIn Member' AND author_name = ? AND service_category = ? AND discovered_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))
     LIMIT 1`,
    [urlHash, contentFingerprint, resolvedAuthor || "__none__", input.evaluated.serviceCategory]
  );

  if (existing.length > 0) {
    return { inserted: false, id: existing[0].id };
  }

  const id = `ils_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const publishedDate = input.publishedAt ? new Date(input.publishedAt) : new Date(Date.now() - ageHours * 3600_000);

  await cmsExecute(
    `INSERT INTO intent_lead_signals (
      id, url_hash, content_fingerprint, source_platform, post_url, post_title, post_text,
      author_name, author_role, author_profile_url,
      company_name, company_domain, company_legitimacy_status, company_legitimacy_score, buyer_persona_type,
      contact_hint, service_category, target_region, discovery_query,
      intent_classification, intent_score, urgency_level,
      ai_reasoning, intent_breakdown_json, conversion_playbook_json,
      suggested_reply, suggested_dm, recommended_dgs_url,
      status, published_at, age_hours, freshness_tier
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?)`,
    [
      id,
      urlHash,
      contentFingerprint,
      input.sourcePlatform,
      input.postUrl,
      (input.postTitle || "").slice(0, 490) || null,
      input.postText.slice(0, 4000),
      resolvedAuthor,
      input.evaluated.authorRole || input.authorRole || null,
      input.authorProfileUrl || null,
      input.evaluated.companyName || null,
      input.evaluated.companyDomain || null,
      input.evaluated.companyLegitimacyStatus,
      input.evaluated.companyLegitimacyScore,
      input.evaluated.buyerPersonaType,
      input.evaluated.contactHint || null,
      input.evaluated.serviceCategory,
      input.evaluated.targetRegion,
      input.discoveryQuery ? input.discoveryQuery.slice(0, 490) : null,
      input.evaluated.classification,
      input.evaluated.intentScore,
      input.evaluated.urgencyLevel,
      input.evaluated.aiReasoning,
      JSON.stringify(input.evaluated.intentBreakdown),
      JSON.stringify(input.evaluated.conversionPlaybook),
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
    const redditResults = await searchRedditAtomRss(options?.serviceFilter, 100);
    queriesExecuted++;
    rawCandidatesFound += redditResults.length;

    for (const r of redditResults) {
      const heuristic = evaluateCandidateHeuristically({
        title: r.title,
        text: r.snippet,
        url: r.url,
        defaultService: options?.serviceFilter || "SEO",
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
        discoveryQuery: `30m Cron <72h buyer search (${evaluated.serviceCategory})`,
        publishedAt: r.publishedAt,
        ageHours: r.ageHours,
        freshnessTier: r.freshnessTier,
        evaluated,
      });

      if (upserted.inserted) {
        qualifiedLeadsAdded++;
        newlyInsertedForEmail.push({
          id: upserted.id,
          sourcePlatform: `REDDIT (${r.ageHours}h old)`,
          postUrl: r.url,
          authorName: evaluated.authorName || "Active Service Buyer",
          authorRole: `${evaluated.buyerPersonaType} • ${evaluated.companyLegitimacyStatus.replace(/_/g, " ")} (${evaluated.companyLegitimacyScore}/100)`,
          companyName: evaluated.companyName || evaluated.companyDomain || "",
          serviceCategory: evaluated.serviceCategory,
          targetRegion: evaluated.targetRegion,
          intentScore: evaluated.intentScore,
          urgencyLevel: evaluated.urgencyLevel,
          postSnippet: `${r.title} — ${r.snippet}`.slice(0, 350),
          aiReasoning: `${evaluated.aiReasoning} | Legitimacy: ${evaluated.conversionPlaybook.companyVerificationNote} | Hook: ${evaluated.conversionPlaybook.recommendedHook}`,
          suggestedReply: evaluated.suggestedReply,
          recommendedDgsUrl: evaluated.recommendedDgsUrl,
        });
      }
    }

    const pool = options?.serviceFilter
      ? DISCOVERY_QUERY_POOL.filter((q) => q.serviceCategory === options.serviceFilter)
      : DISCOVERY_QUERY_POOL;
    const queryOffset = Math.floor(Date.now() / (30 * 60 * 1000)) % Math.max(1, pool.length);
    const orderedQueries = [...pool.slice(queryOffset), ...pool.slice(0, queryOffset)].slice(0, 4);

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
            authorRole: `${evaluated.buyerPersonaType} • ${evaluated.companyLegitimacyStatus.replace(/_/g, " ")} (${evaluated.companyLegitimacyScore}/100)`,
            companyName: evaluated.companyName || evaluated.companyDomain || "",
            serviceCategory: evaluated.serviceCategory,
            targetRegion: evaluated.targetRegion,
            intentScore: evaluated.intentScore,
            urgencyLevel: evaluated.urgencyLevel,
            postSnippet: `${r.title} — ${r.snippet}`.slice(0, 350),
            aiReasoning: `${evaluated.aiReasoning} | Legitimacy: ${evaluated.conversionPlaybook.companyVerificationNote} | Hook: ${evaluated.conversionPlaybook.recommendedHook}`,
            suggestedReply: evaluated.suggestedReply,
            recommendedDgsUrl: evaluated.recommendedDgsUrl,
          });
        }
      }
    }

    // Only email when NET-NEW non-duplicate leads are inserted
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
    const summaryText = `Executed ${queriesExecuted} fresh (<72h) queries. Evaluated ${rawCandidatesFound} recent posts, qualified ${qualifiedLeadsAdded} net-new buyer leads (0 repeats), rejected ${rejectedNoiseCount} cold/job-seeker posts.${emailsSent ? " Email alert sent!" : ""}`;

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
    companyLegitimacyStatus: CompanyLegitimacyStatus;
    companyLegitimacyScore: number;
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
    companyLegitimacyStatus: CompanyLegitimacyStatus;
    companyLegitimacyScore: number;
  }> = [];
  const emailItems: IntentLeadEmailItem[] = [];

  for (const post of posts.slice(0, 40)) {
    const text = String(post.postText || "").trim();
    if (text.length < 25) continue;

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
        companyLegitimacyStatus: evaluated.companyLegitimacyStatus,
        companyLegitimacyScore: evaluated.companyLegitimacyScore,
      });
      emailItems.push({
        id: upserted.id,
        sourcePlatform: `LINKEDIN_FEED (${ageHours}h old)`,
        postUrl,
        authorName: evaluated.authorName || post.authorName || "LinkedIn Connection",
        authorRole: `${evaluated.buyerPersonaType} • ${evaluated.companyLegitimacyStatus.replace(/_/g, " ")} (${evaluated.companyLegitimacyScore}/100)`,
        companyName: evaluated.companyName || evaluated.companyDomain || "",
        serviceCategory: evaluated.serviceCategory,
        targetRegion: evaluated.targetRegion,
        intentScore: evaluated.intentScore,
        urgencyLevel: evaluated.urgencyLevel,
        postSnippet: text.slice(0, 350),
        aiReasoning: `${evaluated.aiReasoning} | Legitimacy: ${evaluated.conversionPlaybook.companyVerificationNote} | Hook: ${evaluated.conversionPlaybook.recommendedHook}`,
        suggestedReply: evaluated.suggestedReply,
        recommendedDgsUrl: evaluated.recommendedDgsUrl,
      });
    } else {
      duplicates++;
    }
  }

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
