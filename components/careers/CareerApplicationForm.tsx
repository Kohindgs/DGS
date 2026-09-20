"use client";

import { useState } from "react";
import styles from "./CareerApplicationForm.module.css";

export function CareerApplicationForm({ positions }: { positions: string[] }) {
  const [status,setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [message,setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending"); setMessage("");
    const form = event.currentTarget;
    const response = await fetch("/api/career/apply", {
      method:"POST",
      body:new FormData(form),
    });
    const payload = await response.json().catch(()=>({}));
    if (!response.ok || !payload?.ok) {
      setStatus("error");
      setMessage(payload?.message || "Unable to submit your application.");
      return;
    }
    form.reset();
    setStatus("success");
    setMessage(payload.message || "Thank you. Your application has been received.");
  }

  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.grid}>
      <label>Full name *<input name="name" autoComplete="name" required /></label>
      <label>Email *<input name="email" type="email" autoComplete="email" required /></label>
      <label>Phone *<input name="phone" type="tel" autoComplete="tel" required /></label>
      <label>Position *
        <select name="position" required defaultValue="">
          <option value="" disabled>Select a role</option>
          {positions.map(position=><option key={position} value={position}>{position}</option>)}
          <option value="General Application">General Application</option>
        </select>
      </label>
      <label>Current location *<input name="location" placeholder="e.g. Bandra, Mumbai" required /></label>
      <label>Total experience *<input name="experience" placeholder="e.g. 2 years 6 months" required /></label>
      <label>Current monthly salary<input name="currentSalary" placeholder="e.g. ₹18,000" /></label>
      <label>Expected monthly salary<input name="expectedSalary" placeholder="e.g. ₹22,000" /></label>
      <label>Notice period<input name="noticePeriod" placeholder="e.g. Immediate / 30 days" /></label>
      <label>Upload CV *<input name="resume" type="file" accept=".pdf,.doc,.docx" required /></label>
    </div>

    <label className={styles.consent}>
      <input name="consent" type="checkbox" value="yes" required />
      <span>I consent to D&apos;Genius Solutions using these details for recruitment and contacting me about this application.</span>
    </label>
    <p className={styles.help}>Accepted CV formats: PDF, DOC, DOCX · Maximum 5 MB.</p>
    <button className={styles.submit} type="submit" disabled={status==="sending"}>
      {status==="sending" ? "Submitting..." : "Submit application"}
    </button>
    {message ? <p className={status==="success" ? styles.success : styles.error} role="status">{message}</p> : null}
  </form>;
}
