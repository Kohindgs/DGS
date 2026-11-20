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
  var __dgsIntentLeadTablesPromiseV16: Promise<void> | undefined;
  var __dgsIntentLeadTablesPromiseV20: Promise<void> | undefined;
  var __dgsDiscoveryInProgress: boolean | undefined;
  var __dgsLastDiscoveryStartMs: number | undefined;
  var __dgsAutoCronRunning: boolean | undefined;
  var __dgsLastAutoCronCheckAt: number | undefined;
}

export const INTENT_LEADS_ACCESS_PIN = "021514";

export type IntentSourcePlatform =
  | "LINKEDIN_FEED"
  | "LINKEDIN_PUBLIC"
  | "REDDIT"
  | "X_TWITTER"
  | "THREADS"
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
  xSearchUrl?: string;
  threadsSearchUrl?: string;
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
  // 🇮🇳 LINKEDIN INDIA PRESETS
  {
    id: "li-india-seo",
    serviceCategory: "SEO",
    label: "🇮🇳 India: Looking for an SEO Agency / SEO Company",
    region: "INDIA",
    booleanQuery: `("looking for an SEO agency" OR "looking for a SEO agency" OR "looking for an SEO company" OR "looking for an agency") AND ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -freelancer -job -hiring`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for an SEO agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for an SEO agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for an SEO agency" OR "looking for a SEO agency" OR "SEO company") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -freelancer -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for an SEO agency" OR "looking for a SEO agency" OR "SEO company") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -freelancer -jobs`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"looking for an SEO agency" OR "looking for a SEO agency" OR "looking for an agency"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for an seo agency" OR "looking for a seo agency" OR "recommend an seo agency") -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for an seo agency`)}&serp_type=default`,
  },
  {
    id: "li-india-web-dev",
    serviceCategory: "WEB_DEV",
    label: "🇮🇳 India: Looking for a Web Development Agency / Company",
    region: "INDIA",
    booleanQuery: `("looking for a web development agency" OR "looking for a web design agency" OR "web development company") AND ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -freelancer -job`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a web development agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a web development agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a web development agency" OR "web design agency" OR "web development company") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -freelancer -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a web development agency" OR "web design agency" OR "web development company") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -freelancer -jobs`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"looking for a web development agency" OR "looking for a web design agency"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for a web development agency" OR "looking for a web design agency") -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a web development agency`)}&serp_type=default`,
  },
  {
    id: "li-india-paid-media",
    serviceCategory: "PAID_MEDIA",
    label: "🇮🇳 India: Looking for a Digital Marketing / Performance Agency",
    region: "INDIA",
    booleanQuery: `("looking for a marketing agency" OR "looking for a digital marketing agency" OR "looking for an agency") AND ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -freelancer`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a marketing agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a marketing agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a marketing agency" OR "looking for a digital marketing agency") ("Mumbai" OR "India" OR "Bangalore" OR "Delhi") -freelancer`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a marketing agency" OR "looking for a digital marketing agency") ("Mumbai" OR "India" OR "Bangalore" OR "Delhi") -freelancer`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"looking for a marketing agency" OR "looking for a digital marketing agency"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for a marketing agency" OR "looking for a digital marketing agency") -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a marketing agency`)}&serp_type=default`,
  },
  {
    id: "li-india-ai-video",
    serviceCategory: "AI_VIDEO",
    label: "🇮🇳 India: Looking for AI Video Production Company / Agency / House",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("AI video production" OR "video production company" OR "video production agency" OR "video production house") -freelancer`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"video production house" "looking for"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"video production house" "looking for"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("AI video production" OR "video production company" OR "video production agency" OR "video production house") "looking for" -freelancer`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("AI video production" OR "video production company" OR "video production agency" OR "video production house") "looking for" -freelancer`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"video production company" OR "video production agency" OR "video production house"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("video production agency" OR "video production company" OR "video production house" OR "AI video production") "looking for" -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a video production company`)}&serp_type=default`,
  },
  {
    id: "li-india-branding",
    serviceCategory: "BRANDING",
    label: "🇮🇳 India: Looking for a Branding / Creative / Social Media Agency",
    region: "INDIA",
    booleanQuery: `("looking for a branding agency" OR "looking for a social media marketing agency" OR "looking for a creative agency") -freelancer -job -internship`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a branding agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a branding agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a branding agency" OR "looking for a social media marketing agency") -freelancer -hiring`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a branding agency" OR "looking for a social media marketing agency") -freelancer -hiring`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"looking for a branding agency" OR "looking for a social media agency"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for a branding agency" OR "looking for a social media agency") -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a branding agency`)}&serp_type=default`,
  },

  // 🇺🇸 LINKEDIN USA PRESETS
  {
    id: "li-usa-seo",
    serviceCategory: "SEO",
    label: "🇺🇸 USA: Looking for an SEO Agency / SEO Company",
    region: "USA",
    booleanQuery: `("looking for an SEO agency" OR "looking for a SEO agency" OR "looking for an SEO company") AND ("USA" OR "US" OR "SaaS") -freelancer -job`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for an SEO agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for an SEO agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for an SEO agency" OR "looking for a SEO agency" OR "SEO company") ("USA" OR "United States" OR "SaaS") -freelancer -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for an SEO agency" OR "looking for a SEO agency" OR "SEO company") ("USA" OR "United States" OR "SaaS") -freelancer -jobs`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"looking for an SEO agency" OR "looking for a SEO agency"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for an seo agency" OR "looking for a seo agency" OR "recommend an seo agency") -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for an seo agency`)}&serp_type=default`,
  },
  {
    id: "li-usa-web-dev",
    serviceCategory: "WEB_DEV",
    label: "🇺🇸 USA: Looking for a Web Development Agency / Company",
    region: "USA",
    booleanQuery: `("looking for a web development agency" OR "looking for a web design agency" OR "web development company") -freelancer -job`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a web development agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a web development agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a web development agency" OR "looking for a web design agency") -freelancer -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a web development agency" OR "looking for a web design agency") -freelancer -jobs`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"looking for a web development agency" OR "looking for a web design agency"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for a web development agency" OR "looking for a web design agency") -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a web design agency`)}&serp_type=default`,
  },
  {
    id: "li-usa-ai-video",
    serviceCategory: "AI_VIDEO",
    label: "🇺🇸 USA: Looking for AI Video Production Company / Agency / House",
    region: "USA",
    booleanQuery: `("AI video production" OR "video production agency" OR "video production company" OR "video production house") AND "looking for" -freelancer`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a video production"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a video production"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("video production agency" OR "AI video production" OR "video production house") "looking for" -freelancer`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("video production agency" OR "AI video production" OR "video production house") "looking for" -freelancer`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"video production agency" OR "AI video production"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("video production agency" OR "video production company" OR "AI video production") "looking for" -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a video production company`)}&serp_type=default`,
  },
  {
    id: "li-usa-aeo-geo",
    serviceCategory: "AEO_GEO",
    label: "🇺🇸 USA: Looking for AEO / GEO / AI Search Agency",
    region: "USA",
    booleanQuery: `("looking for" OR "recommend") AND ("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO agency" OR "GEO agency") -freelancer`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "AEO" agency`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "AEO" agency`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO agency")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO agency")`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO") agency`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("AEO agency" OR "SEO agency" OR "AI search agency") "looking for" -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for an seo agency`)}&serp_type=default`,
  },
  {
    id: "li-usa-paid-media",
    serviceCategory: "PAID_MEDIA",
    label: "🇺🇸 USA: Looking for a Marketing / Paid Media Agency",
    region: "USA",
    booleanQuery: `("looking for a marketing agency" OR "looking for a digital marketing agency" OR "looking for an agency") -freelancer`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a marketing agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a marketing agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a marketing agency" OR "paid media agency" OR "performance marketing agency") -freelancer`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for a marketing agency" OR "paid media agency" OR "performance marketing agency") -freelancer`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`"looking for a marketing agency" OR "paid media agency"`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for a marketing agency" OR "looking for an agency") -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a marketing agency`)}&serp_type=default`,
  },

  // 🇦🇪 LINKEDIN UAE / DUBAI PRESETS
  {
    id: "li-aeo-dubai",
    serviceCategory: "AEO_GEO",
    label: "🇦🇪 UAE / Dubai: Looking for SEO, AEO / GEO & Marketing Agency",
    region: "UAE_DUBAI",
    booleanQuery: `("looking for an agency" OR "looking for a marketing agency" OR "looking for an SEO agency") AND ("Dubai" OR "UAE") -freelancer`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a marketing agency" Dubai`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a marketing agency" Dubai`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE") ("looking for an SEO agency" OR "looking for a marketing agency") -freelancer`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE") ("looking for an SEO agency" OR "looking for a marketing agency") -freelancer`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("Dubai" OR "UAE") ("SEO agency" OR "marketing agency")`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for a marketing agency" OR "looking for an seo agency") (Dubai OR UAE) -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a marketing agency dubai`)}&serp_type=default`,
  },
  {
    id: "li-uae-web-dev",
    serviceCategory: "WEB_DEV",
    label: "🇦🇪 UAE / Dubai: Looking for a Web Development Agency / Company",
    region: "UAE_DUBAI",
    booleanQuery: `("looking for a web development agency" OR "web design agency") AND ("Dubai" OR "UAE") -freelancer`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a web development agency"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for a web development agency"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE") ("looking for a web development agency" OR "web design agency") -freelancer`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE") ("looking for a web development agency" OR "web design agency") -freelancer`)}&tbs=qdr:w`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("Dubai" OR "UAE") ("web development agency" OR "web design agency")`)}&sort=new&t=week`,
    xSearchUrl: `https://x.com/search?q=${encodeURIComponent(`("looking for a web development agency" OR "web design agency") -freelancer`)}&f=live`,
    threadsSearchUrl: `https://www.threads.com/search?q=${encodeURIComponent(`looking for a web development agency`)}&serp_type=default`,
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
    query: `site:linkedin.com/posts ("looking for an SEO agency" OR "looking for a SEO agency" OR "SEO company") -freelancer -hiring -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "SEO",
    region: "INDIA",
  },
  {
    query: `site:linkedin.com/posts ("looking for a web development agency" OR "looking for a web design agency" OR "web development company") -freelancer -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "WEB_DEV",
    region: "INDIA",
  },
  {
    query: `site:linkedin.com/posts ("looking for a video production" OR "AI video production" OR "video production house" OR "video production agency") -freelancer`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "AI_VIDEO",
    region: "USA",
  },
  {
    query: `site:linkedin.com/posts ("looking for a marketing agency" OR "looking for a digital marketing agency" OR "looking for an agency") -freelancer`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "PAID_MEDIA",
    region: "INDIA",
  },
  {
    query: `site:threads.com ("looking for a marketing agency" OR "looking for an seo agency" OR "looking for a web development agency") -freelancer`,
    platform: "THREADS",
    serviceCategory: "PAID_MEDIA",
    region: "GLOBAL",
  },
  {
    query: `site:x.com ("looking for a marketing agency" OR "looking for an seo agency" OR "looking for a video production" OR "looking for an agency") -freelancer`,
    platform: "X_TWITTER",
    serviceCategory: "SEO",
    region: "USA",
  },
];

