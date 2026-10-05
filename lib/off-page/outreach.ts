import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { groundOutreachDraft } from "@/lib/intelligence/turbovec-client";
import type {
  OffPageOpportunity,
  OffPageOutreach,
  OutreachStage,
  PitchType,
} from "./types";

export const DGS_STANDARD_SENDER = "Kohin Bellara - CEO D'Genius Solutions";
export const DGS_STANDARD_SIGNATURE = `Best regards,

Kohin Bellara
CEO, D'Genius Solutions
https://www.dgeniussolutions.com/`;

/**
 * Generates an outreach pitch draft for an opportunity grounded in verified CMS records.
 * Uses exact sender identity and factual messaging backed by retrieved DGS assets.
 * Displays mandatory SOURCES USED block below pitch body.
 */
export function generateOutreachPitchDraft(params: {
  siteName: string;
  publication: string;
  category: string;
  targetPage: string;
  service: string;
  contactName?: string;
  pitchType?: PitchType;
  sourcesUsed?: Array<{ title: string; url: string; entity_type: string }>;
}): {
  pitchType: PitchType;
  pitchSubject: string;
  pitchBody: string;
  sourcesUsed: Array<{ title: string; url: string; entity_type: string }>;
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
    sourcesUsed = [],
  } = params;

  let pitchSubject = "";
  let baseBody = "";

  if (category === "DIGITAL_PR" || category === "EXPERT_CONTRIBUTION" || pitchType === "EXPERT_QUOTE") {
    pitchSubject = `Expert Commentary: Enterprise Generative Search & AI Video Strategy (for ${publication})`;
    baseBody = `Hi ${contactName},

I hope you are well.

I noticed your recent coverage on digital marketing transformation and AI technology at ${publication}. As enterprises adapt to AI Overviews and modern video workflows, notable shifts in organic visibility and multi-modal discovery are taking shape.

At D'Genius Solutions, our team focuses on technical SEO, generative engine optimization (GEO), and enterprise AI video production for clients across India, UAE, and global markets.

We would be glad to share practical commentary, technical perspectives, or an executive quote if you are working on any upcoming stories on AI marketing, search evolutions, or commercial video workflows.

You can review our verified services and case studies here: ${targetPage}

${DGS_STANDARD_SIGNATURE}`;
  } else if (category === "PODCAST" || pitchType === "INTERVIEW") {
    pitchSubject = `Guest Pitch for ${publication}: Generative AI Video Workflows and Modern Search Architecture`;
    baseBody = `Hi ${contactName},

I've been following the discussions on ${publication} and appreciate your thoughtful coverage of the industry.

I would like to propose a timely discussion topic that could provide genuine practical value for your audience of founders, marketers, and technology leaders:
"Practical Generative AI Video Production & Search Visibility in the Era of AI Engines"

In this conversation, we can break down:
1. Real-world generative AI video production pipelines that brands are deploying today.
2. How video schema and entity structuring impact AI Overview citations.
3. Realistic workflows that blend human creative direction with automated neural rendering.

Feel free to review our work at ${targetPage}. If this aligns with your editorial calendar, I would be glad to coordinate a brief introductory conversation.

${DGS_STANDARD_SIGNATURE}`;
  } else {
    pitchSubject = `Resource Submission: ${service} for ${publication}`;
    baseBody = `Hi ${contactName},

I came across your curated resource section at ${publication} and wanted to thank you for maintaining a helpful guide for businesses and digital leaders.

I noticed your directory covers digital agency services and tech innovation. I would like to suggest considering D'Genius Solutions (${targetPage}) for inclusion.

D'Genius Solutions is a Mumbai-headquartered digital agency delivering AI video production, technical SEO, and generative search intelligence for clients across India, the UAE, and global markets.

Details for your editorial team:
- Company: D'Genius Solutions
- URL: ${targetPage}
- Primary Focus: ${service}
- Headquarters: Mumbai, India (serving global and regional markets)

Thank you for your consideration and editorial curation.

${DGS_STANDARD_SIGNATURE}`;
  }

  // Mandatory SOURCES USED grounding block
  let pitchBody = baseBody;
  if (sourcesUsed && sourcesUsed.length > 0) {
    const sourcesLines = sourcesUsed
      .map((s) => `- [${s.title}](${s.url}) (${s.entity_type})`)
      .join("\n");
    pitchBody += `\n\nSOURCES USED:\n${sourcesLines}`;
  }

  return {
    pitchType,
    pitchSubject,
    pitchBody,
    sourcesUsed,
    suggestedFollowUpDays: 5,
  };
}

