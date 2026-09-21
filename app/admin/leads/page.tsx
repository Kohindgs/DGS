import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listCmsLeads, updateLeadStatus } from "@/lib/cms/leads";

export const dynamic = "force-dynamic";

async function changeStatus(formData: FormData) {
  "use server";
  if (!(await hasAdminSession())) redirect("/admin/login/");
  await updateLeadStatus(String(formData.get("id")||""), String(formData.get("status")||"new"));
  revalidatePath("/admin/leads/");
}

function textPayload(value: unknown) {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return ""; }
}

export default async function AdminLeadsPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");
  const ready = isCmsDatabaseConfigured();
  const leads = ready ? await listCmsLeads() : [];
  return <main className="dgs-admin-shell">

    <header className="dgs-admin-header"><div>
      <p className="dgs-admin-kicker">DGS CMS · Leads</p>
      <h1>Lead Inbox</h1>
      <p>One place for website enquiries, career applications and future native form submissions.</p>
    </div><div className="dgs-admin-header-actions">
      <span className={ready?"dgs-admin-badge ready":"dgs-admin-badge"}>{ready?"Database configured":"Database not configured"}</span>
      <Link href="/admin/">Back to CMS</Link>
    </div></header>

    {!ready ? <section className="dgs-admin-status"><h2>Database setup required</h2></section> :
    <section className="dgs-admin-import-panel">
      <div className="dgs-admin-table-wrap"><table className="dgs-admin-table">
        <thead><tr><th>Created</th><th>Lead</th><th>Source</th><th>Status</th><th>Details</th></tr></thead>
        <tbody>{leads.map(lead => <tr key={lead.id}>
          <td>{String(lead.created_at).slice(0,16).replace("T"," ")}</td>
          <td><strong>{lead.name || "Unnamed"}</strong><br/><span>{lead.email || ""}</span><br/><span>{lead.phone || ""}</span></td>
          <td><code>{lead.source_form_key || "unknown"}</code><br/><span>{lead.source_route || ""}</span></td>
          <td><form action={changeStatus} className="dgs-admin-inline-form">
            <input type="hidden" name="id" value={lead.id}/>
            <select name="status" defaultValue={lead.status}>
              {["new","contacted","qualified","won","lost","spam"].map(s=><option key={s}>{s}</option>)}
            </select><button type="submit">Save</button>
          </form></td>
          <td>
            {lead.source_form_key === "career-application" ? <p><a href={`/api/admin/leads/${lead.id}/resume`}>Download CV</a></p> : null}
            <details><summary>View payload</summary><pre>{textPayload(lead.payload)}</pre></details>
          </td>
        </tr>)}</tbody>
      </table></div>
      {!leads.length ? <p className="dgs-admin-help">No native leads captured yet.</p> : null}
    </section>}
  </main>;
}
