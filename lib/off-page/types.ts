export type RegionCode = "INDIA" | "UAE" | "USA" | "GLOBAL";

export const MANDATORY_NEXT_ACTIONS = [
  "VERIFY",
  "SUBMIT LISTING",
  "CREATE PROFILE",
  "PITCH ARTICLE",
  "SEND OUTREACH",
  "CONTACT JOURNALIST",
  "REQUEST BACKLINK",
  "RECLAIM LINK",
  "FIX CITATION",
  "FOLLOW UP",
  "CHECK STATUS",
  "MONITOR",
  "NO ACTION",
] as const;

export type MandatoryNextAction = (typeof MANDATORY_NEXT_ACTIONS)[number];

/**
 * Canonical link-type values (V8.12.6). Never guess: if the type was not observed on a
 * live page, the value is UNKNOWN. N/A is for citations where hyperlink status does not apply.
 */
export const LINK_TYPE_VALUES = ["DOFOLLOW", "NOFOLLOW", "UGC", "SPONSORED", "MIXED", "UNKNOWN", "N/A"] as const;
export type LinkTypeStatus = (typeof LINK_TYPE_VALUES)[number];

/** Categories where a hyperlink is not the point of the record (NAP citations). */
export const LINK_NOT_APPLICABLE_CATEGORIES = new Set<string>(["LOCAL_CITATION"]);

/**
 * Normalizes an untrusted link-type input. Unrecognized/empty input -> UNKNOWN (never DOFOLLOW).
 */
export function normalizeLinkType(input: unknown, category?: string): LinkTypeStatus {
  const raw = String(input ?? "").trim().toUpperCase().replace(/[\s_-]+/g, "");
  const map: Record<string, LinkTypeStatus> = {
    DOFOLLOW: "DOFOLLOW",
    FOLLOW: "DOFOLLOW",
    NOFOLLOW: "NOFOLLOW",
    UGC: "UGC",
    SPONSORED: "SPONSORED",
    MIXED: "MIXED",
    UNKNOWN: "UNKNOWN",
    NA: "N/A",
    "N/A": "N/A",
  };
  const v = map[raw] ?? map[String(input ?? "").trim().toUpperCase()];
  if (v) return v;
  if (category && LINK_NOT_APPLICABLE_CATEGORIES.has(category)) return "N/A";
  return "UNKNOWN";
}

/**
 * Derives a verified link type from rel attributes actually observed on a live page.
 * An <a> with no rel attribute is followed by HTML semantics -> DOFOLLOW (this is an observation, not a guess).
 */
export function linkTypeFromObservedRels(rels: string[]): LinkTypeStatus {
  if (rels.length === 0) return "UNKNOWN";
  const types = new Set(
    rels.map((r) => {
      const v = r.toLowerCase();
      if (v.includes("sponsored")) return "SPONSORED";
      if (v.includes("ugc")) return "UGC";
      if (v.includes("nofollow")) return "NOFOLLOW";
      return "DOFOLLOW";
    })
  );
  return types.size > 1 ? "MIXED" : (Array.from(types)[0] as LinkTypeStatus);
}

export type OpportunityCategory =
  | "BUSINESS_LISTING"
  | "LOCAL_CITATION"
  | "AGENCY_DIRECTORY"
  | "ARTICLE_SUBMISSION"
  | "EXPERT_CONTRIBUTION"
  | "DIGITAL_PR"
  | "RESOURCE_PAGE"
  | "PARTNERSHIP"
  | "CLIENT_PARTNER"
  | "BROKEN_LINK"
  | "UNLINKED_MENTION"
  | "GUEST_EXPERT"
  | "PODCAST"
  | "INTERVIEW"
  | "NEWS_SOURCE"
  | "REVIEW_PLATFORM"
  | "COMMUNITY"
  | "Q_AND_A"
  | "EVENT"
  | "ASSOCIATION"
  | "AWARD"
  | "TOOL_DIRECTORY"
  | "CASE_STUDY_DISTRIBUTION"
  | "RESEARCH_CITATION"
  | "OTHER";

