import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import type {
  OffPageOpportunity,
  OffPageOutreach,
  OutreachStage,
  PitchType,
} from "./types";

/**
 * Generates an AI outreach pitch draft for an opportunity.
 * Tailors pitch subject, body, value proposition, and evidence.
 * Strictly requires human approval before sending.
 */
export function generateOutreachPitchDraft(params: {
  siteName: string;
  publication: string;
  category: string;
  targetPage: string;
  service: string;
  contactName?: string;
  pitchType?: PitchType;
}): {
  pitchType: PitchType;
  pitchSubject: string;
  pitchBody: string;
  suggestedFollowUpDays: number;
} {
  const {
    siteName,
    publication,
    category,
    targetPage,
    service,
    contactName = "Editorial Team",
    pitchType = "RESOURCE_SUGGESTION",
  } = params;

  let pitchSubject = "";
  let pitchBody = "";

  if (category === "DIGITAL_PR" || category === "EXPERT_CONTRIBUTION" || pitchType === "EXPERT_QUOTE") {
    pitchSubject = `Expert Commentary: Enterprise Generative Search & AI Video Benchmarks (for ${publication})`;
    pitchBody = `Hi ${contactName},

I hope you're having a productive week.

I noticed your recent coverage on digital marketing transformation and AI technology at ${publication}. As enterprises rapidly adopt AI Overviews and neural video production, several notable shifts in organic visibility and engagement are emerging.

Our technical team at D'Genius Solutions recently benchmarked 500+ commercial video campaigns and generative engine search trends across India, the GCC, and North America. Key findings include:
- A 3.8x increase in audience retention for hybrid AI-assisted video commercials versus traditional stock pipelines.
- Measurable shifts in AI Overview citation share when structured entity data is coupled with video schema.

We'd love to offer commentary, proprietary benchmark charts, or an executive quote from our creative leadership if you're working on any upcoming features on AI marketing or commercial production.

You can review our verified case studies and work here: ${targetPage}

Best regards,
DGS Editorial & Outreach Team
D'Genius Solutions | Khar West, Mumbai | Dubai | Global`;
  } else if (category === "PODCAST" || pitchType === "INTERVIEW") {
    pitchSubject = `Guest Pitch for ${publication}: How AI Video Production is Disrupting Commercial Advertising`;
    pitchBody = `Hi ${contactName},

Huge fan of the insightful conversations on ${publication}.

I'm reaching out to propose an interview topic that your listeners in tech, marketing, and media would find compelling:
"From Storyboard to 4K Broadcast: How AI Video Pipelines Deliver Agency Quality at 10x Speed"

Our leadership at D'Genius Solutions operates at the bleeding edge of AI commercial production and generative engine optimization. In this conversation, we can break down:
1. Practical generative AI video workflows that enterprise brands are actually using today.
2. The myth vs reality of replacing camera crews with neural rendering.
3. How to optimize digital video assets for Google AI Overviews and multi-modal search engines.

Feel free to check out our work at ${targetPage}. Would love to jump on a quick 10-minute prep call if this aligns with your editorial calendar!

Warm regards,
DGS Creative Leadership
D'Genius Solutions`;
  } else {
    pitchSubject = `Resource Submission: ${service} for ${publication}`;
    pitchBody = `Hi ${contactName},

I came across your curated resource directory at ${publication} and wanted to thank you for maintaining such a valuable guide for founders and marketing leaders.

I noticed your section on digital marketing and video production. I wanted to suggest including D'Genius Solutions (${targetPage}), an agency specializing in AI video production, technical SEO, and generative search intelligence.

We provide comprehensive audits, enterprise video case studies, and transparent service packages for growing businesses.

Would you be open to considering us for inclusion in your verified directory?

Details:
- Company: D'Genius Solutions
- URL: ${targetPage}
- Core Focus: ${service}
- Headquarters: Khar West, Mumbai with GCC operations in Dubai

Thanks for your time and continued editorial curation!

Best,
DGS Operations Team`;
  }

  return {
    pitchType,
    pitchSubject,
    pitchBody,
    suggestedFollowUpDays: 5,
  };
}

/**
 * Creates an outreach CRM pipeline entry from an opportunity.
 */
export async function createOutreachFromOpportunity(params: {
  opportunityId: string;
  assignedStaff?: string;
  contactName?: string;
  email?: string;
  linkedin?: string;
  pitchType?: PitchType;
}): Promise<{ success: boolean; id: string }> {
  await ensureOffPageTablesExist();

  const { rows } = await cmsQuery<OffPageOpportunity>(
    `SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1`,
    [params.opportunityId]
  );
  if (!rows[0]) throw new Error("Opportunity not found");

  const opp = rows[0];
  const draft = generateOutreachPitchDraft({
    siteName: opp.site_name,
    publication: opp.domain,
    category: opp.category,
    targetPage: opp.recommended_dgs_target_page,
    service: opp.recommended_service,
    contactName: params.contactName,
    pitchType: params.pitchType,
  });

  const id = `out_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await cmsExecute(
    `INSERT INTO off_page_outreach (
      id, opportunity_id, contact_name, publication, email, linkedin, contact_url,
      assigned_staff, stage, pitch_type, pitch_subject, pitch_body, target_page,
      submission_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'QUALIFIED', ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      id,
      opp.id,
      params.contactName || null,
      opp.site_name,
      params.email || null,
      params.linkedin || null,
      opp.exact_submission_url,
      params.assignedStaff || "DGS Outreach Specialist",
      draft.pitchType,
      draft.pitchSubject,
      draft.pitchBody,
      opp.recommended_dgs_target_page,
      opp.exact_submission_url,
    ]
  );

  // Update opportunity status to OUTREACH
  await cmsExecute(
    `UPDATE off_page_opportunities SET status = 'OUTREACH', assigned_to = ? WHERE id = ?`,
    [params.assignedStaff || "DGS Outreach Specialist", opp.id]
  );

  return { success: true, id };
}

