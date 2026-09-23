import "server-only";

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || "";
}

function endpointForModel(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
}

export type GeminiTestOutput = {
  psychometric: Array<{
    id: string;
    question: string;
    options: string[];
    trait: string;
  }>;
  mcqs: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  shortAnswers: Array<{
    id: string;
    question: string;
    rubric: string;
    maxScore: number;
  }>;
  longAnswers: Array<{
    id: string;
    question: string;
    scenario: string;
    evaluationCriteria: string[];
    maxScore: number;
  }>;
  practicalTask?: {
    title: string;
    instructions: string;
    deliverables: string[];
  };
};

export type ResumeMatchResult = {
  score: number;
  strengths: string[];
  gaps: string[];
  summary: string;
};

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
            temperature: 0.3,
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

export async function generateTestFromJD(
  jdContent: string,
  options: {
    difficulty?: "junior" | "mid" | "senior" | "lead";
    mcqCount?: number;
    shortCount?: number;
    longCount?: number;
    focusAreas?: string;
    customPrompt?: string;
  } = {}
): Promise<GeminiTestOutput> {
  const systemPrompt = `You are an elite talent evaluation architect for D'Genius Solutions, a premier digital agency specializing in SEO, AI Video, Performance Marketing, and Technology.
Your task is to generate rigorous, role-specific assessment questions from a job description.
Return ONLY valid JSON matching this schema:
{
  "psychometric": [
    { "id": "p1", "question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "trait": "Attention to Detail" }
  ],
  "mcqs": [
    { "id": "m1", "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." }
  ],
  "shortAnswers": [
    { "id": "s1", "question": "...", "rubric": "...", "maxScore": 5 }
  ],
  "longAnswers": [
    { "id": "l1", "question": "...", "scenario": "...", "evaluationCriteria": ["..."], "maxScore": 10 }
  ],
  "practicalTask": {
    "title": "...",
    "instructions": "...",
    "deliverables": ["..."]
  }
}`;

  const userPrompt = `Generate an assessment for the following Job Description:
DIFFICULTY: ${options.difficulty || "mid"}
MCQ COUNT: ${options.mcqCount || 5}
SHORT ANSWER COUNT: ${options.shortCount || 2}
LONG ANSWER COUNT: ${options.longCount || 1}
FOCUS AREAS: ${options.focusAreas || "Practical problem solving, agency workflows, and technical expertise"}
ADMIN INSTRUCTIONS: ${options.customPrompt || "None"}

JOB DESCRIPTION:
${jdContent}`;

  const rawJson = await callGemini(systemPrompt, userPrompt);
  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

export async function compareResumeToJD(jdContent: string, resumeText: string, roleTitle: string = ""): Promise<ResumeMatchResult> {
  const systemPrompt = `You are an executive HR talent screener for D'Genius Solutions.
Analyze the candidate's resume against the Job Description.
Evaluate relevant experience, technical competencies, and alignment.
Return ONLY valid JSON:
{
  "score": 85,
  "strengths": ["...", "..."],
  "gaps": ["...", "..."],
  "summary": "..."
}`;

  const userPrompt = `ROLE TITLE: ${roleTitle}

JOB DESCRIPTION:
${jdContent}

CANDIDATE RESUME:
${resumeText}`;

  const rawJson = await callGemini(systemPrompt, userPrompt);
  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}