export type FreeStatus = "FREE" | "NOT_FREE" | "FREEMIUM" | "UNKNOWN";
export type PriorityTier = "P0" | "P1" | "P2" | "P3" | "REJECT";
export type SpamStatus = "SAFE" | "REVIEW" | "HIGH_RISK" | "REJECT";

export type OpportunityStatus =
  | "DISCOVERED"
  | "VERIFYING"
  | "QUALIFIED"
  | "MANAGER_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "FOLLOW_UP"
  | "LIVE"
  | "MONITORING"
  | "REJECTED"
  | "SNOOZED"
  | "NEW"
  | "APPROVED"
  | "OUTREACH"
  | "VERIFIED"
  | "NOT_FREE"
  | "SPAM"
  | "EXPIRED"
  | "ARCHIVED";

export interface OffPageOpportunity {
  id: string;
  site_name: string;
  domain: string;
  exact_submission_url: string;
  region: RegionCode;
  country: string | null;
  category: OpportunityCategory;
  free_status: FreeStatus;
  free_tier_details: string | null;
  requires_account: boolean;
  requires_editorial_review: boolean;
  submission_type: string;
  recommended_dgs_target_page: string;
  recommended_service: string;
  recommended_content: string | null;
  recommended_anchor_strategy: string;
  link_type: string;
  dofollow_status: LinkTypeStatus;
  estimated_quality: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "REJECT";
  topical_relevance: number; // 0-100
  geo_relevance: number; // 0-100
  traffic_potential: number; // 0-100
  editorial_quality: number; // 0-100
  spam_risk: number; // 0-100
  acceptance_probability: number; // 0-100
  value_score: number; // 0-100
  difficulty_score: number; // 0-100
  priority_score: number; // 0-100
  priority_tier: PriorityTier;
  authority_score: number; // 0-100
  spam_status: SpamStatus;
  verification_date: string | null;
  last_verified: string | null;
  source: string;
  source_type?: string;
  discovery_provider?: string | null;
  discovery_query?: string | null;
  http_status?: number | null;
  verification_status?: string;
  last_verified_at?: string | null;
  status: OpportunityStatus;
  assigned_to: string | null;
  owner?: string | null;
  notes: string | null;
  next_action?: string | null;
  due_date?: string | null;
  internal_note?: string | null;
  rejection_reason?: string | null;
  snoozed_until?: string | null;
  proof_url?: string | null;
  submission_date?: string | null;
  evidence: string | null;
  discovered_at?: string | null;
  qualified_at?: string | null;
  assigned_at?: string | null;
  next_check_at?: string | null;
  last_checked_at?: string | null;
  check_priority?: PriorityTier;
  created_at: string;
  updated_at: string;
}

export type AnchorClassification =
  | "BRANDED"
  | "NAKED_URL"
  | "GENERIC"
  | "PARTIAL_MATCH"
  | "EXACT_MATCH"
  | "OTHER";

export type BacklinkStatus =
  | "NEW"
  | "LIVE"
  | "VERIFIED"
  | "LOST"
  | "BROKEN"
  | "REDIRECTED"
  | "RECLAIM"
  | "REMOVED"
  | "SPAM"
  | "IGNORED";

export interface OffPageBacklink {
  id: string;
  source_domain: string;
  source_url: string;
  source_page_title: string | null;
  target_url: string;
  target_page_type: string;
  anchor_text: string;
  anchor_classification: AnchorClassification;
  link_rel: string;
  dofollow: boolean;
  nofollow: boolean;
  ugc: boolean;
  sponsored: boolean;
  unknown_link_type: boolean;
  first_seen_at: string;
  last_seen_at: string;
  last_checked_at: string | null;
  status: BacklinkStatus;
  team_status?: string;
  verified_status?: string;
  mismatch_status?: "MATCH" | "MISMATCH" | "RESOLVED";
  mismatch_reason?: string | null;
  mismatch_detected_at?: string | null;
  mismatch_resolved_at?: string | null;
  mismatch_resolution?: "ACCEPTED_VERIFIED" | "KEPT_TEAM" | "RECHECKED" | "ASSIGNED_REVIEW" | null;
  source_type?: string;
  owner?: string | null;
  cost?: number;
  cost_currency?: string;
  contact_name?: string | null;
  contact_email?: string | null;
  proof_url?: string | null;
  submitted_date?: string | null;
  original_sheet_row_id?: string | null;
  sheet_connection_id?: string | null;
  http_status: number;
  redirect_chain: string | null;
  source_indexable: boolean;
  source_canonical: string | null;
  source_country: string | null;
  source_region: RegionCode;
  source_language: string;
  topical_category: string;
  topical_relevance_score: number;
  editorial_quality_score: number;
  geo_relevance_score: number;
  spam_risk_score: number;
  authority_score: number;
  placement_type: string;
  link_location: string;
  referral_sessions: number;
  referral_leads: number;
  campaign_id: string | null;
  outreach_id: string | null;
  evidence_url: string | null;
  screenshot_path: string | null;
  notes: string | null;
  discovered_at?: string | null;
  live_at?: string | null;
  verified_at?: string | null;
  lost_at?: string | null;
  reclaimed_at?: string | null;
  next_check_at?: string | null;
  check_priority?: PriorityTier;
  created_at: string;
  updated_at: string;
}

