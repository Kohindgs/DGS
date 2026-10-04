import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { seedMentionsAndCitationsIfEmpty } from "@/lib/off-page/authority-engine";
import type { OffPageCitation, OffPageReviewPlatform } from "@/lib/off-page/types";
import CitationsClientView from "./CitationsClientView";

export const dynamic = "force-dynamic";

export default async function AdminOffPageCitationsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    redirect("/admin/");
  }

  let citations: OffPageCitation[] = [];
  let reviews: OffPageReviewPlatform[] = [];

  if (isCmsDatabaseConfigured()) {
    try {
      await ensureOffPageTablesExist();
      await seedMentionsAndCitationsIfEmpty();
      const [citRes, revRes] = await Promise.all([
        cmsQuery<OffPageCitation>(`SELECT * FROM off_page_citations ORDER BY region, nap_status, platform_name`),
        cmsQuery<OffPageReviewPlatform>(`SELECT * FROM off_page_reviews ORDER BY region, rating DESC`),
      ]);
      citations = citRes.rows || [];
      reviews = revRes.rows || [];
    } catch (err) {
      console.error("Failed to load initial citations:", err);
    }
  }

  return <CitationsClientView initialCitations={citations} initialReviews={reviews} />;
}
