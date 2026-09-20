import "server-only";
import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "./db";

export type CmsLead = {
  id: string; source_form_key: string | null; source_route: string | null;
  name: string | null; email: string | null; phone: string | null;
  company: string | null; payload: string | Record<string, unknown>;
  status: string; created_at: string;
};

export async function listCmsLeads(limit = 200) {
  if (!isCmsDatabaseConfigured()) return [] as CmsLead[];
  const { rows } = await cmsQuery<CmsLead>(
    "SELECT * FROM leads ORDER BY created_at DESC LIMIT ?", [limit],
  );
  return rows;
}

export async function createCmsLead(input: {
  formKey: string; route: string; name?: string; email?: string;
  phone?: string; company?: string; payload: Record<string, unknown>;
}) {
  const id = randomUUID();
  await cmsExecute(
    "INSERT INTO leads (id,source_form_key,source_route,name,email,phone,company,payload,status) VALUES (?,?,?,?,?,?,?,?,?)",
    [id,input.formKey,input.route,input.name||null,input.email||null,input.phone||null,input.company||null,JSON.stringify(input.payload),"new"],
  );
  return id;
}

export async function createCmsSubmission(input: {
  formKey: string; route: string; payload: Record<string, unknown>;
  leadId?: string; provider?: string; providerSubmissionId?: string | null;
}) {
  const id = randomUUID();
  await cmsExecute(
    "INSERT INTO form_submissions (id,form_key,source_route,payload,lead_id,provider,provider_submission_id) VALUES (?,?,?,?,?,?,?)",
    [id,input.formKey,input.route,JSON.stringify(input.payload),input.leadId||null,input.provider||"native",input.providerSubmissionId||null],
  );
  return id;
}

export async function updateLeadStatus(id: string, status: string) {
  const allowed = new Set(["new","contacted","qualified","won","lost","spam"]);
  if (!allowed.has(status)) throw new Error("Invalid lead status");
  await cmsExecute("UPDATE leads SET status = ? WHERE id = ?", [status,id]);
}
