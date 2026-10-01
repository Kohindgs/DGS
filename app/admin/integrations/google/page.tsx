import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminIntegrationsGoogleRedirectPage() {
  redirect("/admin/integrations/google/setup/");
}