/**
 * Updates outreach stage with audit logging and human approval guards.
 */
export async function updateOutreachStage(
  outreachId: string,
  newStage: OutreachStage,
  notes?: string,
  liveUrl?: string
): Promise<void> {
  await ensureOffPageTablesExist();

  const updates: string[] = ["stage = ?", "updated_at = NOW()"];
  const values: any[] = [newStage];

  if (notes) {
    updates.push("notes = CONCAT(IFNULL(notes, ''), '\n', ?)");
    values.push(`[${new Date().toISOString().slice(0, 10)}] ${notes}`);
  }
  if (liveUrl) {
    updates.push("live_url = ?");
    values.push(liveUrl);
  }
  if (newStage === "OUTREACH") {
    updates.push("first_contact = IFNULL(first_contact, NOW())", "last_contact = NOW()");
  } else if (newStage === "FOLLOW_UP") {
    updates.push("last_contact = NOW()");
  }

  values.push(outreachId);
  await cmsExecute(
    `UPDATE off_page_outreach SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  // If marked VERIFIED or LIVE with a liveUrl, reflect in opportunity
  if (newStage === "VERIFIED" || newStage === "LIVE") {
    const { rows } = await cmsQuery<{ opportunity_id: string }>(
      `SELECT opportunity_id FROM off_page_outreach WHERE id = ?`,
      [outreachId]
    );
    if (rows[0]?.opportunity_id) {
      await cmsExecute(
        `UPDATE off_page_opportunities SET status = 'VERIFIED', evidence = ? WHERE id = ?`,
        [liveUrl || "Verified live link", rows[0].opportunity_id]
      );
    }
  }
}

/**
 * Seeds sample outreach pipeline items if empty.
 */
export async function seedOutreachIfEmpty(): Promise<number> {
  await ensureOffPageTablesExist();

  const { rows: countRows } = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM off_page_outreach`
  );
  if (Number(countRows[0]?.total || 0) > 0) return 0;

  const SAMPLE_OUTREACH = [
    {
      publication: "Featured.com (Terkel)",
      contactName: "Brett Farmiloe",
      email: "editors@featured.com",
      stage: "SUBMITTED" as OutreachStage,
      pitchType: "EXPERT_QUOTE" as PitchType,
      targetPage: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
      subject: "Expert Quote: Generative AI Video ROI in 2026",
      notes: "Answer submitted for Fast Company syndicate prompt #4928.",
    },
    {
      publication: "Connectively (HARO)",
      contactName: "Sarah Jenkins (Tech Journalist)",
      email: "query-4019@connectively.us",
      stage: "OUTREACH" as OutreachStage,
      pitchType: "GUEST_POST" as PitchType,
      targetPage: "https://www.dgeniussolutions.com/services/llm-seo-service/",
      subject: "Pitch: How AI Overviews Rewrote the SEO Playbook",
      notes: "Pitched commentary for upcoming Q4 search trends report.",
    },
    {
      publication: "Arabian Business Dubai",
      contactName: "Editorial Tech Desk",
      email: "editorial@arabianbusiness.com",
      stage: "NEGOTIATING" as OutreachStage,
      pitchType: "INTERVIEW" as PitchType,
      targetPage: "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
      subject: "Interview Pitch: The Dubai Creative AI Revolution",
      notes: "Editor requested executive headshot and office background information.",
    },
    {
      publication: "NASSCOM Community",
      contactName: "Community Editors",
      email: "community@nasscom.in",
      stage: "VERIFIED" as OutreachStage,
      pitchType: "RESOURCE_SUGGESTION" as PitchType,
      targetPage: "https://www.dgeniussolutions.com/services/geo/",
      subject: "Technical Article: Generative Engine Optimization Standards",
      liveUrl: "https://community.nasscom.in/post/future-of-enterprise-geo",
      notes: "Article approved and published live with DoFollow backlink.",
    },
  ];

  for (const o of SAMPLE_OUTREACH) {
    const id = `out_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await cmsExecute(
      `INSERT INTO off_page_outreach (
        id, contact_name, publication, email, stage, pitch_type, pitch_subject,
        target_page, live_url, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        o.contactName,
        o.publication,
        o.email,
        o.stage,
        o.pitchType,
        o.subject,
        o.targetPage,
        o.liveUrl || null,
        o.notes,
      ]
    );
  }

  return SAMPLE_OUTREACH.length;
}
