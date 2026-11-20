import type {
  ComparisonDiscrepancyItem,
  ComparisonFeedbackReport,
  OverallComparisonVerdict,
  ReferenceAnswer,
  ReferenceCheckRecord,
} from "./types.ts";

export function evaluateDeterministicComparison(params: {
  record: Pick<
    ReferenceCheckRecord,
    | "candidate_name"
    | "last_company"
    | "last_designation"
    | "last_employment_dates"
    | "claimed_responsibilities"
    | "claimed_achievements"
    | "poc_name"
    | "poc_designation"
    | "questions"
  >;
  responses: ReferenceAnswer[];
  pocConfirmedTitle?: string;
  pocConfirmedDates?: string;
  additionalComments?: string;
}): ComparisonFeedbackReport {
  const { record, responses } = params;
  const answerById = new Map<string, ReferenceAnswer>();
  for (const ans of responses) {
    if (ans && ans.questionId) {
      answerById.set(ans.questionId, ans);
    }
  }

  const activeQuestions = (record.questions || []).filter((q) => q.enabled !== false);
  const items: ComparisonDiscrepancyItem[] = [];
  const redFlags: string[] = [];

  let yesCount = 0;
  let answeredCount = 0;
  let rehireEligible = true;
  let employmentConfirmed = true;
  let goodStandingConfirmed = true;

  for (const q of activeQuestions) {
    const ans = answerById.get(q.id);
    if (!ans) continue;
    answeredCount++;

    const isYes = ans.yesNo === "Yes";
    if (isYes) yesCount++;

    const qLower = q.questionText.toLowerCase();
    const isRehireQ = q.id === "q5" || /\brehire\b/i.test(qLower);
    const isEmploymentQ = q.id === "q1" || /\bwork at\b.*\bduring\b/i.test(qLower);
    const isStandingQ = q.id === "q4" || /\bgood standing\b|\bdisciplinary\b|\btermination\b/i.test(qLower);
    const isConductQ = q.id === "q3" || /\bconduct\b|\bintegrity\b/i.test(qLower);

    if (isRehireQ && !isYes) {
      rehireEligible = false;
      redFlags.push(`Referee (${record.poc_name}) selected NO for rehire eligibility${ans.comment ? `: "${ans.comment}"` : "."}`);
    }
    if (isEmploymentQ && !isYes) {
      employmentConfirmed = false;
      redFlags.push(`Employment role/dates at ${record.last_company} disputed by ${record.poc_name}${ans.comment ? `: "${ans.comment}"` : "."}`);
    }
    if (isStandingQ && !isYes) {
      goodStandingConfirmed = false;
      redFlags.push(`Candidate separation/good standing flagged${ans.comment ? `: "${ans.comment}"` : "."}`);
    }
    if (isConductQ && !isYes) {
      redFlags.push(`Workplace conduct or integrity concern reported${ans.comment ? `: "${ans.comment}"` : "."}`);
    }
    if (q.category === "resume_claim" && !isYes) {
      redFlags.push(`CV claim not corroborated: "${q.claimContext || q.questionText}"${ans.comment ? ` (POC note: ${ans.comment})` : ""}`);
    }

    const candidateClaimed = q.claimContext || (q.category === "common"
      ? `Standard verification (${q.id.toUpperCase()})`
      : q.questionText);

    const refereeReported = `${ans.yesNo}${ans.comment ? ` — "${ans.comment}"` : ""}`;

    let status: ComparisonDiscrepancyItem["status"] = isYes ? "MATCH" : "MISMATCH";
    if (!isYes && q.id === "q2") {
      status = "PARTIAL";
    }

    items.push({
      dimension: q.category === "resume_claim" ? "CV Claim Verification" : "Core Reference Check",
      candidateClaimed,
      refereeReported,
      status,
      analysis: isYes
        ? `Confirmed by ${record.poc_name} (${record.poc_designation}).`
        : `Discrepancy or negative response recorded by ${record.poc_name}.`,
    });
  }

  // Dedicated Designation & Dates comparison rows when POC supplied explicit values
  const pocTitleClean = (params.pocConfirmedTitle || "").trim();
  const cvTitleClean = (record.last_designation || "").trim();
  if (pocTitleClean) {
    const sameTitle =
      pocTitleClean.toLowerCase() === cvTitleClean.toLowerCase() ||
      pocTitleClean.toLowerCase().includes(cvTitleClean.toLowerCase()) ||
      cvTitleClean.toLowerCase().includes(pocTitleClean.toLowerCase());
    if (!sameTitle) {
      redFlags.push(`Designation mismatch: CV claims "${cvTitleClean}", POC stated "${pocTitleClean}".`);
    }
    items.unshift({
      dimension: "Last Role / Designation",
      candidateClaimed: cvTitleClean || "Not specified",
      refereeReported: pocTitleClean,
      status: sameTitle ? "MATCH" : "MISMATCH",
      analysis: sameTitle
        ? "Designation matches candidate's CV."
        : "Possible title inflation or designation discrepancy between CV and employer records.",
    });
  }

  const pocDatesClean = (params.pocConfirmedDates || "").trim();
  const cvDatesClean = (record.last_employment_dates || "").trim();
  if (pocDatesClean) {
    const sameDates =
      pocDatesClean.toLowerCase() === cvDatesClean.toLowerCase() ||
      pocDatesClean.toLowerCase().includes(cvDatesClean.toLowerCase());
    if (!sameDates) {
      redFlags.push(`Tenure dates differ: CV claims "${cvDatesClean}", POC stated "${pocDatesClean}".`);
    }
    items.unshift({
      dimension: "Employment Dates",
      candidateClaimed: cvDatesClean || "Not specified",
      refereeReported: pocDatesClean,
      status: sameDates ? "MATCH" : "PARTIAL",
      analysis: sameDates
        ? "Dates confirmed accurately by referee."
        : "Verify exact joining/relieving dates against relieving letter.",
    });
  }

  const baseScore = answeredCount > 0 ? Math.round((yesCount / answeredCount) * 100) : 0;
  let penalty = 0;
  if (!rehireEligible) penalty += 25;
  if (!employmentConfirmed) penalty += 25;
  if (!goodStandingConfirmed) penalty += 15;
  const matchScore = Math.max(0, Math.min(100, baseScore - penalty));

  let overallVerdict: OverallComparisonVerdict = "VERIFIED_HIGH_CONFIDENCE";
  if (!rehireEligible || !employmentConfirmed || !goodStandingConfirmed || matchScore < 65) {
    overallVerdict = "RED_FLAG_DETECTED";
  } else if (redFlags.length > 0 || matchScore < 85) {
    overallVerdict = "MINOR_DISCREPANCY";
  }

  const executiveSummary =
    overallVerdict === "VERIFIED_HIGH_CONFIDENCE"
      ? `${record.poc_name} (${record.poc_designation} at ${record.last_company}) verified ${yesCount}/${answeredCount} items on ${record.candidate_name}'s CV including rehire eligibility and conduct. High alignment between candidate shared details and employer feedback.`
      : overallVerdict === "MINOR_DISCREPANCY"
      ? `${record.poc_name} verified ${yesCount}/${answeredCount} points for ${record.candidate_name} at ${record.last_company}, with ${redFlags.length} item(s) requiring clarification prior to final onboarding.`
      : `Reference check for ${record.candidate_name} returned ${redFlags.length} significant discrepancy/red flag(s) (${yesCount}/${answeredCount} positive responses; rehire eligible: ${rehireEligible ? "Yes" : "No"}).`;

  const recommendation =
    overallVerdict === "VERIFIED_HIGH_CONFIDENCE"
      ? "Proceed confidently with offer / onboarding."
      : overallVerdict === "MINOR_DISCREPANCY"
      ? "Proceed with targeted HR clarification on the flagged item(s) and collect relieving/experience letters."
      : "Hold offer / Escalate to Hiring Manager for formal review before proceeding.";

  return {
    overallVerdict,
    matchScore,
    executiveSummary,
    rehireEligible,
    items,
    redFlags,
    recommendation,
    pocConfirmedTitle: pocTitleClean || undefined,
    pocConfirmedDates: pocDatesClean || undefined,
    additionalComments: (params.additionalComments || "").trim() || undefined,
    analyzedAt: new Date().toISOString(),
  };
}

