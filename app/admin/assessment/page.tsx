import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import AssessmentClientView from "./AssessmentClientView";

export const dynamic = "force-dynamic";

export default async function AssessmentAdminPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "view")) {
    redirect("/admin/");
  }

  let jds: any[] = [];
  let versions: any[] = [];
  let candidates: any[] = [];

  if (isCmsDatabaseConfigured()) {
    try {
      const { rows: jdRows } = await cmsQuery(
        `SELECT id, role_title, role_level, department, created_at FROM assessment_jds ORDER BY created_at DESC`
      );
      jds = jdRows || [];

      const { rows: verRows } = await cmsQuery(
        `SELECT v.id, v.jd_id, v.version_number, v.difficulty, v.status, v.created_at, v.approved_at, j.role_title
         FROM assessment_versions v
         LEFT JOIN assessment_jds j ON v.jd_id = j.id
         ORDER BY v.created_at DESC`
      );
      versions = verRows || [];

      const { rows: candRows } = await cmsQuery(
        `SELECT c.id, c.assignment_id, c.objective_score, c.objective_total, c.role_match_score, c.review_status, c.submitted_at,
                hp.candidate_name as name, hp.candidate_email as email
         FROM assessment_candidates c
         LEFT JOIN hr_pipeline hp ON (c.assignment_id = hp.id OR c.id = hp.id)
         ORDER BY c.submitted_at DESC
         LIMIT 100`
      );
      candidates = candRows.map((r: any) => ({
        id: r.id,
        name: r.name || "Candidate",
        email: r.email || "candidate@example.com",
        objective_score: r.objective_score || 0,
        objective_total: r.objective_total || 0,
        role_match_score: r.role_match_score || 0,
        review_status: r.review_status || "pending",
        submitted_at: r.submitted_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Error loading assessment data:", err);
    }
  }

  return (
    <AssessmentClientView
      jds={jds}
      versions={versions}
      candidates={candidates}
      currentUserRole={currentUser?.role}
    />
  );
}
