import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { runFormHealthProbe } from "@/lib/forms/health-probe";
import FormsClientView from "./FormsClientView";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const healthReport = await runFormHealthProbe();

  return <FormsClientView healthReport={healthReport} />;
}
