import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { evaluateSpamRisk, calculateDgsAuthorityScore, calculatePriority } from "@/lib/off-page/scoring";
import { randomUUID } from "node:crypto";
import type { RegionCode, OpportunityCategory } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

interface ImportRecord {
  site_name: string;
  domain: string;
  exact_action_url: string;
  region?: string;
  country?: string;
  category?: string;
  free_status?: string;
  target_page?: string;
  verification_status?: string;
  verification_date?: string;
  evidence?: string;
  notes?: string;
}

function parseCsv(text: string): ImportRecord[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const records: ImportRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split by comma ignoring commas inside quotes
    const values: string[] = [];
    let insideQuotes = false;
    let currentVal = "";

    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ""));

    const rec: any = {};
    for (let h = 0; h < header.length; h++) {
      const key = header[h];
      const val = values[h] || "";
      if (key === "site" || key === "site_name") rec.site_name = val;
      else if (key === "domain") rec.domain = val;
      else if (key === "exact_action_url" || key === "action_url" || key === "submission_url" || key === "url") rec.exact_action_url = val;
      else if (key === "region") rec.region = val;
      else if (key === "country") rec.country = val;
      else if (key === "category" || key === "opportunity_type") rec.category = val;
      else if (key === "free_status" || key === "free" || key === "cost") rec.free_status = val;
      else if (key === "target_page" || key === "target_url") rec.target_page = val;
      else if (key === "verification_status" || key === "status") rec.verification_status = val;
      else if (key === "verification_date" || key === "verified_date") rec.verification_date = val;
      else if (key === "evidence" || key === "proof") rec.evidence = val;
      else if (key === "notes" || key === "description") rec.notes = val;
    }

    if (rec.site_name || rec.domain) {
      records.push(rec);
    }
  }

  return records;
}

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();

  try {
    const body = await req.json();
    let records: ImportRecord[] = [];

    if (Array.isArray(body.records)) {
      records = body.records;
    } else if (Array.isArray(body.opportunities)) {
      records = body.opportunities;
    } else if (typeof body.csv_text === "string") {
      records = parseCsv(body.csv_text);
    } else {
      return NextResponse.json(
        { error: "Provide an array of 'records' (or 'opportunities') or 'csv_text' to import." },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json({ error: "No records found in import payload." }, { status: 400 });
    }

    let imported = 0;
    let duplicates = 0;
    let rejected = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const rowNum = i + 1;

      // 1. Validate required fields
      if (!r.site_name?.trim()) {
        errors.push(`Row ${rowNum}: Missing site_name.`);
        rejected++;
        continue;
      }

      let domain = r.domain?.trim().toLowerCase();
      let actionUrl = r.exact_action_url?.trim();

      if (!domain && actionUrl) {
        try {
          domain = new URL(actionUrl).hostname.toLowerCase();
        } catch {
          errors.push(`Row ${rowNum}: Invalid action URL '${actionUrl}'.`);
          rejected++;
          continue;
        }
      }

      if (!domain) {
        errors.push(`Row ${rowNum}: Missing domain.`);
        rejected++;
        continue;
      }

      domain = domain.replace(/^www\./, "");

      if (!actionUrl) {
        actionUrl = `https://${domain}`;
      } else if (!actionUrl.startsWith("http://") && !actionUrl.startsWith("https://")) {
        actionUrl = `https://${actionUrl}`;
      }

      // Validate URL format
      try {
        new URL(actionUrl);
      } catch {
        errors.push(`Row ${rowNum}: Malformed URL '${actionUrl}'.`);
        rejected++;
        continue;
      }

      // Validate region
      const rawRegion = (r.region || "GLOBAL").toUpperCase().trim();
      const region: RegionCode = ["INDIA", "UAE", "USA", "GLOBAL"].includes(rawRegion)
        ? (rawRegion as RegionCode)
        : "GLOBAL";

      // Validate free status
      const rawFree = (r.free_status || "FREE").toUpperCase().trim();
      if (rawFree === "PAID_ONLY" || rawFree === "NOT_FREE") {
        errors.push(`Row ${rowNum}: Rejected '${domain}' — Paid-only listings violate DGS zero-paid policy.`);
        rejected++;
        continue;
      }
      const freeStatus = rawFree === "FREEMIUM" ? "FREEMIUM" : "FREE";

      // Validate target page
      let targetPage = r.target_page?.trim() || "https://www.dgeniussolutions.com/";
      if (!targetPage.startsWith("http")) {
        targetPage = `https://www.dgeniussolutions.com${targetPage.startsWith("/") ? "" : "/"}${targetPage}`;
      }

      // Check spam risk
      const spamEval = evaluateSpamRisk(domain, actionUrl, r.notes);
      if (spamEval.spamStatus === "REJECT") {
        errors.push(`Row ${rowNum}: Spam reject '${domain}': ${spamEval.reasons.join("; ")}.`);
        rejected++;
        continue;
      }

      // Deduplication check: check domain or exact URL
      const { rows: existing } = await cmsQuery<{ id: string }>(
        `SELECT id FROM off_page_opportunities WHERE domain = ? OR exact_submission_url = ? LIMIT 1`,
        [domain, actionUrl]
      );
      if (existing.length > 0) {
        duplicates++;
        continue;
      }

      // Category formatting
      const rawCat = (r.category || "AGENCY_DIRECTORY").toUpperCase().replace(/\s+/g, "_");
      const category: OpportunityCategory = rawCat as OpportunityCategory;

      const id = `opp_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      const authorityScore = calculateDgsAuthorityScore({
        topicalRelevance: 85,
        editorialQuality: 85,
        geoRelevance: region === "INDIA" ? 95 : region === "UAE" ? 90 : 80,
        referralPotential: 75,
        spamRisk: spamEval.spamRiskScore,
      });

      const priority = calculatePriority({
        authorityScore,
        trafficPotential: 75,
        acceptanceProbability: 80,
        geoRelevance: region === "INDIA" ? 95 : region === "UAE" ? 90 : 80,
        isFree: true,
        spamStatus: spamEval.spamStatus,
      });

      await cmsExecute(
        `INSERT INTO off_page_opportunities (
          id, site_name, domain, exact_submission_url, region, country, category,
          free_status, submission_type, recommended_dgs_target_page, recommended_service,
          dofollow_status, estimated_quality, topical_relevance, geo_relevance,
          traffic_potential, editorial_quality, spam_risk, acceptance_probability,
          value_score, difficulty_score, priority_score, priority_tier, authority_score,
          spam_status, verification_date, last_verified, source, status, notes, evidence,
          discovered_at, qualified_at, next_check_at, check_priority, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, 'FORM', ?, 'AI Video Production & SEO',
          'DOFOLLOW', 'HIGH', 85, ?,
          75, 85, ?, 80,
          ?, ?, ?, ?, ?,
          ?, CURDATE(), NOW(), 'VERIFIED_BATCH_IMPORT', 'QUALIFIED', ?, ?,
          NOW(), NOW(), NOW(), ?, NOW(), NOW()
        )`,
        [
          id,
          r.site_name.trim(),
          domain,
          actionUrl,
          region,
          r.country?.trim() || (region === "INDIA" ? "India" : region === "UAE" ? "UAE" : region === "USA" ? "USA" : "Global"),
          category,
          freeStatus,
          targetPage,
          region === "INDIA" ? 95 : region === "UAE" ? 90 : 80,
          spamEval.spamRiskScore,
          priority.valueScore,
          priority.difficultyScore,
          priority.priorityScore,
          priority.priorityTier,
          authorityScore,
          spamEval.spamStatus,
          r.notes || "Imported via verified research batch",
          r.evidence || "Verified legitimate authority platform",
          priority.priorityTier,
        ]
      );

      imported++;
    }

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "create",
      resource: "off_page_opportunities_import",
      resource_id: `batch_${Date.now()}`,
      summary: `Batch imported ${imported} opportunities (duplicates: ${duplicates}, rejected: ${rejected})`,
      status: "success",
    });

    return NextResponse.json({
      ok: true,
      imported,
      duplicates,
      rejected,
      total_processed: records.length,
      errors: errors.slice(0, 15),
    });
  } catch (err: any) {
    console.error("Batch import error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
