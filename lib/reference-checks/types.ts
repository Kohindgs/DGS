export type ReferenceQuestionCategory = "common" | "resume_claim";

export type ReferenceAnswerType = "yes_no" | "yes_no_comment";

export type ReferenceQuestion = {
  id: string;
  questionText: string;
  category: ReferenceQuestionCategory;
  answerType: ReferenceAnswerType;
  claimContext?: string;
  enabled: boolean;
};

export type ReferenceAnswer = {
  questionId: string;
  yesNo: "Yes" | "No";
  comment?: string;
};

export type DetectedPoc = {
  fullName?: string;
  designation?: string;
  email?: string;
  phone?: string;
};

export type CvScanResult = {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  appliedPosition: string;
  lastCompany: string;
  lastDesignation: string;
  lastEmploymentDates: string;
  cvSummary: string;
  claimedResponsibilities: string[];
  claimedAchievements: string[];
  detectedPoc?: DetectedPoc;
  questions: ReferenceQuestion[];
  scannerMode: "gemini_ai" | "heuristic_fallback";
};

export type ComparisonDiscrepancyItem = {
  dimension: string;
  candidateClaimed: string;
  refereeReported: string;
  status: "MATCH" | "PARTIAL" | "MISMATCH";
  analysis: string;
};

export type OverallComparisonVerdict =
  | "VERIFIED_HIGH_CONFIDENCE"
  | "MINOR_DISCREPANCY"
  | "RED_FLAG_DETECTED";

export type ComparisonFeedbackReport = {
  overallVerdict: OverallComparisonVerdict;
  matchScore: number;
  executiveSummary: string;
  rehireEligible: boolean;
  items: ComparisonDiscrepancyItem[];
  redFlags: string[];
  recommendation: string;
  pocConfirmedTitle?: string;
  pocConfirmedDates?: string;
  additionalComments?: string;
  analyzedAt: string;
};

export type ReferenceCheckStatus = "pending" | "submitted" | "expired";

export type ReferenceCheckRecord = {
  id: string;
  candidate_name: string;
  candidate_email: string | null;
  candidate_phone: string | null;
  candidate_position: string | null;
  last_company: string;
  last_designation: string;
  last_employment_dates: string | null;
  cv_filename: string | null;
  cv_text_summary: string | null;
  claimed_responsibilities: string[];
  claimed_achievements: string[];
  poc_name: string;
  poc_designation: string;
  poc_email: string;
  poc_phone: string | null;
  secure_token: string;
  token_expires_at: string | null;
  status: ReferenceCheckStatus;
  questions: ReferenceQuestion[];
  responses: ReferenceAnswer[] | null;
  comparison_feedback: ComparisonFeedbackReport | null;
  sent_at: string | null;
  submitted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicReferenceCheckView = {
  id: string;
  candidateName: string;
  candidatePosition: string | null;
  lastCompany: string;
  lastDesignation: string;
  lastEmploymentDates: string | null;
  pocName: string;
  pocDesignation: string;
  status: ReferenceCheckStatus;
  questions: ReferenceQuestion[];
  submittedAt: string | null;
  expired: boolean;
};
