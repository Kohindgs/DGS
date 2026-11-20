import { randomBytes, randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "../cms/db.ts";
import type {
  ComparisonFeedbackReport,
  ReferenceAnswer,
  ReferenceCheckRecord,
  ReferenceQuestion,
} from "./types.ts";
import { normalizeAndCapQuestions } from "./question-generator.ts";

declare global {
  var __dgsReferenceChecksTableEnsured: boolean | undefined;
}

function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== "string") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function mapRow(row: Record<string, any>): ReferenceCheckRecord {
  return {
    id: String(row.id),
    candidate_name: String(row.candidate_name),
    candidate_email: row.candidate_email ? String(row.candidate_email) : null,
    candidate_phone: row.candidate_phone ? String(row.candidate_phone) : null,
    candidate_position: row.candidate_position ? String(row.candidate_position) : null,
    last_company: String(row.last_company),
    last_designation: String(row.last_designation),
    last_employment_dates: row.last_employment_dates ? String(row.last_employment_dates) : null,
    cv_filename: row.cv_filename ? String(row.cv_filename) : null,
    cv_text_summary: row.cv_text_summary ? String(row.cv_text_summary) : null,
    claimed_responsibilities: safeJsonParse<string[]>(row.claimed_responsibilities, []),
    claimed_achievements: safeJsonParse<string[]>(row.claimed_achievements, []),
    poc_name: String(row.poc_name),
    poc_designation: String(row.poc_designation),
    poc_email: String(row.poc_email),
    poc_phone: row.poc_phone ? String(row.poc_phone) : null,
    secure_token: String(row.secure_token),
    token_expires_at: row.token_expires_at ? String(row.token_expires_at) : null,
    status: (row.status as ReferenceCheckRecord["status"]) || "pending",
    questions: safeJsonParse<ReferenceQuestion[]>(row.questions, []),
    responses: safeJsonParse<ReferenceAnswer[] | null>(row.responses, null),
    comparison_feedback: safeJsonParse<ComparisonFeedbackReport | null>(
      row.comparison_feedback,
      null
    ),
    sent_at: row.sent_at ? String(row.sent_at) : null,
    submitted_at: row.submitted_at ? String(row.submitted_at) : null,
    created_by: row.created_by ? String(row.created_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function ensureReferenceChecksTable(): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  if (global.__dgsReferenceChecksTableEnsured) return;

  await cmsExecute(
    `CREATE TABLE IF NOT EXISTS candidate_reference_checks (
      id VARCHAR(64) PRIMARY KEY,
      candidate_name VARCHAR(255) NOT NULL,
      candidate_email VARCHAR(255) NULL,
      candidate_phone VARCHAR(64) NULL,
      candidate_position VARCHAR(255) NULL,
      last_company VARCHAR(255) NOT NULL,
      last_designation VARCHAR(255) NOT NULL,
      last_employment_dates VARCHAR(255) NULL,
      cv_filename VARCHAR(255) NULL,
      cv_text_summary TEXT NULL,
      claimed_responsibilities JSON NULL,
      claimed_achievements JSON NULL,
      poc_name VARCHAR(255) NOT NULL,
      poc_designation VARCHAR(255) NOT NULL,
      poc_email VARCHAR(255) NOT NULL,
      poc_phone VARCHAR(64) NULL,
      secure_token VARCHAR(128) UNIQUE NOT NULL,
      token_expires_at DATETIME NULL,
      status ENUM('pending', 'submitted', 'expired') DEFAULT 'pending',
      questions JSON NOT NULL,
      responses JSON NULL,
      comparison_feedback JSON NULL,
      sent_at DATETIME NULL,
      submitted_at DATETIME NULL,
      created_by VARCHAR(255) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_crc_status (status),
      INDEX idx_crc_token (secure_token),
      INDEX idx_crc_candidate (candidate_name),
      INDEX idx_crc_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    [],
    { endpoint: "reference-checks", operation: "ENSURE_TABLE" }
  );

  global.__dgsReferenceChecksTableEnsured = true;
}

export async function listReferenceChecks(params?: {
  status?: string;
  search?: string;
  limit?: number;
}): Promise<{
  records: ReferenceCheckRecord[];
  stats: { total: number; pending: number; submitted: number; redFlags: number };
}> {
  if (!isCmsDatabaseConfigured()) {
    return { records: [], stats: { total: 0, pending: 0, submitted: 0, redFlags: 0 } };
  }
  await ensureReferenceChecksTable();

  const limit = Math.min(Math.max(Number(params?.limit || 150), 1), 300);
  const { rows } = await cmsQuery<Record<string, any>>(
    `SELECT * FROM candidate_reference_checks ORDER BY created_at DESC LIMIT ?`,
    [limit],
    { endpoint: "reference-checks", operation: "LIST_ALL" }
  );

  const allMapped = rows.map(mapRow);
  const stats = {
    total: allMapped.length,
    pending: allMapped.filter((r) => r.status === "pending").length,
    submitted: allMapped.filter((r) => r.status === "submitted").length,
    redFlags: allMapped.filter(
      (r) =>
        r.comparison_feedback?.overallVerdict === "RED_FLAG_DETECTED" ||
        r.comparison_feedback?.overallVerdict === "MINOR_DISCREPANCY"
    ).length,
  };

  let filtered = allMapped;
  const statusFilter = (params?.status || "").trim().toLowerCase();
  if (statusFilter === "pending" || statusFilter === "submitted" || statusFilter === "expired") {
    filtered = filtered.filter((r) => r.status === statusFilter);
  } else if (statusFilter === "red_flag") {
    filtered = filtered.filter(
      (r) =>
        r.comparison_feedback?.overallVerdict === "RED_FLAG_DETECTED" ||
        r.comparison_feedback?.overallVerdict === "MINOR_DISCREPANCY"
    );
  }

  const search = (params?.search || "").trim().toLowerCase();
  if (search) {
    filtered = filtered.filter((r) =>
      [
        r.candidate_name,
        r.candidate_position,
        r.last_company,
        r.last_designation,
        r.poc_name,
        r.poc_email,
        r.poc_designation,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(search))
    );
  }

  return { records: filtered, stats };
}

export async function getReferenceCheckById(id: string): Promise<ReferenceCheckRecord | null> {
  if (!isCmsDatabaseConfigured()) return null;
  await ensureReferenceChecksTable();
  const { rows } = await cmsQuery<Record<string, any>>(
    `SELECT * FROM candidate_reference_checks WHERE id = ? LIMIT 1`,
    [id],
    { endpoint: "reference-checks", operation: "GET_BY_ID" }
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getReferenceCheckByToken(token: string): Promise<ReferenceCheckRecord | null> {
  if (!isCmsDatabaseConfigured()) return null;
  await ensureReferenceChecksTable();
  const { rows } = await cmsQuery<Record<string, any>>(
    `SELECT * FROM candidate_reference_checks WHERE secure_token = ? LIMIT 1`,
    [token],
    { endpoint: "reference-checks", operation: "GET_BY_TOKEN" }
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createReferenceCheckRecord(input: {
  candidateName: string;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  candidatePosition?: string | null;
  lastCompany: string;
  lastDesignation: string;
  lastEmploymentDates?: string | null;
  cvFilename?: string | null;
  cvTextSummary?: string | null;
  claimedResponsibilities?: string[];
  claimedAchievements?: string[];
  pocName: string;
  pocDesignation: string;
  pocEmail: string;
  pocPhone?: string | null;
  questions: ReferenceQuestion[];
  createdBy?: string | null;
  markSentNow?: boolean;
}): Promise<ReferenceCheckRecord> {
  await ensureReferenceChecksTable();
  const id = `ref_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const secureToken = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const cappedQuestions = normalizeAndCapQuestions(
    (input.questions || []).filter((q) => q && q.enabled !== false)
  );

  await cmsExecute(
    `INSERT INTO candidate_reference_checks (
      id, candidate_name, candidate_email, candidate_phone, candidate_position,
      last_company, last_designation, last_employment_dates, cv_filename, cv_text_summary,
      claimed_responsibilities, claimed_achievements,
      poc_name, poc_designation, poc_email, poc_phone,
      secure_token, token_expires_at, status, questions, sent_at, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ${
      input.markSentNow ? "UTC_TIMESTAMP()" : "NULL"
    }, ?)`,
    [
      id,
      input.candidateName.trim(),
      input.candidateEmail?.trim() || null,
      input.candidatePhone?.trim() || null,
      input.candidatePosition?.trim() || null,
      input.lastCompany.trim(),
      input.lastDesignation.trim(),
      input.lastEmploymentDates?.trim() || null,
      input.cvFilename?.trim() || null,
      input.cvTextSummary?.trim() || null,
      JSON.stringify(input.claimedResponsibilities || []),
      JSON.stringify(input.claimedAchievements || []),
      input.pocName.trim(),
      input.pocDesignation.trim(),
      input.pocEmail.trim(),
      input.pocPhone?.trim() || null,
      secureToken,
      expiresAt,
      JSON.stringify(cappedQuestions),
      input.createdBy || null,
    ],
    { endpoint: "reference-checks", operation: "INSERT_RECORD" }
  );

  const created = await getReferenceCheckById(id);
  if (!created) throw new Error("Failed to read back created reference check record");
  return created;
}

export async function markReferenceCheckSent(id: string): Promise<void> {
  await ensureReferenceChecksTable();
  await cmsExecute(
    `UPDATE candidate_reference_checks SET sent_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP() WHERE id = ?`,
    [id],
    { endpoint: "reference-checks", operation: "MARK_SENT" }
  );
}

export async function saveReferenceCheckSubmission(params: {
  id: string;
  responses: ReferenceAnswer[];
  comparisonFeedback: ComparisonFeedbackReport;
}): Promise<ReferenceCheckRecord | null> {
  await ensureReferenceChecksTable();
  await cmsExecute(
    `UPDATE candidate_reference_checks
     SET status = 'submitted',
         responses = ?,
         comparison_feedback = ?,
         submitted_at = UTC_TIMESTAMP(),
         updated_at = UTC_TIMESTAMP()
     WHERE id = ?`,
    [
      JSON.stringify(params.responses),
      JSON.stringify(params.comparisonFeedback),
      params.id,
    ],
    { endpoint: "reference-checks", operation: "SAVE_SUBMISSION" }
  );
  return getReferenceCheckById(params.id);
}

export async function deleteReferenceCheckRecord(id: string): Promise<boolean> {
  await ensureReferenceChecksTable();
  const res = await cmsExecute(
    `DELETE FROM candidate_reference_checks WHERE id = ?`,
    [id],
    { endpoint: "reference-checks", operation: "DELETE_RECORD" }
  );
  return Number(res?.affectedRows || 0) > 0;
}
