import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPortfolioOverrides } from "@/lib/cms/portfolio";
import { loadPortfolioDesignPreviewSourceStatic } from "@/lib/design-preview/portfolio-source";
import PortfolioManagerClientView, { type PortfolioManagerItem } from "./PortfolioManagerClientView";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "portfolio", "view")) {
    redirect("/admin/");
  }

  const ready = isCmsDatabaseConfigured();
  const source = loadPortfolioDesignPreviewSourceStatic();
  const overrides = ready ? await listPortfolioOverrides() : [];
  const byId = new Map(overrides.map((row) => [row.source_item_id, row]));

  const items: PortfolioManagerItem[] = source.items.map((item: any, index: number) => {
    const override = byId.get(item.id);
    let thumbnailUrl = "";

    if (item.type === "image") {
      thumbnailUrl = item.variants?.webp?.[0]?.url || item.variants?.fallback || "";
    } else if (item.type === "video") {
      thumbnailUrl = item.poster?.webp || item.poster?.fallback || "";
    }

    return {
      id: item.id,
      sourceItemId: item.id,
      title: override?.title || item.title || item.id,
      altText: override?.alt_text || item.alt || "",
      type: item.type,
      sourceWidth: item.sourceWidth,
      sourceHeight: item.sourceHeight,
      thumbnailUrl,
      sortOrder: override?.sort_order ?? index,
      active: override ? Boolean(override.active) : true,
    };
  });

  return (
    <PortfolioManagerClientView
      items={items}
      databaseConfigured={ready}
    />
  );
}
