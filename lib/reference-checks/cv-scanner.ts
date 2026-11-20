import mammoth from "mammoth";
import type { CvScanResult, ReferenceQuestion } from "./types.ts";
import {
  buildCommonQuestions,
  buildResumeFallbackQuestions,
  normalizeAndCapQuestions,
} from "./question-generator.ts";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

function endpointForModel(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${apiKey}`;
}

function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}

/**
 * Lightweight fallback text extractor for uncompressed/searchable PDF streams
 * when Gemini API is unavailable.
 */
function extractFallbackTextFromPdfBuffer(buffer: Buffer): string {
  const latin = buffer.toString("latin1");
  const textMatches: string[] = [];
  const parenRegex = /\(([^()\\]{3,200})\)/g;
  let m: RegExpExecArray | null;
  while ((m = parenRegex.exec(latin)) !== null && textMatches.length < 400) {
    const snippet = m[1].replace(/[^\x20-\x7E]/g, " ").trim();
    if (snippet.length >= 3 && /[a-zA-Z]{2,}/.test(snippet)) {
      textMatches.push(snippet);
    }
  }
  if (textMatches.length >= 10) {
    return textMatches.join(" ").replace(/\s+/g, " ").trim().slice(0, 18000);
  }
  return buffer
    .toString("utf8")
    .replace(/[^\x20-\x7E\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18000);
}

export async function extractPlainTextFromCv(params: {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
}): Promise<{ kind: "pdf_binary" | "text"; text: string }> {
  const lowerName = (params.filename || "").toLowerCase();
  const mime = (params.mimeType || "").toLowerCase();

  if (lowerName.endsWith(".docx") || mime.includes("wordprocessingml.document")) {
    const result = await mammoth.extractRawText({ buffer: params.buffer });
    return { kind: "text", text: (result.value || "").trim().slice(0, 32000) };
  }

  if (lowerName.endsWith(".pdf") || mime === "application/pdf") {
    return {
      kind: "pdf_binary",
      text: extractFallbackTextFromPdfBuffer(params.buffer),
    };
  }

  return {
    kind: "text",
    text: params.buffer.toString("utf8").trim().slice(0, 32000),
  };
}

type GeminiCvPayload = {
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  appliedPosition?: string;
  lastCompany?: string;
  lastDesignation?: string;
  lastEmploymentDates?: string;
  cvSummary?: string;
  claimedResponsibilities?: string[];
  claimedAchievements?: string[];
  detectedPoc?: {
    fullName?: string;
    designation?: string;
    email?: string;
    phone?: string;
  };
  resumeSpecificQuestions?: Array<{
    questionText?: string;
    claimContext?: string;
  }>;
};

async function callGeminiCvAnalyzer(params: {
  kind: "pdf_binary" | "text";
  buffer: Buffer;
  extractedText: string;
  filename: string;
  appliedPositionHint?: string;
}): Promise<GeminiCvPayload | null> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return null;

  const systemPrompt = `You are an expert HR Background Verification & Reference Check Analyst at D'Genius Solutions.
Analyze the candidate's CV/Resume carefully and return strictly valid JSON matching this schema:
{
  "candidateName": "Full name of candidate",
  "candidateEmail": "Email if found else empty string",
  "candidatePhone": "Phone if found else empty string",
  "appliedPosition": "Target role / headline role of candidate",
  "lastCompany": "Exact name of the MOST RECENT (last/current) company they worked at",
  "lastDesignation": "Exact job title/designation at that LAST company",
  "lastEmploymentDates": "Start - End dates at that LAST company (e.g. Jan 2024 - Oct 2025 or Mar 2023 - Present)",
  "cvSummary": "2-3 sentence concise executive summary of candidate experience and claims at their last company",
  "claimedResponsibilities": ["up to 5 concise bullet statements of responsibilities claimed at last company"],
  "claimedAchievements": ["up to 5 concise bullet statements of measurable/specific achievements claimed at last company"],
  "detectedPoc": {
    "fullName": "Reference or reporting manager name if explicitly named on CV, else empty string",
    "designation": "Reference title if named on CV, else empty string",
    "email": "Reference email if named on CV, else empty string",
    "phone": "Reference phone if named on CV, else empty string"
  },
  "resumeSpecificQuestions": [
    {
      "questionText": "A clear Yes/No verification question referencing a specific project, metric, team size, or responsibility claimed at the LAST company (end with a question mark, answerable with Yes/No + brief clarification)",
      "claimContext": "Exact quote or paraphrase of the CV claim being verified"
    }
  ]
}

CRITICAL RULES:
1. Reference check MUST focus ONLY on the candidate's LAST (most recent) place of work. Do NOT mix in earlier internships or older companies unless there is only one employer in the CV.
2. Generate between 3 and 5 items in "resumeSpecificQuestions". Every question MUST be phrased cleanly so a former manager/HR POC can answer with a simple Yes/No selection and optional short reply.
3. Keep each question concise, polite, professional, and under 220 characters.
4. Return ONLY valid JSON.`;

  const userParts: Array<Record<string, unknown>> = [];
  if (params.kind === "pdf_binary") {
    userParts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: params.buffer.toString("base64"),
      },
    });
    userParts.push({
      text: `Scan this attached CV PDF (${params.filename})${
        params.appliedPositionHint ? ` (Candidate applied for: ${params.appliedPositionHint})` : ""
      }. Extract the candidate details, their LAST employer, and 4 to 5 resume-specific reference verification questions.`,
    });
  } else {
    userParts.push({
      text: `Filename: ${params.filename}${
        params.appliedPositionHint ? `\nApplied Position Hint: ${params.appliedPositionHint}` : ""
      }\n\nCV TEXT:\n${params.extractedText.slice(0, 26000)}`,
    });
  }

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(endpointForModel(model, apiKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: userParts }],
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.warn(`[cv-scanner] ${model} failed HTTP ${res.status}: ${errText.slice(0, 200)}`);
        continue;
      }
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;
      const parsed = safeParseJson<GeminiCvPayload>(text);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (err: any) {
      console.warn(`[cv-scanner] ${model} exception:`, err?.message || err);
    }
  }

  return null;
}

export function extractHeuristicFromCvText(
  text: string,
  filename: string,
  appliedPositionHint?: string
): Omit<CvScanResult, "questions" | "scannerMode"> {
  const clean = text.replace(/\r/g, "\n");
  const lines = clean
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = clean.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,5}/);

  const rawNameLine =
    lines.find(
      (l) =>
        l.length >= 3 &&
        l.length <= 50 &&
        !l.includes("@") &&
        !/resume|curriculum|vitae|experience|summary|profile|contact/i.test(l) &&
        /^[A-Za-z.\s'-]+$/.test(l)
    ) ||
    filename
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]*(?:cv|resume)[-_]*/gi, " ")
      .replace(/[-_]+/g, " ")
      .trim() ||
    "Candidate";

  const dateRangeRegex =
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[-–to]+\s*(?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})|\d{2}\/\d{4}\s*[-–to]+\s*(?:Present|Current|\d{2}\/\d{4})|\b20\d{2}\s*[-–]\s*(?:Present|Current|20\d{2}))/i;

  let lastCompany = "";
  let lastDesignation = appliedPositionHint || "";
  let lastEmploymentDates = "";

  const expStartIdx = lines.findIndex((l) =>
    /^(?:work\s+)?experience|employment\s+history|career\s+history|professional\s+experience/i.test(l)
  );
  const searchLines = expStartIdx >= 0 ? lines.slice(expStartIdx + 1, expStartIdx + 18) : lines;

  for (let i = 0; i < searchLines.length; i++) {
    const line = searchLines[i];
    const dm = line.match(dateRangeRegex);
    if (dm) {
      lastEmploymentDates = dm[1].trim();
      const beforeDate = line.slice(0, dm.index).replace(/[|,\-–•]+$/, "").trim();
      if (beforeDate && !lastCompany) {
        if (beforeDate.includes(" at ")) {
          const parts = beforeDate.split(/\s+at\s+/i);
          lastDesignation = lastDesignation || parts[0].trim();
          lastCompany = parts[1].trim();
        } else {
          lastCompany = beforeDate;
        }
      }
      if (!lastCompany && i > 0) {
        lastCompany = searchLines[i - 1];
      }
      if (!lastDesignation && i > 1) {
        lastDesignation = searchLines[i - 2];
      }
      break;
    }
  }

  const bullets = lines
    .filter((l) => /^[-•*]/.test(l) || (l.length > 30 && l.length < 220 && /\d+%|\bled\b|\bmanaged\b|\bbuilt\b|\bscaled\b|\bincreased\b|\bdelivered\b/i.test(l)))
    .map((l) => l.replace(/^[-•*\s]+/, "").trim())
    .slice(0, 6);

  return {
    candidateName: rawNameLine,
    candidateEmail: emailMatch ? emailMatch[0] : "",
    candidatePhone: phoneMatch ? phoneMatch[0].trim() : "",
    appliedPosition: appliedPositionHint || lastDesignation || "",
    lastCompany: lastCompany || "Previous Employer (verify from CV)",
    lastDesignation: lastDesignation || "Team Member / Specialist",
    lastEmploymentDates: lastEmploymentDates || "Recent tenure (confirm dates)",
    cvSummary: clean.slice(0, 400).replace(/\s+/g, " ").trim(),
    claimedResponsibilities: bullets.slice(0, 3),
    claimedAchievements: bullets.slice(3, 6),
    detectedPoc: undefined,
  };
}

export async function scanCandidateCvAndBuildQuestions(params: {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  appliedPositionHint?: string;
}): Promise<CvScanResult> {
  const extracted = await extractPlainTextFromCv({
    buffer: params.buffer,
    filename: params.filename,
    mimeType: params.mimeType,
  });

  const ai = await callGeminiCvAnalyzer({
    kind: extracted.kind,
    buffer: params.buffer,
    extractedText: extracted.text,
    filename: params.filename,
    appliedPositionHint: params.appliedPositionHint,
  });

  if (ai && ai.lastCompany) {
    const candidateName = (ai.candidateName || "").trim() || "Candidate";
    const lastCompany = (ai.lastCompany || "").trim();
    const lastDesignation = (ai.lastDesignation || "").trim() || "Team Member";
    const lastEmploymentDates = (ai.lastEmploymentDates || "").trim() || "Stated tenure";
    const claimedResponsibilities = Array.isArray(ai.claimedResponsibilities)
      ? ai.claimedResponsibilities.map((s) => String(s).trim()).filter(Boolean).slice(0, 5)
      : [];
    const claimedAchievements = Array.isArray(ai.claimedAchievements)
      ? ai.claimedAchievements.map((s) => String(s).trim()).filter(Boolean).slice(0, 5)
      : [];

    const common = buildCommonQuestions({
      candidateName,
      lastCompany,
      lastDesignation,
      lastEmploymentDates,
    });

    const aiResumeQuestions: ReferenceQuestion[] = Array.isArray(ai.resumeSpecificQuestions)
      ? ai.resumeSpecificQuestions
          .filter((q) => q && q.questionText)
          .slice(0, 5)
          .map((q, idx) => ({
            id: `q${6 + idx}`,
            questionText: String(q.questionText).trim(),
            category: "resume_claim" as const,
            answerType: "yes_no_comment" as const,
            claimContext: q.claimContext ? String(q.claimContext).trim() : undefined,
            enabled: true,
          }))
      : buildResumeFallbackQuestions({
          candidateName,
          lastCompany,
          claimedResponsibilities,
          claimedAchievements,
          maxCount: 5,
        });

    const detectedPoc =
      ai.detectedPoc &&
      (ai.detectedPoc.fullName || ai.detectedPoc.email || ai.detectedPoc.designation || ai.detectedPoc.phone)
        ? {
            fullName: (ai.detectedPoc.fullName || "").trim() || undefined,
            designation: (ai.detectedPoc.designation || "").trim() || undefined,
            email: (ai.detectedPoc.email || "").trim() || undefined,
            phone: (ai.detectedPoc.phone || "").trim() || undefined,
          }
        : undefined;

    return {
      candidateName,
      candidateEmail: (ai.candidateEmail || "").trim(),
      candidatePhone: (ai.candidatePhone || "").trim(),
      appliedPosition: (ai.appliedPosition || params.appliedPositionHint || lastDesignation).trim(),
      lastCompany,
      lastDesignation,
      lastEmploymentDates,
      cvSummary: (ai.cvSummary || extracted.text.slice(0, 350)).trim(),
      claimedResponsibilities,
      claimedAchievements,
      detectedPoc,
      questions: normalizeAndCapQuestions(common, aiResumeQuestions),
      scannerMode: "gemini_ai",
    };
  }

  // Fallback path if Gemini API is unavailable or rate-limited
  const heuristic = extractHeuristicFromCvText(
    extracted.text,
    params.filename,
    params.appliedPositionHint
  );
  const common = buildCommonQuestions({
    candidateName: heuristic.candidateName,
    lastCompany: heuristic.lastCompany,
    lastDesignation: heuristic.lastDesignation,
    lastEmploymentDates: heuristic.lastEmploymentDates,
  });
  const resumeQuestions = buildResumeFallbackQuestions({
    candidateName: heuristic.candidateName,
    lastCompany: heuristic.lastCompany,
    claimedResponsibilities: heuristic.claimedResponsibilities,
    claimedAchievements: heuristic.claimedAchievements,
    maxCount: 4,
  });

  return {
    ...heuristic,
    questions: normalizeAndCapQuestions(common, resumeQuestions),
    scannerMode: "heuristic_fallback",
  };
}
