import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { createCmsCareerJob, listCmsCareerJobs, setCmsCareerJobActive } from "@/lib/cms/careers";

function lines(value: FormDataEntryValue | null) {
  return JSON.stringify(String(value || "").split(/\r?\n/).map(v=>v.trim()).filter(Boolean));
}
async function createJob(formData: FormData) {
  "use server";
  if (!(await hasAdminSession())) redirect("/admin/login/");
  const value = (key: string) => String(formData.get(key) || "").trim();
  await createCmsCareerJob({
    slug:value("slug"), title:value("title"), summary:value("summary"),
    employment_type:value("employment_type") || "FULL_TIME",
    employment_label:value("employment_label") || "Full-time",
    location:value("location"), workplace_type:value("workplace_type") || "On-site",
    schedule:value("schedule"), experience:value("experience"), compensation:value("compensation"),
    overview:value("overview"), responsibilities:lines(formData.get("responsibilities")),
    requirements:lines(formData.get("requirements")), benefits:lines(formData.get("benefits")),
    date_posted:value("date_posted"), active:true,
  });
  revalidatePath("/admin/careers/"); revalidatePath("/career/");
}

async function toggleJob(formData: FormData) {
  "use server";
  if (!(await hasAdminSession())) redirect("/admin/login/");
  await setCmsCareerJobActive(String(formData.get("id")||""), String(formData.get("active")) !== "true");
  revalidatePath("/admin/careers/"); revalidatePath("/career/");
}
export default async function AdminCareersPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");
  const ready = isCmsDatabaseConfigured();
  const jobs = ready ? await listCmsCareerJobs(false) : [];
  return <main className="dgs-admin-shell">
    <header className="dgs-admin-header"><div>
      <p className="dgs-admin-kicker">DGS CMS · Careers</p><h1>Careers Admin</h1>
      <p>Create openings and control which jobs are visible on the public careers section.</p>
    </div><div className="dgs-admin-header-actions">
      <span className={ready?"dgs-admin-badge ready":"dgs-admin-badge"}>{ready?"Database configured":"Database not configured"}</span>
      <Link href="/admin/">Back to CMS</Link>
    </div></header>
    {!ready ? <section className="dgs-admin-status"><h2>Database setup required</h2></section> :
    <div className="dgs-admin-two-column">
      <section className="dgs-admin-import-panel"><h2>New opening</h2>
        <form action={createJob} className="dgs-admin-editor-form">
          <label>Job title<input name="title" required /></label>
          <label>Slug<input name="slug" placeholder="video-editor-premiere-pro-ai" required /></label>
          <label>Summary<textarea name="summary" rows={3} required /></label>

          <div className="dgs-admin-form-grid">
            <label>Employment type<select name="employment_type"><option>FULL_TIME</option><option>PART_TIME</option><option>CONTRACTOR</option><option>INTERN</option></select></label>
            <label>Employment label<input name="employment_label" defaultValue="Full-time" /></label>
            <label>Location<input name="location" defaultValue="Khar West, Mumbai" required /></label>
            <label>Workplace<input name="workplace_type" defaultValue="On-site" /></label>
            <label>Schedule<input name="schedule" defaultValue="Monday - Friday" required /></label>
            <label>Experience<input name="experience" placeholder="1-6 years" required /></label>
            <label>Compensation<input name="compensation" placeholder="₹15,000 - ₹20,000 per month" required /></label>
            <label>Date posted<input name="date_posted" type="date" required /></label>
          </div>
          <label>Overview<textarea name="overview" rows={5} required /></label>
          <label>Responsibilities — one per line<textarea name="responsibilities" rows={6} required /></label>
          <label>Requirements — one per line<textarea name="requirements" rows={6} required /></label>
          <label>Benefits — one per line<textarea name="benefits" rows={5} required /></label>
          <button type="submit">Create & publish job</button>
        </form>
      </section>
      <section className="dgs-admin-import-panel"><h2>Current jobs</h2>
        <div className="dgs-admin-record-list">
          {jobs.length ? jobs.map(job => <article key={job.id} className="dgs-admin-record">
            <div><span className={job.active?"dgs-admin-state live":"dgs-admin-state"}>{job.active?"Live":"Hidden"}</span>
              <h3>{job.title}</h3><p>{job.location} · {job.experience}</p><code>/career/{job.slug}/</code></div>

            <form action={toggleJob}><input type="hidden" name="id" value={job.id}/>
              <input type="hidden" name="active" value={String(Boolean(job.active))}/>
              <button type="submit">{job.active?"Unpublish":"Publish"}</button></form>
          </article>) : <p className="dgs-admin-help">No native career jobs yet. The public site will continue using its safe fallback data until you create the first one.</p>}
        </div>
      </section>
    </div>}
  </main>;
}
