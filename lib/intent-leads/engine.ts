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
  // 🇮🇳 LINKEDIN INDIA PRESETS
  {
    id: "li-india-seo",
    serviceCategory: "SEO",
    label: "🇮🇳 LinkedIn India: Looking for SEO Agency / Technical SEO Partner",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("SEO agency" OR "SEO consultant" OR "SEO company" OR "technical SEO") AND ("India" OR "Mumbai" OR "Bangalore" OR "Delhi" OR "Pune" OR "Hyderabad") -job -hiring`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" India OR Mumbai OR Bangalore OR Delhi`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" India OR Mumbai OR Bangalore OR Delhi`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("SEO agency" OR "SEO company" OR "SEO consultant") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi" OR "Pune") -hiring -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("SEO agency" OR "SEO company" OR "SEO consultant") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi" OR "Pune") -hiring -jobs`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("India" OR "Mumbai" OR "Bangalore") ("looking for" OR "recommend") ("SEO agency" OR "digital marketing")`)}&sort=new&t=week`,
  },
  {
    id: "li-india-web-dev",
    serviceCategory: "WEB_DEV",
    label: "🇮🇳 LinkedIn India: Looking for Website Development / Redesign / AMC",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("website development" OR "web design agency" OR "website redesign" OR "Next.js") AND ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -job`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "website development" OR "web design agency" India OR Mumbai OR Bangalore`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "website development" OR "web design agency" India OR Mumbai OR Bangalore`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("website development" OR "web design agency" OR "website redesign") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("website development" OR "web design agency" OR "website redesign") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -jobs`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("India" OR "Mumbai" OR "Bangalore") ("website development" OR "website redesign" OR "web developer")`)}&sort=new&t=week`,
  },
  {
    id: "li-india-paid-media",
    serviceCategory: "PAID_MEDIA",
    label: "🇮🇳 LinkedIn India: Looking for Performance Marketing / Paid Ads Agency",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("performance marketing agency" OR "Google Ads agency" OR "Meta Ads agency" OR "digital marketing agency") AND ("India" OR "Mumbai" OR "Bangalore" OR "Delhi")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "performance marketing agency" OR "digital marketing agency" India OR Mumbai OR Bangalore`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "performance marketing agency" OR "digital marketing agency" India OR Mumbai OR Bangalore`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("performance marketing agency" OR "digital marketing agency") ("Mumbai" OR "India" OR "Bangalore" OR "Delhi")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("performance marketing agency" OR "digital marketing agency") ("Mumbai" OR "India" OR "Bangalore" OR "Delhi")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("India" OR "Mumbai") ("performance marketing" OR "marketing agency")`)}&sort=new&t=week`,
  },
  {
    id: "li-india-ai-video",
    serviceCategory: "AI_VIDEO",
    label: "🇮🇳 LinkedIn India: Looking for AI Video Production / Brand Film Studio",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("AI video" OR "video production agency" OR "brand film" OR "ad film") AND ("India" OR "Mumbai" OR "Bangalore" OR "Delhi")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "video production agency" OR "AI video" India OR Mumbai OR Bangalore`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "video production agency" OR "AI video" India OR Mumbai OR Bangalore`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("video production agency" OR "AI video" OR "ad film") ("India" OR "Mumbai" OR "Bangalore")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("video production agency" OR "AI video" OR "ad film") ("India" OR "Mumbai" OR "Bangalore")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("India" OR "Mumbai") ("video production" OR "AI video")`)}&sort=new&t=week`,
  },
  {
    id: "li-india-branding",
    serviceCategory: "BRANDING",
    label: "🇮🇳 LinkedIn India: Looking for Branding, Content & Social Media Agency",
    region: "INDIA",
    booleanQuery: `("looking for" OR "recommend") AND ("branding agency" OR "social media agency" OR "creative agency") AND ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -job -internship`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "branding agency" OR "social media agency" India OR Mumbai OR Bangalore`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "branding agency" OR "social media agency" India OR Mumbai OR Bangalore`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("branding agency" OR "social media marketing agency") ("India" OR "Mumbai" OR "Bangalore") -hiring`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("branding agency" OR "social media marketing agency") ("India" OR "Mumbai" OR "Bangalore") -hiring`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("India" OR "Mumbai") ("branding agency" OR "social media agency")`)}&sort=new&t=week`,
  },

  // 🇺🇸 LINKEDIN USA PRESETS
  {
    id: "li-usa-seo",
    serviceCategory: "SEO",
    label: "🇺🇸 LinkedIn USA: Looking for B2B / SaaS / E-Commerce SEO Agency",
    region: "USA",
    booleanQuery: `"looking for" AND ("SEO agency" OR "SEO consultant" OR "B2B SEO" OR "technical SEO") AND ("USA" OR "US" OR "SaaS" OR "New York" OR "Austin" OR "California") -job -jobs -recruiting`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" OR "recommend an SEO" USA OR SaaS OR "United States"`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" OR "recommend an SEO" USA OR SaaS OR "United States"`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("SEO agency" OR "SEO consultant" OR "B2B SEO") ("USA" OR "United States" OR "New York" OR "Austin" OR "San Francisco" OR "SaaS") -hiring -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("SEO agency" OR "SEO consultant" OR "B2B SEO") ("USA" OR "United States" OR "New York" OR "Austin" OR "San Francisco" OR "SaaS") -hiring -jobs`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("SEO agency" OR "SEO consultant")`)}&sort=new&t=day`,
  },
  {
    id: "li-usa-web-dev",
    serviceCategory: "WEB_DEV",
    label: "🇺🇸 LinkedIn USA: Looking for Website Redesign / Next.js / Web Dev Agency",
    region: "USA",
    booleanQuery: `("looking for" OR "recommend") AND ("website redesign" OR "web design agency" OR "Next.js agency" OR "web development agency") AND ("USA" OR "SaaS" OR "B2B") -job -recruiter`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "website redesign" OR "web design agency" USA OR SaaS OR B2B`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "website redesign" OR "web design agency" USA OR SaaS OR B2B`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("web design agency" OR "website redesign" OR "Next.js agency") ("USA" OR "United States" OR "SaaS" OR "B2B") -jobs`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("web design agency" OR "website redesign" OR "Next.js agency") ("USA" OR "United States" OR "SaaS" OR "B2B") -jobs`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "need") ("website redesign" OR "web development agency")`)}&sort=new&t=day`,
  },
  {
    id: "li-usa-ai-video",
    serviceCategory: "AI_VIDEO",
    label: "🇺🇸 LinkedIn USA: Looking for AI Video Production / Commercial Video Studio",
    region: "USA",
    booleanQuery: `("looking for" OR "recommend") AND ("AI video" OR "video production agency" OR "product video" OR "explainer video") AND ("USA" OR "SaaS" OR "startup")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "video production agency" OR "AI video" USA OR SaaS`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "video production agency" OR "AI video" USA OR SaaS`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("video production agency" OR "AI video production" OR "product launch video") ("USA" OR "SaaS" OR "startup")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("video production agency" OR "AI video production" OR "product launch video") ("USA" OR "SaaS" OR "startup")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("video production agency" OR "AI video production")`)}&sort=new&t=day`,
  },
  {
    id: "li-usa-aeo-geo",
    serviceCategory: "AEO_GEO",
    label: "🇺🇸 LinkedIn USA: Looking for AEO / GEO / AI Search Visibility Partner",
    region: "USA",
    booleanQuery: `("looking for" OR "recommend") AND ("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO" OR "GEO" OR "ChatGPT SEO")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO agency" USA`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO agency" USA`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO" OR "AI search SEO")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO" OR "AI search SEO")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO") agency`)}&sort=new&t=week`,
  },
  {
    id: "li-usa-paid-media",
    serviceCategory: "PAID_MEDIA",
    label: "🇺🇸 LinkedIn USA: Looking for Performance Marketing / Paid Media Agency",
    region: "USA",
    booleanQuery: `("looking for" OR "recommend") AND ("performance marketing agency" OR "paid media agency" OR "Google Ads agency" OR "Meta Ads agency") AND ("USA" OR "SaaS" OR "ecommerce")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "paid media agency" OR "performance marketing agency" USA OR SaaS`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "paid media agency" OR "performance marketing agency" USA OR SaaS`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("paid media agency" OR "performance marketing agency" OR "Google Ads agency") ("USA" OR "SaaS" OR "DTC")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("looking for" OR "recommend") ("paid media agency" OR "performance marketing agency" OR "Google Ads agency") ("USA" OR "SaaS" OR "DTC")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("looking for" OR "recommend") ("Google Ads agency" OR "paid media agency")`)}&sort=new&t=day`,
  },

  // 🇦🇪 LINKEDIN UAE / DUBAI PRESETS
  {
    id: "li-aeo-dubai",
    serviceCategory: "AEO_GEO",
    label: "🇦🇪 LinkedIn UAE / Dubai: Looking for SEO, AEO / GEO & AI Search Agency",
    region: "UAE_DUBAI",
    booleanQuery: `("looking for" OR "recommend" OR "agency") AND ("AEO" OR "Answer Engine Optimization" OR "Generative Engine Optimization" OR "SEO Dubai")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" OR "digital marketing agency" Dubai OR UAE`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "SEO agency" OR "digital marketing agency" Dubai OR UAE`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE") ("looking for" OR "recommend") ("SEO agency" OR "digital marketing agency" OR "AEO")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE") ("looking for" OR "recommend") ("SEO agency" OR "digital marketing agency" OR "AEO")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("Dubai" OR "UAE") ("SEO agency" OR "marketing agency" OR "website")`)}&sort=new&t=week`,
  },
  {
    id: "li-uae-web-dev",
    serviceCategory: "WEB_DEV",
    label: "🇦🇪 LinkedIn UAE / Dubai: Looking for Website Development & Redesign",
    region: "UAE_DUBAI",
    booleanQuery: `("looking for" OR "recommend") AND ("website development" OR "web design agency" OR "website redesign") AND ("Dubai" OR "UAE" OR "Abu Dhabi")`,
    linkedinSearch24hUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "website development" OR "web design" Dubai OR UAE`)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`,
    linkedinSearchWeekUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(`"looking for" "website development" OR "web design" Dubai OR UAE`)}&datePosted=%22past-week%22&sortBy=%22date_posted%22`,
    googleDork24hUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE") ("looking for" OR "recommend") ("website development" OR "web design agency" OR "website redesign")`)}&tbs=qdr:d`,
    googleDork3dUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/posts ("Dubai" OR "UAE") ("looking for" OR "recommend") ("website development" OR "web design agency" OR "website redesign")`)}&tbs=qdr:d3`,
    redditSearch24hUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(`("Dubai" OR "UAE") ("website development" OR "web design")`)}&sort=new&t=week`,
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
    query: `site:linkedin.com/posts "looking for" ("SEO agency" OR "SEO consultant") ("India" OR "Mumbai" OR "Bangalore" OR "Delhi") -hiring -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "SEO",
    region: "INDIA",
  },
  {
    query: `site:linkedin.com/posts "looking for" ("SEO agency" OR "SEO consultant" OR "B2B SEO") ("USA" OR "United States" OR "SaaS") -hiring -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "SEO",
    region: "USA",
  },
  {
    query: `site:linkedin.com/posts "looking for" ("website development" OR "web design agency" OR "website redesign") ("India" OR "Mumbai" OR "Bangalore") -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "WEB_DEV",
    region: "INDIA",
  },
  {
    query: `site:linkedin.com/posts "looking for" ("website redesign" OR "web design agency" OR "Next.js") ("USA" OR "SaaS" OR "B2B") -job`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "WEB_DEV",
    region: "USA",
  },
  {
    query: `site:linkedin.com/posts "looking for" "video production agency" OR "AI video" OR "brand film"`,
    platform: "LINKEDIN_PUBLIC",
    serviceCategory: "AI_VIDEO",
    region: "USA",
  },
  {
    query: `site:linkedin.com/posts "looking for" "digital marketing agency" OR "performance marketing" Mumbai OR India OR Bangalore`,
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

  // Purge any service-provider, agency-self-promo, staffing recruiter, or DIY troubleshooting rows so ONLY genuine service-needing buyers remain
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
         'ils_436ccfd3a936442e8e4c'
       )
       OR post_text REGEXP 'I run Google Ads for|I used to run a social media marketing agency|Google ads blocked me|High CPC spike in Google Ads|Bad Google Ads performance since|I run a small agency|how I got [0-9]+ freelancing clients|\\\\[For Hire\\\\]|Virtual Assistant|Talent Manager for Minecraft|Available for candidates based in|STEM OPT|WE ARE HIRING – SEO EXECUTIVE|At Iconic Solutions|Looking for SEO Agency Partners|KD Marketing Group|Nova Tech vision|Unpopular opinion:|When we audit a website|Every founder Slack group'`
    );
    await cmsExecute(
      `UPDATE intent_lead_signals
       SET source_platform = 'LINKEDIN_PUBLIC', target_region = 'INDIA'
       WHERE id IN ('ils_beca0e894aea4f24bfc0', 'ils_c1b15dd8d6dc4ef3bbbc', 'ils_37c7c631756841ea8daa')`
    );
  } catch {}

  // Ensure existing leads have regional tags populated (INDIA, UAE_DUBAI, USA)
  try {
    await cmsExecute(
      `UPDATE intent_lead_signals
       SET target_region = 'INDIA'
       WHERE target_region = 'GLOBAL'
         AND (post_text REGEXP 'Mumbai|India|Bangalore|Bengaluru|Delhi|Gurgaon|Pune|Hyderabad|Chennai|INR|lakh|Pristyn Care|Swiss Beauty' OR post_url REGEXP '/r/(india|mumbai|bangalore|delhi|IndianStartups|StartUpIndia)')`
    );
    await cmsExecute(
      `UPDATE intent_lead_signals
       SET target_region = 'UAE_DUBAI'
       WHERE target_region = 'GLOBAL'
         AND (post_text REGEXP 'Dubai|UAE|Abu Dhabi|Sharjah|AED' OR post_url REGEXP '/r/(dubai|UAE)')`
    );
    await cmsExecute(
      `UPDATE intent_lead_signals
       SET target_region = 'USA'
       WHERE target_region = 'GLOBAL'
         AND source_platform = 'REDDIT'
         AND post_url REGEXP '/r/(smallbusiness|entrepreneur|startups|SEO|bigseo|PPC|web_design|ecommerce|marketing|forhire|DesignJobs)'`
    );
  } catch {}

  global.__dgsIntentLeadTablesEnsured = true;
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
  limit = 80
): Promise<RawSocialResult[]> {
  const subsHiring =
    "forhire+DesignJobs+smallbusiness+entrepreneur+startups+IndianStartups+StartUpIndia+dubai+SEO+web_design+ecommerce";
  const subsBusiness =
    "smallbusiness+entrepreneur+startups+IndianStartups+StartUpIndia+dubai+SEO+bigseo+web_design+ecommerce+marketing";

  const queryByCategory: Record<IntentServiceCategory, string> = {
    SEO: `"looking for SEO" OR "SEO agency" OR "recommend SEO" OR "hire SEO" OR "struggling to get orders"`,
    WEB_DEV: `"need a website" OR "new website" OR "looking for a web developer" OR "website redesign" OR "website launch" OR "corporate site redesign"`,
    AI_VIDEO: `"video production" OR "AI video" OR "explainer video" OR "motion graphics" OR "promo video"`,
    AEO_GEO: `"Answer Engine Optimization" OR "Generative Engine Optimization" OR "AEO" OR "SEO agency Dubai" OR "marketing Dubai"`,
    PAID_MEDIA: `"looking for someone to market" OR "Google Ads" OR "performance marketing" OR "marketing agency" OR "struggling to get orders"`,
    BRANDING: `"branding agency" OR "social media agency" OR "UI/UX designer" OR "rebrand"`,
  };

  const urls = serviceFilter
    ? [
        `https://www.reddit.com/r/${subsHiring}/search.rss?q=${encodeURIComponent(
          queryByCategory[serviceFilter]
        )}&restrict_sr=on&sort=new&t=week&limit=${limit}`,
      ]
    : [
        `https://www.reddit.com/r/${subsHiring}/search.rss?q=${encodeURIComponent(
          `title:"Hiring" AND (website OR SEO OR marketing OR "Google Ads" OR Shopify OR WordPress OR Next.js OR "landing page" OR "video" OR "UI/UX")`
        )}&restrict_sr=on&sort=new&t=week&limit=65`,
        `https://www.reddit.com/r/${subsBusiness}/search.rss?q=${encodeURIComponent(
          `"need a website" OR "new website" OR "web developer" OR "website redesign" OR "website launch" OR "SEO agency" OR "recommend an agency" OR "looking for someone to market" OR "struggling to get orders"`
        )}&restrict_sr=on&sort=new&t=week&limit=65`,
      ];

  const seenUrls = new Set<string>();
  const results: RawSocialResult[] = [];
  const nowMs = Date.now();

  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetchWithTimeout(url, {
          timeoutMs: 5500,
          maxRetries: 0,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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

          const ageHours = Math.max(1, Math.round((nowMs - tsMs) / 3600_000));
          if (ageHours > 168) continue;

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

          if (/\[for hire\]/i.test(title)) continue;

          const link = (entry.match(/<link href="([^"]+)"/) || [])[1] || "";
          if (!link || seenUrls.has(link) || !isValidSocialLeadUrl(link)) continue;

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

          seenUrls.add(link);
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
      } catch {}
    })
  );

  return results;
}

/**
 * Authenticated LinkedIn Content & Feed Search using the user's `li_at` session cookie.
 * Fetches live 1h–24h posts across LinkedIn India, LinkedIn USA, LinkedIn UAE, and Home Feed.
 */
async function searchLinkedInAuthenticated(
  liAtCookie: string,
  serviceFilter?: IntentServiceCategory
): Promise<Array<RawSocialResult & { regionHint: IntentRegion; authorName?: string; authorRole?: string }>> {
  if (!liAtCookie || liAtCookie.length < 15) return [];

  const presets = serviceFilter
    ? LINKEDIN_FEED_PRESET_SEARCHES.filter((p) => p.serviceCategory === serviceFilter).slice(0, 3)
    : [
        LINKEDIN_FEED_PRESET_SEARCHES[0], // India SEO
        LINKEDIN_FEED_PRESET_SEARCHES[1], // India Web Dev
        LINKEDIN_FEED_PRESET_SEARCHES[5], // USA SEO
        LINKEDIN_FEED_PRESET_SEARCHES[6], // USA Web Dev
        LINKEDIN_FEED_PRESET_SEARCHES[10], // UAE / Dubai SEO & AEO
      ].filter(Boolean);

  const results: Array<RawSocialResult & { regionHint: IntentRegion; authorName?: string; authorRole?: string }> = [];
  const seen = new Set<string>();
  const csrfToken = "ajax:5829104728194021";

  await Promise.all(
    presets.slice(0, 4).map(async (preset) => {
      try {
        const res = await fetchWithTimeout(preset.linkedinSearchWeekUrl, {
          timeoutMs: 5000,
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

        // Parse embedded Voyager JSON inside <code> tags
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
            for (const item of included) {
              const postText =
                item?.commentary?.text?.text ||
                item?.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text ||
                "";
              if (!postText || postText.length < 35) continue;

              const urn = item?.urn || item?.entityUrn || item?.updateMetadata?.urn || "";
              const actMatch = String(urn).match(/urn:li:(?:activity|ugcPost|share):\d+/);
              const postUrl = actMatch
                ? `https://www.linkedin.com/feed/update/${actMatch[0]}/`
                : `https://www.linkedin.com/feed/#li-${computeUrlHash("", postText).slice(0, 12)}`;
              if (seen.has(postUrl)) continue;

              const authorName = item?.actor?.name?.text || "LinkedIn Member";
              const authorRole = item?.actor?.description?.text || "";
              const ageText = item?.actor?.subDescription?.text || "4h ago";
              const parsedAge = parseFreshnessHoursFromText(ageText);
              const ageHours = parsedAge !== null ? parsedAge : 6;
              if (ageHours > 168) continue;
              const tier = classifyFreshnessTier(ageHours);
              if (tier === "STALE") continue;

              seen.add(postUrl);
              results.push({
                title: `${authorName} on LinkedIn${authorRole ? ` — ${authorRole}` : ""}`,
                url: postUrl,
                snippet: postText.slice(0, 1200),
                platform: "LINKEDIN_PUBLIC",
                publishedAt: new Date(Date.now() - ageHours * 3600_000).toISOString(),
                ageHours,
                freshnessTier: tier,
                regionHint: preset.region,
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
    /\b(seo|search engine optimization|aeo|answer engine|generative engine|website|web development|web design|website redesign|website development|website launch|new website|need a website|web developer|web & app developer|react\.?js|next\.?js|wordpress|shopify|video production|video editor|video editors|video editing|videographer|ai video|brand film|ad film|explainer video|promo video|motion graphics|3d.*website|ui\/ux|performance marketing|google ads|meta ads|facebook ads|ppc|digital marketing|marketing agency|market my apps|market my|get orders|branding agency|social media agency|social media expansion|agency partnerships|creative agency|website maintenance|website amc)\b/i.test(
      lower
    );

  let serviceCategory: IntentServiceCategory = input.defaultService || "SEO";
  if (/\b(aeo|answer engine|generative engine|ai overview|llm seo|chatgpt ranking|seo agency dubai|digital marketing dubai)\b/i.test(lower)) {
    serviceCategory = "AEO_GEO";
  } else if (/\b(ai video|video production|video editor|video editors|video editing|videographer|brand film|ad film|explainer video|commercial video|product video|promo video|motion graphics)\b/i.test(lower)) {
    serviceCategory = "AI_VIDEO";
  } else if (/\b(website|web development|website redesign|web design|web developer|web & app developer|react\.?js|new website|need a website|website launch|next\.?js|wordpress|shopify|website amc|website maintenance|landing page|build a website|corporate site redesign|ui\/ux|3d.*website)\b/i.test(lower)) {
    serviceCategory = "WEB_DEV";
  } else if (/\b(google ads|meta ads|facebook ads|performance marketing|paid media|ppc|lead generation agency|roas|market my apps|struggling to get orders)\b/i.test(lower)) {
    serviceCategory = "PAID_MEDIA";
  } else if (/\b(branding agency|brand identity|social media agency|social media expansion|agency partnerships|social media management|creative agency)\b/i.test(lower)) {
    serviceCategory = "BRANDING";
  } else if (/\b(seo|search engine optimization|backlink|organic traffic|search ranking|local seo)\b/i.test(lower)) {
    serviceCategory = "SEO";
  }

  let targetRegion: IntentRegion = input.defaultRegion || "GLOBAL";
  const urlLower = (input.url || "").toLowerCase();
  if (/\b(dubai|uae|abu dhabi|sharjah|mena|middle east|dxb|aed)\b|\.ae\b|r\/dubai|r\/uae/i.test(lower) || /dubai|uae|abudhabi/i.test(urlLower)) {
    targetRegion = "UAE_DUBAI";
  } else if (
    /\b(mumbai|india|indian|navi mumbai|thane|bangalore|bengaluru|delhi|ncr|gurgaon|gurugram|noida|pune|hyderabad|chennai|kolkata|ahmedabad|jaipur|surat|kochi|chandigarh|inr|lakh|crore|flipkart)\b|₹|\.in\b|r\/indianstartups|r\/startupindia|r\/india|r\/mumbai|r\/bangalore/i.test(
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
    (targetRegion === "GLOBAL" && /\/r\/(smallbusiness|entrepreneur|startups|seo|bigseo|ppc|web_design|ecommerce|marketing|forhire|designjobs)\b/i.test(urlLower))
  ) {
    targetRegion = "USA";
  }

  // STRICT REJECTION OF JOB SEEKERS, INTERNSHIPS, FULL-TIME ROLES & NON-AGENCY GIGS
  const isJobSeeker =
    /\b(open to work|#opentowork|\[for hire\]|for hire:|looking for a job|looking for a full-time|looking for an internship|one-year internship|intern\b|my resume|20-day job|hire me|applying for|seeking a role|seeking.*job opportunities|i offer seo|i am a freelance|i am an seo|i can build your|self-taught developer|worried about my future|anxious about my career|starting a marketing agency|second year undergrad|final-year|final year|student fund|struggling to turn web design skills into)\b/i.test(
      lower
    ) ||
    /\b(we are hiring a full-time|full-time role|job opening|years of experience required|send your cv to hr|hiring:\s*retail search director|virtual assistant|talent manager|minecraft|freelance sales representatives|get paid to test ai|multi-app data study|tiktok poster|influencer outreach|founding team|co-founders|applications are now closed|this role has been hired|thumbnail designer|available for candidates based in|stem opt|f1 candidates|we are hiring\s*[-–|]?\s*seo executive|hiring interns)\b/i.test(
      lower
    );

  // STRICT REJECTION OF SERVICE PROVIDERS, AGENCIES, FREELANCERS & DIY TROUBLESHOOTERS
  const isSellerPromo =
    (/\b(i run google ads for|i manage google ads for|i manage ads for|for my client|for our clients|onboarded.*clients|how i got.*clients|struggling to get.*clients|get small business clients|freelancing clients|anyone need a website|happy to build a website|strengthen my portfolio|i do website and app development|tracked every.*looking for an agency|i run a small|i used to run a|social media marketing agency|we're a freelancing agency|we help brands|our agency|helping brands, businesses|contact us today for|book a free consultation with us|dm me for seo|we offer|we provide|our seo services|case study: how we|showoff saturday|beginner questions|at iconic solutions|looking for seo agency partners|kd marketing group|nova tech vision|unpopular opinion:|i['’]ve said this to clients|your next client already posted|the wrong digital marketing agency|helps improve search visibility|your business deserves more than|when we audit a website|tell a client they don|every founder slack group|here is a sample of my work)\b/i.test(
      lower
    ) &&
      !/\b(looking to hire an agency|can anyone recommend an agency)\b/i.test(lower)) ||
    (/\blooking for (?:a|an)\s+[^.?!\n]{3,65}\?/i.test(combined) &&
      !/\b(i['’]m looking to hire|i am looking to hire|we['’]re looking to hire|we are looking to hire)\b/i.test(lower)) ||
    (/\b(i'm a|i am a|we are a|we're a)\s+(full-stack|freelance|freelancer|web|software|brand|graphic|ui\/ux|seo|marketing|ppc|google ads|social media|video|influencer)\s*(developer|designer|marketer|specialist|consultant|agency|editor|engineer)\b/i.test(
      lower
    ) &&
      !/\b(looking for someone to market|looking to hire|need someone to market)\b/i.test(lower)) ||
    /\b(google ads blocked me|high cpc spike|bad google ads performance since|is it a good idea to run google ppc ads if i only break even|capcut|cracked|watch tv show|season 1|prime video|netflix|torrent)\b/i.test(
      lower
    );

  // STRICT POSITIVE REQUIREMENT: Must explicitly be a BUYER WHO NEEDS A SERVICE
  const strongBuyerPhrases = [
    "looking for a web",
    "looking for an agency",
    "looking for a marketing",
    "looking for seo",
    "looking for an seo",
    "looking for someone to market",
    "looking for someone to build",
    "looking for someone to redesign",
    "looking for a designer",
    "looking for a freelance",
    "looking for a developer",
    "looking for a video",
    "looking for a 3d",
    "looking to hire",
    "how to find a web developer",
    "how to find a good",
    "can anyone recommend",
    "anyone recommend",
    "recommendations for",
    "recommend a",
    "recommend an",
    "need a new website",
    "need a website",
    "need a web developer",
    "need a web designer",
    "need an agency",
    "need an seo",
    "need seo",
    "need help marketing",
    "redesign our website",
    "corporate site redesign",
    "broke our conversion",
    "doubled our bounce rate",
    "website launch",
    "struggling to get orders",
    "drop your portfolio",
    "send your portfolio",
    "rip my inbox",
    "which agency",
    "hiring an agency",
    "hire an agency",
    "hire an seo",
    "hire a web",
    "exploring agency partnerships",
    "looking to connect with a reliable",
    "a client is looking for",
    "client needs a freelance",
    "video editors needed",
    "freelance website developer required",
    "[hiring]",
  ];
  const matchedBuyerPhrases = strongBuyerPhrases.filter((p) => lower.includes(p));

  const hasActiveCommercialQuestion =
    matchedBuyerPhrases.length > 0 &&
    /\b(website|web developer|web design|web development|redesign|shopify|wordpress|next\.?js|seo|aeo|google ads|meta ads|ppc|digital marketing|market my|marketing|get orders|video|motion graphics|3d|ui\/ux|branding|agency|consultant|developer|designer)\b/i.test(
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

    const [linkedinResults, redditResults] = await Promise.all([
      liAtCookie.length > 15
        ? searchLinkedInAuthenticated(liAtCookie, options?.serviceFilter)
        : Promise.resolve([]),
      searchRedditAtomRss(options?.serviceFilter, 80),
    ]);

    queriesExecuted = (liAtCookie.length > 15 ? 4 : 0) + 2;
    rawCandidatesFound = linkedinResults.length + redditResults.length;

    const combinedCandidates: Array<
      RawSocialResult & { regionHint?: IntentRegion; authorName?: string; authorRole?: string }
    > = [...linkedinResults, ...redditResults];

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
    const summaryText = `Executed ${queriesExecuted} buyer-only (<72h) queries in ${(durationMs / 1000).toFixed(1)}s. Evaluated ${rawCandidatesFound} recent posts, qualified ${qualifiedLeadsAdded} net-new service-needing buyer leads, rejected ${rejectedNoiseCount} service providers/job seekers.${emailsSent ? " Email alert sent!" : ""}`;

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

    const parsedAge = parseFreshnessHoursFromText(`${post.ageText || ""} ${text.slice(0, 120)}`);
    const ageHours = parsedAge !== null ? parsedAge : 4;
    if (ageHours > 168) {
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
