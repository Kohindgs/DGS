import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "./db";
import { logAuditEvent } from "./auth-db";

export type AssessmentAssignment = {
  id: string;
  assessment_key: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  experience: string | null;
  notice_period: string | null;
  expires_at: string | null;
  used_at: string | null;
  created_at: string;
};

export type AssessmentAttempt = {
  id: string;
  assignment_id: string;
  assessment_key: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  experience: string | null;
  notice_period: string | null;
  objective_score: number;
  objective_total: number;
  answers: string | Record<string, unknown>;
  activity: string | Record<string, unknown>;
  review_status: string;
  reviewer_notes: string | null;
  started_at: string | Date;
  submitted_at: string | Date | null;
};

export type AssessmentJd = {
  id: string;
  role_title: string;
  role_level: string;
  department: string;
  jd_text: string;
  status: "active" | "draft" | "archived";
  created_at: string | Date;
  updated_at: string | Date;
  versions_count?: number;
  candidates_count?: number;
};

export type AssessmentVersion = {
  id: string;
  jd_id: string;
  version_number: number;
  difficulty: string;
  status: "draft" | "review" | "approved" | "archived";
  focus_areas: string | null;
  admin_prompt_notes: string | null;
  test_data: any;
  approved_at: string | Date | null;
  approved_by: string | null;
  created_at: string | Date;
  jd_title?: string;
};

export type CandidateRecord = {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  position_id: string;
  stage: string;
  interview_notes: string | null;
  offer_details: any;
  appointment_details: any;
  created_at: string | Date;
  updated_at: string | Date;
  // Joined fields from assessment_candidates
  assessment_id?: string;
  objective_score?: number;
  objective_total?: number;
  role_match_score?: number;
  evaluation_notes?: any;
  answers?: any;
  activity_log?: any;
  review_status?: string;
  reviewer_notes?: string;
  submitted_at?: string | Date | null;
  role_title?: string;
};

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

// ============================================================================
// Job Descriptions (JDs)
// ============================================================================

export async function listAssessmentJds(): Promise<AssessmentJd[]> {
  if (!isCmsDatabaseConfigured()) return [];
  const { rows } = await cmsQuery<AssessmentJd>(
    `SELECT j.*, 
            (SELECT COUNT(*) FROM assessment_versions v WHERE v.jd_id = j.id) as versions_count,
            (SELECT COUNT(*) FROM hr_pipeline p WHERE p.position_id = j.id) as candidates_count
     FROM assessment_jds j 
     WHERE j.status != 'archived'
     ORDER BY j.created_at DESC`
  );
  return rows;
}

export async function getAssessmentJd(id: string): Promise<AssessmentJd | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<AssessmentJd>(
    "SELECT * FROM assessment_jds WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

export async function createAssessmentJd(input: {
  title: string;
  level?: string;
  department?: string;
  content: string;
}): Promise<AssessmentJd> {
  const id = randomUUID();
  const level = input.level || "mid";
  const dept = input.department || "SEO & Digital";
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  await cmsExecute(
    `INSERT INTO assessment_jds (id, role_title, role_level, department, jd_text, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
    [id, input.title, level, dept, input.content, now, now]
  );

  return {
    id,
    role_title: input.title,
    role_level: level,
    department: dept,
    jd_text: input.content,
    status: "active",
    created_at: now,
    updated_at: now,
  };
}

export async function updateAssessmentJd(id: string, input: {
  title?: string;
  level?: string;
  department?: string;
  content?: string;
  status?: "active" | "draft" | "archived";
}): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const current = await getAssessmentJd(id);
  if (!current) throw new Error("JD not found");

  await cmsExecute(
    `UPDATE assessment_jds 
     SET role_title = ?, role_level = ?, department = ?, jd_text = ?, status = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.title !== undefined ? input.title : current.role_title,
      input.level !== undefined ? input.level : current.role_level,
      input.department !== undefined ? input.department : current.department,
      input.content !== undefined ? input.content : current.jd_text,
      input.status !== undefined ? input.status : current.status,
      now,
      id,
    ]
  );
}

export async function duplicateAssessmentJd(id: string): Promise<AssessmentJd> {
  const original = await getAssessmentJd(id);
  if (!original) throw new Error("JD not found");

  return createAssessmentJd({
    title: `${original.role_title} (Copy)`,
    level: original.role_level,
    department: original.department,
    content: original.jd_text,
  });
}

// ============================================================================
// Assessment Versions
// ============================================================================

