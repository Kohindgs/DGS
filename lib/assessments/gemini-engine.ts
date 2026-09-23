import "server-only";

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || "";
}

function endpointForModel(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
}

export type GeminiTestOutput = {
  role_summary?: string;
  role_title?: string;
  role_level?: "junior" | "mid" | "senior" | "lead";
  test_blueprint?: {
    psychometric_count: number;
    mcq_count: number;
    short_answer_count: number;
    long_answer_count: number;
    difficulty: string;
  };
  psychometric: Array<{
    id: string;
    question: string;
    options: string[];
    trait: string;
    scoring?: number[];
  }>;
  mcqs: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    competencyTag?: string;
  }>;
  shortAnswers: Array<{
    id: string;
    question: string;
    rubric: string;
    idealAnswerTraits?: string[];
    maxScore: number;
    competencyTag?: string;
  }>;
  longAnswers: Array<{
    id: string;
    question: string;
    scenario?: string;
    minWords?: number;
    evaluationCriteria?: string[];
    maxScore: number;
    competencyTag?: string;
  }>;
  practicalTask?: {
    title: string;
    instructions: string;
    deliverables: string[];
  };
  scoringRules?: {
    psychometricWeight: number;
    mcqWeight: number;
    shortAnswerWeight: number;
    longAnswerWeight: number;
  };
};

export type ResumeMatchResult = {
  score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  tools_score: number;
  industry_score: number;
  strengths: string[];
  gaps: string[];
  missing_skills: string[];
  concerns: string[];
  suggested_interview_topics: string[];
  summary: string;
  decision: "strong_match" | "moderate_match" | "needs_review" | "outside_requirement";
};

export type WrittenEvaluationResult = {
  score: number;
  maxScore: number;
  accuracy: string;
  relevance: string;
  clarity: string;
  depth: string;
  feedback: string;
};

export type CandidateInterviewSummary = {
  executiveSummary: string;
  strengths: string[];
  skillGaps: string[];
  recommendedInterviewQuestions: Array<{
    question: string;
    targetCompetency: string;
    reasonToAsk: string;
  }>;
  overallRecommendation: "Strong Match" | "Potential Match" | "Needs Review";
};

/**
 * Core Gemini API Caller with model fallback (gemini-2.5-flash -> gemini-2.5-flash-lite)
 */
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in server environment.");
  }

  let lastError: Error | null = null;
  for (const model of MODELS) {
    try {
      const url = endpointForModel(model, apiKey);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error (${model} - HTTP ${res.status}): ${errText}`);
      }

      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(`Empty response from ${model}`);
      return text;
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini attempt with ${model} failed, trying fallback:`, err.message);
    }
  }

  throw lastError || new Error("Gemini generation failed on all models.");
}

/**
 * Live API connection test ping
 */
export async function testGeminiConnection(): Promise<{
  ok: boolean;
  model: string;
  latencyMs: number;
  lastSuccess: string;
  error?: string;
}> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      model: "none",
      latencyMs: 0,
      lastSuccess: "",
      error: "GEMINI_API_KEY is not configured.",
    };
  }

  const startTime = Date.now();
  try {
    const url = endpointForModel("gemini-2.5-flash", apiKey);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Respond with JSON: {\"ping\":\"ok\"}" }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    const latencyMs = Date.now() - startTime;
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, model: "gemini-2.5-flash", latencyMs, lastSuccess: "", error: `HTTP ${res.status}: ${err}` };
    }

    return {
      ok: true,
      model: "gemini-2.5-flash",
      latencyMs,
      lastSuccess: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      ok: false,
      model: "gemini-2.5-flash",
      latencyMs: Date.now() - startTime,
      lastSuccess: "",
      error: err.message,
    };
  }
}

/**
 * Generate full assessment test blueprint from a Job Description
 */