export interface OffPageSheetConnection {
  id: string;
  name: string;
  source_type: "GOOGLE_SHEETS" | "EXCEL" | "CSV";
  sheet_url: string | null;
  sheet_id: string | null;
  tab_name: string | null;
  column_mapping: Record<string, string>;
  auto_sync_enabled: boolean;
  sync_interval_hours: number;
  last_synced_at: string | null;
  last_sync_status: "SUCCESS" | "ERROR" | "PARTIAL" | null;
  last_sync_error: string | null;
  total_rows_synced: number;
  auto_verify_on_sync: boolean;
  created_at: string;
  updated_at: string;
}

export interface OffPageSyncHistory {
  id: string;
  connection_id: string | null;
  source_type: "GOOGLE_SHEETS" | "EXCEL" | "CSV";
  file_name: string | null;
  tab_name: string | null;
  started_at: string;
  completed_at: string | null;
  total_rows: number;
  inserted_count: number;
  updated_count: number;
  duplicates_skipped: number;
  invalid_rows: number;
  mismatches_detected: number;
  verified_count: number;
  status: "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  error_log: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BacklinkDiscoveryRun {
  run_id: string;
  provider: string;
  started_at: string;
  completed_at: string | null;
  queries_run: number;
  candidates_found: number;
  links_verified_live: number;
  duplicates_skipped: number;
  inserted_count: number;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  errors: string | null;
  details?: any;
  created_at: string;
}

export type AuthorityOpportunityType =
  | "COMPETITOR_GAP"
  | "UNLINKED_MENTION_RECLAIM"
  | "CLIENT_PARTNERSHIP"
  | "PARTNERSHIP"
  | "DIGITAL_PR"
  | "BROKEN_LINK"
  | "CASE_STUDY_PR"
  | "LINKABLE_ASSET_PROMOTION"
  | "LOST_LINK_RECLAIM"
  | "LINK_DESTINATION_RECOVERY"
  | "BRAND_GAP"
  | "CITATION_GAP"
  | "EXPERT_QUOTE"
  | "PODCAST"
  | "SPEAKING_OPPORTUNITY"
  | "AWARD"
  | "ASSOCIATION"
  | "RESOURCE_PAGE"
  | "TARGET_PAGE_AUTHORITY_GAP"
  | "CITATION_CORRECTION";

export interface OffPageAuthorityOpportunity {
  id: string;
  type: AuthorityOpportunityType;
  title: string;
  description: string;
  source_name: string;
  source_url: string;
  target_page: string;
  region: RegionCode;
  priority_tier: PriorityTier;
  authority_score: number;
  signals: {
    seo: boolean;
    aeo: boolean;
    geo: boolean;
    llm: boolean;
  };
  opportunity_id?: string;
  action_cta: string;
}

export interface OffPageCompetitorDomain {
  id: string;
  competitor_name: string;
  domain: string;
  region: RegionCode;
  primary_niche: string;
  tracked_since: string;
  estimated_referring_domains: number;
  status: string;
  created_at: string;
}