export async function listVersionsForJd(jdId: string): Promise<AssessmentVersion[]> {
  if (!isCmsDatabaseConfigured()) return [];
  const { rows } = await cmsQuery<AssessmentVersion>(
    `SELECT v.*, j.role_title as jd_title 
     FROM assessment_versions v
     JOIN assessment_jds j ON v.jd_id = j.id
     WHERE v.jd_id = ?
     ORDER BY v.version_number DESC`,
    [jdId]
  );
  return rows.map((r) => ({
    ...r,
    test_data: typeof r.test_data === "string" ? JSON.parse(r.test_data) : r.test_data,
  }));
}

export async function getAssessmentVersion(id: string): Promise<AssessmentVersion | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<AssessmentVersion>(
    `SELECT v.*, j.role_title as jd_title 
     FROM assessment_versions v
     JOIN assessment_jds j ON v.jd_id = j.id
     WHERE v.id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const item = rows[0];
  return {
    ...item,
    test_data: typeof item.test_data === "string" ? JSON.parse(item.test_data) : item.test_data,
  };
}

export async function createAssessmentVersion(input: {
  jdId: string;
  testData: any;
  difficulty?: string;
  focusAreas?: string;
  promptNotes?: string;
}): Promise<AssessmentVersion> {
  const id = randomUUID();
  const { rows } = await cmsQuery<{ max_ver: number }>(
    "SELECT COALESCE(MAX(version_number), 0) as max_ver FROM assessment_versions WHERE jd_id = ?",
    [input.jdId]
  );
  const nextVersion = (rows[0]?.max_ver || 0) + 1;
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  await cmsExecute(
    `INSERT INTO assessment_versions (id, jd_id, version_number, difficulty, status, focus_areas, admin_prompt_notes, test_data, created_at)
     VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?)`,
    [
      id,
      input.jdId,
      nextVersion,
      input.difficulty || "moderate",
      input.focusAreas || null,
      input.promptNotes || null,
      JSON.stringify(input.testData),
      now,
    ]
  );

  return {
    id,
    jd_id: input.jdId,
    version_number: nextVersion,
    difficulty: input.difficulty || "moderate",
    status: "draft",
    focus_areas: input.focusAreas || null,
    admin_prompt_notes: input.promptNotes || null,
    test_data: input.testData,
    approved_at: null,
    approved_by: null,
    created_at: now,
  };
}

export async function updateDraftVersion(id: string, testData: any, promptNotes?: string): Promise<void> {
  const version = await getAssessmentVersion(id);
  if (!version) throw new Error("Assessment version not found");
  if (version.status === "approved") {
    throw new Error("Approved assessment versions are immutable. Create a new version to modify.");
  }

  await cmsExecute(
    "UPDATE assessment_versions SET test_data = ?, admin_prompt_notes = COALESCE(?, admin_prompt_notes) WHERE id = ?",
    [JSON.stringify(testData), promptNotes || null, id]
  );
}

export async function approveAssessmentVersion(id: string, approvedBy: string): Promise<void> {
  const version = await getAssessmentVersion(id);
  if (!version) throw new Error("Assessment version not found");
  if (version.status === "approved") return; // already approved

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  await cmsExecute(
    "UPDATE assessment_versions SET status = 'approved', approved_at = ?, approved_by = ? WHERE id = ?",
    [now, approvedBy, id]
  );
}

// ============================================================================
// HR Pipeline & Candidate Management (13 Stages)
// ============================================================================

export const PIPELINE_STAGES = [
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
] as const;

export async function listPipelineCandidates(stage?: string): Promise<CandidateRecord[]> {
  if (!isCmsDatabaseConfigured()) return [];

  let query = `
    SELECT p.*, j.role_title,
           c.id as assessment_id, c.objective_score, c.objective_total, c.role_match_score,
           c.evaluation_notes, c.answers, c.activity_log, c.review_status, c.reviewer_notes,
           c.submitted_at
    FROM hr_pipeline p
    LEFT JOIN assessment_jds j ON p.position_id = j.id
    LEFT JOIN assessment_candidates c ON c.assignment_id = p.id
  `;
  const params: any[] = [];

  if (stage) {
    query += " WHERE p.stage = ?";
    params.push(stage);
  }

  query += " ORDER BY p.created_at DESC";

  const { rows } = await cmsQuery<CandidateRecord>(query, params);
  return rows.map((r) => ({
    ...r,
    offer_details: typeof r.offer_details === "string" ? JSON.parse(r.offer_details) : r.offer_details,
    appointment_details: typeof r.appointment_details === "string" ? JSON.parse(r.appointment_details) : r.appointment_details,
    evaluation_notes: typeof r.evaluation_notes === "string" ? JSON.parse(r.evaluation_notes) : r.evaluation_notes,
    answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers,
    activity_log: typeof r.activity_log === "string" ? JSON.parse(r.activity_log) : r.activity_log,
  }));
}

export async function getCandidateDetails(id: string): Promise<CandidateRecord | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<CandidateRecord>(
    `SELECT p.*, j.role_title,
            c.id as assessment_id, c.objective_score, c.objective_total, c.role_match_score,
            c.evaluation_notes, c.answers, c.activity_log, c.review_status, c.reviewer_notes,
            c.submitted_at
     FROM hr_pipeline p
     LEFT JOIN assessment_jds j ON p.position_id = j.id
     LEFT JOIN assessment_candidates c ON c.assignment_id = p.id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    offer_details: typeof r.offer_details === "string" ? JSON.parse(r.offer_details) : r.offer_details,
    appointment_details: typeof r.appointment_details === "string" ? JSON.parse(r.appointment_details) : r.appointment_details,
    evaluation_notes: typeof r.evaluation_notes === "string" ? JSON.parse(r.evaluation_notes) : r.evaluation_notes,
    answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers,
    activity_log: typeof r.activity_log === "string" ? JSON.parse(r.activity_log) : r.activity_log,
  };
}

