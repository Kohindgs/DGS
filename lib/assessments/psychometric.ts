export type PsychometricTrait =
  | "ownership"
  | "adaptability"
  | "collaboration"
  | "communication"
  | "problem_solving"
  | "integrity"
  | "initiative"
  | "resilience";

export interface PsychometricOption {
  id?: string;
  label: string;
  value: number; // 0 to 3
  traits: Partial<Record<PsychometricTrait, number>>;
}

export interface PsychometricQuestion {
  id: string;
  type: "psychometric";
  prompt: string;
  options: PsychometricOption[];
  competencyTag: string;
  context?: string;
}

export interface CandidatePsychometricQuestion {
  id: string;
  type: "psychometric";
  prompt: string;
  options: Array<{ id: string; label: string }>;
  competencyTag?: string;
}

export interface TraitScore {
  trait: PsychometricTrait;
  label: string;
  score: number; // Normalized 0-100
  rawScore: number;
  maxPossible: number;
  description: string;
}

export interface PsychometricProfileResult {
  classification: "STRONG WORKPLACE ALIGNMENT" | "SOLID WORKPLACE ALIGNMENT" | "MIXED / NEEDS HUMAN REVIEW";
  averageScore: number;
  traits: Record<PsychometricTrait, TraitScore>;
  questionsAnswered: number;
  totalQuestions: number;
  humanReviewRequired: true;
  summary: string;
  methodology: string;
}

export const PSYCHOMETRIC_TRAIT_LABELS: Record<PsychometricTrait, string> = {
  ownership: "Ownership & Accountability",
  adaptability: "Adaptability & Flexibility",
  collaboration: "Collaboration & Teamwork",
  communication: "Clear Communication",
  problem_solving: "Analytical Problem Solving",
  integrity: "Professional Integrity",
  initiative: "Proactive Initiative",
  resilience: "Resilience Under Pressure",
};

/**
 * Validated deterministic bank of 10 employment-focused workplace situations.
 * Strictly avoids medical, clinical, personality disorder, or protected-class inference.
 */