export async function generateComparisonFeedback(params: {
  record: Pick<
    ReferenceCheckRecord,
    | "candidate_name"
    | "last_company"
    | "last_designation"
    | "last_employment_dates"
    | "claimed_responsibilities"
    | "claimed_achievements"
    | "poc_name"
    | "poc_designation"
    | "questions"
  >;
  responses: ReferenceAnswer[];
  pocConfirmedTitle?: string;
  pocConfirmedDates?: string;
  additionalComments?: string;
}): Promise<ComparisonFeedbackReport> {
  const deterministic = evaluateDeterministicComparison(params);
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return deterministic;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are an HR Reference Verification Reviewer. Given candidate CV claims and the former employer referee's responses, refine the executive summary and hiring recommendation into concise JSON: { "executiveSummary": "...", "recommendation": "..." }. Keep all facts strictly faithful to the responses provided.`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: JSON.stringify({
                    candidateName: params.record.candidate_name,
                    lastCompany: params.record.last_company,
                    claimedDesignation: params.record.last_designation,
                    claimedDates: params.record.last_employment_dates,
                    pocConfirmedTitle: params.pocConfirmedTitle,
                    pocConfirmedDates: params.pocConfirmedDates,
                    additionalComments: params.additionalComments,
                    matchScore: deterministic.matchScore,
                    verdict: deterministic.overallVerdict,
                    redFlags: deterministic.redFlags,
                    items: deterministic.items,
                  }),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (res.ok) {
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed?.executiveSummary && parsed?.recommendation) {
          return {
            ...deterministic,
            executiveSummary: String(parsed.executiveSummary).trim(),
            recommendation: String(parsed.recommendation).trim(),
          };
        }
      }
    }
  } catch (err: any) {
    console.warn("[comparison-engine] Gemini enrichment skipped:", err?.message || err);
  }

  return deterministic;
}
