import "server-only";
import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "./db";

export type CmsCareerJob = {
  id: string; slug: string; title: string; summary: string;
  employment_type: string; employment_label: string; location: string;
  workplace_type: string; schedule: string; experience: string;
  compensation: string; overview: string; responsibilities: string;
  requirements: string; benefits: string; date_posted: string;
  active: number | boolean; creative_requirements?: unknown;
  created_at?: string; updated_at?: string;
};

export async function listCmsCareerJobs(activeOnly = false) {
  if (!isCmsDatabaseConfigured()) return [] as CmsCareerJob[];
  const where = activeOnly ? " WHERE active = TRUE" : "";
  const { rows } = await cmsQuery<CmsCareerJob>(
    `SELECT * FROM career_jobs${where} ORDER BY active DESC, date_posted DESC, created_at DESC`,
  );
  return rows;
}

export async function getCmsCareerJob(slug: string) {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<CmsCareerJob>(
    "SELECT * FROM career_jobs WHERE slug = ? LIMIT 1", [slug],
  );
  return rows[0] || null;
}

export async function createCmsCareerJob(input: Omit<CmsCareerJob,"id"|"created_at"|"updated_at">) {
  const id = randomUUID();
  const creativeReq = input.creative_requirements
    ? typeof input.creative_requirements === "string"
      ? input.creative_requirements
      : JSON.stringify(input.creative_requirements)
    : null;
  await cmsExecute(
    `INSERT INTO career_jobs
    (id,slug,title,summary,employment_type,employment_label,location,workplace_type,schedule,experience,compensation,overview,responsibilities,requirements,benefits,date_posted,active,creative_requirements)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id,input.slug,input.title,input.summary,input.employment_type,input.employment_label,input.location,input.workplace_type,input.schedule,input.experience,input.compensation,input.overview,input.responsibilities,input.requirements,input.benefits,input.date_posted,Boolean(input.active),creativeReq],
  );
  return id;
}

export async function setCmsCareerJobActive(id: string, active: boolean) {
  await cmsExecute("UPDATE career_jobs SET active = ? WHERE id = ?", [active, id]);
}