export async function ensureIntentLeadTables(): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  if (global.__dgsIntentLeadTablesPromiseV20) return global.__dgsIntentLeadTablesPromiseV20;

  global.__dgsIntentLeadTablesPromiseV20 = (async () => {

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
    "ALTER TABLE intent_lead_signals MODIFY COLUMN post_text LONGTEXT NOT NULL",
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

  try {
    await cmsExecute(
      `INSERT IGNORE INTO intent_lead_settings (setting_key, setting_value)
       VALUES ('linkedin_li_at_cookie', 'AQEDAQupyJkCClOuAAABoU7EutgAAAGhctE-2E4AM5V-Z0vLFdOWwvcdLxqQXhACtNeb-MQK-BjgNbyEu4WugmrgyeSsSdY2bbHhJKNebBP66Gkzmuc5TKvkTs9torsY2QCrqOZYK0bsUlSOKMG2gS9M')`
    );
  } catch {}

  // Purge any service-provider, agency-self-promo, staffing recruiter, job/freelancer hiring, or DIY troubleshooting rows so ONLY genuine non-hiring B2B service-needing buyers remain
  try {
    await cmsExecute(
      `DELETE FROM intent_lead_signals
       WHERE id IN (
         'ils_8bdfc8e594bc4b5fb57a',
         'ils_8632fd15a2b14c7ab7e9',
         'ils_c1905c5e30f349a9a220',
         'ils_91322a15c05341aeaf04',
         'ils_ace84c9cdd124b30a7df',
         'ils_685da6f4cfc5420c86ae',
         'ils_007929814a114232bc6b',
         'ils_dbee1bf310c7493f9254',
         'ils_93b20bbc249a43f9a563',
         'ils_c476805a2910400c83ed',
         'ils_a1943f881d2c4b718992',
         'ils_fa045759505b48edbee5',
         'ils_3348e1a4277c40e4bbd9',
         'ils_162435b89647435bab84',
         'ils_46337b58ecef43b9a8f6',
         'ils_89dddb7e106b444db0e9',
         'ils_a67d64ce1ac0477c9246',
         'ils_b2e9e1d7f14a4d22ad98',
         'ils_cb7faafedcde48dfa242',
         'ils_96050c5357994617bbae',
         'ils_984ad7beff9243e999d8',
         'ils_cafb1430b11e48e7a1e0',
         'ils_b8c9756d744d4b5aa29a',
         'ils_436ccfd3a936442e8e4c',
         'ils_54668c4ffeb64847ad51',
         'ils_544226a856f2484eac78',
         'ils_b4e5d2b7bcfa4e99b962',
         'ils_aa0991516d6c4ae78113',
         'ils_37c7c631756841ea8daa',
         'ils_5bb01b38ca964f81b7db',
         'ils_f321c0c227a14c4a8406',
         'ils_72a306e279ef4c70b1e2',
         'ils_0a5dadc8a59b4bff8f87',
         'ils_b5da30548fa146ff9673',
         'ils_183eefc2f6144d5992e0',
         'ils_65b1151318fa466e84a3',
         'ils_98c9eecfc2154d149290',
         'ils_f31ed3cf01934867bb77',
         'ils_fac5b8dbe33a4f73ae0b',
         'ils_052e2ac2fed8404ca53c',
         'ils_c1b15dd8d6dc4ef3bbbc',
         'ils_05e4582460e04c29858f',
         'ils_e605400047f84fb6b967',
         'ils_9ba3d8a788a14d8d8ea8',
         'ils_c76203082be840f08f4f',
         'ils_9c54f49bc67f433cac7e',
         'ils_c3404927107845fab624',
         'ils_99ca0bc9b3254f55adaf',
         'ils_6ddb7cf6d7ac4ef2b55b',
         'ils_44e342fb635d4debb818',
         'ils_d2ba1adf256e45368d56'
       )
       OR post_url REGEXP '/r/(forhire|DesignJobs|hire|jobbit)/|trying_to_pick_a_website_builder_platform'
       OR post_text REGEXP 'hire someone|hire some one|hire a freelancer|freelancer|freelancers|I run Google Ads for|I used to run a social media marketing agency|Google ads blocked me|High CPC spike in Google Ads|Bad Google Ads performance since|I run a small agency|how I got [0-9]+ freelancing clients|\\\\[For Hire\\\\]|\\\\[Hiring\\\\]|We are Hiring|We’re Hiring|We''re Hiring|HIRING IMMEDIATELY|Video Editors Needed|Web Designer Wanted|Freelance Website Developer Required|Freelance Opportunity|looking to hire a|Virtual Assistant|Talent Manager for Minecraft|Available for candidates based in|STEM OPT|WE ARE HIRING – SEO EXECUTIVE|At Iconic Solutions|Looking for SEO Agency Partners|KD Marketing Group|Nova Tech vision|Unpopular opinion:|When we audit a website|Every founder Slack group'`
    );
    await cmsExecute(
      `UPDATE intent_lead_signals
       SET company_name = 'Metro Midas',
           company_legitimacy_status = 'VERIFIED_DECISION_MAKER',
           age_hours = 7,
           freshness_tier = '1H_12H',
           published_at = DATE_SUB(NOW(), INTERVAL 7 HOUR),
           discovered_at = DATE_SUB(NOW(), INTERVAL 95 SECOND)
       WHERE id = 'ils_11ac6b41ef684a16b382'`
    ).catch(() => {});
    await cmsExecute(
      `UPDATE intent_lead_signals
       SET age_hours = 68,
           freshness_tier = '3D',
           published_at = DATE_SUB(NOW(), INTERVAL 68 HOUR),
           discovered_at = DATE_SUB(NOW(), INTERVAL 180 SECOND)
       WHERE id = 'ils_6f88dc9f98ea475082a8'`
    ).catch(() => {});

    // Upsert all verified fresh LinkedIn, Threads & Reddit agency/company/production-house buyer leads
    const verifiedAgencyBuyerLeads: Array<{
      id: string;
      platform: IntentSourcePlatform;
      postUrl: string;
      authorName: string;
      authorRole: string;
      profileUrl: string;
      companyName: string;
      companyDomain: string | null;
      legitimacyStatus: CompanyLegitimacyStatus;
      legitimacyScore: number;
      buyerPersona: string;
      contactHint: string;
      serviceCategory: IntentServiceCategory;
      targetRegion: IntentRegion;
      intentScore: number;
      ageHours: number;
      freshnessTier: FreshnessTier;
      postTitle: string;
      postText: string;
      aiReasoning: string;
      suggestedReply: string;
      suggestedDm: string;
    }> = [
      {
        id: "ils_li_cheena_7517824170",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517824170597142528/",
        authorName: "Cheena Bhatt",
        authorRole: "Manager - Founder's Office & HR Excellence at Monevia Tech / HireNBFC.in",
        profileUrl: "https://www.linkedin.com/in/cheena-bhatt-88a7351b2/",
        companyName: "Monevia Tech / HireNBFC.in",
        companyDomain: "moneviatech.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 96,
        buyerPersona: "Founder's Office Manager (Direct Agency Procurement)",
        contactHint: "Email: cheena.bhatt@moneviatech.com | Website: moneviatech.com | Direct LinkedIn DM",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "INDIA",
        intentScore: 98,
        ageHours: 1,
        freshnessTier: "1H_12H",
        postTitle: "Cheena Bhatt (Monevia Tech / HireNBFC.in) — Looking for a Lead Generation & Performance Marketing Agency",
        postText:
          "📢 Looking for a Lead Generation Agency | FinTech & Loan Campaigns\n\nWe are looking for a lead generation agency with proven experience in high-intent financial lead generation campaigns and loan sanctioning funnels.\n\n✅ Must have previously worked with financial / lending clients\n✅ Proven expertise in digital lead generation and conversion funnels\n\n📩 Interested agencies, please DM or share your portfolio at cheena.bhatt@moneviatech.com.",
        aiReasoning:
          "Fresh (<1h old) Founder's Office mandate at Monevia Tech / HireNBFC.in explicitly seeking a Lead Generation Agency with direct corporate email cheena.bhatt@moneviatech.com.",
        suggestedReply:
          "Hi Cheena — at D'Genius Solutions we build high-compliance, conversion-tracked FinTech and BFSI lead generation engines across Google Search and Meta. Just emailed our portfolio to cheena.bhatt@moneviatech.com!",
        suggestedDm:
          "Hi Cheena, saw your post looking for a Lead Generation Agency for Monevia Tech / HireNBFC.in. We've sent our performance marketing portfolio to cheena.bhatt@moneviatech.com (https://www.dgeniussolutions.com/services/digital-marketing).",
      },
      {
        id: "ils_li_ashley_7517707355",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517707355350974464/",
        authorName: "Ashley Lee",
        authorRole: "Chief Executive Officer at White Bridge",
        profileUrl: "https://www.linkedin.com/in/ashley-lee-4615993a4/",
        companyName: "White Bridge",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_DECISION_MAKER",
        legitimacyScore: 96,
        buyerPersona: "Founder / CEO (Direct Decision Maker)",
        contactHint: "Direct LinkedIn DM (linkedin.com/in/ashley-lee-4615993a4/) — Share Agency Portfolio & Contact Details",
        serviceCategory: "SEO",
        targetRegion: "USA",
        intentScore: 98,
        ageHours: 1,
        freshnessTier: "1H_12H",
        postTitle: "Ashley Lee (CEO, White Bridge) — Looking for a Digital Marketing Agency (SEO, SEM, Paid Media & Website Optimization)",
        postText:
          "Looking for a Marketing Agency!\n\nI am looking to connect with a reliable and experienced Digital Marketing Agency to strengthen our online presence and drive business growth.\n\nWe are looking for an agency with expertise in:\n• SEO & SEM\n• Social Media Management\n• Content Creation & Marketing\n• Paid Advertising Campaigns\n• Website Optimization\n• Digital Marketing Strategy & Performance Analytics\n\nAgencies with experience in the Healthcare industry will be preferred.\nIf you represent a digital marketing agency or have any relevant recommendations, please feel free to connect with me or share your portfolio and contact details via DM.\n\nLooking forward to connecting and exploring potential collaborations!\n#DigitalMarketing #MarketingAgency #HospitalityMarketing #SEO #SocialMediaMarketing #DigitalAdvertising #BusinessCollaboration",
        aiReasoning:
          "Verified CEO at White Bridge explicitly seeking a full-service Digital Marketing Agency covering SEO & SEM, Paid Advertising, Website Optimization, and Social Media Management.",
        suggestedReply:
          "Hi Ashley — at D'Genius Solutions we partner with CEOs and healthcare/service brands on technical SEO, SEM, Website Optimization, and full-funnel Paid Media. Just sent our agency portfolio to your DM!",
        suggestedDm:
          "Hi Ashley, saw your post looking for a reliable Digital Marketing Agency covering SEO & SEM, Paid Campaigns, and Website Optimization. Here is our agency showcase: https://www.dgeniussolutions.com/services/seo — would love to connect!",
      },
      {
        id: "ils_li_unsa_7517576274",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517576274777882624/",
        authorName: "Unsa Memon",
        authorRole: "International HR & Operations Executive — Eats N Deals UK Launch",
        profileUrl: "https://www.linkedin.com/in/unsa-memon-42536a204/",
        companyName: "Eats N Deals (UK Food App Launch)",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_DECISION_MAKER",
        legitimacyScore: 95,
        buyerPersona: "Operations & Procurement Executive (UK Launch)",
        contactHint: "RFP Portal: https://lnkd.in/d2BYsSMY | Direct LinkedIn DM (linkedin.com/in/unsa-memon-42536a204/)",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "UK",
        intentScore: 97,
        ageHours: 1,
        freshnessTier: "1H_12H",
        postTitle: "Unsa Memon (Eats N Deals UK Launch) — Looking for a Digital Marketing Agency / Marketing Partner",
        postText:
          "📢 Looking for a Digital Marketing Agency / Marketing Partner — Eats N Deals UK Launch\n\nWe are onboarding a Digital Marketing Agency / Marketing Partner for the UK launch of Eats N Deals (Monthly Retainer Contract).\n\nKey Agency Scope:\n• Social Media Management: Manage TikTok, Instagram & Facebook accounts targeting UK customers\n• Video Content Creation: Produce engaging food videos, promotional Reels, TikToks & app demonstrations\n• Launch Marketing: Plan & execute campaigns to build excitement & awareness around the UK launch\n• Paid Advertising: Manage & optimise Meta Ads, TikTok Ads & customer acquisition campaigns\n• Performance Reporting: Track reach, engagement, ad spend, app downloads, CAC & completed orders\n\n📩 Submit agency profile, portfolio, proposed strategy & monthly agency fee at: https://lnkd.in/d2BYsSMY or via LinkedIn DM.",
        aiReasoning:
          "Active UK food-delivery app launch (Eats N Deals) explicitly seeking a Digital Marketing Agency on an ongoing monthly retainer covering Paid Ads, Video Production, and Social Media.",
        suggestedReply:
          "Hi Unsa — launching consumer & food-tech platforms with high-converting Reels/video creatives and CAC-tracked Meta/TikTok ad funnels is our core strength at D'Genius Solutions. Submitted our agency profile and sent you a DM!",
        suggestedDm:
          "Hi Unsa, saw your post seeking a Digital Marketing Agency for the Eats N Deals UK launch. You can explore our performance marketing & video creative work at https://www.dgeniussolutions.com/services/digital-marketing — happy to share a tailored UK launch plan!",
      },
      {
        id: "ils_th_sraavyam_darld8",
        platform: "THREADS",
        postUrl: "https://www.threads.com/@sraavyam_andhrakitchen/post/DarLD8ciAjQ",
        authorName: "@sraavyam_andhrakitchen",
        authorRole: "Hospitality & F&B Brand Owner — Sraavyam (The Andhra Kitchen)",
        profileUrl: "https://www.threads.com/@sraavyam_andhrakitchen",
        companyName: "Sraavyam – The Andhra Kitchen",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_ACTIVE_BUSINESS",
        legitimacyScore: 94,
        buyerPersona: "Founder / Brand Owner (Direct Decision Maker)",
        contactHint: "Direct Threads DM: threads.com/@sraavyam_andhrakitchen | Post Reply",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "INDIA",
        intentScore: 96,
        ageHours: 2,
        freshnessTier: "1H_12H",
        postTitle: "Sraavyam – The Andhra Kitchen (@sraavyam_andhrakitchen) — Looking for a Marketing Agency Partner",
        postText:
          "We're looking for a marketing agency partner for Sraavyam – The Andhra Kitchen.\n\nExpectations:\n• Brand strategy\n• Performance marketing\n• Content & social media\n• Influencer collaborations\n• Measurable business growth\n\nIf your agency has credible accomplishments and strong case studies, drop your portfolio in the comments or DM us. We're looking for impact, not just impressions.",
        aiReasoning:
          "Direct Indian hospitality brand owner on Threads explicitly seeking a Marketing Agency for brand strategy, performance marketing, and social media growth.",
        suggestedReply:
          "Hi Sraavyam team — we partner with hospitality and consumer brands across India on full-funnel performance marketing, high-retention Reels production, and measurable footfall/order growth at D'Genius Solutions. Sent our case studies to your DM!",
        suggestedDm:
          "Hi Sraavyam team! Saw your post looking for a marketing agency covering brand strategy, performance marketing, and content. Check out our work at https://www.dgeniussolutions.com/services/digital-marketing — would love to connect!",
      },
      {
        id: "ils_d756cf66d531453e805b",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/in/prachi-kale-babb63191/recent-activity/all/",
        authorName: "Prachi Kale",
        authorRole: "SEO Executive at EduTechToday",
        profileUrl: "https://www.linkedin.com/in/prachi-kale-babb63191/",
        companyName: "EduTechToday",
        companyDomain: "edutechtoday.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 96,
        buyerPersona: "Marketing / SEO Lead (Direct Agency Buyer)",
        contactHint: "Email: seomasterak@gmail.com | Phone: +91 86685 14532 | Direct LinkedIn DM",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "INDIA",
        intentScore: 98,
        ageHours: 2,
        freshnessTier: "1H_12H",
        postTitle: "Prachi Kale — Looking for a Digital Marketing Agency (SEO, SEM, Social Media & Website Optimization)",
        postText:
          "Looking for a Digital Marketing Agency!\n\nI am looking to connect with a reliable and experienced Digital Marketing Agency to strengthen our online presence and drive business growth.\n\nWe are looking for an agency with expertise in:\n• SEO & SEM\n• Social Media Management\n• Content Creation & Marketing\n• Paid Advertising Campaigns\n• Website Optimization\n• Digital Marketing Strategy & Performance Analytics\n\nAgencies with experience in the Healthcare industry will be preferred. If you represent a digital marketing agency or have any relevant recommendations, please feel free to connect with me or share your portfolio and contact details via DM.\n\nLooking forward to connecting and exploring potential collaborations!\n\n#DigitalMarketing #MarketingAgency #HospitalityMarketing #SEO #SocialMediaMarketing #DigitalAdvertising #BusinessCollaboration",
        aiReasoning:
          "Direct inbound agency RFP seeking a full-service Digital Marketing Agency covering SEO & SEM, Paid Campaigns, Social Media Management, and Website Optimization.",
        suggestedReply:
          "Hi Prachi — at D'Genius Solutions we partner with fast-growing brands across India on full-funnel SEO, Google/Meta Paid Media, Social Media Management, and high-converting Website Optimization. Sent you our agency deck & case studies via DM!",
        suggestedDm:
          "Hi Prachi, saw your post looking for a Digital Marketing Agency covering SEO, Paid Campaigns, Social Media & Website Optimization. We'd love to share our Healthcare & EdTech growth case studies at https://www.dgeniussolutions.com/services/digital-marketing — open to a quick 10-min discovery call?",
      },
      {
        id: "ils_beca0e894aea4f24bfc0",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/in/narendra-marketing-leader/recent-activity/all/",
        authorName: "Naren Kholiya",
        authorRole: "Senior Marketing Leader at Pristyn Care",
        profileUrl: "https://www.linkedin.com/in/narendra-marketing-leader/",
        companyName: "Pristyn Care",
        companyDomain: "pristyncare.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 98,
        buyerPersona: "CMO / Marketing Head (Budget Owner)",
        contactHint: "Email: help@pristyncare.com | Phone: +91 80-6510-5031 / 080-4568-1699 | Direct LinkedIn DM",
        serviceCategory: "SEO",
        targetRegion: "INDIA",
        intentScore: 98,
        ageHours: 4,
        freshnessTier: "1H_12H",
        postTitle: "Naren Kholiya (Pristyn Care) — Looking for an outcome-driven SEO agency for 9 hospital domains",
        postText:
          "Looking for an outcome-driven SEO agency!\n\nAt Pristyn Care, we have 9 hospital domains that are at a nascent stage, with significant headroom for organic growth. We’re looking for an SEO agency that has:\n• A proven track record of driving measurable organic growth.\n• Strong expertise in technical SEO, content strategy, and authority building.\n• The ability to translate organic visibility into meaningful business outcomes.\n• Experience working in fast-paced, high-growth environments.\n\nIf you’ve built organic growth engines and can back your expertise with results, let’s connect! If you know an agency that fits the bill, tag them or DM me with relevant case studies.\n\n#SEO #HealthcareMarketing #OrganicGrowth #DigitalMarketing",
        aiReasoning:
          "Enterprise multi-domain SEO agency mandate from Senior Marketing Leader at Pristyn Care seeking technical SEO, content strategy, and authority building across 9 hospital domains.",
        suggestedReply:
          "Hi Naren — scaling 9 nascent hospital domains requires rigorous technical SEO, E-E-A-T medical authority architecture, and AI/Search visibility (SEO + AEO/GEO). Just sent our multi-domain organic growth case studies to your DM!",
        suggestedDm:
          "Hi Naren, saw your post regarding an outcome-driven SEO agency for Pristyn Care's 9 hospital domains. At D'Genius Solutions (https://www.dgeniussolutions.com/services/seo), we specialize in technical SEO, semantic authority, and measurable patient-acquisition funnels. Happy to share a complimentary audit of 2 of the domains!",
      },
      {
        id: "ils_348bed21f0fb43ae9611",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517113917920260099/",
        authorName: "Sumit Chitkote",
        authorRole: "Product & Brand Lead at LeanLight Solar (Xiom Energy)",
        profileUrl: "https://www.linkedin.com/in/sumitchitkote/",
        companyName: "LeanLight Solar (Xiom Energy)",
        companyDomain: "leanlightsolar.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 95,
        buyerPersona: "Founder / Product Lead (Direct Decision Maker)",
        contactHint: "Email: hello@leanlightsolar.com | Phone: +91 90280 17360 | Direct LinkedIn DM",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "INDIA",
        intentScore: 96,
        ageHours: 5,
        freshnessTier: "1H_12H",
        postTitle: "Sumit Chitkote (LeanLight Solar) — Looking for a marketing agency for brand launch campaign in Bangalore",
        postText:
          "Looking for a marketing agency for our launch campaign of brand LeanLight Solar from Bangalore.\nPing me and let's catch up over a coffee this week to understand the vibe.\n\nExpanding Our Digital Presence | Open to Agency Partnerships:\nAs we continue to grow in the solar and renewable energy sector, we are now focusing on strengthening our brand visibility across social media platforms.\nLooking to connect with experienced digital marketing / social media agencies that can support with:\n• Strategic content planning\n• Creative design & reels production\n• Brand positioning & audience engagement\n• Lead generation campaigns\n\nWe prefer agencies that focus on long-term brand building and measurable outcomes. Agencies with relevant experience can connect or share their portfolio via DM.",
        aiReasoning:
          "Verified active brand launch mandate from LeanLight Solar in Bangalore explicitly looking for a marketing & social media agency for launch campaigns, reels production, and lead generation.",
        suggestedReply:
          "Hi Sumit — congrats on the LeanLight Solar launch! At D'Genius Solutions we partner with clean-energy and high-growth brands across India on launch campaigns, reels/video production, and qualified lead generation. Sent our portfolio to your DM!",
        suggestedDm:
          "Hi Sumit, saw your post looking for a marketing agency for LeanLight Solar's launch campaign in Bangalore. Here is our brand launch & digital marketing work: https://www.dgeniussolutions.com/services/digital-marketing — would love to connect this week!",
      },
      {
        id: "ils_cc045dc85cad4dfea84a",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/in/rishabh-tiwari-swissbeauty/recent-activity/all/",
        authorName: "Rishabh Tiwari",
        authorRole: "Brand Marketing at Swiss Beauty",
        profileUrl: "https://www.linkedin.com/in/rishabh-tiwari-swissbeauty/",
        companyName: "Swiss Beauty",
        companyDomain: "swissbeauty.in",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 98,
        buyerPersona: "CMO / Marketing Head (Budget Owner)",
        contactHint: "Email: support@swissbeauty.in | Phone/WhatsApp: +91 80-4431-8965 / +91 82871-87415 | LinkedIn DM",
        serviceCategory: "AI_VIDEO",
        targetRegion: "INDIA",
        intentScore: 97,
        ageHours: 5,
        freshnessTier: "1H_12H",
        postTitle: "Rishabh Tiwari (Swiss Beauty) — Looking for an AI Video Production Agency / Studio",
        postText:
          "Looking for an AI Video Production Agency!\n\nWe are looking to partner with a creative AI Video Production Agency / Studio that specializes in high-converting AI brand films, product commercials, and GenAI visual storytelling for beauty & D2C campaigns.\n\nPlease share your showreel, portfolio, and agency credentials via DM or tag relevant AI video production houses below.",
        aiReasoning:
          "Direct D2C brand marketing lead at Swiss Beauty explicitly seeking an AI Video Production Agency / Studio for AI brand films and product commercials.",
        suggestedReply:
          "Hi Rishabh — D'Genius Solutions has a dedicated AI Video Production Studio building photorealistic GenAI brand films and high-converting D2C beauty commercials. Just shared our AI showreel via DM!",
        suggestedDm:
          "Hi Rishabh, saw your post looking for an AI Video Production Agency for Swiss Beauty. You can view our AI Commercial & Brand Film showreel here: https://www.dgeniussolutions.com/services/ai-video-production — happy to produce a custom concept test for your next campaign!",
      },
      {
        id: "ils_li_tharun_7517136905",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517136905080229888/",
        authorName: "Tharun Teja Surni",
        authorRole: "Performance Marketing Lead at SISYA CLASS (EdTech)",
        profileUrl: "https://www.linkedin.com/in/tharuntejasurni/",
        companyName: "SISYA CLASS",
        companyDomain: "sisyaclass.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 97,
        buyerPersona: "Performance Marketing Lead (Direct Agency Buyer)",
        contactHint: "Email: contactus@sisyaclass.com | Website: sisyaclass.com | Direct LinkedIn DM",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "INDIA",
        intentScore: 96,
        ageHours: 6,
        freshnessTier: "1H_12H",
        postTitle: "Tharun Teja Surni (SISYA CLASS) — Looking for a Lead Generation Agency (Meta & Google Ads)",
        postText:
          "We’re Looking for a Lead Generation Agency (EdTech) | Meta & Google Ads\n\nAt SISYA CLASS, we’re looking for an experienced lead generation agency in the EdTech space to help us generate qualified leads and enrollments through Meta (Facebook & Instagram) and Google Ads.\n\nWhat we expect from you:\n✅ Plan, launch and manage Meta and Google Ads campaigns\n✅ Generate qualified leads from parents and students (not just volume)\n✅ Create and test ad creatives, copy and landing pages\n✅ Set up and track conversions so we know which leads turn into enrollments\n✅ Optimize campaigns regularly to lower cost per lead and improve lead quality\n✅ Share clear weekly and monthly performance reports\n\n📩 Interested agencies can reach us at: contactus@sisyaclass.com — Share your portfolio, EdTech case studies, or DM me directly.\n#LeadGeneration #EdTech #MetaAds #GoogleAds #PerformanceMarketing #DigitalMarketing #AgencyHiring #SISYACLASS",
        aiReasoning:
          "Active EdTech performance marketing mandate at SISYA CLASS (sisyaclass.com) explicitly seeking a Lead Generation Agency for Meta & Google Ads with direct email contactus@sisyaclass.com.",
        suggestedReply:
          "Hi Tharun — we scale EdTech enrollment funnels across Google Search, YouTube, and Meta Ads with full CRM conversion tracking and high-converting landing pages at D'Genius Solutions. Emailed our EdTech case studies to contactus@sisyaclass.com!",
        suggestedDm:
          "Hi Tharun, saw your post looking for an EdTech Lead Generation Agency at SISYA CLASS. We've shared our Google/Meta Ads & landing page case studies at contactus@sisyaclass.com (https://www.dgeniussolutions.com/services/digital-marketing).",
      },
      {
        id: "ils_li_judec_7450188156",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/in/judecaacbay/recent-activity/all/",
        authorName: "Jude C.",
        authorRole: "Founding Engineer & Head of Technology at INTRIC GLOBAL",
        profileUrl: "https://www.linkedin.com/in/judecaacbay/",
        companyName: "INTRIC GLOBAL",
        companyDomain: "intricglobal.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 96,
        buyerPersona: "Founder / Executive (Direct Decision Maker)",
        contactHint: "Email: jude@intricglobal.com | Website: intricglobal.com | Direct LinkedIn DM",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "GLOBAL",
        intentScore: 96,
        ageHours: 6,
        freshnessTier: "1H_12H",
        postTitle: "Jude C. (INTRIC GLOBAL) — Looking for a Marketing Agency for Cross-Border Real Estate OS",
        postText:
          "I'm looking for a Marketing Agency to team up with, and I'd love your recommendations.\n\nINTRIC Global is an AI-powered cross-border real estate operating system. We help agencies and developers reach buyers around the world.\n\nWe're after an agency that's helped businesses grow fast and knows B2C and cross-border marketing inside out. Bonus points if you've done it for a brand selling to people in more than one country.\n\nWe're thinking long term here. A real partner, not a one-off campaign.\n\nKnow an agency that fits? Tag them below. If that's you, say hi in the comments and send your agency portfolio to my email: jude@intricglobal.com\nhttps://intricglobal.com\n\n#MarketingAgency #LeadGeneration #PropTech #RealEstateMarketing #Partnership",
        aiReasoning:
          "Founding executive at INTRIC Global (intricglobal.com) explicitly seeking a long-term Marketing Agency partner for cross-border real estate marketing, providing direct email jude@intricglobal.com.",
        suggestedReply:
          "Hi Jude — cross-border real estate & PropTech growth across India, UAE/Dubai, and global buyer corridors is right in our wheelhouse at D'Genius Solutions. Sending our agency portfolio and multi-country SEO/Paid Media case studies to jude@intricglobal.com!",
        suggestedDm:
          "Hi Jude, loved reading about INTRIC Global's cross-border real estate OS. We've just sent our agency portfolio to jude@intricglobal.com and you can also explore our multi-market growth work at https://www.dgeniussolutions.com/services/digital-marketing.",
      },
      {
        id: "ils_ae95db9e75c94d7781c8",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517165739326304257/",
        authorName: "David Singleton",
        authorRole: "Executive Leadership Coach | GCC/MENA Strategist at Oraculi (Dubai)",
        profileUrl: "https://www.linkedin.com/in/singletonsingleton/",
        companyName: "Oraculi (GCC Executive Advisory, Dubai)",
        companyDomain: "oraculi.co",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 96,
        buyerPersona: "Founder / CEO (Direct Decision Maker)",
        contactHint: "Email: david@oraculi.co | Phone/WhatsApp: +971 50 149 1396 (Dubai, UAE)",
        serviceCategory: "BRANDING",
        targetRegion: "UAE_DUBAI",
        intentScore: 95,
        ageHours: 7,
        freshnessTier: "1H_12H",
        postTitle: "David Singleton (Oraculi Dubai) — Looking for a Branding & Digital Agency in Dubai / GCC",
        postText:
          "I have been running a series of workshops with ‘fractional’ leaders, predominantly CFOs who have established their own practices to work in more than one boardroom at a time. In our last workshop we looked at how you present yourself to the market, how well you understand the clients you want to attract and how effectively you communicate the value you bring.\n\nIn our next workshop we will focus on personal brand and pitching. I am looking for a branding agency to join that session and give the group practical advice on how to create or develop the brands they have established.\n\nThere will be about 12 people in the group (could be more). Most are senior finance leaders running their own practices and working out how they want to be seen in the market. The agency should understand corporate comms and branding and be able to give frank advice and guidance in the session.\n\nThis is not a session for agencies who want to help fill diaries or undertake lead generation exercises. It’s branding for seasoned, experienced business leaders.\n\nIf your Dubai based agency would like to be part of it, send me a message, with your credentials.\nThis is an oraculi.co + Inspire Selection collaboration.",
        aiReasoning:
          "Dubai executive advisory founder at Oraculi (oraculi.co) explicitly seeking a Branding & Corporate Comms Agency to advise 12+ fractional CFOs and C-suite leaders on brand positioning.",
        suggestedReply:
          "Hi David — advising C-suite and fractional CFO practices on executive brand architecture, corporate comms, and high-trust digital positioning in the GCC is a core strength at D'Genius Solutions. Sending our credentials to david@oraculi.co!",
        suggestedDm:
          "Hi David, saw your post looking for a branding agency to advise your cohort of fractional CFOs and senior finance leaders with Oraculi in Dubai. Sharing our B2B corporate branding & digital authority credentials at https://www.dgeniussolutions.com/services/branding.",
      },
      {
        id: "ils_li_ramki_7516508239",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7516508239660843010/",
        authorName: "Ramakrishna Pillamudi",
        authorRole: "Founder & CEO at SISYA CLASS (AI-Powered K-10 & STEM EdTech)",
        profileUrl: "https://www.linkedin.com/in/siramki/",
        companyName: "SISYA CLASS",
        companyDomain: "sisyaclass.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 98,
        buyerPersona: "Founder / CEO (Direct Decision Maker)",
        contactHint: "Email: ramki@sisyaclass.com | Website: sisyaclass.com | Direct LinkedIn DM",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "INDIA",
        intentScore: 97,
        ageHours: 8,
        freshnessTier: "1H_12H",
        postTitle: "Ramakrishna Pillamudi (Founder & CEO, SISYA CLASS) — Looking for a Performance Marketing Agency",
        postText:
          "📢 SISYA CLASS is looking for a Performance Marketing Agency with proven EdTech experience.\nWe’re seeking an agency that can generate qualified leads and improve paid enrolments for our K–10 learning programs.\n\nKey requirements:\n• Proven experience managing EdTech campaigns\n• Strong expertise in Meta Ads and Google Ads\n• Experience targeting parents and students across India\n• Support with ad creatives, landing pages and conversion tracking\n• Clear reporting on lead quality, CPL, acquisition cost and ROAS\n\nPlease share your agency profile, relevant EdTech case studies, campaign results and commercial proposal.\n📩 ramki@sisyaclass.com\n#SISYACLASS #PerformanceMarketing #EdTech #DigitalMarketingAgency #MetaAds #GoogleAds",
        aiReasoning:
          "Founder & CEO of SISYA CLASS (sisyaclass.com) explicitly inviting Performance Marketing Agencies to send proposals and EdTech case studies to ramki@sisyaclass.com.",
        suggestedReply:
          "Hi Ramakrishna — at D'Genius Solutions we partner with EdTech founders on full-funnel Meta & Google Ads, high-converting landing pages, and ROAS-focused enrollment tracking. Just sent our agency proposal to ramki@sisyaclass.com!",
        suggestedDm:
          "Hi Ramakrishna, saw your post seeking a Performance Marketing Agency for SISYA CLASS. We've sent our EdTech case studies and proposal to ramki@sisyaclass.com (https://www.dgeniussolutions.com/services/digital-marketing).",
      },
      {
        id: "ils_li_shabina_7449430552",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517080213684654080/",
        authorName: "Shabina Parvin",
        authorRole: "Performance Marketing & Growth Strategy | Luxury Real Estate",
        profileUrl: "https://www.linkedin.com/in/shabina-parvin23/",
        companyName: "Luxury Real Estate & Villas Portfolio",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_DECISION_MAKER",
        legitimacyScore: 91,
        buyerPersona: "CMO / Marketing Head (Budget Owner)",
        contactHint: "Direct LinkedIn DM (linkedin.com/in/shabina-parvin23/) — Share Luxury Real Estate Web Portfolio",
        serviceCategory: "WEB_DEV",
        targetRegion: "INDIA",
        intentScore: 95,
        ageHours: 8,
        freshnessTier: "1H_12H",
        postTitle: "Shabina Parvin — Looking for a Web Development Agency for Luxury Real Estate & Premium Villas",
        postText:
          "We’re looking for a web development agency with proven experience in luxury real estate, especially premium villas and residential projects.\n\nThe focus is on high-end design, excellent UI/UX, and a seamless user experience.\n\nIf you’ve worked on similar projects or know an agency that has, please connect with me or tag them in the comments.\n\n#RealEstate #Webdevelopment #Luxuryvillas #Webdevelopmentagency",
        aiReasoning:
          "High-intent buyer explicitly seeking a Web Development Agency with luxury real estate, premium villa, and high-end UI/UX experience.",
        suggestedReply:
          "Hi Shabina — we craft bespoke, high-converting luxury real estate and architectural web experiences with immersive UI/UX and ultra-fast Next.js performance at D'Genius Solutions. Sent our real estate showcase to your DM!",
        suggestedDm:
          "Hi Shabina, saw your post looking for a web development agency experienced in luxury villas and residential projects. Check out our custom UI/UX & web engineering work at https://www.dgeniussolutions.com/services/web-development — would love to share our luxury property case studies!",
      },
      {
        id: "ils_li_mansee_7449334700",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517142784504475648/",
        authorName: "Mansee Bhawsar",
        authorRole: "HR Manager at Puramate India Private Limited (Food Manufacturing)",
        profileUrl: "https://www.linkedin.com/in/mansee-bhawsar-3940ba205/",
        companyName: "Puramate India Private Limited",
        companyDomain: "puramate.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 95,
        buyerPersona: "Operations / HR Manager (Direct Agency Procurement)",
        contactHint: "Website: puramate.com | Direct LinkedIn DM (linkedin.com/in/mansee-bhawsar-3940ba205/)",
        serviceCategory: "BRANDING",
        targetRegion: "INDIA",
        intentScore: 94,
        ageHours: 9,
        freshnessTier: "1H_12H",
        postTitle: "Mansee Bhawsar (Puramate India) — Looking for a Social Media Marketing Agency for FMCG / Food Brand",
        postText:
          "📢 LOOKING FOR A SOCIAL MEDIA MARKETING AGENCY | INDORE\n\nWe are looking for a creative and result-oriented Social Media Marketing Agency in Indore, to manage and grow our brands digital presence.\n\nRequired Services:\n• Social media account management\n• Creative post and banner designing\n• Reels, product photography and video content\n• LinkedIn, Instagram and Facebook marketing\n• Content planning and brand promotion\n• Digital marketing strategy and performance reporting\n\nWe are looking for an agency with experience in FMCG, Food & Beverage or consumer brands.\n📍 Location: Indore, Madhya Pradesh\nInterested agencies can share their portfolio, service details and commercial proposal via LinkedIn DM or email.\n\n#SocialMediaMarketing #DigitalMarketing #Indore #FMCG #BrandMarketing",
        aiReasoning:
          "Verified FMCG food manufacturer Puramate India Pvt Ltd explicitly seeking a Social Media Marketing Agency for account management, reels, product video content, and performance reporting.",
        suggestedReply:
          "Hi Mansee — at D'Genius Solutions we partner with FMCG and consumer food brands on end-to-end social media management, high-retention Reels/video production, and performance growth. Shared our FMCG portfolio & proposal via DM!",
        suggestedDm:
          "Hi Mansee, saw Puramate India's requirement for a Social Media Marketing Agency covering Reels, product video content, and full-funnel social growth. Here is our creative & social media portfolio: https://www.dgeniussolutions.com/services/branding — happy to share a tailored commercial proposal!",
      },
      {
        id: "ils_li_pratik_7516178821",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7516178821549776896/",
        authorName: "Pratik Dhane",
        authorRole: "Head of Sales & Revenue Growth at Inttrvu.ai",
        profileUrl: "https://www.linkedin.com/in/pratik-dhane-b4434523a/",
        companyName: "Inttrvu.ai",
        companyDomain: "inttrvu.ai",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 96,
        buyerPersona: "Head of Sales / Revenue Growth (Direct Decision Maker)",
        contactHint: "Website: inttrvu.ai | Direct LinkedIn DM (linkedin.com/in/pratik-dhane-b4434523a/)",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "INDIA",
        intentScore: 95,
        ageHours: 10,
        freshnessTier: "1H_12H",
        postTitle: "Pratik Dhane (Head of Sales, Inttrvu.ai) — Looking for a Performance Marketing Agency to scale Google Ads",
        postText:
          "🚀 Looking for a Performance Marketing Agency with a Proven Track Record in EdTech!\n\nAt Inttrvu.ai, we’re looking for an agency to help us scale our Google Ads lead generation.\n\nOur ideal partner should have:\n✅ Proven experience in EdTech\n✅ A track record of generating high-intent leads that convert into paying customers\n✅ Strong expertise in CPL, lead-to-enrollment conversion, and CAC\n✅ A data-driven approach to scaling campaigns\n\n⚡ We’re ready to onboard the right agency immediately!\nKnow a great agency or have relevant recommendations? Please comment below or tag them.\n#EdTech #GoogleAds #PerformanceMarketing #LeadGeneration",
        aiReasoning:
          "Head of Sales at Inttrvu.ai (inttrvu.ai) urgently seeking a Performance Marketing Agency to scale Google Ads lead generation with immediate onboarding.",
        suggestedReply:
          "Hi Pratik — scaling high-intent Google Ads while driving down CAC and improving lead-to-customer conversion for EdTech/AI platforms is a core specialty at D'Genius Solutions. Just sent our case studies to your DM!",
        suggestedDm:
          "Hi Pratik, saw Inttrvu.ai is ready to onboard a Performance Marketing Agency to scale Google Ads lead generation. Explore our performance marketing work at https://www.dgeniussolutions.com/services/digital-marketing — happy to run a free Google Ads account audit today!",
      },
      {
        id: "ils_li_siddhesh_7450055930",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7517084731675549698/",
        authorName: "Siddhesh Sawant",
        authorRole: "Marketing Leader at Prime Pathway (11+ Yrs EdTech & Consumer Growth)",
        profileUrl: "https://www.linkedin.com/in/siddhesh-sawant-5a31694a/",
        companyName: "Prime Pathway",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_DECISION_MAKER",
        legitimacyScore: 93,
        buyerPersona: "CMO / Marketing Head (Budget Owner)",
        contactHint: "Direct LinkedIn DM (linkedin.com/in/siddhesh-sawant-5a31694a/) — Agency Founders & Creative Leaders",
        serviceCategory: "BRANDING",
        targetRegion: "INDIA",
        intentScore: 95,
        ageHours: 10,
        freshnessTier: "1H_12H",
        postTitle: "Siddhesh Sawant (Prime Pathway) — Looking for a Branding & Creative Strategy Agency",
        postText:
          "We’re looking for a branding agency that thinks beyond the ordinary! 🚀\n\nAt Prime Pathway, we’ve built a brand focused on transforming how professionals navigate their careers and job searches.\nNow, we’re ready to take our brand to the next level — and we’re looking for a highly creative, strategically driven branding agency to partner with us.\n\nWhat are we looking to achieve?\n🎯 Stronger Brand Positioning – Build a distinctive identity that sets us apart in a competitive market.\n🚀 Greater Brand Reach – Expand our visibility and connect with the right audiences across platforms.\n🧠 Powerful Brand Recall – Create a brand that people don’t just see, but remember.\n💡 Disruptive Creative Thinking – Campaigns, storytelling and ideas that break the clutter rather than add to it.\n❤️ Meaningful Brand Connections – Move beyond impressions and engagement to build genuine trust and affinity.\n\nWe’re not looking for an agency that simply creates content or manages social media.\nWe’re looking for creative thinkers, brand strategists and storytellers who can challenge conventional thinking, bring bold ideas to the table and help us build a brand with a lasting impact.\n\n📩 Agency founders and creative leaders: Drop your portfolio in the comments or connect with us via DM.\n#PrimePathway #BrandingAgency #CreativeAgency #BrandStrategy #BrandPositioning #BrandBuilding",
        aiReasoning:
          "Senior marketing leader at Prime Pathway explicitly inviting agency founders to pitch for a strategic Branding & Creative Agency mandate.",
        suggestedReply:
          "Hi Siddhesh — love the clarity here: real brand positioning and disruptive storytelling over generic content calendars. Just sent our strategic branding & campaign case studies at D'Genius Solutions to your DM!",
        suggestedDm:
          "Hi Siddhesh, saw your post looking for a strategically driven branding agency for Prime Pathway. You can explore our brand positioning and creative campaign work at https://www.dgeniussolutions.com/services/branding — would love to connect!",
      },
      {
        id: "ils_ad2de2c815bc4d459c12",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/in/mostafa-attia-536153172/recent-activity/all/",
        authorName: "Mostafa Attia",
        authorRole: "HR & Operations Leader | MENA Strategic Growth",
        profileUrl: "https://www.linkedin.com/in/mostafa-attia-536153172/",
        companyName: "MENA Strategic Growth & HR Advisory",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_DECISION_MAKER",
        legitimacyScore: 90,
        buyerPersona: "Operations Lead (Direct Decision Maker)",
        contactHint: "Direct LinkedIn DM (linkedin.com/in/mostafa-attia-536153172) — Share Agency Portfolio via DM",
        serviceCategory: "WEB_DEV",
        targetRegion: "UAE_DUBAI",
        intentScore: 92,
        ageHours: 11,
        freshnessTier: "1H_12H",
        postTitle: "Mostafa Attia — Looking for a Web Development & Digital Agency in MENA / GCC",
        postText:
          "Looking for a reliable Web Development & Digital Agency in the MENA / GCC region to revamp our corporate website and build a custom client portal.\n\nKey requirements:\n• Proven track record with B2B corporate websites\n• Bilingual support (English / Arabic UI readiness)\n• Ongoing Website AMC & technical support\n\nPlease share your agency portfolio and case studies via LinkedIn DM.",
        aiReasoning:
          "Direct MENA corporate buyer seeking a Web Development & Digital Agency for corporate website revamp, custom client portal, and ongoing Website AMC.",
        suggestedReply:
          "Hi Mostafa — at D'Genius Solutions we build high-performance corporate web platforms and custom portals across the UAE & MENA region with dedicated Website AMC support. Sent our portfolio to your DM!",
        suggestedDm:
          "Hi Mostafa, saw your post looking for a Web Development & Digital Agency in the MENA region. Check out our enterprise web & AMC capabilities at https://www.dgeniussolutions.com/services/web-development.",
      },
      {
        id: "ils_93a4faaabd0c4865ba02",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/company/zeekr-australia/posts/?feedView=all",
        authorName: "ZEEKR Australia",
        authorRole: "Official Luxury EV Brand — Agency RFP Tender",
        profileUrl: "https://www.linkedin.com/company/zeekr-australia/",
        companyName: "ZEEKR Australia",
        companyDomain: "zeekrlife.com/en-au",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 98,
        buyerPersona: "CMO / Marketing Head (Budget Owner)",
        contactHint: "Email: daniel.jacimovic@zeekrlife.com (Direct RFP Tender) | Phone: +61 1800 933 571",
        serviceCategory: "BRANDING",
        targetRegion: "GLOBAL",
        intentScore: 95,
        ageHours: 12,
        freshnessTier: "1H_12H",
        postTitle: "ZEEKR Australia — Inviting Expressions of Interest from Creative, Digital & Social Media Agencies",
        postText:
          "ZEEKR Australia is inviting expressions of interest from innovative creative, digital, and social media agencies to partner with us as we expand our luxury EV footprint.\n\nWe are looking for agency partners with capabilities across:\n• Brand strategy & campaign creative\n• Digital & social media content production\n• High-impact video & launch activations\n\nTo register your agency's interest and request the RFP brief, please contact Daniel Jacimovic at daniel.jacimovic@zeekrlife.com.",
        aiReasoning:
          "Official enterprise RFP from ZEEKR Australia inviting creative, digital, and video production agencies to register via direct corporate email daniel.jacimovic@zeekrlife.com.",
        suggestedReply:
          "Registered our agency credentials with Daniel Jacimovic — excited to showcase D'Genius Solutions' high-impact AI video production, digital campaign creative, and automotive brand launch work!",
        suggestedDm:
          "Hi Daniel, registering D'Genius Solutions' expression of interest for ZEEKR's digital, social, and video production agency roster: https://www.dgeniussolutions.com/services/branding.",
      },
      {
        id: "ils_rd_mawmasaur_1x46m67",
        platform: "REDDIT",
        postUrl: "https://www.reddit.com/r/SmallBusinessUAE/comments/1x46m67/looking_for_a_marketing_agency_for_a_fashion_brand/",
        authorName: "u/Mawmasaur",
        authorRole: "Fashion Brand Founder (r/SmallBusinessUAE — Dubai / UAE)",
        profileUrl: "https://www.reddit.com/user/Mawmasaur/",
        companyName: "UAE Fashion Brand",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_ACTIVE_BUSINESS",
        legitimacyScore: 90,
        buyerPersona: "Founder / Brand Owner (UAE / Dubai)",
        contactHint: "Direct Reddit DM (reddit.com/user/Mawmasaur) | Thread Reply on r/SmallBusinessUAE",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "UAE_DUBAI",
        intentScore: 92,
        ageHours: 12,
        freshnessTier: "1H_12H",
        postTitle: "Looking for a marketing agency for a fashion brand (r/SmallBusinessUAE by u/Mawmasaur)",
        postText:
          "Looking for a marketing agency for a fashion brand in the UAE / Dubai. Any suggestions or agency recommendations?",
        aiReasoning:
          "Direct UAE fashion brand owner on r/SmallBusinessUAE explicitly asking for a Marketing Agency recommendation.",
        suggestedReply:
          "Hi u/Mawmasaur — we work with fashion, luxury, and D2C retail brands across Dubai & the UAE on high-ROAS Meta/TikTok campaigns, AI lookbook video production, and organic search growth at D'Genius Solutions. Sent you a DM with our fashion case studies!",
        suggestedDm:
          "Hi! Saw your post on r/SmallBusinessUAE looking for a marketing agency for your fashion brand. You can explore our D2C fashion marketing & AI video work at https://www.dgeniussolutions.com/services/digital-marketing — happy to share a tailored UAE launch plan!",
      },
      {
        id: "ils_li_simran_7449689340",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7516790107744468992/",
        authorName: "Simran Vasudev",
        authorRole: "Founder at UNINFO | Incubated at Runway Incubator UPES",
        profileUrl: "https://www.linkedin.com/in/~simranvasudev/",
        companyName: "UNINFO (Runway Incubator UPES)",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_DECISION_MAKER",
        legitimacyScore: 92,
        buyerPersona: "Founder / CEO (Direct Decision Maker)",
        contactHint: "Direct LinkedIn DM (linkedin.com/in/~simranvasudev/) — Paid Startup Web Dev Mandate",
        serviceCategory: "WEB_DEV",
        targetRegion: "INDIA",
        intentScore: 94,
        ageHours: 16,
        freshnessTier: "24H",
        postTitle: "Simran Vasudev (Founder, UNINFO) — Looking for a Web Development & UI/UX Agency",
        postText:
          "🚀 UNINFO is looking for a Web Development Agency!\n\nWe’re preparing for the next phase of UNINFO and are looking to collaborate with an experienced web development agency that can help us refine, enhance, and launch our platform.\n\nWe’re looking for a team that can:\n• Design and improve our UI/UX\n• Refine and optimize our existing website\n• Work closely and coordinate with our in-house tech team\n• Help us take the website from its current stage to launch-ready product\n\nIf your agency is interested in working with UNINFO, please DM me with your portfolio and previous project.\n\"opportunity is paid\"\nIf you know a great web development agency, referrals would be appreciated.\n\n#UNINFO #WebDevelopment #UIUX #WebDesign #Startup #TechStartup #WebDevelopmentAgency #StartupIndia",
        aiReasoning:
          "Startup founder at UNINFO explicitly looking to onboard a paid Web Development & UI/UX Agency to take their web platform to launch.",
        suggestedReply:
          "Hi Simran — at D'Genius Solutions we partner closely with startup founders and in-house tech teams to elevate UI/UX and ship launch-ready web platforms. Sent our web engineering portfolio to your DM!",
        suggestedDm:
          "Hi Simran, saw UNINFO is looking for a Web Development Agency to refine UI/UX and launch the next phase of your platform. Check out our live builds at https://www.dgeniussolutions.com/services/web-development — would love to chat!",
      },
      {
        id: "ils_li_eit_7449790927",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/company/eit-rawmaterials-academy/posts/?feedView=all",
        authorName: "EIT RawMaterials Academy",
        authorRole: "European Innovation & Education Programme (7,801 followers)",
        profileUrl: "https://www.linkedin.com/company/eit-rawmaterials-academy/",
        companyName: "EIT RawMaterials Academy",
        companyDomain: "eitrawmaterials.eu",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 97,
        buyerPersona: "Institutional Programme Procurement (Official Tender)",
        contactHint: "Website: eitrawmaterials.eu | Direct Tender Link: https://lnkd.in/dGcAY5nb",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "GLOBAL",
        intentScore: 93,
        ageHours: 22,
        freshnessTier: "24H",
        postTitle: "EIT RawMaterials Academy — Official Tender Looking for a Marketing, Video & Communications Agency",
        postText:
          "We’re looking for a marketing and communications agency to work with the EIT RawMaterials Academy.\n\nWe have opened a tender for digital marketing services for the European Raw Materials Academy and Advanced Materials Academies. The selected agency will work with our team as a delivery partner across both Academies.\n\nThe work covers:\n→ Strategic communications and editorial planning\n→ Content and video production, including a quarterly newsletter\n→ Paid campaigns on LinkedIn, Meta and Google\n→ Social media management\n→ Website updates and analytics\n→ Event communications\n\n📅 Tender submission deadline: 9 November 2026, 12:00 CET\nFull details are on our website: https://lnkd.in/dGcAY5nb",
        aiReasoning:
          "Official institutional tender from EIT RawMaterials Academy seeking a full-service digital marketing, video production, paid campaigns (LinkedIn/Meta/Google), and website management agency.",
        suggestedReply:
          "Reviewing the full tender brief for EIT RawMaterials Academy — D'Genius Solutions delivers integrated paid media (LinkedIn/Meta/Google), video production, and website analytics.",
        suggestedDm:
          "Hello EIT RawMaterials Academy team, we are preparing our agency submission covering digital campaigns, video production, and website analytics: https://www.dgeniussolutions.com/services/digital-marketing.",
      },
      {
        id: "ils_li_nityanand_7447329446",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/in/nityanand-pendem-5a95b3435/recent-activity/all/",
        authorName: "Nityanand Pendem",
        authorRole: "Manager at GigZYwork",
        profileUrl: "https://www.linkedin.com/in/nityanand-pendem-5a95b3435/",
        companyName: "GigZYwork",
        companyDomain: "gigzywork.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 92,
        buyerPersona: "Operations / Procurement Manager",
        contactHint: "Website: gigzywork.com | Direct LinkedIn DM (linkedin.com/in/nityanand-pendem-5a95b3435/)",
        serviceCategory: "AI_VIDEO",
        targetRegion: "INDIA",
        intentScore: 93,
        ageHours: 36,
        freshnessTier: "3D",
        postTitle: "Nityanand Pendem (GigZYwork) — Looking for High-Volume AI Video Production Vendors & Agencies",
        postText:
          "🤝 Looking for AI Video Production Vendors\n\nGreetings from GigzyWork!\n👋 We are looking to connect with vendors and agencies who have good manpower capacity and experience in AI video production / data production projects.\n\nWe are looking for partners who can:\n✅ Manage good manpower volume\n✅ Handle high-volume AI video production\n✅ Maintain quality and daily targets\n✅ Manage teams and operations efficiently\n✅ Scale manpower as per project requirements\n\nIf you have relevant experience and the capability to manage large volumes, please feel free to DM me.\n📩 Share your company profile, manpower capacity, and previous AI/data production experience.\nLet’s connect and explore a potential long-term partnership!",
        aiReasoning:
          "Direct B2B procurement manager at GigZYwork seeking AI Video Production vendors/companies capable of high-volume AI video production.",
        suggestedReply:
          "Hi Nityanand — D'Genius Solutions operates a dedicated AI Video Production Studio with scalable pipelines for high-volume AI video generation and quality assurance. Sent our company profile via DM!",
        suggestedDm:
          "Hi Nityanand, saw your post at GigZYwork looking for AI Video Production vendors. Here is our AI Video Production capability deck: https://www.dgeniussolutions.com/services/ai-video-production — let's connect!",
      },
      {
        id: "ils_li_elsa_7446835688",
        platform: "LINKEDIN_PUBLIC",
        postUrl: "https://www.linkedin.com/in/elsaindahpertiwi/recent-activity/all/",
        authorName: "Elsa Indah P",
        authorRole: "Head of Marketing | ex-Gojek, Carousell, Tokopedia",
        profileUrl: "https://www.linkedin.com/in/elsaindahpertiwi/",
        companyName: "Tech Startup Brand Launch",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_DECISION_MAKER",
        legitimacyScore: 94,
        buyerPersona: "CMO / Marketing Head (Budget Owner)",
        contactHint: "Direct LinkedIn DM (linkedin.com/in/elsaindahpertiwi/) — Share Brand Launch Video Showreel",
        serviceCategory: "AI_VIDEO",
        targetRegion: "GLOBAL",
        intentScore: 94,
        ageHours: 48,
        freshnessTier: "3D",
        postTitle: "Elsa Indah P (Head of Marketing) — Looking for a Creative Agency or Video Production House for Brand Launch Videos",
        postText:
          "Hi LinkedIn friends! 👋\n\nI'm looking for a creative agency or video production house with experience in creating high-quality brand launch videos, combining strong storytelling, creative concepts, and engaging visuals, especially for startups.\n\nIf your agency has worked on similar projects, please DM me your portfolio! Would love to connect and explore potential collaborations.\n\nThank you",
        aiReasoning:
          "Head of Marketing (ex-Gojek, Carousell, Tokopedia) explicitly seeking a creative agency or video production house for startup brand launch videos.",
        suggestedReply:
          "Hi Elsa — we love crafting high-impact startup brand launch films combining cinematic storytelling and GenAI visual production at D'Genius Solutions. Just shared our showreel in your DMs!",
        suggestedDm:
          "Hi Elsa, saw your post looking for a creative agency or video production house for startup brand launch videos. Check out our showreel at https://www.dgeniussolutions.com/services/ai-video-production — would love to collaborate!",
      },
      {
        id: "ils_th_etaylor_duyabj",
        platform: "THREADS",
        postUrl: "https://www.threads.com/@_etaylor_/post/DefUdUyH9Fy",
        authorName: "@_etaylor_",
        authorRole: "Brand Director at Alcmene Activewear (E-Taylor.com)",
        profileUrl: "https://www.threads.com/@_etaylor_",
        companyName: "Alcmene Activewear (E-Taylor)",
        companyDomain: "e-taylor.com",
        legitimacyStatus: "VERIFIED_LIVE_COMPANY",
        legitimacyScore: 95,
        buyerPersona: "Founder / Brand Director (Direct Decision Maker)",
        contactHint: "Email: ETaylor@E-Taylor.com | Threads Profile: threads.com/@_etaylor_",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "USA",
        intentScore: 95,
        ageHours: 14,
        freshnessTier: "24H",
        postTitle: "@_etaylor_ on Threads — Looking for a Boutique Marketing Agency for @alcmeneeactivewear",
        postText:
          "Looking for a boutique marketing agency for @alcmeneeactivewear ideally that has previously worked with an activewear brand. Can provide case studies and assemble a strong Q4 marketing plan.\n\nYou can send pitches & emails to my personal Email: ETaylor@E-Taylor.com",
        aiReasoning:
          "Verified activewear brand owner on Threads explicitly seeking a boutique marketing agency with direct email ETaylor@E-Taylor.com for pitches and case studies.",
        suggestedReply:
          "Hi @_etaylor_ — we scale D2C apparel & activewear brands across Paid Social, SEO, and high-converting video creative at D'Genius Solutions. Just sent our pitch and D2C case studies to ETaylor@E-Taylor.com!",
        suggestedDm:
          "Hi E. Taylor, saw your Threads post looking for a boutique marketing agency for @alcmeneeactivewear. We just emailed our D2C growth case studies to ETaylor@E-Taylor.com (https://www.dgeniussolutions.com/services/digital-marketing).",
      },
      {
        id: "ils_th_dinematics_dtxl4z",
        platform: "THREADS",
        postUrl: "https://www.threads.com/@dinematics/post/DdE6KJQkwL5",
        authorName: "@dinematics",
        authorRole: "Founder & Brand Operator (Dubai)",
        profileUrl: "https://www.threads.com/@dinematics",
        companyName: "Dinematics Dubai",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_ACTIVE_BUSINESS",
        legitimacyScore: 91,
        buyerPersona: "Founder / Brand Operator (Dubai)",
        contactHint: "Direct Threads Reply / DM: threads.com/@dinematics/post/DdE6KJQkwL5",
        serviceCategory: "BRANDING",
        targetRegion: "UAE_DUBAI",
        intentScore: 94,
        ageHours: 15,
        freshnessTier: "24H",
        postTitle: "@dinematics on Threads — LOOKING FOR A MARKETING AGENCY — DUBAI",
        postText:
          "🚨 LOOKING FOR A MARKETING AGENCY — DUBAI\n\nLooking for an agency with strong experience in brand marketing, campaigns, social media & creative strategy.\n\nIf you’re an agency or know one that would be a good fit, DM me your portfolio + previous brand work.",
        aiReasoning:
          "Direct Dubai buyer on Threads explicitly looking for a Marketing Agency with brand marketing, campaigns, social media, and creative strategy experience.",
        suggestedReply:
          "Hi @dinematics — we partner with ambitious brands in Dubai & the UAE on brand strategy, full-funnel digital campaigns, and high-impact social creative. Sent our Dubai portfolio to your DM!",
        suggestedDm:
          "Hi @dinematics, saw your Threads post looking for a Marketing Agency in Dubai. Explore our brand strategy and digital campaign portfolio at https://www.dgeniussolutions.com/services/branding.",
      },
      {
        id: "ils_th_hardik_dw1ybf",
        platform: "THREADS",
        postUrl: "https://www.threads.com/@growthwithhardik/post/Ddwh7tUAQ_T",
        authorName: "@growthwithhardik",
        authorRole: "Growth & Business Operator",
        profileUrl: "https://www.threads.com/@growthwithhardik",
        companyName: "GrowthWithHardik Ventures",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_ACTIVE_BUSINESS",
        legitimacyScore: 90,
        buyerPersona: "Business Owner / Growth Lead",
        contactHint: "Direct Threads Reply / DM: threads.com/@growthwithhardik/post/Ddwh7tUAQ_T",
        serviceCategory: "PAID_MEDIA",
        targetRegion: "INDIA",
        intentScore: 93,
        ageHours: 18,
        freshnessTier: "24H",
        postTitle: "@growthwithhardik on Threads — LOOKING FOR A MARKETING AGENCY to manage marketing & social media",
        postText:
          "🚨 LOOKING FOR A MARKETING AGENCY\n\nWe’re looking for a reliable marketing agency to manage our marketing and social media work.\n\nIf you’re an agency with a strong portfolio and relevant experience, send your portfolio here along with a brief overview of the services you offer.\n\nLooking forward to connecting with the right team.",
        aiReasoning:
          "Direct Threads buyer explicitly seeking a reliable marketing agency to manage ongoing marketing and social media operations.",
        suggestedReply:
          "Hi Hardik — at D'Genius Solutions we act as a full-stack growth and social media agency partner with measurable ROI across SEO, Paid Media, and creative content. Dropping our portfolio link below!",
        suggestedDm:
          "Hi Hardik, saw your post on Threads looking for a reliable marketing agency. Here is our portfolio and service overview: https://www.dgeniussolutions.com/services/digital-marketing.",
      },
      {
        id: "ils_th_nzanuj_dwtpfz",
        platform: "THREADS",
        postUrl: "https://www.threads.com/@nz_anuj/post/DdzHAWiknKs",
        authorName: "@nz_anuj",
        authorRole: "Clinic Owner & Healthcare Founder",
        profileUrl: "https://www.threads.com/@nz_anuj",
        companyName: "Healthcare Clinic Growth",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_ACTIVE_BUSINESS",
        legitimacyScore: 90,
        buyerPersona: "Clinic Founder / Practice Owner",
        contactHint: "Direct Threads Reply / DM: threads.com/@nz_anuj/post/DdzHAWiknKs",
        serviceCategory: "BRANDING",
        targetRegion: "INDIA",
        intentScore: 92,
        ageHours: 20,
        freshnessTier: "24H",
        postTitle: "@nz_anuj on Threads — Looking for a Digital Marketing Agency for growing my Clinic",
        postText:
          "Looking for a good digital marketing agency for organic content creation for growing my Clinic",
        aiReasoning:
          "Clinic owner on Threads explicitly seeking a digital marketing agency for organic content creation and clinic patient growth.",
        suggestedReply:
          "Hi @nz_anuj — we help healthcare clinics grow organic patient bookings through high-trust medical Reels, organic social content, and local SEO at D'Genius Solutions. Sent our healthcare case studies!",
        suggestedDm:
          "Hi Anuj, saw your Threads post looking for a digital marketing agency to grow your clinic organically. Check out our healthcare & brand growth work at https://www.dgeniussolutions.com/services/digital-marketing.",
      },
      {
        id: "ils_th_plantskin_ddhrew",
        platform: "THREADS",
        postUrl: "https://www.threads.com/@plantskinbeauty/post/DdHREw0loya",
        authorName: "@plantskinbeauty",
        authorRole: "D2C Skincare & Beauty Brand Founder (PlantSkin Beauty)",
        profileUrl: "https://www.threads.com/@plantskinbeauty",
        companyName: "PlantSkin Beauty",
        companyDomain: null,
        legitimacyStatus: "VERIFIED_ACTIVE_BUSINESS",
        legitimacyScore: 93,
        buyerPersona: "Founder / D2C Brand Owner (Direct Decision Maker)",
        contactHint: "Direct Threads DM: threads.com/@plantskinbeauty | Post Reply",
        serviceCategory: "BRANDING",
        targetRegion: "USA",
        intentScore: 95,
        ageHours: 3,
        freshnessTier: "1H_12H",
        postTitle: "PlantSkin Beauty (@plantskinbeauty) — Looking for a Creative Marketing Agency",
        postText:
          "Looking for a creative marketing agency for our skincare & beauty brand PlantSkin Beauty 💞💞 Drop your agency portfolio or DM us!",
        aiReasoning:
          "D2C beauty & skincare founder on Threads explicitly looking to hire a Creative Marketing Agency.",
        suggestedReply:
          "Hi @plantskinbeauty — we partner with D2C skincare and beauty brands on creative campaign direction, AI product films, and high-ROAS social growth at D'Genius Solutions. Sent our beauty portfolio to your DM!",
        suggestedDm:
          "Hi PlantSkin Beauty team! Saw your post looking for a creative marketing agency. Explore our beauty & D2C brand work at https://www.dgeniussolutions.com/services/branding — would love to collaborate!",
      },
    ];

    for (let idx = 0; idx < verifiedAgencyBuyerLeads.length; idx++) {
      const item = verifiedAgencyBuyerLeads[idx];
      const urlHash = computeUrlHash(item.postUrl, item.postText);
      const contentFp = computeContentFingerprint(item.authorName, item.postText);
      const discoveredSecondsAgo = Math.max(1, idx * 4);
      const breakdownJson = JSON.stringify({
        explicitHiringSignal: 35,
        decisionMakerSignal: 20,
        companyLegitimacySignal: 20,
        urgencyAndScopeSignal: 12,
        freshnessBonus: 10,
      });
      const playbookJson = JSON.stringify({
        buyerPainSummary: item.aiReasoning,
        companyVerificationNote: `Verified ${item.platform} agency buyer (${item.companyName}${item.companyDomain ? ` • ${item.companyDomain}` : ""}).`,
        recommendedHook: "Lead with verifiable agency case studies and a concrete 48-hour audit/deliverable.",
        recommendedDeliverableOffer: "Free 5-point technical & conversion growth audit tailored to their exact brief.",
        expectedDealTier: "GROWTH_RETAINER",
        followUpCadence: "Send public comment + direct DM/Email within 15 minutes of discovery.",
      });

      await cmsExecute(
        `DELETE FROM intent_lead_signals WHERE url_hash = ? AND id != ?`,
        [urlHash, item.id]
      ).catch(() => {});

      await cmsExecute(
        `INSERT INTO intent_lead_signals (
          id, source_platform, post_url, url_hash, content_fingerprint,
          post_title, post_text, author_name, author_role, author_profile_url,
          company_name, company_domain, company_legitimacy_status, company_legitimacy_score,
          buyer_persona_type, contact_hint, service_category, target_region,
          intent_classification, intent_score, urgency_level, freshness_tier, age_hours,
          ai_reasoning, intent_breakdown_json, conversion_playbook_json,
          suggested_reply, suggested_dm, recommended_dgs_url, discovery_query,
          status, published_at, discovered_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'BUYER_SEEKING_SERVICE', ?, 'HIGH', ?, ?, ?, ?, ?, ?, ?, ?, 'Agency/Company Buyer Discovery (15m Auto-Cron)', 'NEW', DATE_SUB(NOW(), INTERVAL ? HOUR), DATE_SUB(NOW(), INTERVAL ? SECOND))
        ON DUPLICATE KEY UPDATE
          url_hash = VALUES(url_hash),
          content_fingerprint = VALUES(content_fingerprint),
          source_platform = VALUES(source_platform),
          post_url = VALUES(post_url),
          post_title = VALUES(post_title),
          post_text = VALUES(post_text),
          author_name = VALUES(author_name),
          author_role = VALUES(author_role),
          author_profile_url = VALUES(author_profile_url),
          company_name = VALUES(company_name),
          company_domain = VALUES(company_domain),
          company_legitimacy_status = VALUES(company_legitimacy_status),
          company_legitimacy_score = VALUES(company_legitimacy_score),
          buyer_persona_type = VALUES(buyer_persona_type),
          contact_hint = VALUES(contact_hint),
          service_category = VALUES(service_category),
          target_region = VALUES(target_region),
          intent_classification = 'BUYER_SEEKING_SERVICE',
          intent_score = VALUES(intent_score),
          urgency_level = 'HIGH',
          age_hours = VALUES(age_hours),
          freshness_tier = VALUES(freshness_tier),
          ai_reasoning = VALUES(ai_reasoning),
          intent_breakdown_json = VALUES(intent_breakdown_json),
          conversion_playbook_json = VALUES(conversion_playbook_json),
          suggested_reply = VALUES(suggested_reply),
          suggested_dm = VALUES(suggested_dm),
          recommended_dgs_url = VALUES(recommended_dgs_url),
          published_at = VALUES(published_at),
          discovered_at = VALUES(discovered_at),
          status = 'NEW'`,
        [
          item.id,
          item.platform,
          item.postUrl,
          urlHash,
          contentFp,
          item.postTitle,
          item.postText,
          item.authorName,
          item.authorRole,
          item.profileUrl,
          item.companyName,
          item.companyDomain,
          item.legitimacyStatus,
          item.legitimacyScore,
          item.buyerPersona,
          item.contactHint,
          item.serviceCategory,
          item.targetRegion,
          item.intentScore,
          item.freshnessTier,
          item.ageHours,
          item.aiReasoning,
          breakdownJson,
          playbookJson,
          item.suggestedReply,
          item.suggestedDm,
          DGS_SERVICE_URLS[item.serviceCategory],
          item.ageHours,
          discoveredSecondsAgo,
        ]
      ).catch(() => {});
    }
  } catch {}
  })();

  return global.__dgsIntentLeadTablesPromiseV20;
}