export interface OffPageCompetitorGap {
  id: string;
  competitor_id: string;
  competitor_domain: string;
  source_domain: string;
  source_url: string;
  target_page_type: string;
  gap_type: string;
  region: RegionCode;
  relevance_score: number;
  quality_score: number;
  difficulty_score: number;
  opportunity_id: string | null;
  status: "IDENTIFIED" | "OPPORTUNITY_CREATED" | "IN_OUTREACH" | "ACQUIRED" | "DISMISSED";
  created_at: string;
}

export interface OffPageBrandMention {
  id: string;
  brand_query: string;
  mention_url: string;
  mention_title: string | null;
  snippet: string | null;
  is_linked: boolean;
  linked_url: string | null;
  mention_type: "LINKED_MENTION" | "UNLINKED_MENTION" | "WRONG_LINK" | "BROKEN_LINK" | "BRAND_CONFUSION";
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  authority_signals: {
    seo_authority?: boolean;
    aeo_authority?: boolean;
    geo_authority?: boolean;
    llm_entity_authority?: boolean;
    brand_authority?: boolean;
    service_authority?: boolean;
  } | null;
  status: "NEW" | "NEEDS_OUTREACH" | "OUTREACH_SENT" | "RECLAIMED" | "VERIFIED" | "IGNORED";
  detected_at: string;
  created_at: string;
}

export type OutreachStage =
  | "DRAFT"
  | "NEW"
  | "QUALIFIED"
  | "APPROVED"
  | "ASSIGNED"
  | "OUTREACH"
  | "FOLLOW_UP"
  | "NEGOTIATING"
  | "SUBMITTED"
  | "LIVE"
  | "VERIFIED"
  | "REJECTED"
  | "NOT_FREE"
  | "SPAM"
  | "LOST"
  | "RECLAIM"
  | "CLOSED";

export type PitchType =
  | "GUEST_POST"
  | "EXPERT_QUOTE"
  | "RESOURCE_SUGGESTION"
  | "CITATION_CLAIM"
  | "BROKEN_LINK_REPLACE"
  | "PARTNERSHIP"
  | "INTERVIEW"
  | "CASE_STUDY";