export async function updateCandidateStage(id: string, stage: string, actorEmail?: string): Promise<void> {
  const allowed = new Set(PIPELINE_STAGES);
  if (!allowed.has(stage as any)) {
    throw new Error(`Invalid recruitment pipeline stage: ${stage}`);
  }

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  await cmsExecute(
    "UPDATE hr_pipeline SET stage = ?, updated_at = ? WHERE id = ?",
    [stage, now, id]
  );

  if (actorEmail) {
    await logAuditEvent({
      actor_email: actorEmail,
      role: "admin",
      action: "hr.candidate.stage_change",
      resource: "hr_pipeline",
      resource_id: id,
      summary: `Moved candidate stage to ${stage}`,
      after_state: { stage },
    });
  }
}

export async function updateCandidateNotes(id: string, notes: string): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  await cmsExecute(
    "UPDATE hr_pipeline SET interview_notes = ?, updated_at = ? WHERE id = ?",
    [notes, now, id]
  );
}

export async function deleteCandidateRecord(id: string, userRole: string, actorEmail: string): Promise<void> {
  if (userRole !== "superadmin") {
    throw new Error("Unauthorized: Only Superadmin can permanently delete candidate records.");
  }

  const candidate = await getCandidateDetails(id);
  if (!candidate) throw new Error("Candidate not found");

  // Delete associated records
  await cmsExecute("DELETE FROM assessment_candidates WHERE assignment_id = ?", [id]);
  await cmsExecute("DELETE FROM hr_documents WHERE pipeline_id = ?", [id]);
  await cmsExecute("DELETE FROM hr_pipeline WHERE id = ?", [id]);

  await logAuditEvent({
    actor_email: actorEmail,
    role: userRole,
    action: "hr.candidate.delete",
    resource: "hr_pipeline",
    resource_id: id,
    summary: `Permanently deleted candidate ${candidate.candidate_name} (${candidate.candidate_email})`,
    before_state: {
      candidateId: id,
      name: candidate.candidate_name,
      email: candidate.candidate_email,
    },
  });
}

// ============================================================================
// Assessment Attempts & Candidate Runner Operations
// ============================================================================

export async function createAssessmentAssignment(input: {
  assessmentKey: string;
  name: string;
  email: string;
  phone: string;
  experience?: string;
  noticePeriod?: string;
  expiresAt?: string | null;
}) {
  const token = randomBytes(32).toString("hex");
  const id = randomUUID();
  await cmsExecute(
    "INSERT INTO assessment_assignments (id,assessment_key,token_hash,candidate_name,candidate_email,candidate_phone,experience,notice_period,expires_at) VALUES (?,?,?,?,?,?,?,?,?)",
    [
      id,
      input.assessmentKey,
      tokenHash(token),
      input.name,
      input.email,
      input.phone,
      input.experience || null,
      input.noticePeriod || null,
      input.expiresAt || null,
    ]
  );
  return { id, token };
}

export async function getAssignmentByToken(token: string) {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<AssessmentAssignment>(
    "SELECT * FROM assessment_assignments WHERE token_hash=? LIMIT 1",
    [tokenHash(token)]
  );
  return rows[0] || null;
}

