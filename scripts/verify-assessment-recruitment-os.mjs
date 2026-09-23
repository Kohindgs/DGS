import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";

test("REQ-01: Structured JD lifecycle management fields", async () => {
  const jdRoute = await fs.readFile("app/api/admin/assessment/jds/route.ts", "utf8");
  assert.ok(jdRoute.includes("createAssessmentJd"), "Must provide createAssessmentJd");
  assert.ok(jdRoute.includes("duplicateAssessmentJd"), "Must support JD duplication");
  assert.ok(jdRoute.includes("updateAssessmentJd"), "Must support JD update");
});

test("REQ-02: Gemini 2.5 Flash AI blueprint generation with Flash Lite fallback", async () => {
  const geminiEngine = await fs.readFile("lib/assessments/gemini-engine.ts", "utf8");
  assert.ok(geminiEngine.includes("gemini-2.5-flash"), "Must default to gemini-2.5-flash");
  assert.ok(geminiEngine.includes("gemini-2.5-flash-lite"), "Must fallback to gemini-2.5-flash-lite");
  assert.ok(geminiEngine.includes("generateTestFromJD"), "Must export generateTestFromJD");
});

test("REQ-03: Live Gemini API health check endpoint", async () => {
  const healthRoute = await fs.readFile("app/api/admin/assessment/test-connection/route.ts", "utf8");
  assert.ok(healthRoute.includes("testGeminiConnection"), "Must invoke testGeminiConnection");
});

test("REQ-04 & REQ-05: Per-question recommendations & single-question regeneration", async () => {
  const regenRoute = await fs.readFile("app/api/admin/assessment/regenerate-question/route.ts", "utf8");
  assert.ok(regenRoute.includes("regenerateSingleQuestion"), "Must invoke targeted question regeneration");
  assert.ok(regenRoute.includes("recommendation"), "Must inject HR recommendation into prompt");
});

test("REQ-06 & REQ-07: Manual question authoring & blueprint questions schema", async () => {
  const geminiEngine = await fs.readFile("lib/assessments/gemini-engine.ts", "utf8");
  assert.ok(geminiEngine.includes('"mcq"'), "Must support MCQ questions");
  assert.ok(geminiEngine.includes('"short"'), "Must support short answer questions");
  assert.ok(geminiEngine.includes('"long"'), "Must support long written questions");
});

test("REQ-08: Version immutability lock on approved versions", async () => {
  const versionRoute = await fs.readFile("app/api/admin/assessment/versions/[id]/route.ts", "utf8");
  assert.ok(versionRoute.includes('version.status === "approved"'), "Must check approved status");
  assert.ok(versionRoute.includes("immutable"), "Must reject approved version mutation");
});

test("REQ-09: Candidate test preview mode in admin", async () => {
  const adminView = await fs.readFile("app/admin/assessment/AssessmentClientView.tsx", "utf8");
  assert.ok(adminView.includes("Candidate Test Preview"), "Must provide Candidate Test Preview button");
  assert.ok(adminView.includes("showPreviewModal"), "Must render candidate preview modal");
});

test("REQ-10: Secure private candidate CV & document storage outside web root", async () => {
  const assessmentsDb = await fs.readFile("lib/cms/assessments.ts", "utf8");
  assert.ok(
    assessmentsDb.includes('storage", "private", "candidates'),
    "Files must be stored in storage/private/candidates outside public web root"
  );
  assert.ok(assessmentsDb.includes("getPrivateCandidateDocument"), "Must provide secure private file stream");
});

test("REQ-11 & REQ-12: Multi-dimensional AI CV vs JD fit analysis", async () => {
  const geminiEngine = await fs.readFile("lib/assessments/gemini-engine.ts", "utf8");
  assert.ok(geminiEngine.includes("compareResumeToJD"), "Must export compareResumeToJD");
  assert.ok(geminiEngine.includes("skills_score"), "Must calculate skills score");
  assert.ok(geminiEngine.includes("missing_skills"), "Must identify missing skills");
});

test("REQ-13: Visual fit graph/chart rendering", async () => {
  const adminView = await fs.readFile("app/admin/assessment/AssessmentClientView.tsx", "utf8");
  assert.ok(adminView.includes("Fit Breakdown"), "Must render visual fit breakdown section");
  assert.ok(adminView.includes("Technical Skills"), "Must render skills progress dimension");
});

test("REQ-14 & REQ-15: Resilient form state & localStorage autosave", async () => {
  const runner = await fs.readFile("components/assessments/AssessmentRunner.tsx", "utf8");
  assert.ok(runner.includes("localStorage.getItem"), "Must restore cached answers on mount");
  assert.ok(runner.includes("localStorage.setItem"), "Must persist answers to localStorage");
});

test("REQ-17: Failure recovery without wiping candidate answers", async () => {
  const runner = await fs.readFile("components/assessments/AssessmentRunner.tsx", "utf8");
  assert.ok(runner.includes('setStatus("ready")'), "Must return to ready state on error without wiping formAnswers");
  assert.ok(runner.includes("Submission failed"), "Must display clear retry prompt");
});

