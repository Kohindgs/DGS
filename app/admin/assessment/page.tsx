import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { ASSESSMENTS } from "@/lib/assessments/definitions";
import { createAssessmentAssignment, listAssessmentAttempts, updateAssessmentReview } from "@/lib/cms/assessments";

function parseJson(value:unknown) {
  if(typeof value!=="string") return value as Record<string,unknown>;
  try{return JSON.parse(value) as Record<string,unknown>;}catch{return {};}
}

async function createInvite(formData:FormData) {
  "use server";
  if(!(await hasAdminSession())) redirect("/admin/login/");
  const assessmentKey=String(formData.get("assessmentKey")||"");
  const definition=ASSESSMENTS.find(item=>item.key===assessmentKey);
  if(!definition) throw new Error("Invalid assessment");
  const result=await createAssessmentAssignment({
    assessmentKey,
    name:String(formData.get("name")||"").trim(),
    email:String(formData.get("email")||"").trim(),
    phone:String(formData.get("phone")||"").trim(),
    experience:String(formData.get("experience")||"").trim(),
    noticePeriod:String(formData.get("noticePeriod")||"").trim(),
    expiresAt:String(formData.get("expiresAt")||"").trim()||null,
  });
  const invite=`/${definition.slug}/?token=${result.token}`;
  redirect(`/admin/assessment/?invite=${encodeURIComponent(invite)}`);
}

async function saveReview(formData:FormData) {
  "use server";
  if(!(await hasAdminSession())) redirect("/admin/login/");
  await updateAssessmentReview(
    String(formData.get("id")||""),
    String(formData.get("status")||"pending"),
    String(formData.get("notes")||""),
  );
  revalidatePath("/admin/assessment/");
}

export default async function AssessmentAdminPage({
  searchParams,
}:{searchParams:Promise<{invite?:string}>}) {
  if(process.env.DGS_ADMIN_ENABLED!=="true") notFound();
  if(!(await hasAdminSession())) redirect("/admin/login/");
  const ready=isCmsDatabaseConfigured();
  const {invite=""}=await searchParams;
  const attempts=ready?await listAssessmentAttempts():[];

  return <main className="dgs-admin-shell">
    <header className="dgs-admin-header"><div>
      <p className="dgs-admin-kicker">DGS CMS · Assessment</p>
      <h1>Candidate Assessments</h1>
      <p>Create secure single-use candidate links and review objective scores, written answers and activity indicators.</p>
    </div><div className="dgs-admin-header-actions">
      <span className={ready?"dgs-admin-badge ready":"dgs-admin-badge"}>{ready?"Database configured":"Database not configured"}</span>
      <Link href="/admin/">Back to CMS</Link>
    </div></header>

    {!ready?<section className="dgs-admin-status"><h2>Database setup required</h2></section>:
    <div className="dgs-admin-two-column">
      <section className="dgs-admin-import-panel">
        <h2>Create candidate link</h2>
        {invite?<div className="dgs-admin-invite"><strong>New private link</strong><code>{invite}</code><p>Copy this link now. The token is not stored in readable form.</p></div>:null}
        <form action={createInvite} className="dgs-admin-editor-form">
          <label>Assessment<select name="assessmentKey" required>{ASSESSMENTS.map(a=><option key={a.key} value={a.key}>{a.title}</option>)}</select></label>
          <label>Candidate name<input name="name" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Phone<input name="phone" required /></label>
          <label>SEO experience<input name="experience" /></label>
          <label>Notice period<input name="noticePeriod" /></label>
          <label>Link expires at<input name="expiresAt" type="datetime-local" /></label>
          <button type="submit">Create secure link</button>
        </form>
      </section>

      <section className="dgs-admin-import-panel">
        <h2>Assessment policy</h2>
        <p className="dgs-admin-help">MCQs are objectively auto-scored. Written answers and activity indicators require human review and do not automatically accept or reject a candidate.</p>
        <ul>
          <li>Secure single-use token</li>
          <li>Server-enforced timer</li>
          <li>Tab/blur events logged as review context only</li>
          <li>No health, DOB, gender or criminal-history scoring</li>
        </ul>
      </section>
    </div>}

    {ready?<section className="dgs-admin-import-panel" style={{maxWidth:1280,margin:"18px auto 0"}}>
      <h2>Candidate results</h2>
      <div className="dgs-admin-record-list">
        {attempts.length?attempts.map(attempt=>{
          const answers=parseJson(attempt.answers);
          const activity=Array.isArray(parseJson(attempt.activity))?parseJson(attempt.activity):attempt.activity;
          return <article className="dgs-admin-record dgs-admin-assessment-record" key={attempt.id}>
            <div>
              <span className="dgs-admin-state live">{attempt.review_status}</span>
              <h3>{attempt.candidate_name}</h3>
              <p>{attempt.assessment_key} · {attempt.candidate_email} · {attempt.candidate_phone}</p>
              <p>Objective score: <strong>{attempt.objective_score}/{attempt.objective_total}</strong></p>
              <p>Started: {attempt.started_at} · Submitted: {attempt.submitted_at||"In progress"}</p>
              <details><summary>Answers</summary><pre>{JSON.stringify(answers,null,2)}</pre></details>
              <details><summary>Activity indicators</summary><pre>{JSON.stringify(activity,null,2)}</pre></details>
            </div>
            <form action={saveReview} className="dgs-admin-editor-form dgs-admin-review-form">
              <input type="hidden" name="id" value={attempt.id}/>
              <label>HR review status<select name="status" defaultValue={attempt.review_status}>
                {["pending","reviewed","shortlisted","hold","rejected"].map(s=><option key={s}>{s}</option>)}
              </select></label>
              <label>Reviewer notes<textarea name="notes" rows={5} defaultValue={attempt.reviewer_notes||""}/></label>
              <button type="submit">Save review</button>
            </form>
          </article>;
        }):<p className="dgs-admin-help">No assessment attempts yet.</p>}
      </div>
    </section>:null}
  </main>;
}
