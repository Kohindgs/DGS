import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "./db";

export type AssessmentAssignment = {
  id:string; assessment_key:string; candidate_name:string; candidate_email:string;
  candidate_phone:string; experience:string|null; notice_period:string|null;
  expires_at:string|null; used_at:string|null; created_at:string;
};

export type AssessmentAttempt = {
  id:string; assignment_id:string; assessment_key:string; candidate_name:string;
  candidate_email:string; candidate_phone:string; experience:string|null;
  notice_period:string|null; objective_score:number; objective_total:number;
  answers:string|Record<string,unknown>; activity:string|Record<string,unknown>;
  review_status:string; reviewer_notes:string|null; started_at:string|Date; submitted_at:string|Date|null;
};

const tokenHash=(token:string)=>createHash("sha256").update(token).digest("hex");

export async function createAssessmentAssignment(input:{
  assessmentKey:string; name:string; email:string; phone:string;
  experience?:string; noticePeriod?:string; expiresAt?:string|null;
}) {
  const token=randomBytes(32).toString("hex");
  const id=randomUUID();
  await cmsExecute(
    "INSERT INTO assessment_assignments (id,assessment_key,token_hash,candidate_name,candidate_email,candidate_phone,experience,notice_period,expires_at) VALUES (?,?,?,?,?,?,?,?,?)",
    [id,input.assessmentKey,tokenHash(token),input.name,input.email,input.phone,input.experience||null,input.noticePeriod||null,input.expiresAt||null],
  );
  return { id, token };
}

export async function getAssignmentByToken(token:string) {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows }=await cmsQuery<AssessmentAssignment>(
    "SELECT * FROM assessment_assignments WHERE token_hash=? LIMIT 1",[tokenHash(token)],
  );
  return rows[0]||null;
}

export async function startAssessmentAttempt(token:string,assessmentKey:string) {
  const assignment=await getAssignmentByToken(token);
  if (!assignment || assignment.assessment_key!==assessmentKey) throw new Error("Invalid assessment link");

  const { rows:existing }=await cmsQuery<AssessmentAttempt>(
    "SELECT * FROM assessment_attempts WHERE assignment_id=? AND submitted_at IS NULL LIMIT 1",[assignment.id],
  );
  if (existing[0]) return existing[0];

  if (assignment.used_at) throw new Error("This assessment link has already been used");
  if (assignment.expires_at && new Date(assignment.expires_at).getTime()<Date.now()) throw new Error("This assessment link has expired");

  const id=randomUUID();
  const startedAt=new Date().toISOString().slice(0,19).replace("T"," ");
  await cmsExecute(
    "INSERT INTO assessment_attempts (id,assignment_id,assessment_key,candidate_name,candidate_email,candidate_phone,experience,notice_period,answers,activity,started_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [id,assignment.id,assessmentKey,assignment.candidate_name,assignment.candidate_email,assignment.candidate_phone,assignment.experience,assignment.notice_period,"{}","[]",startedAt],
  );
  await cmsExecute("UPDATE assessment_assignments SET used_at=? WHERE id=?",[startedAt,assignment.id]);
  return { id, assignment_id:assignment.id, assessment_key:assessmentKey, candidate_name:assignment.candidate_name,
    candidate_email:assignment.candidate_email,candidate_phone:assignment.candidate_phone,experience:assignment.experience,
    notice_period:assignment.notice_period,objective_score:0,objective_total:0,answers:"{}",activity:"[]",
    review_status:"pending",reviewer_notes:null,started_at:startedAt,submitted_at:null } as AssessmentAttempt;
}

export async function getAttempt(id:string) {
  const { rows }=await cmsQuery<AssessmentAttempt>("SELECT * FROM assessment_attempts WHERE id=? LIMIT 1",[id]);
  return rows[0]||null;
}

export async function submitAssessmentAttempt(input:{
  id:string; answers:Record<string,unknown>; activity:unknown[]; score:number; total:number;
}) {
  const submittedAt=new Date().toISOString().slice(0,19).replace("T"," ");
  await cmsExecute(
    "UPDATE assessment_attempts SET answers=?,activity=?,objective_score=?,objective_total=?,submitted_at=? WHERE id=? AND submitted_at IS NULL",
    [JSON.stringify(input.answers),JSON.stringify(input.activity),input.score,input.total,submittedAt,input.id],
  );
}

export async function listAssessmentAttempts(limit=200) {
  if (!isCmsDatabaseConfigured()) return [] as AssessmentAttempt[];
  const { rows }=await cmsQuery<AssessmentAttempt>(
    "SELECT * FROM assessment_attempts ORDER BY created_at DESC LIMIT ?",[limit],
  );
  return rows;
}

export async function updateAssessmentReview(id:string,status:string,notes:string) {
  const allowed=new Set(["pending","reviewed","shortlisted","hold","rejected"]);
  if(!allowed.has(status)) throw new Error("Invalid review status");
  await cmsExecute("UPDATE assessment_attempts SET review_status=?,reviewer_notes=? WHERE id=?",[status,notes||null,id]);
}