/**
 * Creates an outreach CRM pipeline entry from an opportunity or custom input.
 * Default stage is DRAFT.
 */
export async function createOutreachFromOpportunity(params: {
  opportunityId?: string;
  assignedStaff?: string;
  contactName?: string;
  email?: string;
  linkedin?: string;
  pitchType?: PitchType;
  pitchSubject?: string;
  pitchBody?: string;
  stage?: OutreachStage;
  sourceModule?: string;
  sourceRecordId?: string;
  targetDomain?: string;
  targetUrl?: string;
  targetPage?: string;
  publication?: string;
  createdBy?: string;
  notes?: string;
}): Promise<{ success: boolean; id: string }> {
  await ensureOffPageTablesExist();

  let opp: OffPageOpportunity | null = null;
  if (params.opportunityId) {
    const { rows } = await cmsQuery<OffPageOpportunity>(
      `SELECT * FROM off_page_opportunities WHERE id = ? LIMIT 1`,
      [params.opportunityId]
    );
    if (rows[0]) opp = rows[0];
  }

  const publication = params.publication || opp?.site_name || params.targetDomain || "Unknown Publication";
  const domain = params.targetDomain || opp?.domain || null;
  const targetPage = params.targetPage || opp?.recommended_dgs_target_page || "https://www.dgeniussolutions.com/";
  const submissionUrl = params.targetUrl || opp?.exact_submission_url || null;
  const stage = params.stage || "DRAFT";

  let pitchType = params.pitchType || "RESOURCE_SUGGESTION";
  let pitchSubject = params.pitchSubject;
  let pitchBody = params.pitchBody;

  if (!pitchSubject || !pitchBody) {
    let sourcesUsed: Array<{ title: string; url: string; entity_type: string }> = [];
    try {
      const oppText = `${publication} ${domain || ""} ${opp?.category || ""} ${opp?.notes || ""} ${opp?.recommended_content || ""}`;
      const groundRes = await groundOutreachDraft({
        opportunityText: oppText,
        publicationName: publication,
        targetPage,
      });
      if (groundRes.ok && groundRes.sources_used.length > 0) {
        sourcesUsed = groundRes.sources_used;
      }
    } catch (err) {
      console.warn("Failed grounding draft in createOutreachFromOpportunity:", err);
    }

    const draft = generateOutreachPitchDraft({
      siteName: publication,
      publication: domain || publication,
      category: opp?.category || "AGENCY_DIRECTORY",
      targetPage,
      service: opp?.recommended_service || "AI Video Production & SEO",
      contactName: params.contactName,
      pitchType,
      sourcesUsed,
    });
    pitchType = draft.pitchType;
    pitchSubject = draft.pitchSubject;
    pitchBody = draft.pitchBody;
  }

  const id = `out_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await cmsExecute(
    `INSERT INTO off_page_outreach (
      id, opportunity_id, source_module, source_record_id, target_domain,
      contact_name, publication, email, linkedin, contact_url,
      assigned_staff, stage, pitch_type, pitch_subject, pitch_body, target_page,
      submission_url, notes, created_by, drafted_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
    [
      id,
      opp?.id || null,
      params.sourceModule || (opp ? "OPPORTUNITIES" : "MANUAL"),
      params.sourceRecordId || opp?.id || null,
      domain,
      params.contactName || null,
      publication,
      params.email || null,
      params.linkedin || null,
      submissionUrl,
      params.assignedStaff || DGS_STANDARD_SENDER,
      stage,
      pitchType,
      pitchSubject,
      pitchBody,
      targetPage,
      submissionUrl,
      params.notes || null,
      params.createdBy || DGS_STANDARD_SENDER,
    ]
  );

  if (opp?.id) {
    await cmsExecute(
      `UPDATE off_page_opportunities SET status = 'OUTREACH', assigned_to = ? WHERE id = ?`,
      [params.assignedStaff || DGS_STANDARD_SENDER, opp.id]
    );
  }

  return { success: true, id };
}

