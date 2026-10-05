import fs from "node:fs";
import path from "node:path";

const PROD_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.4 END-TO-END PRODUCTION ASSESSMENT VERIFICATION");
  console.log("==================================================");

  // Read production env for admin credentials
  const envPath = path.join(process.cwd(), ".env.production");
  const envContent = fs.readFileSync(envPath, "utf8");
  let email = "";
  let password = "";
  for (const line of envContent.split(/\r?\n/)) {
    if (line.startsWith("DGS_ADMIN_EMAIL=")) {
      email = line.slice("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"](.*)['"]$/, "$1");
    }
    if (line.startsWith("DGS_ADMIN_PASSWORD=")) {
      password = line.slice("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }

  console.log("1. Authenticating as Admin via /api/admin/session...");
  const loginParams = new URLSearchParams();
  loginParams.set("email", email);
  loginParams.set("password", password);

  const loginRes = await fetch(`${PROD_URL}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: loginParams.toString(),
    redirect: "manual",
  });

  const cookieHeader = loginRes.headers.get("set-cookie");
  if (!cookieHeader) {
    throw new Error("Failed to acquire session cookie from /api/admin/session");
  }
  const sessionCookie = cookieHeader.split(";")[0];
  console.log(`✓ Admin session acquired: ${sessionCookie.slice(0, 24)}...`);

  const authHeaders = {
    Cookie: sessionCookie,
    "Content-Type": "application/json",
  };

  console.log("\n2. Admin Assessment Blueprint Generation...");

  // Generate a new assessment blueprint with psychometric = 10
  const genPayload = {
    role_title: "Senior SEO & Technical Growth Specialist",
    difficulty: "senior",
    mcq_count: 5,
    short_count: 2,
    long_count: 1,
    include_psychometric: true,
    psychometric_count: 10,
    manual_draft: true
  };

  console.log("Generating assessment blueprint via /api/admin/assessment/generate...");
  const genRes = await fetch(`${PROD_URL}/api/admin/assessment/generate`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(genPayload)
  });

  const genData = await genRes.json();
  console.log(`Generate response status: ${genRes.status}, ok: ${genData.ok || genData.success}`);
  if (!genData.ok && !genData.success) {
    throw new Error(`Assessment generation failed: ${JSON.stringify(genData)}`);
  }

  const versionId = genData.versionId;
  const testData = genData.testData;
  const roleTitle = genData.roleTitle;

  console.log(`✓ Created Assessment Version: ${versionId} (${roleTitle})`);
  console.log(`  - MCQs: ${testData.mcqs?.length || 0}`);
  console.log(`  - Short Answers: ${testData.shortAnswers?.length || 0}`);
  console.log(`  - Long Answers: ${testData.longAnswers?.length || 0}`);
  console.log(`  - Psychometric Scenarios: ${testData.psychometric?.length || 0}`);
  console.log(`  - Duration: ${testData.durationMinutes}m`);

  if ((testData.psychometric?.length || 0) < 10) {
    throw new Error(`Expected at least 10 psychometric scenarios, found ${testData.psychometric?.length}`);
  }

  // 2b. Approve the version so it can be assigned
  console.log("\n2b. Approving Assessment Version...");
  const approveRes = await fetch(`${PROD_URL}/api/admin/assessment/versions/${versionId}/approve`, {
    method: "POST",
    headers: authHeaders
  });
  const approveData = await approveRes.json();
  console.log(`Approve status: ${approveRes.status}, ok: ${approveData.ok}`);
  if (!approveData.ok) {
    throw new Error(`Failed to approve version: ${JSON.stringify(approveData)}`);
  }
  console.log(`✓ Version ${versionId} approved successfully.`);

  // 3. Create Candidate Assignment Link
  console.log("\n3. Creating Candidate Assessment Link & Snapshot...");
  const assignPayload = {
    assessmentKey: versionId,
    name: "Alex Vance (V8.12.4 Audit)",
    email: "alex.vance.test@dgeniussolutions.com",
    phone: "+91 98765 43210",
    expiresInDays: 2,
    includePsychometric: true,
    durationMinutes: 75
  };

  const assignRes = await fetch(`${PROD_URL}/api/admin/assessment/assignments`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(assignPayload)
  });

  const assignData = await assignRes.json();
  console.log(`Assignment response status: ${assignRes.status}, success: ${assignData.success}`);
  if (!assignData.success || (!assignData.assignment && !assignData.assignmentId)) {
    throw new Error(`Assignment creation failed: ${JSON.stringify(assignData)}`);
  }

  const assignment = assignData.assignment || {
    id: assignData.assignmentId,
    candidateLink: assignData.assessmentUrl,
    token: assignData.token,
    duration_minutes: assignData.durationMinutes,
    psychometric_enabled: assignData.psychometricEnabled,
    assignment_snapshot: assignData.snapshotSummary,
  };

  console.log(`✓ Assignment Created ID: ${assignment.id}`);
  console.log(`  - Candidate Link: ${assignment.candidateLink || assignment.assessmentUrl}`);
  console.log(`  - Token: ${assignment.token}`);
  console.log(`  - Duration: ${assignment.duration_minutes || assignment.durationMinutes} min`);
  console.log(`  - Psychometric Enabled: ${assignment.psychometric_enabled}`);
  console.log(`  - Snapshot Frozen: ${!!assignment.assignment_snapshot}`);
  console.log(`  - Snapshot Summary:`, assignData.snapshotSummary || assignData.confirmationSummary);

  // 4. Candidate Experience: Load Public Assessment Link
  console.log("\n4. Candidate Experience: Loading Public Assessment Page & Sanitization Check...");
  const candidateUrl = assignment.candidateLink || `${PROD_URL}/assessment/${versionId}?token=${assignment.token}`;
  console.log(`Fetching candidate assessment page: ${candidateUrl}`);
  
  const pageRes = await fetch(candidateUrl);
  const pageHtml = await pageRes.text();
  console.log(`Candidate page status: ${pageRes.status}`);
  if (pageRes.status !== 200) {
    throw new Error(`Candidate assessment page failed to load (status ${pageRes.status})`);
  }

  // 5. Check Public Question Sanitization (CRITICAL SECURITY GATE)
  console.log("\n5. CRITICAL AUDIT: Public Question Sanitization Check...");
  const sensitiveTerms = [
    '"correctIndex"',
    '"rubric"',
    '"ideal_answer"',
    '"traits":{',
    '"ownership":',
    '"adaptability":',
    '"collaboration":',
    '"problem_solving":'
  ];

  for (const term of sensitiveTerms) {
    if (pageHtml.includes(term)) {
      throw new Error(`SECURITY BREACH: Candidate page leaked sensitive scoring metadata: ${term}`);
    }
  }
  console.log("✓ CRITICAL GATE PASSED: Zero scoring weights, rubrics, or internal traits exposed to candidate!");

  // 6. Start Candidate Assessment Session
  console.log("\n6. Candidate Starts Assessment Session (/api/assessment/start)...");
  const startRes = await fetch(`${PROD_URL}/api/assessment/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: assignment.token,
      assessmentKey: versionId
    })
  });

  const startData = await startRes.json();
  console.log(`Start response status: ${startRes.status}, ok: ${startData.ok || startData.success}`);
  if (!startData.ok && !startData.success) {
    throw new Error(`Start assessment failed: ${JSON.stringify(startData)}`);
  }

  const attemptId = startData.attemptId || startData.attempt?.id;
  console.log(`✓ Started Attempt ID: ${attemptId}, Duration: ${startData.durationMinutes || startData.duration_minutes}m`);

  // 7. Prepare Comprehensive Candidate Submission
  console.log("\n7. Simulating Candidate Test Completion & Submission...");
  
  // Technical MCQ & Short Answers
  const technicalAnswers = {};
  if (testData.mcqs) {
    testData.mcqs.forEach((mcq, idx) => {
      technicalAnswers[mcq.id || `mcq_${idx}`] = 0; // Choose first option
    });
  }
  if (testData.shortAnswers) {
    testData.shortAnswers.forEach((q, idx) => {
      technicalAnswers[q.id || `short_${idx}`] = "To systematically resolve critical bottlenecks under tight deadlines, I immediately isolate the blocking dependencies, communicate immediate risk projections to key stakeholders, delegate non-blocking parallel tasks across the team, and establish a continuous status checkpoint until production resolution is verified.";
    });
  }
  if (testData.longAnswers) {
    testData.longAnswers.forEach((q, idx) => {
      technicalAnswers[q.id || `long_${idx}`] = "In order to diagnose and resolve an enterprise-level organic traffic decline following a search engine core update, I execute a rigorous multi-phased diagnostic protocol. First, I segment search console performance by directory, template type, device, and query intent to isolate the exact landing pages suffering losses. Second, I perform a forensic technical crawl examining canonical tag hygiene, hreflang annotations, indexation flags, internal link equity distribution, and 301 redirect chains. Third, I conduct a comprehensive content quality and EEAT evaluation comparing our pages against winning competitors in the SERPs, identifying missing semantic coverage, depth gaps, and user satisfaction signals. Fourth, I formulate an executive communication briefing clarifying the nature of algorithmic recalibration versus technical defects to maintain stakeholder confidence. Finally, I deliver a prioritized 30-day technical remediation sprint resolving high-severity crawl budget blockers, consolidating thin pages, and establishing daily keyword tracking.";
    });
  }

  // Psychometric Answers (Must answer all 10 questions)
  const psychometricAnswers = {};
  testData.psychometric.forEach((psy, idx) => {
    psychometricAnswers[psy.id] = 0; // Candidate selects option 0
  });

  console.log(`Submitting ${Object.keys(technicalAnswers).length} technical answers and ${Object.keys(psychometricAnswers).length} psychometric answers...`);

  const submitPayload = {
    attemptId,
    token: assignment.token,
    answers: {
      ...technicalAnswers,
      ...psychometricAnswers
    },
    technicalAnswers,
    psychometricAnswers,
    practicalSubmission: "Completed technical audit report: Identified 14 duplicate canonicals and fixed with 301 rules."
  };

  const submitRes = await fetch(`${PROD_URL}/api/assessment/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submitPayload)
  });

  const submitData = await submitRes.json();
  console.log(`Submit response status: ${submitRes.status}, ok: ${submitData.ok || submitData.success}`);
  if (!submitData.ok && !submitData.success) {
    throw new Error(`Assessment submit failed: ${JSON.stringify(submitData)}`);
  }

  console.log("✓ Candidate successfully submitted assessment session!");

  // 8. Admin Verification: Candidate Workstation Results
  console.log("\n8. Admin Candidate Workstation Results Verification...");
  const candidateDetailRes = await fetch(`${PROD_URL}/api/admin/assessment/candidates/${attemptId}`, {
    headers: authHeaders
  });

  const candidateDetail = await candidateDetailRes.json();
  console.log(`Candidate detail response status: ${candidateDetailRes.status}, success: ${candidateDetail.success}`);
  if (!candidateDetail.success || !candidateDetail.candidate) {
    throw new Error(`Failed to load candidate details in admin: ${JSON.stringify(candidateDetail)}`);
  }

  const cand = candidateDetail.candidate;
  console.log(`✓ Candidate: ${cand.candidate_name || cand.candidateName}`);
  console.log(`✓ Assessment Status: ${cand.stage || cand.status}`);
  console.log(`✓ MCQ Score: ${cand.objective_score ?? cand.mcqScore} / ${cand.objective_total}`);
  console.log(`✓ Psychometric Profile: ${cand.psychometric_profile || cand.psychometricProfile}`);
  console.log(`✓ Psychometric Trait Scores:`, cand.psychometric_score_data || cand.psychometricScoreData);
  console.log(`✓ Practical Submission Received: ${!!(cand.practical_submission || cand.practicalSubmission)}`);

  const scoreData = cand.psychometric_score_data || cand.psychometricScoreData;
  if (!scoreData || typeof scoreData !== "object" || !scoreData.traits) {
    throw new Error("Missing trait scores in candidate details!");
  }

  const expectedTraits = ["ownership", "adaptability", "collaboration", "communication", "problem_solving", "integrity", "initiative", "resilience"];
  for (const trait of expectedTraits) {
    const item = scoreData.traits[trait];
    if (!item || item.score === undefined) {
      throw new Error(`Missing expected trait score: ${trait}`);
    }
    console.log(`  - ${trait.toUpperCase()}: ${item.score} / 100 (${item.label})`);
  }

  console.log("\n==================================================");
  console.log("✓ ALL V8.12.4 CRITICAL FUNCTIONALITY VERIFIED ON LIVE PRODUCTION!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR in E2E Verification:", err);
  process.exit(1);
});
