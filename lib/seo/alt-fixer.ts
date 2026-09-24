import "server-only";
import { randomUUID } from "node:crypto";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";

export type MissingAltRecord = {
  id: string;
  auditRunId?: string | null;
  pageUrl: string;
  imageSrc: string;
  mediaAssetId?: string | null;
  filename: string;
  currentAlt: string | null;
  surroundingContext?: string | null;
  altStatus: "MISSING_ALT_ATTRIBUTE" | "EMPTY_ALT_DECORATIVE" | "EMPTY_ALT_NEEDS_REVIEW";
  isDecorative: boolean;
  suggestedAlt?: string | null;
  fixedAlt?: string | null;
  resolved: boolean;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * List missing alt image records from the database with media usage counts.
 */
export async function listMissingAlts(options: {
  pageUrl?: string;
  resolved?: boolean;
  limit?: number;
} = {}): Promise<MissingAltRecord[]> {
  if (!isCmsDatabaseConfigured()) return [];

  const limit = options.limit || 100;
  const whereClauses: string[] = [];
  const params: unknown[] = [];

  if (options.pageUrl) {
    whereClauses.push("page_url = ?");
    params.push(options.pageUrl);
  }

  if (options.resolved !== undefined) {
    whereClauses.push("resolved = ?");
    params.push(options.resolved ? 1 : 0);
  }

  const whereSql = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : "";
  params.push(limit);

  try {
    const { rows } = await cmsQuery<Record<string, unknown>>(
      `SELECT * FROM site_audit_missing_alts${whereSql} ORDER BY created_at DESC LIMIT ?`,
      params
    );

    const results: MissingAltRecord[] = [];
    for (const r of rows) {
      let usageCount = 1;
      const mediaAssetId = r.media_asset_id ? String(r.media_asset_id) : null;

      if (mediaAssetId) {
        try {
          const { rows: uRows } = await cmsQuery<{ cnt: number }>(
            `SELECT COUNT(*) as cnt FROM media_usage WHERE media_id = ?`,
            [mediaAssetId]
          );
          if (uRows[0]?.cnt) usageCount = Math.max(1, Number(uRows[0].cnt));
        } catch {}
      }

      results.push({
        id: String(r.id),
        auditRunId: r.audit_run_id ? String(r.audit_run_id) : null,
        pageUrl: String(r.page_url),
        imageSrc: String(r.image_src),
        mediaAssetId,
        filename: String(r.filename),
        currentAlt: r.current_alt ? String(r.current_alt) : null,
        surroundingContext: r.surrounding_context ? String(r.surrounding_context) : null,
        altStatus: String(r.alt_status) as MissingAltRecord["altStatus"],
        isDecorative: Boolean(r.is_decorative),
        suggestedAlt: r.suggested_alt ? String(r.suggested_alt) : null,
        fixedAlt: r.fixed_alt ? String(r.fixed_alt) : null,
        resolved: Boolean(r.resolved),
        usageCount,
        createdAt: String(r.created_at || ""),
        updatedAt: String(r.updated_at || ""),
      });
    }

    return results;
  } catch (err) {
    console.error("listMissingAlts error:", err);
    return [];
  }
}

/**
 * Generate a descriptive, context-aware alt text suggestion.
 * Follows accessibility guidelines: concise, informative, NO keyword stuffing.
 */
export async function generateAltTextSuggestion(params: {
  pageUrl: string;
  filename: string;
  imageSrc: string;
  currentAlt?: string | null;
  surroundingContext?: string | null;
}): Promise<string> {
  const { pageUrl, filename, surroundingContext } = params;

  // Clean filename: remove extension, replace hyphens/underscores with spaces
  const baseName = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();

  // Extract page topic from URL
  const pageSlug = pageUrl.replace(/\/$/, "").split("/").pop() || "";
  const pageTopic = pageSlug.replace(/[-_]+/g, " ");

  // If Gemini API key is configured, query Gemini for high-fidelity description
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const prompt = `Generate a concise, natural, accessible image alt text (maximum 12-16 words).
Image filename: "${filename}" (${baseName})
Appears on page: "${pageUrl}" (Topic: ${pageTopic})
Surrounding context or heading: "${surroundingContext || "General service section"}"
RULES:
1. Describe what the image conveys clearly and accurately for screen readers and search engines.
2. DO NOT keyword stuff or repeat identical marketing phrases.
3. Output ONLY the suggested alt text string, nothing else.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 50, temperature: 0.2 },
          }),
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidate && candidate.length > 5) {
          return candidate.replace(/^["']|["']$/g, "").trim();
        }
      }
    } catch (err) {
      console.warn("Gemini alt suggestion fallback triggered:", err);
    }
  }

  // High-fidelity heuristic semantic synthesis
  if (baseName && baseName.length > 3 && !/^\d+$/.test(baseName) && !/^img/i.test(baseName)) {
    const capitalized = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    if (pageTopic && !capitalized.toLowerCase().includes(pageTopic.toLowerCase())) {
      return `${capitalized} for ${pageTopic}`;
    }
    return capitalized;
  }

  if (surroundingContext && surroundingContext.length > 5) {
    return `Illustration showcasing ${surroundingContext.slice(0, 60)}`;
  }

  return `Visual showcase for ${pageTopic || "DGS digital media portfolio"}`;
}

/**
 * Apply approved alt text to the record, the media library asset, and audit log.
 */
export async function applyAltTextFix(params: {
  id: string;
  newAltText: string;
  applyToAllUsages: boolean;
  userId?: string;
  userName?: string;
}): Promise<{ ok: boolean; affectedUsages: number }> {
  if (!isCmsDatabaseConfigured()) return { ok: false, affectedUsages: 0 };

  const { id, newAltText, applyToAllUsages, userId, userName } = params;

  try {
    // 1. Fetch current record
    const { rows } = await cmsQuery<Record<string, unknown>>(
      `SELECT * FROM site_audit_missing_alts WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      throw new Error("Missing alt record not found");
    }

    const currentRecord = rows[0];
    const oldAlt = currentRecord.current_alt ? String(currentRecord.current_alt) : null;
    const pageUrl = String(currentRecord.page_url);
    const mediaAssetId = currentRecord.media_asset_id ? String(currentRecord.media_asset_id) : null;
    const imageSrc = String(currentRecord.image_src);

    // 2. Update site_audit_missing_alts
    await cmsExecute(
      `UPDATE site_audit_missing_alts
       SET fixed_alt = ?, resolved = 1, alt_status = 'EMPTY_ALT_DECORATIVE'
       WHERE id = ?`,
      [newAltText, id]
    );

    let affectedUsages = 1;

    // 3. Update canonical Media Library metadata if mediaAssetId is linked
    if (mediaAssetId) {
      await cmsExecute(
        `UPDATE media_assets SET alt_text = ? WHERE id = ?`,
        [newAltText, mediaAssetId]
      );

      if (applyToAllUsages) {
        // Also resolve any other missing alt records sharing this image or media_asset_id
        const updateResult: any = await cmsExecute(
          `UPDATE site_audit_missing_alts
           SET fixed_alt = ?, resolved = 1
           WHERE (media_asset_id = ? OR image_src = ?) AND id != ?`,
          [newAltText, mediaAssetId, imageSrc, id]
        );
        affectedUsages += updateResult?.affectedRows || 0;
      }
    }

    // 4. Record in audit_logs
    try {
      const logId = randomUUID();
      await cmsExecute(
        `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          logId,
          userId || null,
          "seo.alt_text.updated",
          "media_asset",
          mediaAssetId || id,
          JSON.stringify({
            old_alt: oldAlt,
            new_alt: newAltText,
            page_url: pageUrl,
            image_src: imageSrc,
            apply_to_all: applyToAllUsages,
            affected_usages: affectedUsages,
            performed_by: userName || "admin",
            timestamp: new Date().toISOString(),
          }),
        ]
      );
    } catch (logErr) {
      console.warn("Audit log entry failed:", logErr);
    }

    return { ok: true, affectedUsages };
  } catch (err) {
    console.error("applyAltTextFix error:", err);
    throw err;
  }
}

/**
 * Mark image as deliberately decorative (alt="" valid per WCAG).
 */
export async function markAltDecorative(params: {
  id: string;
  userId?: string;
  userName?: string;
}): Promise<boolean> {
  if (!isCmsDatabaseConfigured()) return false;

  const { id, userId, userName } = params;

  try {
    const { rows } = await cmsQuery<Record<string, unknown>>(
      `SELECT * FROM site_audit_missing_alts WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return false;

    const currentRecord = rows[0];
    const mediaAssetId = currentRecord.media_asset_id ? String(currentRecord.media_asset_id) : null;

    await cmsExecute(
      `UPDATE site_audit_missing_alts
       SET is_decorative = 1, alt_status = 'EMPTY_ALT_DECORATIVE', resolved = 1
       WHERE id = ?`,
      [id]
    );

    if (mediaAssetId) {
      await cmsExecute(
        `UPDATE media_assets SET is_decorative = 1, alt_text = '' WHERE id = ?`,
        [mediaAssetId]
      );
    }

    // Log action
    try {
      const logId = randomUUID();
      await cmsExecute(
        `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          logId,
          userId || null,
          "seo.alt_text.mark_decorative",
          "media_asset",
          mediaAssetId || id,
          JSON.stringify({
            page_url: currentRecord.page_url,
            image_src: currentRecord.image_src,
            performed_by: userName || "admin",
            timestamp: new Date().toISOString(),
          }),
        ]
      );
    } catch {}

    return true;
  } catch (err) {
    console.error("markAltDecorative error:", err);
    return false;
  }
}
