import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedMentionsAndCitationsIfEmpty } from "@/lib/off-page/authority-engine";
import type { OffPageBrandMention } from "@/lib/off-page/types";
import MentionsClientView from "./MentionsClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageMentionsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let initialMentions: OffPageBrandMention[] = [];
  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      await seedMentionsAndCitationsIfEmpty();
      const { rows } = await cmsQuery<OffPageBrandMention>(
        "SELECT * FROM off_page_brand_mentions ORDER BY detected_at DESC LIMIT 100"
      );
      initialMentions = rows || [];
    } catch (err) {
      console.error("Failed to load initial mentions:", err);
    }
  }

  return <MentionsClientView initialMentions={initialMentions} />;
}
