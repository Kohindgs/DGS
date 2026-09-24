import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getFreshAccessToken, getIntegrationStatuses } from "@/lib/integrations/google";
import GoogleSetupWizard from "@/components/admin/GoogleSetupWizard";

export const dynamic = "force-dynamic";

export default async function GoogleSetupPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "edit")) {
    redirect("/admin/");
  }

  const token = await getFreshAccessToken("gsc");
  const statuses = await getIntegrationStatuses();
  const gscStatus = statuses.find((s) => s.service === "gsc");

  const isConnected = Boolean(token);
  const accountEmail = gscStatus?.accountEmail || null;

  return (
    <div style={{ padding: "12px 0 32px" }}>
      <GoogleSetupWizard
        initialConnected={isConnected}
        initialEmail={accountEmail}
      />
    </div>
  );
}