export const DEFAULT_PSYCHOMETRIC_QUESTIONS: PsychometricQuestion[] = [
  {
    id: "psy_1",
    type: "psychometric",
    competencyTag: "Ownership & Accountability",
    prompt: "You notice an overlooked configuration error in a live client campaign that went live yesterday. No one else has flagged it yet. What is your immediate action?",
    options: [
      {
        id: "opt_1_a",
        label: "Immediately document the issue, notify your lead with a verified fix and impact summary, and correct it after approval.",
        value: 3,
        traits: { ownership: 3, integrity: 3, communication: 2 },
      },
      {
        id: "opt_1_b",
        label: "Silently patch the error without alerting anyone so the team does not worry unnecessarily.",
        value: 1,
        traits: { ownership: 2, integrity: 1, communication: 0 },
      },
      {
        id: "opt_1_c",
        label: "Wait to see if the client notices before bringing it to leadership attention.",
        value: 0,
        traits: { ownership: 0, integrity: 0, initiative: 0 },
      },
      {
        id: "opt_1_d",
        label: "Ask a colleague if they worked on it first to determine who was originally responsible.",
        value: 1,
        traits: { ownership: 1, collaboration: 1, initiative: 1 },
      },
    ],
  },
  {
    id: "psy_2",
    type: "psychometric",
    competencyTag: "Adaptability & Flexibility",
    prompt: "A major search engine or platform algorithm update unexpectedly invalidates your planned 60-day roadmap. How do you respond?",
    options: [
      {
        id: "opt_2_a",
        label: "Analyze the official documentation and search data, formulate a restructured mitigation roadmap, and align team priorities.",
        value: 3,
        traits: { adaptability: 3, problem_solving: 3, initiative: 2 },
      },
      {
        id: "opt_2_b",
        label: "Continue with the existing plan until client quarterly reviews force a pivot.",
        value: 0,
        traits: { adaptability: 0, initiative: 0, resilience: 0 },
      },
      {
        id: "opt_2_c",
        label: "Hold off on all client execution until other industry agencies confirm what works.",
        value: 1,
        traits: { adaptability: 1, problem_solving: 1, resilience: 1 },
      },
      {
        id: "opt_2_d",
        label: "Voice frustration about the disruption to team members while awaiting new instructions.",
        value: 0,
        traits: { adaptability: 0, communication: 0, resilience: 0 },
      },
    ],
  },
  {
    id: "psy_3",
    type: "psychometric",
    competencyTag: "Collaboration & Teamwork",
    prompt: "A cross-functional colleague strongly disagrees with your technical recommendations during a client strategy session. How do you handle the disagreement?",
    options: [
      {
        id: "opt_3_a",
        label: "Keep discussions calm and unified in front of the client, then schedule an internal sync with data to find the optimal hybrid solution.",
        value: 3,
        traits: { collaboration: 3, communication: 3, integrity: 2 },
      },
      {
        id: "opt_3_b",
        label: "Debate the colleague directly in front of the client to prove your technical perspective is superior.",
        value: 0,
        traits: { collaboration: 0, communication: 0, integrity: 1 },
      },
      {
        id: "opt_3_c",
        label: "Concede immediately to avoid conflict, even if you know their suggestion may harm performance.",
        value: 1,
        traits: { collaboration: 1, ownership: 0, integrity: 1 },
      },
      {
        id: "opt_3_d",
        label: "Escalate the issue straight to executive leadership without speaking to the colleague privately.",
        value: 1,
        traits: { collaboration: 1, communication: 1, problem_solving: 1 },
      },
    ],
  },
  {
    id: "psy_4",
    type: "psychometric",
    competencyTag: "Clear Communication",
    prompt: "A project deliverable will be delayed by 48 hours due to unforeseen third-party API rate limits. How do you communicate this to the account director?",
    options: [
      {
        id: "opt_4_a",
        label: "Send a proactive update 24 hours in advance explaining the bottleneck, the revised ETA, and the contingency actions being taken.",
        value: 3,
        traits: { communication: 3, ownership: 3, problem_solving: 2 },
      },
      {
        id: "opt_4_b",
        label: "Work overtime quietly and only inform them at the deadline if it turns out you cannot deliver in time.",
        value: 1,
        traits: { communication: 1, resilience: 2, ownership: 1 },
      },
      {
        id: "opt_4_c",
        label: "Wait for the account director to ask for the status before giving excuses.",
        value: 0,
        traits: { communication: 0, ownership: 0, initiative: 0 },
      },
      {
        id: "opt_4_d",
        label: "Blame the third-party provider and suggest the client should lower their expectations.",
        value: 0,
        traits: { communication: 0, ownership: 0, collaboration: 0 },
      },
    ],
  },
  {
    id: "psy_5",
    type: "psychometric",
    competencyTag: "Analytical Problem Solving",
    prompt: "You are tasked with solving a recurring technical drop in campaign efficiency that three other specialists failed to resolve. What is your process?",
    options: [
      {
        id: "opt_5_a",
        label: "Break down the historical data, isolate variables through controlled tests, and document evidence before making changes.",
        value: 3,
        traits: { problem_solving: 3, initiative: 2, ownership: 2 },
      },
      {
        id: "opt_5_b",
        label: "Apply the most popular generic advice found on industry blogs to see if anything sticks.",
        value: 1,
        traits: { problem_solving: 1, initiative: 1, adaptability: 1 },
      },
      {
        id: "opt_5_c",
        label: "Inform leadership that the problem is unsolvable because previous colleagues already tried.",
        value: 0,
        traits: { problem_solving: 0, resilience: 0, initiative: 0 },
      },
      {
        id: "opt_5_d",
        label: "Make rapid multiple adjustments at once across all assets so changes happen faster.",
        value: 1,
        traits: { problem_solving: 1, initiative: 2, integrity: 1 },
      },
    ],
  },
  {
    id: "psy_6",
    type: "psychometric",
    competencyTag: "Professional Integrity",
    prompt: "A client asks you to implement a deceptive shortcut or black-hat technique to artificially inflate their month-end numbers. How do you respond?",
    options: [
      {
        id: "opt_6_a",
        label: "Respectfully explain the penalty risks, uphold agency standards, and propose high-velocity legitimate strategies to achieve their growth goals.",
        value: 3,
        traits: { integrity: 3, communication: 3, problem_solving: 2 },
      },
      {
        id: "opt_6_b",
        label: "Execute what the client asks since they are paying for the service.",
        value: 0,
        traits: { integrity: 0, ownership: 0, communication: 0 },
      },
      {
        id: "opt_6_c",
        label: "Refuse rudely and accuse the client of attempting fraud.",
        value: 1,
        traits: { integrity: 2, communication: 0, collaboration: 0 },
      },
      {
        id: "opt_6_d",
        label: "Ignore the request and hope the client forgets about it.",
        value: 0,
        traits: { integrity: 1, communication: 0, ownership: 0 },
      },
    ],
  },
  {
    id: "psy_7",
    type: "psychometric",
    competencyTag: "Proactive Initiative",
    prompt: "You notice that a recurring weekly reporting task consumes 6 manual hours for your team every Monday. What do you do?",
    options: [
      {
        id: "opt_7_a",
        label: "Build or propose an automated workflow or template during downtime to reduce the weekly effort to under 30 minutes.",
        value: 3,
        traits: { initiative: 3, problem_solving: 3, collaboration: 2 },
      },
      {
        id: "opt_7_b",
        label: "Complete your assigned portion each week without questioning the process.",
        value: 1,
        traits: { initiative: 1, ownership: 1, adaptability: 1 },
      },
      {
        id: "opt_7_c",
        label: "Complain to colleagues that management gives tedious tasks.",
        value: 0,
        traits: { initiative: 0, collaboration: 0, resilience: 0 },
      },
      {
        id: "opt_7_d",
        label: "Skip the reporting task occasionally when other work gets busy.",
        value: 0,
        traits: { initiative: 0, ownership: 0, integrity: 0 },
      },
    ],
  },
  {
    id: "psy_8",
    type: "psychometric",
    competencyTag: "Resilience Under Pressure",
    prompt: "During a major client quarterly review, leadership rejects your creative concept and requests an entirely new direction within 24 hours. How do you handle this?",
    options: [
      {
        id: "opt_8_a",
        label: "Treat the feedback as valuable alignment data, rally necessary resources, and focus calmly on delivering a strong revised concept on time.",
        value: 3,
        traits: { resilience: 3, adaptability: 3, ownership: 2 },
      },
      {
        id: "opt_8_b",
        label: "Take the rejection personally and disengage from the project for the rest of the day.",
        value: 0,
        traits: { resilience: 0, collaboration: 0, professionalism: 0 } as any,
      },
      {
        id: "opt_8_c",
        label: "Rush out a minimal sloppy draft just to meet the 24-hour turnaround.",
        value: 1,
        traits: { resilience: 1, ownership: 0, integrity: 1 },
      },
      {
        id: "opt_8_d",
        label: "Argue that the leadership does not understand the market before begrudgingly working.",
        value: 1,
        traits: { resilience: 1, collaboration: 0, adaptability: 1 },
      },
    ],
  },
  {
    id: "psy_9",
    type: "psychometric",
    competencyTag: "Learning & Feedback Orientation",
    prompt: "Your manager conducts a quality audit of your work and points out three specific analytical oversights in your execution. How do you approach this?",
    options: [
      {
        id: "opt_9_a",
        label: "Acknowledge the points, ask clarifying questions to ensure deep understanding, and update your personal checklist to prevent recurrence.",
        value: 3,
        traits: { ownership: 3, adaptability: 3, collaboration: 2 },
      },
      {
        id: "opt_9_b",
        label: "Make excuses about workload and tight deadlines to defend why the oversights occurred.",
        value: 1,
        traits: { ownership: 1, resilience: 1, communication: 1 },
      },
      {
        id: "opt_9_c",
        label: "Quietly accept the criticism but continue doing the task the exact same way.",
        value: 0,
        traits: { ownership: 0, adaptability: 0, integrity: 0 },
      },
      {
        id: "opt_9_d",
        label: "Avoid interacting with the manager for the remainder of the week.",
        value: 0,
        traits: { communication: 0, collaboration: 0, resilience: 0 },
      },
    ],
  },
  {
    id: "psy_10",
    type: "psychometric",
    competencyTag: "Client Focus & Ownership",
    prompt: "An enterprise client contacts you in distress on a Friday evening because an urgent executive meeting requires updated campaign performance figures. What is your response?",
    options: [
      {
        id: "opt_9_a",
        label: "Verify the request, quickly extract the verified key figures, send a concise executive summary, and schedule a Monday follow-up.",
        value: 3,
        traits: { ownership: 3, communication: 3, resilience: 2 },
      },
      {
        id: "opt_10_b",
        label: "Ignore the message completely until Monday morning since it arrived after official hours.",
        value: 1,
        traits: { ownership: 1, communication: 0, adaptability: 0 },
      },
      {
        id: "opt_10_c",
        label: "Send unverified raw data without checking accuracy just to respond quickly.",
        value: 1,
        traits: { integrity: 0, ownership: 1, problem_solving: 1 },
      },
      {
        id: "opt_10_d",
        label: "Forward the email to your manager without acknowledgment to let them deal with it.",
        value: 1,
        traits: { ownership: 0, initiative: 0, communication: 1 },
      },
    ],
  },
];

