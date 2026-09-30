import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import ApplicationsClientView from "./ApplicationsClientView";

export const dynamic = "force-dynamic";

export type ApplicationRow = {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  stage: string;
  interview_notes: string | null;
  created_at: string;
  position_id: string | null;
  role_title: string | null;
  objective_score: number | null;
  objective_total: number | null;
  role_match_score: number | null;
  resume_id: string | null;
  resume_filename: string | null;
};

export default async function AdminApplicationsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "hr", "view")) {
    redirect("/admin/");
  }

  let applications: ApplicationRow[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      const { rows } = await cmsQuery<ApplicationRow>(
        `SELECT 
           p.id,
           p.candidate_name,
           p.candidate_email,
           p.candidate_phone,
           p.stage,
           p.interview_notes,
           p.created_at,
           p.position_id,
           COALESCE(j.role_title, 'Candidate Position') as role_title,
           c.objective_score,
           c.objective_total,
           c.role_match_score,
           d.id as resume_id,
           d.filename as resume_filename
         FROM hr_pipeline p
         LEFT JOIN assessment_jds j ON p.position_id = j.id
         LEFT JOIN assessment_candidates c ON (c.assignment_id = p.id OR c.id = p.id)
         LEFT JOIN (
           SELECT pipeline_id, id, filename 
           FROM hr_documents 
           WHERE document_type = 'cv'
           GROUP BY pipeline_id
         ) d ON d.pipeline_id = p.id
         ORDER BY p.updated_at DESC, p.created_at DESC
         LIMIT 200`
      );
      applications = rows || [];
    } catch (err) {
      console.error("Error loading candidate applications:", err);
    }
  }

  return (
    <ApplicationsClientView
      initialApplications={applications}
      currentUserRole={currentUser?.role || "viewer"}
    />
  );
}
