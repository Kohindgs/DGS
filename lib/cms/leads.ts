import "server-only";
import { randomUUID } from "node:crypto";
import { getCmsPool, cmsQuery } from "@/lib/cms/db";

type CaptureInput = {
  formKey: string;
  sourceRoute: string;
  fields: Record<string, string>;
  provider: string;
  providerSubmissionId?: string | number;
};

function firstValue(fields: Record<string, string>, patterns: RegExp[]) {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;
    if (patterns.some((pattern) => pattern.test(key))) return value.trim();
  }
  return "";
}

function leadIdentity(fields: Record<string, string>) {
  const first = firstValue(fields, [/^first[_-]?name$/i, /first.*name/i]);
  const last = firstValue(fields, [/^last[_-]?name$/i, /last.*name/i]);
  const explicitName = firstValue(fields, [/^name$/i, /full.*name/i, /your.*name/i]);
  return {
    name: explicitName || [first, last].filter(Boolean).join(" "),
    email: firstValue(fields, [/email/i]),
    phone: firstValue(fields, [/phone/i, /mobile/i, /contact.*number/i]),
    company: firstValue(fields, [/company/i, /organisation/i, /organization/i, /business.*name/i]),
  };
}
export async function captureFormSubmission(input: CaptureInput) {
  const pool = getCmsPool();
  const connection = await pool.getConnection();
  const leadId = randomUUID();
  const submissionId = randomUUID();
  const identity = leadIdentity(input.fields);

  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO leads (id, source_form_key, source_route, name, email, phone, company, payload, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        leadId,
        input.formKey,
        input.sourceRoute,
        identity.name || null,
        identity.email || null,
        identity.phone || null,
        identity.company || null,
        JSON.stringify(input.fields),
      ],
    );
    await connection.execute(
      `INSERT INTO form_submissions
       (id, form_key, source_route, payload, lead_id, provider, provider_submission_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionId,
        input.formKey,
        input.sourceRoute,
        JSON.stringify(input.fields),
        leadId,
        input.provider,
        input.providerSubmissionId ? String(input.providerSubmissionId) : null,
      ],
    );
    await connection.commit();
    return { leadId, submissionId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export type CmsLeadRow = {
  id: string;
  source_form_key: string | null;
  source_route: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  created_at: string;
};

export async function listRecentLeads(limit = 100) {
  const safeLimit = Math.min(Math.max(limit, 1), 250);
  return (await cmsQuery<CmsLeadRow>(
    `SELECT id, source_form_key, source_route, name, email, phone, company, status, created_at
     FROM leads ORDER BY created_at DESC LIMIT ?`,
    [safeLimit],
  )).rows;
}

export async function getFormSubmissionCounts() {
  const rows = (await cmsQuery<{ form_key: string; total: number | string }>(
    `SELECT form_key, COUNT(*) AS total FROM form_submissions GROUP BY form_key ORDER BY form_key`,
  )).rows;
  return new Map(rows.map((row) => [row.form_key, Number(row.total)]));
}
