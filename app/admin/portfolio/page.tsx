import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listPortfolioOverrides, upsertPortfolioOverride } from "@/lib/cms/portfolio";
import { loadPortfolioDesignPreviewSourceStatic } from "@/lib/design-preview/portfolio-source";

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

        {source.items.map((item,index)=>{
          const row=byId.get(item.id);
          const active=row ? Boolean(row.active) : true;
          return <article className="dgs-admin-record" key={item.id}>
            <div className="dgs-admin-portfolio-preview">
              <span className={active?"dgs-admin-state live":"dgs-admin-state"}>{active?"Visible":"Hidden"}</span>
              <h3>{item.title || item.id}</h3>
              <p>{item.type} · {item.sourceWidth}×{item.sourceHeight}</p>
              <code>{item.id}</code>
            </div>
            <form action={saveItem} className="dgs-admin-editor-form dgs-admin-portfolio-form">
              <input type="hidden" name="sourceItemId" value={item.id}/>
              <label>Title<input name="title" defaultValue={row?.title || item.title} /></label>
              <label>Alt text<input name="altText" defaultValue={row?.alt_text || item.alt} /></label>
              <label>Order<input name="sortOrder" type="number" defaultValue={row?.sort_order ?? index} /></label>
              <label>Visibility
                <select name="active" defaultValue={String(active)}>
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </label>
              <button type="submit">Save</button>
            </form>
          </article>;
        })}
      </div>
    </section>}
  </main>;
}
