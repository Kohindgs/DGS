import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import { ingestDiscoveredOpportunity, seedOpportunitiesIfEmpty } from "@/lib/off-page/discovery";
import { searchTurboVec } from "@/lib/intelligence/turbovec-client";
import type { OffPageOpportunity } from "@/lib/off-page/types";

export const dynamic = "force-dynamic";

function formatWhyItMatches(opp: OffPageOpportunity, query: string, score: number): string {
  const relPct = Math.round(score * 100);
  const region = opp.region || "Global";
  const cat = opp.category?.replace(/_/g, " ").toLowerCase() || "directory";
  const target = (opp.recommended_dgs_target_page || "/services/ai-seo").replace("https://www.dgeniussolutions.com", "");
  return `Matches query "${query}" with ${relPct}% semantic relevance. Correlates ${cat} in ${region} to target authority asset ${target}.`;
}

export async function GET(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();
  await seedOpportunitiesIfEmpty();

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");
  const status = searchParams.get("status");
  const freeStatus = searchParams.get("free_status");
  const query = searchParams.get("q")?.trim();
  const isSmart = searchParams.get("smart") === "true";

  const conditions: string[] = [];
  const params: any[] = [];

  if (region && region !== "ALL") {
    conditions.push("o.region = ?");
    params.push(region);
  }
  if (category && category !== "ALL") {
    conditions.push("o.category = ?");
    params.push(category);
  }
  if (priority && priority !== "ALL") {
    conditions.push("o.priority_tier = ?");
    params.push(priority);
  }
  if (status && status !== "ALL") {
    conditions.push("o.status = ?");
    params.push(status);
  }
  if (freeStatus && freeStatus !== "ALL") {
    conditions.push("o.free_status = ?");
    params.push(freeStatus);
  }

  // --- SMART SEMANTIC SEARCH (Section 4.1: TurboVec Allowlist Reranking) ---
  if (isSmart && query) {
    try {
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const candidateSql = `
        SELECT o.*, v.vector_id 
        FROM off_page_opportunities o
        LEFT JOIN off_page_vector_documents v 
          ON v.entity_id = o.id AND v.index_name = 'off-page'
        ${whereClause}
        ORDER BY o.priority_score DESC
        LIMIT 300
      `;

      const { rows: candidates } = await cmsQuery<OffPageOpportunity & { vector_id: string | null }>(
        candidateSql,
        params
      );

      const candidateVectorIds = candidates
        .map((c) => (c.vector_id != null ? String(c.vector_id) : null))
        .filter((vid): vid is string => Boolean(vid));

      if (candidateVectorIds.length > 0) {
        const tvRes = await searchTurboVec({
          indexName: "off-page",
          query,
          allowlist: candidateVectorIds,
          limit: Math.min(100, candidates.length),
          k: Math.min(100, candidates.length),
        });

        if (tvRes.ok && tvRes.results && tvRes.results.length > 0) {
          const scoreMap = new Map<string, number>();
          for (const item of tvRes.results) {
            const oppId = item.entity_id || item.key?.replace("opp:", "");
            if (oppId) {
              scoreMap.set(oppId, item.score);
            }
          }

          // Rerank candidates based on TurboVec semantic similarity
          const rankedOpps: any[] = [];
          const unrankedOpps: any[] = [];

          for (const cand of candidates) {
            const score = scoreMap.get(cand.id);
            if (score !== undefined) {
              rankedOpps.push({
                ...cand,
                semantic_relevance: score,
                why_matches: formatWhyItMatches(cand, query, score),
              });
            } else {
              unrankedOpps.push(cand);
            }
          }

          rankedOpps.sort((a, b) => b.semantic_relevance - a.semantic_relevance);

          const finalResults = [...rankedOpps, ...unrankedOpps];
          return NextResponse.json({
            ok: true,
            data: finalResults,
            opportunities: finalResults,
            total: finalResults.length,
            smart: true,
            engine: "TurboVec",
            rerankedCount: rankedOpps.length,
          });
        }
      }
    } catch (smartErr) {
      console.warn("[TURBOVEC_OPPORTUNITIES] Smart search fallback to standard query:", smartErr);
      // Fall through to standard search
    }
  }

  // --- STANDARD FILTER / LEXICAL SEARCH (Fail-Safe) ---
  if (query) {
    conditions.push("(LOWER(o.site_name) LIKE ? OR LOWER(o.domain) LIKE ? OR LOWER(o.recommended_service) LIKE ?)");
    const qStr = `%${query.toLowerCase()}%`;
    params.push(qStr, qStr, qStr);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT o.* FROM off_page_opportunities o ${whereClause} ORDER BY o.priority_score DESC, o.authority_score DESC LIMIT 300`;

  try {
    const { rows } = await cmsQuery<OffPageOpportunity>(sql, params);
    return NextResponse.json({ ok: true, data: rows, opportunities: rows, total: rows.length, smart: false });
  } catch (err: any) {
    console.error("Failed querying opportunities:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = await ingestDiscoveredOpportunity(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "create",
      resource: "off_page_opportunity",
      resource_id: result.id,
      summary: `Created opportunity ${body.site_name} (${body.domain})`,
      status: "success",
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err: any) {
    console.error("Failed creating opportunity:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, status, assigned_to, notes, priority_tier, free_status } = await req.json();
    if (!id) return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });

    const updates: string[] = ["updated_at = NOW()"];
    const values: any[] = [];

    if (status) {
      updates.push("status = ?");
      values.push(status);
    }
    if (assigned_to !== undefined) {
      updates.push("assigned_to = ?");
      values.push(assigned_to);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      values.push(notes);
    }
    if (priority_tier) {
      updates.push("priority_tier = ?");
      values.push(priority_tier);
    }
    if (free_status) {
      updates.push("free_status = ?");
      values.push(free_status);
    }

    values.push(id);
    await cmsExecute(
      `UPDATE off_page_opportunities SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "edit",
      resource: "off_page_opportunity",
      resource_id: id,
      summary: `Updated opportunity ${id} to status=${status || "unchanged"}`,
      status: "success",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed updating opportunity:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "delete")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await cmsExecute(`DELETE FROM off_page_opportunities WHERE id = ?`, [id]);
  return NextResponse.json({ ok: true });
}