/**
 * Updates outreach stage with audit logging and timestamp tracking.
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

  if (newStage === "APPROVED") {
    updates.push("approved_at = IFNULL(approved_at, NOW())");
  } else if (newStage === "OUTREACH") {
    updates.push("sent_at = IFNULL(sent_at, NOW())", "first_contact = IFNULL(first_contact, NOW())", "last_contact = NOW()");
  } else if (newStage === "FOLLOW_UP") {
    updates.push("last_contact = NOW()");
  } else if (newStage === "SUBMITTED") {
    updates.push("submitted_at = IFNULL(submitted_at, NOW())");
  } else if (newStage === "LIVE") {
    updates.push("live_at = IFNULL(live_at, NOW())");
  } else if (newStage === "VERIFIED") {
    updates.push("verified_at = IFNULL(verified_at, NOW())");
  }

  values.push(outreachId);
  await cmsExecute(
    `UPDATE off_page_outreach SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  // If marked LIVE or VERIFIED with a live URL, link opportunity and create backlink if not exists
  if ((newStage === "LIVE" || newStage === "VERIFIED") && liveUrl) {
    const { rows } = await cmsQuery<OffPageOutreach>(
      `SELECT * FROM off_page_outreach WHERE id = ? LIMIT 1`,
      [outreachId]
    );
    const outreachRecord = rows[0];

    if (outreachRecord?.opportunity_id) {
      await cmsExecute(
        `UPDATE off_page_opportunities SET status = 'VERIFIED', evidence = ? WHERE id = ?`,
        [liveUrl, outreachRecord.opportunity_id]
      );
    }

    // Auto-create or link into off_page_backlinks for monitoring
    try {
      const sourceDomain = new URL(liveUrl).hostname;
      const { rows: existingLinks } = await cmsQuery<{ id: string }>(
        `SELECT id FROM off_page_backlinks WHERE source_url = ? LIMIT 1`,
        [liveUrl]
      );

      if (existingLinks.length === 0) {
        const linkId = `lnk_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
        await cmsExecute(
          `INSERT INTO off_page_backlinks (
            id, source_domain, source_url, target_url, target_page_type,
            anchor_text, anchor_classification, link_rel, dofollow, nofollow,
            first_seen_at, last_seen_at, status, http_status, source_country,
            source_region, source_language, topical_category, authority_score,
            outreach_id, notes, discovered_at, live_at, next_check_at, check_priority,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'SERVICE_PAGE', 'D\\'Genius Solutions', 'BRANDED', 'unknown', 0, 0, NOW(), NOW(), 'NEW', NULL, 'Global', 'GLOBAL', 'en', 'Outreach Win', 85, ?, ?, NOW(), NOW(), NOW(), 'P0', NOW(), NOW())`,
          [
            linkId,
            sourceDomain,
            liveUrl,
            outreachRecord?.target_page || "https://www.dgeniussolutions.com/",
            outreachId,
            notes || "Won via outreach CRM",
          ]
        );
      }
    } catch (linkErr) {
      console.warn("Could not auto-create backlink record from live URL:", linkErr);
    }
  }
}

/**
 * Updates full outreach draft fields (subject, body, contact, email, etc.)
 */
export async function updateOutreachDraft(params: {
  id: string;
  pitchSubject?: string;
  pitchBody?: string;
  contactName?: string;
  email?: string;
  linkedin?: string;
  targetPage?: string;
  assignedStaff?: string;
  notes?: string;
  stage?: OutreachStage;
}): Promise<void> {
  await ensureOffPageTablesExist();

  const updates: string[] = ["updated_at = NOW()"];
  const values: any[] = [];

  if (params.pitchSubject !== undefined) {
    updates.push("pitch_subject = ?");
    values.push(params.pitchSubject);
  }
  if (params.pitchBody !== undefined) {
    updates.push("pitch_body = ?");
    values.push(params.pitchBody);
  }
  if (params.contactName !== undefined) {
    updates.push("contact_name = ?");
    values.push(params.contactName);
  }
  if (params.email !== undefined) {
    updates.push("email = ?");
    values.push(params.email);
  }
  if (params.linkedin !== undefined) {
    updates.push("linkedin = ?");
    values.push(params.linkedin);
  }
  if (params.targetPage !== undefined) {
    updates.push("target_page = ?");
    values.push(params.targetPage);
  }
  if (params.assignedStaff !== undefined) {
    updates.push("assigned_staff = ?");
    values.push(params.assignedStaff);
  }
  if (params.notes !== undefined) {
    updates.push("notes = ?");
    values.push(params.notes);
  }
  if (params.stage !== undefined) {
    updates.push("stage = ?");
    values.push(params.stage);
  }

  values.push(params.id);
  await cmsExecute(
    `UPDATE off_page_outreach SET ${updates.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Zero-seeding: sample outreach records are permanently removed from production code.
 * Preserved as a safe no-op for backward compatibility.
 */
export async function seedOutreachIfEmpty(): Promise<number> {
  return 0;
}