test("REQ-18: Answer immutability post-submission", async () => {
  const submitRoute = await fs.readFile("app/api/assessment/submit/route.ts", "utf8");
  assert.ok(submitRoute.includes("attempt.submitted_at"), "Must check if attempt is already submitted");
  assert.ok(submitRoute.includes("Assessment attempt is unavailable"), "Must reject resubmissions");
});

test("REQ-19: Zero candidate answer key or score disclosure", async () => {
  const submitRoute = await fs.readFile("app/api/assessment/submit/route.ts", "utf8");
  assert.equal(submitRoute.includes("objectiveScore"), false, "Must never return objectiveScore to candidate");
  assert.equal(submitRoute.includes("objectiveTotal"), false, "Must never return objectiveTotal to candidate");
});

test("REQ-20: Server-enforced countdown timer with auto-submit", async () => {
  const submitRoute = await fs.readFile("app/api/assessment/submit/route.ts", "utf8");
  assert.ok(submitRoute.includes("elapsed>allowedMs"), "Server must enforce timer expiration");

  const runner = await fs.readFile("components/assessments/AssessmentRunner.tsx", "utf8");
  assert.ok(runner.includes("auto_submitted_time_expired"), "Client must auto-submit upon timer expiry");
});

test("REQ-21: Anti-cheat activity tracking", async () => {
  const runner = await fs.readFile("components/assessments/AssessmentRunner.tsx", "utf8");
  assert.ok(runner.includes("visibilitychange"), "Must listen to visibilitychange");
  assert.ok(runner.includes("blur"), "Must listen to window blur");
  assert.ok(runner.includes("paste"), "Must log paste events");
});

test("REQ-22: Server-side MCQ scoring", async () => {
  const submitRoute = await fs.readFile("app/api/assessment/submit/route.ts", "utf8");
  assert.ok(submitRoute.includes("question.correctIndex"), "Must compute score using server definition correctIndex");
});

test("REQ-25: AI tailored interview questions generation", async () => {
  const geminiEngine = await fs.readFile("lib/assessments/gemini-engine.ts", "utf8");
  assert.ok(
    geminiEngine.includes("generateCandidateInterviewSummary"),
    "Must export generateCandidateInterviewSummary"
  );
});

test("REQ-28: Deterministic conditional screening rules", async () => {
  const adminView = await fs.readFile("app/admin/assessment/AssessmentClientView.tsx", "utf8");
  assert.ok(adminView.includes("Screening Status"), "Must render Screening Status section");
  assert.ok(adminView.includes("QUALIFIED"), "Must display screening qualification tag");
});

test("REQ-29: Side-by-side 3-pane candidate review workstation", async () => {
  const adminView = await fs.readFile("app/admin/assessment/AssessmentClientView.tsx", "utf8");
  assert.ok(
    adminView.includes("gridTemplateColumns: \"320px 1fr 340px\""),
    "Must implement 3-pane grid layout for Left CV, Center Answers, Right AI Fit"
  );
  assert.ok(adminView.includes("Anti-Cheat Activity Timeline"), "Must display anti-cheat logs in workstation");
});

test("REQ-30: 13-stage recruitment pipeline", async () => {
  const assessmentsDb = await fs.readFile("lib/cms/assessments.ts", "utf8");
  const match = assessmentsDb.match(/export const PIPELINE_STAGES = \[([\s\S]*?)\] as const;/);
  assert.ok(match, "PIPELINE_STAGES must be defined");
  const stages = match[1]
    .split(",")
    .map((s) => s.replace(/["'\s]/g, ""))
    .filter(Boolean);
  assert.equal(stages.length, 13);
  assert.deepEqual(stages, [
    "called",
    "shortlisted",
    "interview_scheduled",
    "interview_done",
    "test_created",
    "test_assigned",
    "test_submitted",
    "selected",
    "offer_sent",
    "offer_accepted",
    "appointment_issued",
    "onboarded",
    "rejected",
  ]);
});

test("REQ-31: HR document management and authenticated download", async () => {
  const hrRoute = await fs.readFile("app/api/admin/hr/pipeline/[id]/route.ts", "utf8");
  assert.ok(hrRoute.includes("hr_documents"), "Must query hr_documents for candidate");

  const filesRoute = await fs.readFile("app/api/admin/files/private/[id]/route.ts", "utf8");
  assert.ok(filesRoute.includes("getPrivateCandidateDocument"), "Must stream private file securely");
});

test("REQ-32: Superadmin candidate deletion protection with immutable audit log", async () => {
  const candidateApi = await fs.readFile("app/api/admin/assessment/candidates/[id]/route.ts", "utf8");
  assert.ok(
    candidateApi.includes('currentUser.role !== "superadmin"'),
    "Candidate deletion must strictly require superadmin role"
  );

  const hrPipelineApi = await fs.readFile("app/api/admin/hr/pipeline/[id]/route.ts", "utf8");
  assert.ok(
    hrPipelineApi.includes('currentUser.role !== "superadmin"'),
    "HR Pipeline candidate deletion must strictly require superadmin role"
  );

  const assessmentsDb = await fs.readFile("lib/cms/assessments.ts", "utf8");
  assert.ok(assessmentsDb.includes("hr.candidate.delete"), "Must log audit event for candidate deletion");
});