/**
 * Sanitizes psychometric questions for the candidate runner.
 * Completely strips `value`, `traits`, `competencyTag`, internal scoring rules.
 */
export function sanitizePsychometricQuestions(
  questions: PsychometricQuestion[]
): CandidatePsychometricQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    type: "psychometric",
    prompt: q.prompt,
    options: q.options.map((opt, idx) => ({
      id: opt.id || `opt_${idx}`,
      label: opt.label,
    })),
  }));
}

/**
 * Deterministic scoring engine for candidate psychometric responses.
 * Never auto-rejects; produces descriptive alignment bands.
 */
export function calculatePsychometricProfile(
  candidateAnswers: Record<string, string | number>,
  questionBank: PsychometricQuestion[] = DEFAULT_PSYCHOMETRIC_QUESTIONS
): PsychometricProfileResult {
  const traitSums: Record<PsychometricTrait, number> = {
    ownership: 0,
    adaptability: 0,
    collaboration: 0,
    communication: 0,
    problem_solving: 0,
    integrity: 0,
    initiative: 0,
    resilience: 0,
  };

  const traitMaxes: Record<PsychometricTrait, number> = {
    ownership: 0,
    adaptability: 0,
    collaboration: 0,
    communication: 0,
    problem_solving: 0,
    integrity: 0,
    initiative: 0,
    resilience: 0,
  };

  let answeredCount = 0;

  for (const q of questionBank) {
    // Calculate maximum possible for each trait in this question
    const maxPerTraitInQuestion: Partial<Record<PsychometricTrait, number>> = {};
    for (const opt of q.options) {
      if (opt.traits) {
        for (const [t, val] of Object.entries(opt.traits)) {
          const trait = t as PsychometricTrait;
          if (traitMaxes[trait] !== undefined) {
            maxPerTraitInQuestion[trait] = Math.max(maxPerTraitInQuestion[trait] || 0, val || 0);
          }
        }
      }
    }
    for (const [t, maxVal] of Object.entries(maxPerTraitInQuestion)) {
      traitMaxes[t as PsychometricTrait] += maxVal;
    }

    // Evaluate candidate choice
    const answer = candidateAnswers[q.id];
    if (answer !== undefined && answer !== null && answer !== "") {
      answeredCount++;
      let selectedOption: PsychometricOption | undefined;

      if (typeof answer === "number" || (/^\d+$/.test(String(answer)) && Number(answer) < q.options.length)) {
        selectedOption = q.options[Number(answer)];
      } else {
        selectedOption = q.options.find((o) => o.id === String(answer) || o.label === String(answer));
      }

      if (selectedOption && selectedOption.traits) {
        for (const [t, val] of Object.entries(selectedOption.traits)) {
          const trait = t as PsychometricTrait;
          if (traitSums[trait] !== undefined) {
            traitSums[trait] += val || 0;
          }
        }
      }
    }
  }

  // Normalize traits to 0-100 scale
  const traitScores: Record<PsychometricTrait, TraitScore> = {} as any;
  let totalPctSum = 0;
  let traitCount = 0;

  const traitDescriptions: Record<PsychometricTrait, string> = {
    ownership: "Accountability for outcomes, adherence to QA standards, and taking responsibility for client deliverables.",
    adaptability: "Ability to pivot effectively when platforms, roadmaps, or requirements shift unexpectedly.",
    collaboration: "Constructive teamwork, resolving disagreements with evidence, and cross-functional alignment.",
    communication: "Clarity, proactive stakeholder transparency, and executive reporting poise.",
    problem_solving: "Methodical root-cause diagnosis and analytical reasoning without guesswork.",
    integrity: "Upholding professional ethics, compliance with search policies, and agency standards.",
    initiative: "Identifying inefficiencies and building solutions without waiting for direct orders.",
    resilience: "Composure and focus under deadline pressure, feedback critique, and operational hurdles.",
  };

  for (const t of Object.keys(traitSums) as PsychometricTrait[]) {
    const raw = traitSums[t];
    const max = Math.max(1, traitMaxes[t]);
    const normalized = Math.min(100, Math.max(0, Math.round((raw / max) * 100)));
    traitScores[t] = {
      trait: t,
      label: PSYCHOMETRIC_TRAIT_LABELS[t],
      score: normalized,
      rawScore: raw,
      maxPossible: max,
      description: traitDescriptions[t],
    };
    totalPctSum += normalized;
    traitCount++;
  }

  const averageScore = Math.round(totalPctSum / Math.max(1, traitCount));

  let classification: "STRONG WORKPLACE ALIGNMENT" | "SOLID WORKPLACE ALIGNMENT" | "MIXED / NEEDS HUMAN REVIEW";
  if (averageScore >= 75) {
    classification = "STRONG WORKPLACE ALIGNMENT";
  } else if (averageScore >= 55) {
    classification = "SOLID WORKPLACE ALIGNMENT";
  } else {
    classification = "MIXED / NEEDS HUMAN REVIEW";
  }

  return {
    classification,
    averageScore,
    traits: traitScores,
    questionsAnswered: answeredCount,
    totalQuestions: questionBank.length,
    humanReviewRequired: true,
    summary: `Candidate demonstrated ${classification.toLowerCase()} with an average workplace situational score of ${averageScore}%. Evaluated across ${questionBank.length} standardized employment scenarios. Human HR review remains mandatory.`,
    methodology: "Standardized workplace situational judgment evaluation calibrated across 8 core operational traits. Deterministic trait weighting normalized to 100-point scale. Non-diagnostic, strictly supplemental employment tool.",
  };
}
