import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { listApprovedForms } from "@/lib/forms/registry";
import FormsClientView from "./FormsClientView";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const forms = listApprovedForms();

  return <FormsClientView forms={forms} />;
}