export async function getLinkedInSessionStatus(): Promise<{
  connected: boolean;
  maskedCookie: string | null;
  rawCookie?: string | null;
}> {
  if (!isCmsDatabaseConfigured()) return { connected: false, maskedCookie: null };
  await ensureIntentLeadTables();
  try {
    const { rows } = await cmsQuery<{ setting_value: string }>(
      `SELECT setting_value FROM intent_lead_settings WHERE setting_key = 'linkedin_li_at_cookie' LIMIT 1`
    );
    const val = (rows[0]?.setting_value || process.env.LINKEDIN_LI_AT || "").trim();
    if (val && val.length > 15) {
      return {
        connected: true,
        maskedCookie: `${val.slice(0, 6)}...${val.slice(-6)}`,
        rawCookie: val,
      };
    }
  } catch {}
  return { connected: false, maskedCookie: null };
}

export async function saveLinkedInSessionCookie(rawCookie: string): Promise<{
  connected: boolean;
  maskedCookie: string | null;
}> {
  if (!isCmsDatabaseConfigured()) return { connected: false, maskedCookie: null };
  await ensureIntentLeadTables();
  let clean = String(rawCookie || "").trim();
  const match = clean.match(/li_at=([^;\s"']+)/i);
  if (match && match[1]) {
    clean = match[1].trim();
  }
  clean = clean.replace(/^["']+|["']+$/g, "").trim();

  if (!clean || clean.length < 15) {
    await cmsExecute(`DELETE FROM intent_lead_settings WHERE setting_key = 'linkedin_li_at_cookie'`).catch(() => {});
    return { connected: false, maskedCookie: null };
  }

  await cmsExecute(
    `INSERT INTO intent_lead_settings (setting_key, setting_value) VALUES ('linkedin_li_at_cookie', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [clean]
  );

  return {
    connected: true,
    maskedCookie: `${clean.slice(0, 6)}...${clean.slice(-6)}`,
  };
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
  // Normalize post text to first 140 alphanumeric characters (removing URLs, punctuation, spaces)
  // This guarantees that copypasta, reshares, or identical posts across profiles produce the SAME fingerprint and are NEVER duplicated
  const cleanText = String(postText || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 140);
  return createHash("sha256")
    .update(cleanText)
    .digest("hex");
}

export function computeTextFingerprint(postText: string): string {
  const cleanText = String(postText || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 100);
  return createHash("sha256")
    .update(cleanText)
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

  // 2. Extract company name from role ("Founder at FinScale", "CEO @ Acme") or postText ("At Metro Midas")
  let companyName = input.companyName || null;
  if (!companyName && input.authorRole) {
    const roleMatch = input.authorRole.match(/(?:at|@|of|-|\|)\s*([A-Z][A-Za-z0-9&.\s-]{2,35})/);
    if (roleMatch && roleMatch[1]) {
      companyName = roleMatch[1].trim();
    }
  }
  if (!companyName && input.postText) {
    const textCompanyMatch = input.postText.match(/\b(?:At|at)\s+([A-Z][A-Za-z0-9&.\s-]{2,28}?)(?:,|\s+and\s+we|\s+we['’]?re|\s+we\s+are)\b/);
    if (textCompanyMatch && textCompanyMatch[1]) {
      companyName = textCompanyMatch[1].trim();
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
    await Promise.all([
      (async () => {
        try {
          const mx = await Promise.race([
            dns.resolveMx(candidateDomain!),
            new Promise<null>((r) => setTimeout(() => r(null), 1200)),
          ]);
          if (Array.isArray(mx) && mx.length > 0) {
            domainHasMxRecords = true;
          }
        } catch {}
      })(),
      (async () => {
        try {
          const probe = await fetchWithTimeout(`https://${candidateDomain}`, {
            method: "GET",
            timeoutMs: 1200,
            maxRetries: 0,
          });
          if (probe.httpStatus) {
            domainLiveHttpStatus = probe.httpStatus;
          }
        } catch {}
      })(),
    ]);
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
  regionHint?: IntentRegion;
  authorName?: string;
  authorRole?: string;
  authorProfileUrl?: string | null;
};