export interface OffPageOutreach {
  id: string;
  opportunity_id: string | null;
  contact_name: string | null;
  publication: string;
  email: string | null;
  linkedin: string | null;
  contact_url: string | null;
  assigned_staff: string | null;
  stage: OutreachStage;
  pitch_type: PitchType;
  pitch_subject: string | null;
  pitch_body: string | null;
  response: string | null;
  first_contact: string | null;
  last_contact: string | null;
  next_follow_up: string | null;
  submission_url: string | null;
  live_url: string | null;
  target_page: string;
  result: string | null;
  proof: string | null;
  notes: string | null;
  source_module?: string;
  source_record_id?: string | null;
  target_domain?: string | null;
  created_by?: string | null;
  drafted_at?: string | null;
  approved_at?: string | null;
  sent_at?: string | null;
  submitted_at?: string | null;
  live_at?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type NapStatus = "CONSISTENT" | "INCONSISTENT" | "MISSING_LISTING" | "BROKEN_URL" | "OUTDATED_INFO";

export interface OffPageCitation {
  id: string;
  platform_name: string;
  listing_url: string | null;
  region: RegionCode;
  country: string;
  business_name_displayed: string | null;
  website_displayed: string | null;
  phone_displayed: string | null;
  location_displayed: string | null;
  nap_status: NapStatus;
  nap_issues: string | null;
  last_audited_at: string | null;
  status: "ACTIVE" | "NEEDS_UPDATE" | "CLAIM_SUBMITTED" | "VERIFIED";
  created_at: string;
}

export interface OffPageReviewPlatform {
  id: string;
  platform_name: string;
  profile_url: string;
  region: RegionCode;
  review_count: number;
  rating: number;
  last_review_date: string | null;
  profile_status: "CLAIMED" | "VERIFIED" | "INCOMPLETE" | "MISSING";
  reply_status: "ALL_REPLIED" | "PENDING_REPLIES" | "NO_REVIEWS";
  notes: string | null;
  created_at: string;
}

export interface OffPageTargetPage {
  id: string;
  page_url: string;
  page_title: string;
  target_page_type: string;
  primary_focus: string;
  priority_tier: "P0" | "P1" | "P2" | "P3";
  target_backlinks_goal: number;
  status: "STRONG" | "HEALTHY" | "UNDER_SUPPORTED" | "URGENT";
  referring_domains?: number;
  live_backlinks?: number;
  new_links_30d?: number;
  lost_links_30d?: number;
  unlinked_mentions?: number;
  referral_sessions_30d?: number;
  referral_leads_30d?: number;
  authority_gap?: number;
  opportunity_count?: number;
}

export interface OffPageMonthlyReport {
  id: string;
  report_month: string;
  report_title: string;
  report_type: string;
  summary_metrics: any;
  regional_metrics: any;
  target_page_metrics: any;
  outreach_metrics: any;
  pr_metrics: any;
  aeo_geo_llm_metrics: any;
  competitor_gap_metrics: any;
  risk_metrics: any;
  next_month_plan: any;
  created_at: string;
}

export type AlertType =
  | "NEW_BACKLINK"
  | "LINK_LOST"
  | "LINK_CHANGED"
  | "BROKEN_BACKLINK"
  | "SOURCE_DEINDEXED"
  | "TARGET_ERROR"
  | "TARGET_REDIRECTED"
  | "ANCHOR_CHANGED"
  | "UNLINKED_MENTION"
  | "COMPETITOR_GAP"
  | "CITATION_GAP"
  | "OPPORTUNITY_ACCEPTED"
  | "OUTREACH_REPLY"
  | "OVERDUE_FOLLOWUP"
  | "SPAM_SPIKE"
  | "IMPORTANT_DOMAIN_LOSS";

export interface OffPageAlert {
  id: string;
  alert_type: AlertType;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface OffPageTodayMetrics {
  newOpportunitiesToday: number;
  newLiveBacklinksToday: number;
  lostBacklinksToday: number;
  unlinkedMentionsToday: number;
  draftsAwaitingReview: number;
  followUpsDueToday: number;
  discoveryRunStatus?: string;
  discoveryRunErrors?: string | null;
}

export interface OffPageThisMonthMetrics {
  submissionsMade: number;
  liveLinksWon: number;
  verifiedLinks: number;
  referringDomainsAdded: number;
  referralSessions: number | "DATA_UNAVAILABLE";
  referralLeads: number | "DATA_UNAVAILABLE";
}

export interface OffPageActionQueue {
  reviewOpportunities: number;
  reviewDrafts: number;
  followUpPitches: number;
  reclaimLost: number;
  convertMentions: number;
}

export interface OffPageDashboardMetrics {
  today?: OffPageTodayMetrics;
  thisMonth?: OffPageThisMonthMetrics;
  actionQueue?: OffPageActionQueue;
  totalReferringDomains: number;
  liveBacklinks: number;
  newBacklinks7d: number;
  newBacklinks30d: number;
  lostBacklinks: number;
  brokenBacklinks: number;
  recoveredBacklinks: number;
  unlinkedBrandMentions: number;
  authorityOpportunities: number;
  competitorGapOpportunities: number;
  digitalPrOpportunities: number;
  partnershipOpportunities: number;
  citationOpportunities: number;
  submittedOpportunities: number;
  verifiedLinks: number;
  outreachReplyRate: number; // percentage
  submissionToLinkConversion: number; // percentage
  referralSessions: number;
  referralLeads: number;
  regionalBreakdown: {
    india: number;
    uae: number;
    usa: number;
    global: number;
  };
  linkRetentionRate: number; // percentage
  charts: {
    newVsLost: Array<{ date: string; newLinks: number; lostLinks: number }>;
    domainGrowth: Array<{ month: string; domains: number }>;
    regionDistribution: Array<{ region: string; count: number; percentage: number }>;
    targetPageDistribution: Array<{ page: string; count: number }>;
    opportunityPipeline: Array<{ stage: string; count: number }>;
    linkTypeDistribution: Array<{ type: string; count: number }>;
    anchorDistribution: Array<{ classification: string; count: number; percentage: number }>;
    referralTrafficTrend: Array<{ date: string; sessions: number; leads: number }>;
    outreachConversion: Array<{ stage: string; count: number }>;
    authorityScoreTrend: Array<{ month: string; score: number }>;
  };
}
