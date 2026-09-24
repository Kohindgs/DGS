export type ChangeRequestStatus =
  | "DRAFT"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "APPLYING"
  | "APPLIED"
  | "VERIFIED"
  | "REJECTED"
  | "FAILED"
  | "ROLLED_BACK";

export type ChangeType =
  | "MISSING_ALT"
  | "META_DESCRIPTION"
  | "SCHEMA"
  | "INTERNAL_LINK"
  | "FAQ_ADDITION"
  | "CONTENT_SECTION"
  | "IMAGE_OPTIMIZATION"
  | "PAGESPEED_REMEDIATION"
  | "TITLE"
  | "H1"
  | "CANONICAL"
  | "TARGET_EXPANSION";

export type RiskLevel = "SAFE" | "MODERATE" | "HIGH" | "CRITICAL";

export type SeoChangeRequestRecord = {
  id: string;
  source_type: string;
  source_id?: string | null;
  page_url: string;
  keyword?: string | null;
  issue_code?: string | null;
  change_type: ChangeType;
  risk_level: RiskLevel;
  protected_page: boolean;
  before_state?: any;
  proposed_state: any;
  diff_json?: any;
  reason: string;
  evidence?: any;
  implementation_plan: string[];
  status: ChangeRequestStatus;
  created_by: string;
  approved_by?: string | null;
  created_at: string;
  approved_at?: string | null;
  applied_at?: string | null;
  verified_at?: string | null;
  failed_at?: string | null;
  rolled_back_at?: string | null;
  error_message?: string | null;
};

export const PROTECTED_TIER0_PAGES = [
  "/services/ai-video-production-agency/",
  "/services/aeo-services-in-mumbai/",
  "/services/geo/",
  "/services/llm-seo-service/",
  "/services/seo-services-in-mumbai/",
];

export function isProtectedPage(url: string): boolean {
  if (!url) return false;
  const norm = url.replace(/^https?:\/\/[^/]+/i, "").replace(/\/+$/, "") + "/";
  return PROTECTED_TIER0_PAGES.some((p) => {
    const pNorm = p.replace(/\/+$/, "") + "/";
    return norm === pNorm;
  });
}

export function determineRiskLevel(changeType: ChangeType, isProtected: boolean): RiskLevel {
  if (isProtected) {
    if (["CANONICAL", "TITLE", "H1"].includes(changeType)) return "CRITICAL";
    if (["CONTENT_SECTION", "PAGESPEED_REMEDIATION"].includes(changeType)) return "HIGH";
    return "MODERATE";
  }

  switch (changeType) {
    case "CANONICAL":
      return "CRITICAL";
    case "TITLE":
    case "H1":
    case "CONTENT_SECTION":
      return "HIGH";
    case "INTERNAL_LINK":
    case "SCHEMA":
    case "FAQ_ADDITION":
    case "META_DESCRIPTION":
    case "PAGESPEED_REMEDIATION":
      return "MODERATE";
    case "MISSING_ALT":
    case "IMAGE_OPTIMIZATION":
    case "TARGET_EXPANSION":
    default:
      return "SAFE";
  }
}

export function classifyRiskLevel(url: string, changeType: ChangeType): RiskLevel {
  const protected_page = isProtectedPage(url);
  return determineRiskLevel(changeType, protected_page);
}