export async function generateTestFromJD(
  jdContent: string,
  options: {
    difficulty?: "basic" | "moderate" | "advanced" | "junior" | "mid" | "senior";
    mcqCount?: number;
    shortCount?: number;
    longCount?: number;
    focusAreas?: string;
    customPrompt?: string;
    previousDraft?: unknown;
  } = {}
): Promise<GeminiTestOutput> {
  const mcqCount = options.mcqCount || 10;
  const shortCount = options.shortCount || 2;
  const longCount = options.longCount || 1;
  const difficulty = options.difficulty || "moderate";

  const systemPrompt = `You are an elite talent evaluation architect and psychometrician for D'Genius Solutions, an enterprise digital agency in Mumbai.
Generate complete, rigorous, professional hiring assessment tests tailored to the Job Description.
Return ONLY valid raw JSON matching this schema:
{
  "role_summary": "string",
  "role_title": "string",
  "role_level": "junior|mid|senior",
  "test_blueprint": {
    "psychometric_count": 10,
    "mcq_count": ${mcqCount},
    "short_answer_count": ${shortCount},
    "long_answer_count": ${longCount},
    "difficulty": "${difficulty}"
  },
  "psychometric": [
    {
      "id": "p1",
      "question": "string scenario",
      "options": ["Option A (poor)", "Option B (adequate)", "Option C (good)", "Option D (excellent)"],
      "trait": "Ownership / Problem Solving / Client Focus",
      "scoring": [0, 1, 2, 3]
    }
  ],
  "mcqs": [
    {
      "id": "m1",
      "question": "string technical question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "string explaining why option is correct and others are plausible distractors",
      "competencyTag": "string"
    }
  ],
  "shortAnswers": [
    {
      "id": "s1",
      "question": "string practical question",
      "rubric": "string scoring guideline",
      "idealAnswerTraits": ["trait 1", "trait 2"],
      "maxScore": 5,
      "competencyTag": "string"
    }
  ],
  "longAnswers": [
    {
      "id": "l1",
      "question": "string complex scenario strategy question",
      "scenario": "string context",
      "minWords": 150,
      "evaluationCriteria": ["strategic depth", "agency execution", "ROI focus"],
      "maxScore": 10,
      "competencyTag": "string"
    }
  ],
  "practicalTask": {
    "title": "string practical agency assignment",
    "instructions": "string step by step instructions",
    "deliverables": ["string deliverable 1", "string deliverable 2"]
  }
}`;

  let userPrompt = `Generate a complete assessment test for this Job Description.
DIFFICULTY: ${difficulty}
MCQ COUNT: ${mcqCount}
SHORT ANSWER COUNT: ${shortCount}
LONG ANSWER COUNT: ${longCount}
FOCUS AREAS: ${options.focusAreas || "Technical competence, practical agency execution, critical problem solving"}
ADMIN INSTRUCTIONS: ${options.customPrompt || "Ensure challenging, non-generic, scenario-based questions."}

JOB DESCRIPTION:
${jdContent}`;

  if (options.previousDraft) {
    userPrompt += `\n\n=== PREVIOUS DRAFT (REFERENCE ONLY - DO NOT REPEAT QUESTIONS) ===\n${JSON.stringify(options.previousDraft, null, 2)}\n=== END PREVIOUS DRAFT ===\nGenerate a fresh alternate version with different scenarios and options.`;
  }

  const rawJson = await callGemini(systemPrompt, userPrompt);
  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Regenerate an individual question incorporating HR recommendations
 */
export async function regenerateSingleQuestion(params: {
  questionType: "mcq" | "short" | "long" | "psychometric" | "practical";
  originalQuestion: any;
  recommendation: string;
  roleContext: string;
  difficulty?: string;
}): Promise<any> {
  const systemPrompt = `You are an expert assessment designer for D'Genius Solutions.
Your task is to rewrite a single assessment question based on an HR recommendation (e.g. "Make harder", "Focus on technical crawlability", "Change scenario to e-commerce").
Return ONLY valid raw JSON matching the question structure.`;

  const userPrompt = `ROLE CONTEXT: ${params.roleContext}
DIFFICULTY: ${params.difficulty || "moderate"}
QUESTION TYPE: ${params.questionType}
ORIGINAL QUESTION:
${JSON.stringify(params.originalQuestion, null, 2)}

HR RECOMMENDATION TO APPLY:
"${params.recommendation}"

Generate the revised question strictly following the recommendation. Output JSON matching the original schema.`;

  const rawJson = await callGemini(systemPrompt, userPrompt);
  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Compare candidate resume vs Job Description across 6 dimensions
 */
export async function compareResumeToJD(
  jdContent: string,
  resumeText: string,
  roleTitle: string = ""
): Promise<ResumeMatchResult> {
  const systemPrompt = `You are a strict, veteran HR director and talent evaluator for D'Genius Solutions.
Compare the candidate's resume against the Job Description. Be objective, realistic, and discerning.
Score role fit across 6 distinct dimensions from 0 to 100.
Return ONLY raw JSON matching this schema:
{
  "score": 82,
  "skills_score": 85,
  "experience_score": 80,
  "education_score": 75,
  "tools_score": 88,
  "industry_score": 78,
  "strengths": ["...", "..."],
  "gaps": ["...", "..."],
  "missing_skills": ["...", "..."],
  "concerns": ["...", "..."],
  "suggested_interview_topics": ["...", "..."],
  "summary": "Concise summary within 60 words.",
  "decision": "strong_match|moderate_match|needs_review|outside_requirement"
}`;

  const userPrompt = `ROLE TITLE: ${roleTitle}

JOB DESCRIPTION:
${jdContent}

CANDIDATE RESUME TEXT:
${resumeText}`;

  const rawJson = await callGemini(systemPrompt, userPrompt);
  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

/**
 * AI Written Answer Rubric Evaluation
 */
export async function evaluateWrittenAnswer(params: {
  question: string;
  rubric?: string;
  idealAnswerTraits?: string[];
  maxScore: number;
  candidateAnswer: string;
}): Promise<WrittenEvaluationResult> {
  const systemPrompt = `You are an expert HR examiner grading candidate written answers for D'Genius Solutions.
Evaluate the candidate's answer against the question rubric and ideal traits.
Return ONLY valid JSON:
{
  "score": 4,
  "maxScore": ${params.maxScore},
  "accuracy": "High / Medium / Low",
  "relevance": "Direct / Tangential / Irrelevant",
  "clarity": "Clear / Adequate / Vague",
  "depth": "Thorough / Surface / Incomplete",
  "feedback": "Concise 2-sentence rationale."
}`;

  const userPrompt = `QUESTION:
${params.question}

RUBRIC / CRITERIA:
${params.rubric || "Evaluate technical correctness, practical agency reasoning, and clarity."}

IDEAL TRAITS:
${(params.idealAnswerTraits || []).join(", ") || "Practical examples, structured thinking"}

CANDIDATE ANSWER:
${params.candidateAnswer || "(No answer provided)"}`;

  const rawJson = await callGemini(systemPrompt, userPrompt);
  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Generate candidate interview summary & tailored questions based on weak/strong areas
 */
export async function generateCandidateInterviewSummary(params: {
  jdTitle: string;
  jdContent: string;
  candidateName: string;
  resumeSummary?: string;
  mcqResults: { score: number; total: number; percentage: number };
  writtenAnswerHighlights?: string;
}): Promise<CandidateInterviewSummary> {
  const systemPrompt = `You are an executive hiring partner for D'Genius Solutions.
Synthesize the candidate's assessment results and resume match into an actionable interview briefing.
Focus on weak areas that require probing and strong areas that need verification.
Return ONLY raw JSON:
{
  "executiveSummary": "Concise 3-sentence summary of candidate fit.",
  "strengths": ["...", "..."],
  "skillGaps": ["...", "..."],
  "recommendedInterviewQuestions": [
    {
      "question": "...",
      "targetCompetency": "...",
      "reasonToAsk": "..."
    }
  ],
  "overallRecommendation": "Strong Match|Potential Match|Needs Review"
}`;

  const userPrompt = `CANDIDATE: ${params.candidateName}
TARGET ROLE: ${params.jdTitle}

JOB DESCRIPTION:
${params.jdContent}

RESUME SUMMARY:
${params.resumeSummary || "Not available"}

MCQ ASSESSMENT PERFORMANCE:
Scored ${params.mcqResults.score} out of ${params.mcqResults.total} (${params.mcqResults.percentage}%)

WRITTEN ASSESSMENT HIGHLIGHTS:
${params.writtenAnswerHighlights || "Standard responses submitted."}`;

  const rawJson = await callGemini(systemPrompt, userPrompt);
  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}
