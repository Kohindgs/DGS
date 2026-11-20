import type { ReferenceQuestion } from "./types.ts";

export const MAX_REFERENCE_QUESTIONS = 10;

export function buildCommonQuestions(params: {
  candidateName: string;
  lastCompany: string;
  lastDesignation: string;
  lastEmploymentDates: string;
}): ReferenceQuestion[] {
  const candidate = (params.candidateName || "the candidate").trim();
  const company = (params.lastCompany || "your organization").trim();
  const role = (params.lastDesignation || "their stated role").trim();
  const dates = (params.lastEmploymentDates || "their stated dates").trim();

  return [
    {
      id: "q1",
      questionText: `Did ${candidate} work at ${company} as ${role} during ${dates}?`,
      category: "common",
      answerType: "yes_no_comment",
      claimContext: `${role} at ${company} (${dates})`,
      enabled: true,
    },
    {
      id: "q2",
      questionText: `Were ${candidate}'s attendance, punctuality, and day-to-day reliability satisfactory throughout their tenure?`,
      category: "common",
      answerType: "yes_no_comment",
      claimContext: "Punctuality, attendance & day-to-day dependability",
      enabled: true,
    },
    {
      id: "q3",
      questionText: `Did ${candidate} maintain professional conduct, integrity, and positive collaboration with peers and management?`,
      category: "common",
      answerType: "yes_no_comment",
      claimContext: "Workplace conduct, ethics & team collaboration",
      enabled: true,
    },
    {
      id: "q4",
      questionText: `Did ${candidate} leave ${company} in good standing without any disciplinary or performance termination issues?`,
      category: "common",
      answerType: "yes_no_comment",
      claimContext: "Voluntary / clean separation in good standing",
      enabled: true,
    },
    {
      id: "q5",
      questionText: `Would you rehire ${candidate} if a suitable opportunity arose in the future?`,
      category: "common",
      answerType: "yes_no_comment",
      claimContext: "Rehire eligibility",
      enabled: true,
    },
  ];
}

export function buildResumeFallbackQuestions(params: {
  candidateName: string;
  lastCompany: string;
  claimedResponsibilities: string[];
  claimedAchievements: string[];
  maxCount?: number;
}): ReferenceQuestion[] {
  const candidate = (params.candidateName || "the candidate").trim();
  const company = (params.lastCompany || "your organization").trim();
  const cap = Math.max(0, Math.min(5, params.maxCount ?? 5));

  const pool = [
    ...params.claimedAchievements.map((c) => ({ kind: "achievement", text: c })),
    ...params.claimedResponsibilities.map((c) => ({ kind: "responsibility", text: c })),
  ]
    .map((item) => ({
      ...item,
      clean: item.text.replace(/\s+/g, " ").replace(/^[-•*\d.)\s]+/, "").trim(),
    }))
    .filter((item) => item.clean.length >= 12)
    .slice(0, cap);

  const questions: ReferenceQuestion[] = pool.map((item, idx) => {
    const truncated = item.clean.length > 180 ? `${item.clean.slice(0, 177)}...` : item.clean;
    const prefix =
      item.kind === "achievement"
        ? `On their CV, ${candidate} claims: "${truncated}" during their time at ${company}. Can you confirm this achievement?`
        : `${candidate}'s resume states they were directly responsible for: "${truncated}". Does this accurately reflect their scope?`;

    return {
      id: `q${6 + idx}`,
      questionText: prefix,
      category: "resume_claim",
      answerType: "yes_no_comment",
      claimContext: truncated,
      enabled: true,
    };
  });

  if (questions.length === 0) {
    questions.push({
      id: "q6",
      questionText: `Did ${candidate} independently deliver core work responsibilities listed for ${company} without excessive supervision?`,
      category: "resume_claim",
      answerType: "yes_no_comment",
      claimContext: `Independent ownership of deliverables at ${company}`,
      enabled: true,
    });
  }

  return questions.slice(0, cap);
}

export function normalizeAndCapQuestions(
  commonOrAll: ReferenceQuestion[],
  resumeSpecific?: ReferenceQuestion[]
): ReferenceQuestion[] {
  const combined = resumeSpecific
    ? [...commonOrAll.slice(0, 5), ...resumeSpecific.slice(0, 5)]
    : commonOrAll;

  const cleaned: ReferenceQuestion[] = [];
  const seenText = new Set<string>();

  for (const q of combined) {
    const text = String(q.questionText || "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seenText.has(key)) continue;
    seenText.add(key);

    cleaned.push({
      id: `q${cleaned.length + 1}`,
      questionText: text.slice(0, 500),
      category: q.category === "resume_claim" ? "resume_claim" : "common",
      answerType: q.answerType === "yes_no" ? "yes_no" : "yes_no_comment",
      claimContext: q.claimContext ? String(q.claimContext).trim().slice(0, 300) : undefined,
      enabled: q.enabled !== false,
    });

    if (cleaned.length >= MAX_REFERENCE_QUESTIONS) break;
  }

  return cleaned;
}
