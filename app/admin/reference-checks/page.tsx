import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { listReferenceChecks } from "@/lib/reference-checks/db";
import { getHrEmailConfig } from "@/lib/reference-checks/email-service";
import ReferenceChecksClientView from "./ReferenceChecksClientView";

export const dynamic = "force-dynamic";

export default async function AdminReferenceChecksPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "hr", "view")) {
    redirect("/admin/");
  }

  const data = await listReferenceChecks().catch(() => ({
    records: [],
    stats: { total: 0, pending: 0, submitted: 0, redFlags: 0 },
  }));

  return (
    <ReferenceChecksClientView
      initialRecords={data.records}
      initialStats={data.stats}
      hrSenderEmail={getHrEmailConfig().hrEmail}
      currentUserRole={currentUser.role || "viewer"}
    />
  );
}
