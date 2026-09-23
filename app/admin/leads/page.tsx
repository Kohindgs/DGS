import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listCmsLeads } from "@/lib/cms/leads";
import LeadsClientView from "@/components/admin/leads/LeadsClientView";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const ready = isCmsDatabaseConfigured();
  const leads = ready ? await listCmsLeads() : [];

  return <LeadsClientView initialLeads={leads} />;
}