export async function startAssessmentAttempt(token: string, assessmentKey: string) {
  const assignment = await getAssignmentByToken(token);
  if (!assignment || assignment.assessment_key !== assessmentKey) throw new Error("Invalid assessment link");

  const { rows: existing } = await cmsQuery<AssessmentAttempt>(
    "SELECT * FROM assessment_attempts WHERE assignment_id=? AND submitted_at IS NULL LIMIT 1",
    [assignment.id]
  );
  if (existing[0]) return existing[0];

  if (assignment.used_at) throw new Error("This assessment link has already been used");
  if (assignment.expires_at && new Date(assignment.expires_at).getTime() < Date.now()) throw new Error("This assessment link has expired");

  const id = randomUUID();
  const startedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  await cmsExecute(
    "INSERT INTO assessment_attempts (id,assignment_id,assessment_key,candidate_name,candidate_email,candidate_phone,experience,notice_period,answers,activity,started_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [
      id,
      assignment.id,
      assessmentKey,
      assignment.candidate_name,
      assignment.candidate_email,
      assignment.candidate_phone,
      assignment.experience,
      assignment.notice_period,
      "{}",
      "[]",
      startedAt,
    ]
  );
  await cmsExecute("UPDATE assessment_assignments SET used_at=? WHERE id=?", [startedAt, assignment.id]);
  return {
    id,
    assignment_id: assignment.id,
    assessment_key: assessmentKey,
    candidate_name: assignment.candidate_name,
    candidate_email: assignment.candidate_email,
    candidate_phone: assignment.candidate_phone,
    experience: assignment.experience,
    notice_period: assignment.notice_period,
    objective_score: 0,
    objective_total: 0,
    answers: "{}",
    activity: "[]",
    review_status: "pending",
    reviewer_notes: null,
    started_at: startedAt,
    submitted_at: null,
  } as AssessmentAttempt;
}

export async function getAttempt(id: string) {
  const { rows } = await cmsQuery<AssessmentAttempt>("SELECT * FROM assessment_attempts WHERE id=? LIMIT 1", [id]);
  return rows[0] || null;
}

export async function submitAssessmentAttempt(input: {
  id: string;
  answers: Record<string, unknown>;
  activity: unknown[];
  score: number;
  total: number;
}) {
  const submittedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  await cmsExecute(
    "UPDATE assessment_attempts SET answers=?,activity=?,objective_score=?,objective_total=?,submitted_at=? WHERE id=? AND submitted_at IS NULL",
    [JSON.stringify(input.answers), JSON.stringify(input.activity), input.score, input.total, submittedAt, input.id]
  );
}

export async function listAssessmentAttempts(limit = 200) {
  if (!isCmsDatabaseConfigured()) return [] as AssessmentAttempt[];
  const { rows } = await cmsQuery<AssessmentAttempt>(
    "SELECT * FROM assessment_attempts ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
  return rows;
}

export async function updateAssessmentReview(id: string, status: string, notes: string) {
  const allowed = new Set(["pending", "reviewed", "shortlisted", "hold", "rejected"]);
  if (!allowed.has(status)) throw new Error("Invalid review status");
  await cmsExecute("UPDATE assessment_attempts SET review_status=?,reviewer_notes=? WHERE id=?", [status, notes || null, id]);
}

// ============================================================================
// Private Candidate Document Storage (Outside Web Root)
// ============================================================================

const PRIVATE_STORAGE_DIR = path.join(process.cwd(), "storage", "private", "candidates");

export async function storePrivateCandidateFile(params: {
  candidateId: string;
  documentType: "cv" | "offer_letter" | "signed_offer" | "appointment_letter" | "signed_appointment" | "practical_task";
  filename: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<string> {
  await fs.mkdir(PRIVATE_STORAGE_DIR, { recursive: true });

  const ext = path.extname(params.filename);
  const fileId = randomUUID();
  const storageFilename = `${params.candidateId}_${params.documentType}_${fileId}${ext}`;
  const absolutePath = path.join(PRIVATE_STORAGE_DIR, storageFilename);

  await fs.writeFile(absolutePath, params.buffer);

  const docId = randomUUID();
  await cmsExecute(
    `INSERT INTO hr_documents (id, pipeline_id, document_type, storage_key, filename, file_size, mime_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      docId,
      params.candidateId,
      params.documentType,
      storageFilename,
      params.filename,
      params.buffer.length,
      params.mimeType,
    ]
  );

  return docId;
}

export async function getPrivateCandidateDocument(docId: string, userRole: string): Promise<{
  filename: string;
  mimeType: string;
  buffer: Buffer;
} | null> {
  if (!["superadmin", "admin", "manager"].includes(userRole)) {
    throw new Error("Unauthorized access to private candidate document.");
  }

  const { rows } = await cmsQuery<{
    storage_key: string;
    filename: string;
    mime_type: string;
  }>("SELECT storage_key, filename, mime_type FROM hr_documents WHERE id = ? LIMIT 1", [docId]);

  if (!rows[0]) return null;

  const doc = rows[0];
  const absolutePath = path.join(PRIVATE_STORAGE_DIR, doc.storage_key);

  try {
    const buffer = await fs.readFile(absolutePath);
    return {
      filename: doc.filename,
      mimeType: doc.mime_type,
      buffer,
    };
  } catch (err) {
    console.error("Error reading private candidate document:", err);
    return null;
  }
}