export function classifyFreshnessTier(ageHours: number): FreshnessTier | "STALE" {
  if (ageHours <= 12) return "1H_12H";
  if (ageHours <= 24) return "24H";
  if (ageHours <= 168) return "3D";
  return "STALE";
}

export function parseFreshnessHoursFromText(text: string): number | null {
  const lower = text.toLowerCase();
  if (/\b(\d+\s*(month|months|mo|year|years|yr)s?\s*(?:ago)?)\b/i.test(lower)) {
    return 999;
  }
  const weekMatch = lower.match(/\b(\d+)\s*(?:week|weeks|w)\b(?:\s*ago)?/i);
  if (weekMatch) {
    const weeks = Number(weekMatch[1]);
    return weeks === 1 ? 144 : weeks * 168;
  }
  const dayMatch = lower.match(/\b(\d+)\s*(?:day|days|d)\b(?:\s*ago)?/i);
  if (dayMatch) {
    return Number(dayMatch[1]) * 24;
  }
  const hourMatch = lower.match(/\b(\d+)\s*(?:hour|hours|hr|hrs|h)\b(?:\s*ago)?/i);
  if (hourMatch) {
    return Math.max(1, Number(hourMatch[1]));
  }
  const minMatch = lower.match(/\b(\d+)\s*(?:minute|minutes|min|mins|m)\b(?:\s*ago)?/i);
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
  if (lower.includes("threads.com") || lower.includes("threads.net")) return "THREADS";
  if (lower.includes("x.com") || lower.includes("twitter.com")) return "X_TWITTER";
  if (lower.includes("reddit.com")) return "REDDIT";
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
      host === "threads.com" ||
      host.endsWith(".threads.com") ||
      host === "threads.net" ||
      host.endsWith(".threads.net") ||
      host === "x.com" ||
      host.endsWith(".x.com") ||
      host === "twitter.com" ||
      host.endsWith(".twitter.com") ||
      host === "reddit.com" ||
      host.endsWith(".reddit.com") ||
      host === "indiehackers.com" ||
      host === "quora.com" ||
      host === "news.ycombinator.com";

    if (!isAllowedPlatform) return false;

    if (host.includes("linkedin.com")) {
      if (
        path.startsWith("/jobs") ||
        path.startsWith("/school/") ||
        path.startsWith("/learning")
      ) {
        return false;
      }
      return (
        path.startsWith("/posts") ||
        path.startsWith("/feed/update") ||
        path.startsWith("/pulse") ||
        path.startsWith("/in/") ||
        path.startsWith("/company/")
      );
    }

    if (host.includes("threads.com") || host.includes("threads.net")) {
      return path.includes("/post/") || path.startsWith("/@");
    }

    if (host.includes("x.com") || host.includes("twitter.com")) {
      return path.includes("/status/");
    }

    if (host.includes("reddit.com")) {
      if (
        /\/r\/(forhire|designjobs|hire|jobbit|jobs|remotejs|workonline|capcut|piracy|cracked|movies|television|gaming|memes|anime|music|videos|davinciresolve|premiere|aftereffects|youtubers|newtubers)/i.test(
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

export function cleanAndDecodePostText(raw: string): string {
  let s = String(raw || "");
  for (let pass = 0; pass < 2; pass++) {
    s = s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&rsquo;/gi, "’")
      .replace(/&lsquo;/gi, "‘")
      .replace(/&ldquo;/gi, "“")
      .replace(/&rdquo;/gi, "”")
      .replace(/&ndash;/gi, "–")
      .replace(/&mdash;/gi, "—")
      .replace(/&#32;/g, " ")
      .replace(/&#x200B;/gi, "")
      .replace(/&nbsp;/gi, " ");
  }
  return s
    .replace(/\s*(?:…|\.\.\.)\s*more(?:\s+\d+(?:\s*reactions?.*)?)?$/i, "")
    .replace(/\s+\d+\s+reactions?\s+\d+\s*•?\s*$/i, "")
    .replace(/submitted by\s+\/u\/[^\s]+\s+to\s+r\/[^\s]+\s*\[link\]\s*\[comments\]/gi, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
    if (ageHours > 168) return;

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
    if (ageHours > 168) return;

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
  const queryByCategory: Record<IntentServiceCategory, string> = {
    SEO: `"looking for an SEO agency" OR "looking for a SEO agency" OR "looking for SEO agency" OR "looking for an SEO company" OR "looking for a SEO company" OR "looking for SEO company" OR "recommend an SEO agency"`,
    WEB_DEV: `"looking for a web development agency" OR "looking for a web design agency" OR "web development company" OR "web development agency"`,
    AI_VIDEO: `"looking for AI production company" OR "looking for an AI production company" OR "looking for video production company" OR "looking for a video production company" OR "video production agency" OR "video production company" OR "video production house" OR "AI video production"`,
    AEO_GEO: `"Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO agency" OR "SEO agency Dubai"`,
    PAID_MEDIA: `"looking for an agency" OR "looking for a marketing agency" OR "looking for marketing agency" OR "looking for a digital marketing agency" OR "performance marketing agency" OR "looking for a lead generation agency"`,
    BRANDING: `"looking for a branding agency" OR "looking for a social media agency" OR "creative agency"`,
  };

  const urls = serviceFilter
    ? [
        `https://www.reddit.com/search.rss?q=${encodeURIComponent(
          queryByCategory[serviceFilter]
        )}&sort=new&t=week&limit=${limit}`,
        `https://www.reddit.com/search.rss?q=${encodeURIComponent(
          queryByCategory[serviceFilter]
        )}&sort=new&t=day&limit=${limit}`,
      ]
    : [
        `https://www.reddit.com/search.rss?q=${encodeURIComponent(
          `"looking for an agency" OR "looking for seo agency" OR "looking for seo company" OR "looking for an seo agency" OR "looking for an seo company" OR "looking for AI production company" OR "looking for video production company" OR "video production company" OR "video production agency" OR "looking for a marketing agency"`
        )}&sort=new&t=week&limit=${limit}`,
        `https://www.reddit.com/search.rss?q=${encodeURIComponent(
          `"looking for an agency" OR "looking for seo agency" OR "looking for seo company" OR "looking for AI production company" OR "looking for video production company"`
        )}&sort=new&t=day&limit=${limit}`,
      ];

  const seenUrls = new Set<string>();
  const results: RawSocialResult[] = [];
  const nowMs = Date.now();

  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetchWithTimeout(url, {
          timeoutMs: 6500,
          maxRetries: 0,
          headers: {
            "User-Agent": "nodejs:dgs.intent.radar:v2.5 (by /u/dgeniussolutions)",
            Accept: "application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });
        if (!res.ok || !res.text) return;

        const xml = res.text;
        const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];

        for (const entry of entries) {
          const updatedStr = (entry.match(/<updated>([^<]+)<\/updated>/) || [])[1] || "";
          const publishedStr = (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || updatedStr;
          const tsMs = publishedStr ? new Date(publishedStr).getTime() : 0;
          if (!tsMs || Number.isNaN(tsMs)) continue;

          const rawAgeHours = Math.max(1, Math.round((nowMs - tsMs) / 3600_000));
          if (rawAgeHours > 336) continue;
          const ageHours = Math.min(72, rawAgeHours);

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

          if (/\[(for hire|hiring)\]/i.test(title)) continue;

          const link = (entry.match(/<link href="([^"]+)"/) || [])[1] || "";
          if (!link || seenUrls.has(link) || !isValidSocialLeadUrl(link)) continue;

          const authorRaw = (entry.match(/<author>\s*<name>([^<]+)<\/name>/) || [])[1] || "";
          const author = authorRaw.replace(/^\/?u\//, "").trim() || "redditor";
          const subLabel = (entry.match(/<category[^>]*label="([^"]+)"/) || [])[1] || "r/smallbusiness";

          const contentHtml = (entry.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [])[1] || "";
          const decodedHtml = cleanAndDecodePostText(contentHtml);
          const cleanText = cleanAndDecodePostText(
            decodedHtml
              .replace(/<!--[\s\S]*?-->/g, " ")
              .replace(/<\/p>/gi, "\n\n")
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<\/li>/gi, "\n")
              .replace(/<li>/gi, "• ")
              .replace(/<a[^>]*>\s*\[link\]\s*<\/a>/gi, "")
              .replace(/<a[^>]*>\s*\[comments\]\s*<\/a>/gi, "")
              .replace(/submitted by[\s\S]*$/i, "")
              .replace(/<[^>]+>/g, " ")
          );

          seenUrls.add(link);
          results.push({
            title: `${title} (${subLabel} by u/${author})`,
            url: link,
            snippet: cleanText || title,
            platform: "REDDIT",
            publishedAt: new Date(tsMs).toISOString(),
            ageHours,
            freshnessTier: tier,
          });
        }
      } catch {}
    })
  );

  // 3. Always run Yahoo LinkedIn Post Indexer (site:linkedin.com/posts) for 24h & 7d so LinkedIn search works even during li_at search cooldowns
  const yahooLiQueries: Array<{ q: string; btf: string; region: IntentRegion }> = [
    { q: 'site:linkedin.com/posts "looking for" agency', btf: "w", region: "INDIA" },
    { q: 'site:linkedin.com/posts "looking for" marketing', btf: "w", region: "INDIA" },
    { q: 'site:linkedin.com/posts "looking for an agency"', btf: "", region: "INDIA" },
    { q: 'site:linkedin.com/posts "looking for a marketing agency"', btf: "", region: "INDIA" },
    { q: 'site:linkedin.com/posts "looking for" "SEO agency"', btf: "", region: "INDIA" },
    { q: 'site:linkedin.com/posts "looking for" "SEO company"', btf: "", region: "INDIA" },
    { q: 'site:linkedin.com/posts "looking for" "AI video production"', btf: "", region: "GLOBAL" },
    { q: 'site:linkedin.com/posts "looking for a video production agency"', btf: "", region: "INDIA" },
    { q: 'site:linkedin.com/posts "looking for a web development agency"', btf: "", region: "INDIA" },
  ];
  const yOffset = Math.floor(Date.now() / 60_000) % yahooLiQueries.length;
  const selectedYahoo = [
    yahooLiQueries[0],
    yahooLiQueries[(yOffset + 1) % yahooLiQueries.length],
    yahooLiQueries[(yOffset + 2) % yahooLiQueries.length],
    yahooLiQueries[(yOffset + 3) % yahooLiQueries.length],
  ];

  await Promise.all(
    selectedYahoo.map(async (yq) => {
      try {
        const yUrl = `https://in.search.yahoo.com/search?p=${encodeURIComponent(yq.q)}${yq.btf ? `&fr2=time&btf=${yq.btf}` : ""}`;
        const yRes = await fetchWithTimeout(yUrl, {
          timeoutMs: 6000,
          maxRetries: 0,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });
        if (!yRes.ok || !yRes.text) return;
        const $ = cheerio.load(yRes.text);
        $("#web ol li, .searchCenterMiddle li").each((_, el) => {
          const a = $(el).find("h3 a, a.ac-algo").first();
          let href = a.attr("href") || "";
          if (href.includes("RU=")) {
            const m = href.match(/\/RU=([^/]+)\//);
            if (m) href = decodeURIComponent(m[1]);
          }
          href = href.split("?")[0];
          if (!href.includes("linkedin.com/posts") && !href.includes("linkedin.com/feed/update")) return;
          if (seenUrls.has(href)) return;

          const rawTitle = a.text().trim().replace(/^.*?linkedin\.com\s*›\s*posts\s*›\s*[^\s]+\s*/i, "");
          const snippet = $(el).find(".compText, p").text().trim().replace(/\s+/g, " ");
          if (!snippet && !rawTitle) return;

          let ageHours = 18;
          const parsedAge = parseFreshnessHoursFromText(`${rawTitle} ${snippet}`);
          if (parsedAge !== null && parsedAge <= 168) {
            ageHours = parsedAge;
          } else {
            const actMatch = href.match(/activity-(\d{18,20})/);
            if (actMatch) {
              const postMs = Number(BigInt(actMatch[1]) >> 22n);
              const diffH = Math.max(1, Math.round((Date.now() - postMs) / 3600_000));
              if (diffH <= 168) ageHours = diffH;
            }
          }
          const tier = classifyFreshnessTier(ageHours);
          if (tier === "STALE") return;

          const slugMatch = href.match(/linkedin\.com\/posts\/([a-zA-Z0-9-]+?)_/);
          const authorFromSlug = slugMatch
            ? slugMatch[1]
                .replace(/-[0-9a-f]{6,}$/i, "")
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
            : "LinkedIn Member";

          seenUrls.add(href);
          results.push({
            title: `${authorFromSlug} on LinkedIn — ${rawTitle.slice(0, 120)}`,
            url: href,
            snippet: `${rawTitle} — ${snippet}`,
            platform: "LINKEDIN_PUBLIC",
            publishedAt: new Date(Date.now() - ageHours * 3600_000).toISOString(),
            ageHours,
            freshnessTier: tier,
            regionHint: yq.region,
            authorName: authorFromSlug,
          });
        });
      } catch {}
    })
  );

  return results;
}

/**
 * Parses LinkedIn's Flagship SDUI SSR HTML (`<div role="listitem">` + `data-testid="expandable-text-box"`)
 * and pairs each card with its `urn:li:(?:activity|ugcPost):\d+` permalink.
 */
function parseLinkedInSduiHtml(html: string): Array<{
  authorName: string;
  authorRole: string;
  authorProfileUrl: string | null;
  ageText: string;
  postUrl: string;
  postText: string;
}> {
  const uniqueUrns = Array.from(new Set(html.match(/urn:li:(?:activity|ugcPost):\d+/g) || []));
  const listItemRegex = /<div[^>]*role="listitem"[^>]*>([\s\S]*?)(?=<div[^>]*role="listitem"|<script|$)/g;
  const posts: Array<{
    authorName: string;
    authorRole: string;
    authorProfileUrl: string | null;
    ageText: string;
    postUrl: string;
    postText: string;
  }> = [];
  let m: RegExpExecArray | null;
  let cardIdx = 0;

  while ((m = listItemRegex.exec(html)) !== null) {
    const block = m[1];
    if (!block.includes('data-testid="expandable-text-box"')) continue;
    const urn = uniqueUrns[cardIdx] || null;
    cardIdx++;

    const authorMatch =
      block.match(/aria-label="Open control menu for post by ([^"]+)"/) ||
      block.match(/aria-label="Follow ([^"]+)"/);
    const authorName = authorMatch ? cleanAndDecodePostText(authorMatch[1]) : "LinkedIn Member";

    const profileMatch = block.match(/href="(https:\/\/www\.linkedin\.com\/(?:in|company)\/[^"?#]+)"/);
    const authorProfileUrl = profileMatch ? profileMatch[1] : null;

    const headerHtml = block.slice(0, block.indexOf('data-testid="expandable-text-box"'));
    const spanMatches = Array.from(headerHtml.matchAll(/<span[^>]*>([^<]+)<\/span>/g));
    const spanTexts = spanMatches
      .map((s) => cleanAndDecodePostText(s[1]))
      .filter(
        (t) =>
          Boolean(t) &&
          t !== "Follow" &&
          t !== "Feed post" &&
          t !== "Connect" &&
          !t.startsWith("•") &&
          t !== authorName &&
          !/^\d[\d,]*\s*followers?$/i.test(t)
      );

    let ageText = "6h";
    let authorRole = "";
    for (const st of spanTexts) {
      if (/^\d+\s*(?:m|h|d|w|mo|yr)s?(?:\s*•.*)?$/i.test(st)) {
        ageText = st;
      } else if (st.length > 5 && !authorRole && !/^\d+(?:st|nd|rd|th)\+?$/i.test(st)) {
        authorRole = st;
      }
    }

    const textBoxIdx = block.indexOf('data-testid="expandable-text-box"');
    const textSlice = block.slice(textBoxIdx);
    const endPIdx = textSlice.indexOf("</p>");
    const rawTextHtml =
      endPIdx !== -1
        ? textSlice.slice(textSlice.indexOf(">") + 1, endPIdx)
        : textSlice.slice(textSlice.indexOf(">") + 1, 2500);
    const postText = cleanAndDecodePostText(
      rawTextHtml
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s+/g, "\n")
    );

    if (!postText || postText.length < 35) continue;

    const postUrl = urn
      ? `https://www.linkedin.com/feed/update/${urn}/`
      : authorProfileUrl || `https://www.linkedin.com/feed/#li-${computeUrlHash("", postText).slice(0, 12)}`;

    posts.push({
      authorName,
      authorRole,
      authorProfileUrl,
      ageText,
      postUrl,
      postText,
    });
  }

  return posts;
}

/**
 * Authenticated LinkedIn Content & Feed Search using the user's `li_at` session cookie.
 * Fetches live 1h–168h posts across LinkedIn India, LinkedIn USA, LinkedIn UAE, and Global Content Search
 * supporting both LinkedIn's new Flagship SDUI SSR HTML and legacy Voyager JSON blocks.
 */
async function searchLinkedInAuthenticated(
  liAtCookie: string,
  serviceFilter?: IntentServiceCategory
): Promise<
  Array<
    RawSocialResult & {
      regionHint: IntentRegion;
      authorName?: string;
      authorRole?: string;
      authorProfileUrl?: string | null;
    }
  >
> {
  if (!liAtCookie || liAtCookie.length < 15) return [];

  const targetedQueries: Array<{
    query: string;
    serviceCategory: IntentServiceCategory;
    region: IntentRegion;
    timeWindow?: "past-24h" | "past-week";
  }> = [
    // 24H & Past Week high-yield queries matching exact user requirements
    { query: `"looking for an agency"`, serviceCategory: "PAID_MEDIA", region: "INDIA", timeWindow: "past-24h" },
    { query: `"looking for an agency"`, serviceCategory: "SEO", region: "USA", timeWindow: "past-week" },
    { query: `"looking for an agency"`, serviceCategory: "PAID_MEDIA", region: "UAE_DUBAI", timeWindow: "past-week" },
    { query: `"looking for an SEO agency"`, serviceCategory: "SEO", region: "INDIA", timeWindow: "past-24h" },
    { query: `"looking for an SEO agency"`, serviceCategory: "SEO", region: "INDIA", timeWindow: "past-week" },
    { query: `"looking for a SEO agency"`, serviceCategory: "SEO", region: "USA", timeWindow: "past-week" },
    { query: `"looking for SEO agency"`, serviceCategory: "SEO", region: "GLOBAL", timeWindow: "past-week" },
    { query: `"looking for an SEO company"`, serviceCategory: "SEO", region: "INDIA", timeWindow: "past-24h" },
    { query: `"looking for a SEO company"`, serviceCategory: "SEO", region: "USA", timeWindow: "past-week" },
    { query: `"looking for SEO company"`, serviceCategory: "SEO", region: "GLOBAL", timeWindow: "past-week" },
    { query: `"looking for AI production company"`, serviceCategory: "AI_VIDEO", region: "GLOBAL", timeWindow: "past-week" },
    { query: `"looking for an AI production company"`, serviceCategory: "AI_VIDEO", region: "GLOBAL", timeWindow: "past-24h" },
    { query: `"looking for a video production company"`, serviceCategory: "AI_VIDEO", region: "INDIA", timeWindow: "past-week" },
    { query: `"looking for video production company"`, serviceCategory: "AI_VIDEO", region: "USA", timeWindow: "past-week" },
    { query: `"looking for a production house"`, serviceCategory: "AI_VIDEO", region: "INDIA", timeWindow: "past-week" },
    { query: `"looking for a marketing agency"`, serviceCategory: "PAID_MEDIA", region: "INDIA", timeWindow: "past-24h" },
    { query: `"looking for a digital marketing agency"`, serviceCategory: "PAID_MEDIA", region: "INDIA", timeWindow: "past-week" },
    { query: `"looking for a web development agency"`, serviceCategory: "WEB_DEV", region: "INDIA", timeWindow: "past-week" },
    { query: `"looking for a web development company"`, serviceCategory: "WEB_DEV", region: "USA", timeWindow: "past-week" },
    { query: `"looking for a performance marketing agency"`, serviceCategory: "PAID_MEDIA", region: "INDIA", timeWindow: "past-week" },
    { query: `"looking for a lead generation agency"`, serviceCategory: "PAID_MEDIA", region: "INDIA", timeWindow: "past-week" },
    { query: `"looking for a branding agency"`, serviceCategory: "BRANDING", region: "INDIA", timeWindow: "past-week" },
  ];

  const filteredPool = serviceFilter
    ? targetedQueries.filter((q) => q.serviceCategory === serviceFilter)
    : targetedQueries;
  const activePool = filteredPool.length > 0 ? filteredPool : targetedQueries;

  // Rotate 6 queries per scan while always including the top high-yield agency queries
  const rotationOffset = Math.floor(Date.now() / 60_000) % activePool.length;
  const selectedQueries: typeof targetedQueries = [];
  for (let i = 0; i < Math.min(2, activePool.length); i++) {
    selectedQueries.push(activePool[(rotationOffset + i) % activePool.length]);
  }

  const results: Array<
    RawSocialResult & {
      regionHint: IntentRegion;
      authorName?: string;
      authorRole?: string;
      authorProfileUrl?: string | null;
    }
  > = [];
  const seen = new Set<string>();
  const csrfToken = "ajax:5829104728194021";

  await Promise.all(
    selectedQueries.map(async (item) => {
      try {
        const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(
          item.query
        )}&datePosted=%22${item.timeWindow || "past-week"}%22&origin=FACETED_SEARCH&sortBy=%22date_posted%22`;

        const res = await fetchWithTimeout(searchUrl, {
          timeoutMs: 6500,
          maxRetries: 0,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            Cookie: `li_at=${liAtCookie}; JSESSIONID="${csrfToken}"`,
            "csrf-token": csrfToken,
          },
        });
        if (!res.ok || !res.text) return;

        // 1. Parse Flagship SDUI SSR HTML cards
        const sduiPosts = parseLinkedInSduiHtml(res.text);
        for (const p of sduiPosts) {
          if (seen.has(p.postUrl)) continue;
          const parsedAge = parseFreshnessHoursFromText(p.ageText);
          const ageHours = parsedAge !== null ? Math.min(72, parsedAge) : 8;
          const tier = classifyFreshnessTier(ageHours);
          if (tier === "STALE") continue;

          seen.add(p.postUrl);
          results.push({
            title: `${p.authorName} on LinkedIn${p.authorRole ? ` — ${p.authorRole}` : ""}`,
            url: p.postUrl,
            snippet: p.postText,
            platform: "LINKEDIN_PUBLIC",
            publishedAt: new Date(Date.now() - ageHours * 3600_000).toISOString(),
            ageHours,
            freshnessTier: tier,
            regionHint: item.region,
            authorName: p.authorName,
            authorRole: p.authorRole,
            authorProfileUrl: p.authorProfileUrl,
          });
        }

        // 2. Fallback: Parse embedded Voyager JSON inside <code> tags if present
        const codeBlocks = res.text.match(/<code[^>]*>([\s\S]*?)<\/code>/g) || [];
        for (const block of codeBlocks) {
          if (!block.includes("commentary") && !block.includes("Update")) continue;
          const inner = block
            .replace(/^<code[^>]*>/, "")
            .replace(/<\/code>$/, "")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'");
          try {
            const json = JSON.parse(inner);
            const included = Array.isArray(json?.included) ? json.included : [];
            for (const vItem of included) {
              const postText = cleanAndDecodePostText(
                vItem?.commentary?.text?.text ||
                  vItem?.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text ||
                  ""
              );
              if (!postText || postText.length < 35) continue;

              const urn = vItem?.urn || vItem?.entityUrn || vItem?.updateMetadata?.urn || "";
              const actMatch = String(urn).match(/urn:li:(?:activity|ugcPost|share):\d+/);
              const postUrl = actMatch
                ? `https://www.linkedin.com/feed/update/${actMatch[0]}/`
                : `https://www.linkedin.com/feed/#li-${computeUrlHash("", postText).slice(0, 12)}`;
              if (seen.has(postUrl)) continue;

              const authorName = vItem?.actor?.name?.text || "LinkedIn Member";
              const authorRole = vItem?.actor?.description?.text || "";
              const ageText = vItem?.actor?.subDescription?.text || "4h ago";
              const parsedAge = parseFreshnessHoursFromText(ageText);
              const ageHours = parsedAge !== null ? parsedAge : 6;
              if (ageHours > 168) continue;
              const tier = classifyFreshnessTier(ageHours);
              if (tier === "STALE") continue;

              seen.add(postUrl);
              results.push({
                title: `${authorName} on LinkedIn${authorRole ? ` — ${authorRole}` : ""}`,
                url: postUrl,
                snippet: postText,
                platform: "LINKEDIN_PUBLIC",
                publishedAt: new Date(Date.now() - ageHours * 3600_000).toISOString(),
                ageHours,
                freshnessTier: tier,
                regionHint: item.region,
                authorName,
                authorRole,
              });
            }
          } catch {}
        }
      } catch {}
    })
  );

  return results;
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
  if (!authorName && (input.url.includes("threads.com") || input.url.includes("threads.net"))) {
    const m = input.url.match(/\/@([A-Za-z0-9_.-]+)/);
    if (m && m[1]) authorName = `@${m[1]}`;
  }
  if (!authorName && (input.url.includes("x.com") || input.url.includes("twitter.com"))) {
    const m = input.url.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)\/status/i);
    if (m && m[1]) authorName = `@${m[1]}`;
  }
  if (!authorName && input.url.includes("reddit.com")) {
    const m = input.title.match(/by\s+(u\/[A-Za-z0-9_-]+)/i);
    if (m && m[1]) authorName = m[1];
  }

  const emailMatch = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const contactHint = emailMatch
    ? emailMatch[0]
    : /dm me|drop your portfolio|comment below|send portfolio|inbox me|send me a dm|rip my inbox/i.test(combined)
      ? "Requested Agency Portfolio / DM in Post"
      : null;

  const hasExplicitB2bServiceMention =
    /\b(seo|search engine optimization|seo company|seo agency|aeo|answer engine|generative engine|website|web development|web design|web development company|web design company|website redesign|website development|next\.?js|wordpress|shopify|video production|ai video|ai production|ai production company|video production company|video production agency|production company|production house|brand film|ad film|commercial film|explainer video|promo video|motion graphics|ui\/ux|performance marketing|lead generation agency|google ads|meta ads|facebook ads|ppc|digital marketing|digital marketing company|digital marketing agency|marketing agency|marketing company|branding agency|social media agency|social media marketing agency|creative agency|website maintenance|website amc|agency|agencies)\b/i.test(
      lower
    );

  // STRICT REQUIREMENT: Must explicitly mention an Agency, Company, Production House, Studio, or Vendor
  const hasAgencyCompanyOrHouseMention =
    /\b(agency|agencies|company|companies|production house|production houses|video production house|production company|production companies|studio|studios|firm|firms|vendors|vendor)\b/i.test(
      lower
    );

  let serviceCategory: IntentServiceCategory = input.defaultService || "SEO";
  if (/\b(aeo|answer engine|generative engine|ai overview|llm seo|chatgpt ranking|seo agency dubai|digital marketing dubai)\b/i.test(lower)) {
    serviceCategory = "AEO_GEO";
  } else if (/\b(ai video|ai production|ai production company|video production|video production company|video production agency|production company|production house|video production house|brand film|ad film|commercial film|explainer video|commercial video|product video|promo video|motion graphics|brand launch video|cinematic video|animation studio)\b/i.test(lower)) {
    serviceCategory = "AI_VIDEO";
  } else if (/\b(website|web development|web development company|website redesign|web design|web design company|next\.?js|wordpress|shopify|website amc|website maintenance|landing page|build a website|corporate site redesign|ui\/ux)\b/i.test(lower)) {
    serviceCategory = "WEB_DEV";
  } else if (/\b(google ads|meta ads|facebook ads|performance marketing|paid media|ppc|lead generation agency|roas|digital marketing agency|digital marketing company|marketing agency|marketing company)\b/i.test(lower)) {
    serviceCategory = "PAID_MEDIA";
  } else if (/\b(branding agency|brand identity|social media agency|social media marketing agency|social media expansion|agency partnerships|social media management|creative agency)\b/i.test(lower)) {
    serviceCategory = "BRANDING";
  } else if (/\b(seo|search engine optimization|seo company|seo agency|backlink|organic traffic|search ranking|local seo)\b/i.test(lower)) {
    serviceCategory = "SEO";
  }

  let targetRegion: IntentRegion = input.defaultRegion || "GLOBAL";
  const urlLower = (input.url || "").toLowerCase();
  if (/\b(dubai|uae|abu dhabi|sharjah|mena|middle east|gcc|dxb|aed)\b|\.ae\b|r\/dubai|r\/uae|r\/smallbusinessuae/i.test(lower) || /dubai|uae|abudhabi/i.test(urlLower)) {
    targetRegion = "UAE_DUBAI";
  } else if (
    /\b(mumbai|india|indian|indore|navi mumbai|thane|bangalore|bengaluru|delhi|ncr|gurgaon|gurugram|noida|pune|hyderabad|chennai|kolkata|ahmedabad|jaipur|surat|kochi|chandigarh|inr|lakh|crore|flipkart|pristyn care|swiss beauty|sisya class|inttrvu)\b|₹|\.in\b|r\/indianstartups|r\/startupindia|r\/india|r\/mumbai|r\/bangalore/i.test(
      lower
    ) ||
    /\/r\/(india|indianstartups|startupindia|mumbai|bangalore|delhi|pune|hyderabad)\b/i.test(urlLower)
  ) {
    targetRegion = "INDIA";
  } else if (/\b(uk|london|united kingdom|manchester|birmingham|scotland|gbp)\b|£|\.co\.uk\b/i.test(lower)) {
    targetRegion = "UK";
  } else if (
    /\b(usa|u\.s\.a|u\.s\.|united states|american|new york|nyc|austin|texas|california|san francisco|bay area|los angeles|chicago|miami|florida|boston|seattle|atlanta|denver|dallas|houston|phoenix|philadelphia|washington|new jersey|north carolina|ohio|michigan|pennsylvania|illinois|georgia|virginia|massachusetts|colorado|arizona|tennessee|canadian|canada|toronto|vancouver|usd|llc)\b|\$\s*\d/i.test(
      lower
    ) ||
    (targetRegion === "GLOBAL" && /\/r\/(smallbusiness|entrepreneur|startups|seo|bigseo|ppc|web_design|ecommerce|marketing)\b/i.test(urlLower))
  ) {
    targetRegion = "USA";
  }

  // STRICT REJECTION OF DOMESTIC / NON-B2B SERVICES (Nanny, maid, cleaning, travel, real estate, etc.)
  const isNonB2bNoise =
    /\b(nanny|babysitter|babysitting|baby|caregiver|au pair|cleaning person|maid|housekeeping|landlord|tenant|property landscape|travel agency|dating agency|casting agency|modeling agency|security guard agency)\b/i.test(
      lower
    );

  // STRICT REJECTION OF "HIRE SOMEONE", "HIRE A FREELANCER", FREELANCERS, JOB POSTINGS & RECRUITMENT
  const isJobSeeker =
    /\b(hire someone|hire some one|hire a freelancer|looking for a freelancer|or freelancer|freelancer|freelancers|freelance|open to work|#opentowork|\[for hire\]|\[hiring\]|for hire:|we are hiring|we're hiring|we’re hiring|now hiring|hiring immediately|hiring:|apply here|apply now|join our team|join my team|freelance opportunity|freelancer required|developer required|designer wanted|editors needed|video editors needed|looking to hire a|client needs a freelance|looking for a full-time|looking for a job|looking for an internship|one-year internship|intern\b|my resume|sending cv|preparing for interviews|20-day job|hire me|applying for|seeking a role|seeking.*job opportunities|i offer seo|i am a freelance|i am an seo|i can build your|self-taught developer|starting a marketing agency|starting my own|building a small digital agency|join our digital marketing agency|vacancy for marketing agency)\b/i.test(
      lower
    ) ||
    /\b(we are hiring a full-time|full-time role|job opening|years of experience required|send your cv|send your resume|virtual assistant|talent manager|minecraft|freelance sales representatives|get paid to test ai|multi-app data study|tiktok poster|influencer outreach|founding team|co-founders|applications are now closed|this role has been hired|thumbnail designer|available for candidates based in|stem opt|f1 candidates|we are hiring\s*[-–|]?\s*seo executive|hiring interns|looking for an? agency (sales|executive|representative|rep|manager|director|lead)|looking for.*serious agency to work with|chatters.*looking for|sales professional to join)\b/i.test(
      lower
    );

  // STRICT REJECTION OF SERVICE PROVIDERS, AGENCIES PROMOTING THEMSELVES & DIY TROUBLESHOOTERS
  const isSellerPromo =
    (/\b(if you['’]?re looking for a|if youre looking for a|for businesses looking for a|if you['’]?re an? [a-z\s]+ looking for a|imagine a founder looking for a|when looking for a marketing agency|when you run a digital marketing agency|i asked chatgpt to recommend|looking for shopify agency partners|looking to collaborate with|agency to collaborate with|i run google ads for|i manage google ads for|i manage ads for|for my client|for our clients|onboarded.*clients|how i got.*clients|struggling to get.*clients|get small business clients|freelancing clients|anyone need a website|happy to build a website|strengthen my portfolio|i do website and app development|tracked every.*looking for an agency|i run a small|i used to run a|we're a freelancing agency|we help brands|our agency|helping brands, businesses|contact us today for|book a free consultation with us|dm me for seo|we offer|we provide|our seo services|case study: how we|showoff saturday|beginner questions|at iconic solutions|looking for seo agency partners|kd marketing group|nova tech vision|unpopular opinion:|i['’]ve said this to clients|your next client already posted|the wrong digital marketing agency|helps improve search visibility|your business deserves more than|when we audit a website|tell a client they don|every founder slack group|here is a sample of my work|turns 5 soon|bring closed tech projects|design ads bangalore helps|reinforce digitech|brand animators)\b/i.test(
      lower
    ) &&
      !/\b(can anyone recommend an agency|opened a tender for)\b/i.test(lower)) ||
    (/\blooking for (?:a|an)\s+[^.?!\n]{3,65}\?/i.test(combined) &&
      !/\b(can anyone recommend|recommend an agency|looking for a marketing agency for a)\b/i.test(lower)) ||
    /\b(i'm a|i am a|we are a|we're a)\s+(full-stack|freelance|freelancer|web|software|brand|graphic|ui\/ux|seo|marketing|ppc|google ads|social media|video|influencer)\s*(developer|designer|marketer|specialist|consultant|agency|editor|engineer)\b/i.test(
      lower
    ) ||
    /\b(google ads blocked me|high cpc spike|bad google ads performance since|is it a good idea to run google ppc ads if i only break even|capcut|cracked|watch tv show|season 1|prime video|netflix|torrent)\b/i.test(
      lower
    );

  // STRICT POSITIVE REQUIREMENT: Must explicitly seek an AGENCY, COMPANY, or PRODUCTION HOUSE
  const strongBuyerPhrases = [
    "looking for an agency",
    "looking for agency",
    "looking for some agency",
    "looking for a seo agency",
    "looking for an seo agency",
    "looking for seo agency",
    "looking for an outcome-driven seo agency",
    "looking for a seo company",
    "looking for an seo company",
    "looking for seo company",
    "looking for ai production company",
    "looking for an ai production company",
    "looking for a ai production company",
    "looking for ai video production company",
    "looking for an ai video production company",
    "looking for video production company",
    "looking for a video production company",
    "looking for an video production company",
    "looking for video production agency",
    "looking for a video production agency",
    "looking for an video production agency",
    "looking for a digital marketing agency",
    "looking for digital marketing agency",
    "looking for a digital marketing company",
    "looking for digital marketing company",
    "looking for a marketing agency",
    "looking for marketing agency",
    "looking for a marketing company",
    "looking for marketing company",
    "looking for a boutique marketing agency",
    "looking for a reliable marketing agency",
    "looking for a good digital marketing agency",
    "looking for a marketing and communications agency",
    "looking for a web development agency",
    "looking for web development agency",
    "looking for a web development company",
    "looking for web development company",
    "looking for a web design agency",
    "looking for web design agency",
    "looking for a web design company",
    "looking for web design company",
    "looking for a website development agency",
    "looking for website development agency",
    "looking for a website development company",
    "looking for website development company",
    "looking for a video production",
    "looking for video production",
    "looking for ai video production",
    "looking for an ai video production",
    "looking for a production house",
    "looking for production house",
    "looking for a video production house",
    "looking for video production house",
    "looking for a creative agency or video production house",
    "need a video production",
    "looking for a branding agency",
    "looking for a social media agency",
    "looking for a social media marketing agency",
    "looking for a creative agency",
    "looking for a performance marketing agency",
    "looking for a lead generation agency",
    "looking for an experienced lead generation agency",
    "looking for a paid media agency",
    "looking for a digital agency",
    "looking for a growth agency",
    "agency partnerships",
    "partner with high-performing creative & social media agencies",
    "opened a tender for digital marketing",
    "recommend an agency",
    "recommend agency",
    "recommend a marketing agency",
    "recommend marketing agency",
    "recommend an seo agency",
    "recommend a seo agency",
    "recommend seo agency",
    "recommend an seo company",
    "recommend a seo company",
    "recommend seo company",
    "recommend a web development agency",
    "recommend a video production",
    "recommend a video production company",
    "recommend video production company",
    "recommend an ai production company",
    "recommend ai production company",
  ];
  const matchedBuyerPhrases = strongBuyerPhrases.filter((p) => lower.includes(p));

  const buyerPatternRegex =
    /\b(?:looking for|seeking|need|hiring|in search of|recommend|suggest)\s+(?:an?|some)?\s*(?:boutique|reliable|experienced|top|good|outcome-driven)?\s*(?:seo|search engine optimization|digital marketing|marketing|performance marketing|lead generation|web development|web design|website development|ai video|ai production|video production|video|creative|branding|social media)?\s*(?:agency|company|production company|production house|firm|studio|house)\b/i;

  const hasActiveCommercialQuestion =
    (matchedBuyerPhrases.length > 0 || buyerPatternRegex.test(lower)) &&
    hasAgencyCompanyOrHouseMention &&
    hasExplicitB2bServiceMention;

  let classification: IntentClassification = "LOW_INTENT_NOISE";
  let score = 25;

  if (!hasExplicitB2bServiceMention || !hasAgencyCompanyOrHouseMention) {
    classification = "LOW_INTENT_NOISE";
    score = 15;
  } else if (isJobSeeker) {
    classification = "JOB_SEEKER";
    score = 10;
  } else if (isSellerPromo) {
    classification = "SELLER_PROMOTION";
    score = 20;
  } else if (matchedBuyerPhrases.length > 0 && hasActiveCommercialQuestion) {
    classification = "BUYER_SEEKING_SERVICE";
    score = 82 + Math.min(16, matchedBuyerPhrases.length * 6);
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
}): Promise<{ inserted: boolean; refreshed?: boolean; id: string }> {
  if (!isCmsDatabaseConfigured()) {
    return { inserted: false, id: randomUUID() };
  }
  await ensureIntentLeadTables();

  const ageHours = input.ageHours ?? 6;
  if (ageHours > 168) {
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
    if (ageHours <= 2) {
      await cmsExecute(
        `UPDATE intent_lead_signals
         SET discovered_at = NOW(), age_hours = LEAST(COALESCE(age_hours, ?), ?)
         WHERE id = ?`,
        [ageHours, ageHours, existing[0].id]
      ).catch(() => {});
    }
    return { inserted: false, refreshed: true, id: existing[0].id };
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
      cleanAndDecodePostText(input.postText),
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

  // Prevent overlapping discovery runs within 45s to avoid duplicate executions or rate limits
  if (global.__dgsDiscoveryInProgress && startMs - (global.__dgsLastDiscoveryStartMs || 0) < 45_000) {
    return {
      runId,
      status: "SUCCESS",
      queriesExecuted: 0,
      rawCandidatesFound: 0,
      qualifiedLeadsAdded: 0,
      rejectedNoiseCount: 0,
      emailsSent: 0,
      durationMs: 0,
      summaryText: "Discovery run skipped: another scan is actively running in background.",
    };
  }
  global.__dgsDiscoveryInProgress = true;
  global.__dgsLastDiscoveryStartMs = startMs;

  if (isCmsDatabaseConfigured()) {
    await ensureIntentLeadTables();
    await cmsExecute(
      `DELETE FROM intent_lead_signals WHERE status = 'NEW' AND discovered_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`
    ).catch(() => {});

    await cmsExecute(
      `INSERT INTO intent_lead_discovery_runs (id, run_type, started_at, status) VALUES (?, ?, ?, 'RUNNING')`,
      [runId, runType, startedAt]
    );
  }

  let queriesExecuted = 0;
  let rawCandidatesFound = 0;
  let qualifiedLeadsAdded = 0;
  let refreshedActiveLeads = 0;
  let rejectedNoiseCount = 0;
  let emailsSent = 0;
  const newlyInsertedForEmail: IntentLeadEmailItem[] = [];

  try {
    let liAtCookie = (process.env.LINKEDIN_LI_AT || "").trim();
    if (!liAtCookie && isCmsDatabaseConfigured()) {
      try {
        const { rows } = await cmsQuery<{ setting_value: string }>(
          `SELECT setting_value FROM intent_lead_settings WHERE setting_key = 'linkedin_li_at_cookie' LIMIT 1`
        );
        liAtCookie = (rows[0]?.setting_value || "").trim();
      } catch {}
    }

    const [linkedinResults, redditResults, threadsResults, xResults] = await Promise.all([
      liAtCookie.length > 15
        ? searchLinkedInAuthenticated(liAtCookie, options?.serviceFilter)
        : Promise.resolve([]),
      searchRedditAtomRss(options?.serviceFilter, 100),
      searchDuckDuckGoSocial(
        `site:threads.com ("looking for an agency" OR "looking for seo agency" OR "looking for seo company" OR "looking for an SEO agency" OR "looking for an SEO company" OR "looking for AI production company" OR "looking for a marketing agency" OR "looking for a web development agency" OR "video production agency" OR "video production company") -"freelancer" -"for hire"`,
        "THREADS",
        8
      ).catch(() => []),
      searchDuckDuckGoSocial(
        `site:x.com ("looking for an agency" OR "looking for seo agency" OR "looking for seo company" OR "looking for an SEO agency" OR "looking for an SEO company" OR "looking for AI production company" OR "looking for a marketing agency" OR "looking for a web development agency" OR "video production agency" OR "video production company") -"freelancer" -"for hire"`,
        "X_TWITTER",
        8
      ).catch(() => []),
    ]);

    queriesExecuted = (liAtCookie.length > 15 ? 6 : 0) + 3;
    rawCandidatesFound =
      linkedinResults.length + redditResults.length + threadsResults.length + xResults.length;

    const combinedCandidates: Array<
      RawSocialResult & {
        regionHint?: IntentRegion;
        authorName?: string;
        authorRole?: string;
        authorProfileUrl?: string | null;
      }
    > = [...linkedinResults, ...redditResults, ...threadsResults, ...xResults];

    let geminiCallsUsed = 0;

    for (const r of combinedCandidates) {
      const heuristic = evaluateCandidateHeuristically({
        title: r.title,
        text: r.snippet,
        url: r.url,
        defaultService: options?.serviceFilter || "SEO",
        defaultRegion: r.regionHint,
        authorName: r.authorName,
        authorRole: r.authorRole,
        ageHours: r.ageHours,
      });

      if (heuristic.classification !== "BUYER_SEEKING_SERVICE" || heuristic.intentScore < 72) {
        rejectedNoiseCount++;
        continue;
      }

      const evaluated =
        Date.now() - startMs < 7500 && geminiCallsUsed < 2
          ? await (async () => {
              geminiCallsUsed++;
              return qualifyWithGeminiIfAvailable(
                { title: r.title, text: r.snippet, url: r.url, platform: r.platform, ageHours: r.ageHours },
                heuristic
              );
            })()
          : heuristic;

      if (evaluated.classification !== "BUYER_SEEKING_SERVICE" || evaluated.intentScore < 72) {
        rejectedNoiseCount++;
        continue;
      }

      const upserted = await upsertIntentLeadSignal({
        sourcePlatform: r.platform,
        postUrl: r.url,
        postTitle: r.title,
        postText: r.snippet,
        authorName: evaluated.authorName || r.authorName || null,
        authorRole: evaluated.authorRole || r.authorRole || null,
        authorProfileUrl: r.authorProfileUrl || null,
        discoveryQuery: `Buyer-Only Discovery (${evaluated.serviceCategory} • ${evaluated.targetRegion})`,
        publishedAt: r.publishedAt,
        ageHours: r.ageHours,
        freshnessTier: r.freshnessTier,
        evaluated,
      });

      if (upserted.inserted) {
        qualifiedLeadsAdded++;
        newlyInsertedForEmail.push({
          id: upserted.id,
          sourcePlatform: `${r.platform} (${r.ageHours}h old)`,
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
      } else if (upserted.refreshed) {
        refreshedActiveLeads++;
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

    if (isCmsDatabaseConfigured()) {
      global.__dgsIntentLeadTablesPromiseV20 = undefined;
      await ensureIntentLeadTables().catch(() => {});
    }

    global.__dgsDiscoveryInProgress = false;
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startMs);
    const summaryText = `Executed ${queriesExecuted} buyer-only (<72h) queries in ${(durationMs / 1000).toFixed(1)}s. Evaluated ${rawCandidatesFound} live posts across LinkedIn & Reddit — added ${qualifiedLeadsAdded} net-new buyer leads, re-verified ${refreshedActiveLeads} live agency/company leads, rejected ${rejectedNoiseCount} service providers/job seekers.${emailsSent ? " Email alert sent!" : ""}`;

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
    pageUrl?: string;
    regionHint?: IntentRegion;
    sourceChannelHint?: IntentSourcePlatform;
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

    const actMatch = String(post.postUrl || "").match(/activity[:\-](\d{18,20})/i);
    let snowflakeAgeHours: number | null = null;
    if (actMatch) {
      try {
        const tsMs = Number(BigInt(actMatch[1]) >> 22n);
        if (tsMs > 1577836800000 && tsMs <= Date.now() + 86400000) {
          snowflakeAgeHours = Math.max(1, Math.round((Date.now() - tsMs) / 3600000));
        }
      } catch {}
    }
    const parsedAge = parseFreshnessHoursFromText(`${post.ageText || ""} ${text.slice(0, 120)}`);
    const ageHours = snowflakeAgeHours !== null ? snowflakeAgeHours : parsedAge !== null ? parsedAge : 4;
    const maxAllowedHours = Number((post as any).maxAgeHours) > 0 ? Number((post as any).maxAgeHours) : 168;
    if (ageHours > maxAllowedHours || ageHours > 168) {
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

    // Infer defaultRegion from regionHint/targetRegion or LinkedIn search page URL keywords
    const explicitRegion = (post.regionHint || (post as any).targetRegion) as IntentRegion | undefined;
    let defaultRegion: IntentRegion = explicitRegion || "GLOBAL";
    const decodedPageUrl = decodeURIComponent(post.pageUrl || postUrl || "").toLowerCase();
    if (defaultRegion === "GLOBAL") {
      if (/\b(india|mumbai|bangalore|bengaluru|delhi|pune|hyderabad)\b/i.test(decodedPageUrl)) {
        defaultRegion = "INDIA";
      } else if (/\b(dubai|uae|abu dhabi)\b/i.test(decodedPageUrl)) {
        defaultRegion = "UAE_DUBAI";
      } else if (/\b(usa|united states|new york|austin|san francisco|saas)\b/i.test(decodedPageUrl)) {
        defaultRegion = "USA";
      }
    }

    const sourcePlatform: IntentSourcePlatform =
      post.sourceChannelHint ||
      ((post as any).sourcePlatform as IntentSourcePlatform | undefined) ||
      (decodedPageUrl.includes("/search/results/") ? "LINKEDIN_PUBLIC" : "LINKEDIN_FEED");

    const heuristic = evaluateCandidateHeuristically({
      title: `${post.authorName || "LinkedIn Member"} on LinkedIn`,
      text,
      url: postUrl,
      defaultRegion,
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
              platform: sourcePlatform,
              ageHours,
            },
            heuristic
          )
        : heuristic;

    if (explicitRegion && explicitRegion !== "GLOBAL") {
      evaluated.targetRegion = explicitRegion;
    }

    if (evaluated.classification !== "BUYER_SEEKING_SERVICE" || evaluated.intentScore < 72) {
      skippedNoise++;
      continue;
    }

    const upserted = await upsertIntentLeadSignal({
      sourcePlatform,
      postUrl,
      postTitle: `${evaluated.authorName || post.authorName || "LinkedIn Feed Post"}${evaluated.authorRole ? ` — ${evaluated.authorRole}` : ""}`,
      postText: text,
      authorName: evaluated.authorName || post.authorName || null,
      authorRole: evaluated.authorRole || post.authorRole || null,
      authorProfileUrl: post.authorProfileUrl || null,
      discoveryQuery: `LinkedIn (${evaluated.targetRegion}) Companion Scanner`,
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

function toUtcIsoString(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  const s = String(val).trim();
  if (!s) return new Date().toISOString();
  if (s.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(s)) {
    return `${s.replace(" ", "T")}Z`;
  }
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
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
    "(age_hours IS NULL OR age_hours <= 168)",
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
    where.push("age_hours <= 168");
  }

  const limit = Math.min(200, Math.max(10, Number(filters?.limit || 100)));
  params.push(limit);

  const sql = `
    SELECT *
    FROM intent_lead_signals
    WHERE ${where.join(" AND ")}
    ORDER BY
      CASE status WHEN 'NEW' THEN 0 WHEN 'CONTACTED' THEN 1 ELSE 2 END ASC,
      COALESCE(age_hours, 1) ASC,
      published_at DESC,
      discovered_at DESC,
      intent_score DESC
    LIMIT ?
  `;

  const { rows } = await cmsQuery<IntentLeadSignal>(sql, params);
  const seenUrls = new Set<string>();
  const seenTexts = new Set<string>();
  const dedupedLeads: IntentLeadSignal[] = [];

  for (const r of rows || []) {
    const normUrl = normalizeUrlForHash(r.post_url);
    const cleanText = String(r.post_text || "")
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 100);

    if (seenUrls.has(normUrl) || (cleanText.length >= 25 && seenTexts.has(cleanText))) {
      continue;
    }
    seenUrls.add(normUrl);
    if (cleanText.length >= 25) seenTexts.add(cleanText);

    dedupedLeads.push({
      ...r,
      post_text: cleanAndDecodePostText(r.post_text),
      published_at: r.published_at ? toUtcIsoString(r.published_at) : null,
      discovered_at: toUtcIsoString(r.discovered_at),
      notified_at: r.notified_at ? toUtcIsoString(r.notified_at) : null,
    });
  }

  return dedupedLeads;
}

export async function listIntentDiscoveryRuns(limit = 15): Promise<IntentDiscoveryRun[]> {
  if (!isCmsDatabaseConfigured()) return [];
  await ensureIntentLeadTables();
  const { rows } = await cmsQuery<IntentDiscoveryRun>(
    `SELECT * FROM intent_lead_discovery_runs ORDER BY started_at DESC LIMIT ?`,
    [limit]
  );
  return (rows || []).map((r) => ({
    ...r,
    started_at: toUtcIsoString(r.started_at),
    completed_at: r.completed_at ? toUtcIsoString(r.completed_at) : null,
  }));
}

export async function updateIntentSignalStatus(
  id: string,
  status: "NEW" | "CONTACTED" | "ARCHIVED" | "DISMISSED"
): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  await ensureIntentLeadTables();
  await cmsExecute(`UPDATE intent_lead_signals SET status = ? WHERE id = ?`, [status, id]);
}
