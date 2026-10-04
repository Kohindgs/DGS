export type RegionCode = "INDIA" | "UAE" | "USA" | "GLOBAL";

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
  | "NEW"
  | "QUALIFIED"
  | "APPROVED"
  | "ASSIGNED"
  | "OUTREACH"
  | "SUBMITTED"
  | "LIVE"
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
  dofollow_status: "DOFOLLOW" | "NOFOLLOW" | "UGC" | "UNKNOWN";
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
  status: OpportunityStatus;
  assigned_to: string | null;
  notes: string | null;
  evidence: string | null;
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
  created_at: string;
  updated_at: string;
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

export interface OffPageDashboardMetrics {
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
