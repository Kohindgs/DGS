import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import HrPipelineClientView from "./HrPipelineClientView";

export const dynamic = "force-dynamic";

export default async function AdminHrPipelinePage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "hr", "view")) {
    redirect("/admin/");
  }

  let candidates: any[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      const { rows } = await cmsQuery(
        `SELECT id, candidate_name, candidate_email, candidate_phone, stage, interview_notes, created_at
         FROM hr_pipeline
         ORDER BY updated_at DESC, created_at DESC
         LIMIT 150`
      );
      candidates = rows || [];
    } catch (err) {
      console.error("Error loading HR pipeline:", err);
    }
  }

  return <HrPipelineClientView candidates={candidates} />;
}
