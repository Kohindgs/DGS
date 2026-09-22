import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPortfolioOverrides, upsertPortfolioOverride } from "@/lib/cms/portfolio";
import { loadPortfolioDesignPreviewSourceStatic } from "@/lib/design-preview/portfolio-source";
import PortfolioItemRow from "./PortfolioItemRow";

export const dynamic = "force-dynamic";

async function saveItem(formData: FormData) {
  "use server";
  if (!(await hasAdminSession())) redirect("/admin/login/");
  await upsertPortfolioOverride({
    sourceItemId:String(formData.get("sourceItemId")||""),
    title:String(formData.get("title")||"").trim(),
    altText:String(formData.get("altText")||"").trim(),
    sortOrder:Number(formData.get("sortOrder")||0),
    active:String(formData.get("active"))==="true",
  });
  revalidatePath("/admin/portfolio/");
  revalidatePath("/portfolio/");
}

export default async function AdminPortfolioPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const ready = isCmsDatabaseConfigured();
  const source = loadPortfolioDesignPreviewSourceStatic();
  const overrides = ready ? await listPortfolioOverrides() : [];
  const byId = new Map(overrides.map(row=>[row.source_item_id,row]));

  return <main className="dgs-admin-shell">
    <header className="dgs-admin-header"><div>
      <p className="dgs-admin-kicker">DGS CMS · Portfolio</p>
      <h1>Portfolio Admin</h1>
      <p>Control the approved portfolio gallery without changing the current visual presentation.</p>
    </div><div className="dgs-admin-header-actions">
      <span className={ready?"dgs-admin-badge ready":"dgs-admin-badge"}>{ready?"Database configured":"Database not configured"}</span>
      <Link href="/admin/">Back to CMS</Link>
    </div></header>

    {!ready ? <section className="dgs-admin-status"><h2>Database setup required</h2></section> :
    <section className="dgs-admin-import-panel">
      <div className="dgs-admin-record-list">

        {source.items.map((item, index) => (
          <PortfolioItemRow
            key={item.id}
            item={item}
            row={byId.get(item.id)}
            index={index}
            saveItemAction={saveItem}
          />
        ))}
      </div>
    </section>}
  </main>;
}
