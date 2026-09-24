import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "./db";
import {
  processUploadedImage,
  processUploadedVideo,
  type ProcessedImageResult,
  type ProcessedVideoResult,
} from "./media-processor.ts";
import { computeFileChecksum } from "./media-storage.ts";

export type MediaAsset = {
  id: string;
  filename: string;
  original_filename: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  media_type: "image" | "video";
  extension: string;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  file_size: number;
  original_file_size: number;
  optimised_file_size: number | null;
  alt_text: string | null;
  is_decorative: number | boolean;
  alt_source?: "MANUAL" | "AI_CONTEXTUAL" | "DECORATIVE" | "EMPTY" | null;
  title: string | null;
  caption: string | null;
  description: string | null;
  conversion_status: "ready" | "failed" | "unconverted" | "processing";
  conversion_error: string | null;
  source: string;
  source_id: string | null;
  checksum: string;
  poster_url: string | null;
  original_storage_path: string | null;
  original_url: string | null;
  category: "general" | "portfolio" | "blog" | "service";
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  usage_count?: number;
};

export type MediaUsage = {
  id: string;
  media_id: string;
  usage_type: string;
  entity_type: string;
  entity_id: string;
  route: string;
  field: string;
  created_at: string;
};

export type MediaFilterOptions = {
  type?: "all" | "image" | "video";
  format?: string; // webp, webm, jpg, jpeg, png, mp4, gif
  usage?: "all" | "used" | "unused";
  alt?: "all" | "missing" | "has_alt" | "decorative";
  status?: "all" | "ready" | "failed" | "unconverted";
  category?: "all" | "general" | "portfolio" | "blog" | "service";
  search?: string;
  sort?: "recent" | "oldest" | "largest" | "savings";
  page?: number;
  limit?: number;
};

export type MediaStats = {
  totalAssets: number;
  totalImages: number;
  totalVideos: number;
  totalOriginalBytes: number;
  totalCurrentBytes: number;
  totalSavingsBytes: number;
  savingsPercentage: number;
  unusedCount: number;
  missingAltCount: number;
  failedCount: number;
};

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<MediaAsset>(
    `SELECT m.*, (SELECT COUNT(*) FROM media_usage u WHERE u.media_id = m.id) as usage_count
     FROM media_assets m
     WHERE m.id = ? AND m.deleted_at IS NULL
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function getMediaAssetByChecksum(checksum: string): Promise<MediaAsset | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<MediaAsset>(
    `SELECT * FROM media_assets WHERE checksum = ? AND deleted_at IS NULL LIMIT 1`,
    [checksum]
  );
  return rows[0] || null;
}

export async function listMediaAssets(options: MediaFilterOptions = {}): Promise<{
  assets: MediaAsset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  if (!isCmsDatabaseConfigured()) {
    return { assets: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const conditions: string[] = ["m.deleted_at IS NULL"];
  const params: any[] = [];

  // Type filter
  if (options.type && options.type !== "all") {
    conditions.push("m.media_type = ?");
    params.push(options.type);
  }

  // Format filter
  if (options.format && options.format !== "all") {
    conditions.push("m.extension = ?");
    params.push(options.format.toLowerCase());
  }

  // Category filter
  if (options.category && options.category !== "all") {
    conditions.push("m.category = ?");
    params.push(options.category);
  }

  // Status filter
  if (options.status && options.status !== "all") {
    conditions.push("m.conversion_status = ?");
    params.push(options.status);
  }

  // Alt text filter
  if (options.alt === "missing") {
    conditions.push("(m.media_type = 'image' AND (m.alt_text IS NULL OR TRIM(m.alt_text) = '') AND m.is_decorative = FALSE)");
  } else if (options.alt === "decorative") {
    conditions.push("m.is_decorative = TRUE");
  } else if (options.alt === "has_alt") {
    conditions.push("(m.alt_text IS NOT NULL AND TRIM(m.alt_text) != '')");
  }

  // Search filter
  if (options.search && options.search.trim()) {
    const term = `%${options.search.trim()}%`;
    conditions.push(
      "(m.filename LIKE ? OR m.title LIKE ? OR m.alt_text LIKE ? OR m.caption LIKE ? OR m.description LIKE ? OR m.original_filename LIKE ? OR m.id LIKE ?)"
    );
    params.push(term, term, term, term, term, term, term);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // Having clause for usage filter
  let havingClause = "";
  if (options.usage === "used") {
    havingClause = "HAVING usage_count > 0";
  } else if (options.usage === "unused") {
    havingClause = "HAVING usage_count = 0";
  }

  // Count total query
  const countQuery = `
    SELECT COUNT(*) as cnt FROM (
      SELECT m.id, (SELECT COUNT(*) FROM media_usage u WHERE u.media_id = m.id) as usage_count
      FROM media_assets m
      ${whereClause}
      GROUP BY m.id
      ${havingClause}
    ) as filtered
  `;
  const { rows: countRows } = await cmsQuery<{ cnt: number }>(countQuery, params);
  const total = Number(countRows[0]?.cnt || 0);

  // Sorting
  let orderBy = "m.created_at DESC";
  if (options.sort === "oldest") orderBy = "m.created_at ASC";
  else if (options.sort === "largest") orderBy = "m.file_size DESC";
  else if (options.sort === "savings") orderBy = "(m.original_file_size - m.file_size) DESC";

  // Pagination
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Math.min(100, Number(options.limit || 24)));
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT m.*, (SELECT COUNT(*) FROM media_usage u WHERE u.media_id = m.id) as usage_count
    FROM media_assets m
    ${whereClause}
    GROUP BY m.id
    ${havingClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const { rows: assets } = await cmsQuery<MediaAsset>(dataQuery, [...params, limit, offset]);

  return {
    assets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createMediaAssetFromProcessed(
  processed: ProcessedImageResult | ProcessedVideoResult,
  mediaType: "image" | "video",
  checksum: string,
  metadata: {
    altText?: string;
    isDecorative?: boolean;
    altSource?: "MANUAL" | "AI_CONTEXTUAL" | "DECORATIVE" | "EMPTY";
    title?: string;
    caption?: string;
    description?: string;
    category?: "general" | "portfolio" | "blog" | "service";
    source?: string;
    sourceId?: string;
    createdBy?: string;
  } = {}
): Promise<MediaAsset> {
  const id = randomUUID();
  const posterUrl = "posterUrl" in processed ? processed.posterUrl : null;
  const duration = "durationSeconds" in processed ? processed.durationSeconds : null;
  const isDecorative = Boolean(metadata.isDecorative);
  const altText = isDecorative ? "" : (metadata.altText || null);
  const altSource = isDecorative
    ? "DECORATIVE"
    : metadata.altSource || (altText && altText.trim().length > 0 ? "MANUAL" : "EMPTY");

  await cmsExecute(
    `INSERT INTO media_assets (
      id, filename, original_filename, storage_path, public_url,
      mime_type, media_type, extension, width, height, duration_seconds,
      file_size, original_file_size, optimised_file_size,
      alt_text, is_decorative, alt_source, title, caption, description,
      conversion_status, conversion_error, source, source_id,
      checksum, poster_url, original_storage_path, original_url,
      category, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      processed.filename,
      processed.originalFilename,
      processed.storagePath,
      processed.publicUrl,
      processed.mimeType,
      mediaType,
      processed.extension,
      processed.width || null,
      processed.height || null,
      duration || null,
      processed.fileSize,
      processed.originalFileSize,
      processed.optimisedFileSize || null,
      altText,
      isDecorative,
      altSource,
      metadata.title || null,
      metadata.caption || null,
      metadata.description || null,
      processed.conversionStatus,
      processed.conversionError || null,
      metadata.source || "upload",
      metadata.sourceId || null,
      checksum,
      posterUrl,
      processed.originalStoragePath,
      processed.originalUrl,
      metadata.category || "general",
      metadata.createdBy || null,
    ]
  );

  const created = await getMediaAssetById(id);
  if (!created) throw new Error("Failed to retrieve created media asset");
  return created;
}

export async function updateMediaAssetMetadata(
  id: string,
  data: {
    altText?: string | null;
    isDecorative?: boolean;
    altSource?: "MANUAL" | "AI_CONTEXTUAL" | "DECORATIVE" | "EMPTY";
    title?: string | null;
    caption?: string | null;
    description?: string | null;
    category?: "general" | "portfolio" | "blog" | "service";
  }
): Promise<MediaAsset | null> {
  const existing = await getMediaAssetById(id);
  if (!existing) return null;

  const isDecorative = data.isDecorative !== undefined ? Boolean(data.isDecorative) : Boolean(existing.is_decorative);
  const altText = isDecorative ? "" : (data.altText !== undefined ? data.altText : existing.alt_text);
  const altSource = isDecorative
    ? "DECORATIVE"
    : data.altSource !== undefined
    ? data.altSource
    : data.altText !== undefined
    ? (altText && altText.trim().length > 0 ? "MANUAL" : "EMPTY")
    : (existing as any).alt_source || "MANUAL";
  const title = data.title !== undefined ? data.title : existing.title;
  const caption = data.caption !== undefined ? data.caption : existing.caption;
  const description = data.description !== undefined ? data.description : existing.description;
  const category = data.category !== undefined ? data.category : existing.category;

  await cmsExecute(
    `UPDATE media_assets SET
      alt_text = ?,
      is_decorative = ?,
      alt_source = ?,
      title = ?,
      caption = ?,
      description = ?,
      category = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [altText, isDecorative, altSource, title, caption, description, category, id]
  );

  return getMediaAssetById(id);
}

export async function replaceMediaAssetContent(
  id: string,
  newBuffer: Buffer,
  newOriginalFilename: string
): Promise<MediaAsset> {
  const existing = await getMediaAssetById(id);
  if (!existing) throw new Error("Media asset not found for replacement");

  const newChecksum = computeFileChecksum(newBuffer);
  let processed: ProcessedImageResult | ProcessedVideoResult;

  if (existing.media_type === "image") {
    processed = await processUploadedImage(newBuffer, newOriginalFilename, existing.title || undefined);
  } else {
    processed = await processUploadedVideo(newBuffer, newOriginalFilename, existing.title || undefined);
  }

  const posterUrl = "posterUrl" in processed ? processed.posterUrl : existing.poster_url;
  const duration = "durationSeconds" in processed ? processed.durationSeconds : existing.duration_seconds;

  // Append a cache-busting timestamp to the public URL for live CDN refresh
  const timestamp = Date.now();
  const updatedPublicUrl = `${processed.publicUrl}?v=${timestamp}`;

  await cmsExecute(
    `UPDATE media_assets SET
      filename = ?,
      original_filename = ?,
      storage_path = ?,
      public_url = ?,
      mime_type = ?,
      extension = ?,
      width = ?,
      height = ?,
      duration_seconds = ?,
      file_size = ?,
      original_file_size = ?,
      optimised_file_size = ?,
      checksum = ?,
      poster_url = ?,
      original_storage_path = ?,
      original_url = ?,
      conversion_status = ?,
      conversion_error = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      processed.filename,
      newOriginalFilename,
      processed.storagePath,
      updatedPublicUrl,
      processed.mimeType,
      processed.extension,
      processed.width || null,
      processed.height || null,
      duration || null,
      processed.fileSize,
      processed.originalFileSize,
      processed.optimisedFileSize || null,
      newChecksum,
      posterUrl,
      processed.originalStoragePath,
      processed.originalUrl,
      processed.conversionStatus,
      processed.conversionError || null,
      id,
    ]
  );

  const updated = await getMediaAssetById(id);
  if (!updated) throw new Error("Failed to retrieve replaced asset");
  return updated;
}

export async function getMediaUsages(mediaId: string): Promise<MediaUsage[]> {
  if (!isCmsDatabaseConfigured()) return [];
  const { rows } = await cmsQuery<MediaUsage>(
    "SELECT * FROM media_usage WHERE media_id = ? ORDER BY created_at DESC",
    [mediaId]
  );
  return rows;
}

export async function recordMediaUsage(input: {
  mediaId: string;
  usageType?: string;
  entityType: string;
  entityId: string;
  route: string;
  field: string;
}): Promise<string> {
  const id = randomUUID();
  await cmsExecute(
    `INSERT INTO media_usage (id, media_id, usage_type, entity_type, entity_id, route, field)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.mediaId,
      input.usageType || "page",
      input.entityType,
      input.entityId,
      input.route,
      input.field,
    ]
  );
  return id;
}

export async function removeMediaUsage(usageId: string): Promise<void> {
  await cmsExecute("DELETE FROM media_usage WHERE id = ?", [usageId]);
}

export async function deleteMediaAssetSafe(
  id: string,
  options: { forcePermanent?: boolean } = {}
): Promise<{ ok: boolean; message?: string; usages?: MediaUsage[] }> {
  const existing = await getMediaAssetById(id);
  if (!existing) {
    return { ok: false, message: "Media asset not found" };
  }

  // Safe delete check: verify if asset is used anywhere
  const usages = await getMediaUsages(id);
  if (usages.length > 0) {
    return {
      ok: false,
      message: `Cannot permanently delete — asset is used in ${usages.length} location${usages.length > 1 ? "s" : ""}. Replace or remove usages first.`,
      usages,
    };
  }

  if (options.forcePermanent) {
    // Delete physical files
    if (existing.storage_path) await rm(existing.storage_path, { force: true }).catch(() => {});
    if (existing.original_storage_path) await rm(existing.original_storage_path, { force: true }).catch(() => {});
    await cmsExecute("DELETE FROM media_assets WHERE id = ?", [id]);
    return { ok: true, message: "Asset permanently deleted." };
  }

  // Soft delete / archive
  await cmsExecute("UPDATE media_assets SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
  return { ok: true, message: "Asset moved to trash/archived." };
}

export async function getMediaStorageStats(): Promise<MediaStats> {
  if (!isCmsDatabaseConfigured()) {
    return {
      totalAssets: 0,
      totalImages: 0,
      totalVideos: 0,
      totalOriginalBytes: 0,
      totalCurrentBytes: 0,
      totalSavingsBytes: 0,
      savingsPercentage: 0,
      unusedCount: 0,
      missingAltCount: 0,
      failedCount: 0,
    };
  }

  const { rows: statsRows } = await cmsQuery<any>(`
    SELECT
      COUNT(*) as totalAssets,
      SUM(CASE WHEN media_type = 'image' THEN 1 ELSE 0 END) as totalImages,
      SUM(CASE WHEN media_type = 'video' THEN 1 ELSE 0 END) as totalVideos,
      COALESCE(SUM(original_file_size), 0) as totalOriginalBytes,
      COALESCE(SUM(file_size), 0) as totalCurrentBytes,
      SUM(CASE WHEN (SELECT COUNT(*) FROM media_usage u WHERE u.media_id = m.id) = 0 THEN 1 ELSE 0 END) as unusedCount,
      SUM(CASE WHEN media_type = 'image' AND (alt_text IS NULL OR TRIM(alt_text) = '') AND is_decorative = FALSE THEN 1 ELSE 0 END) as missingAltCount,
      SUM(CASE WHEN conversion_status = 'failed' THEN 1 ELSE 0 END) as failedCount
    FROM media_assets m
    WHERE m.deleted_at IS NULL
  `);

  const stat = statsRows[0] || {};
  const totalAssets = Number(stat.totalAssets || 0);
  const totalImages = Number(stat.totalImages || 0);
  const totalVideos = Number(stat.totalVideos || 0);
  const totalOriginalBytes = Number(stat.totalOriginalBytes || 0);
  const totalCurrentBytes = Number(stat.totalCurrentBytes || 0);
  const totalSavingsBytes = Math.max(0, totalOriginalBytes - totalCurrentBytes);
  const savingsPercentage = totalOriginalBytes > 0 ? Number(((totalSavingsBytes / totalOriginalBytes) * 100).toFixed(1)) : 0;
  const unusedCount = Number(stat.unusedCount || 0);
  const missingAltCount = Number(stat.missingAltCount || 0);
  const failedCount = Number(stat.failedCount || 0);

  return {
    totalAssets,
    totalImages,
    totalVideos,
    totalOriginalBytes,
    totalCurrentBytes,
    totalSavingsBytes,
    savingsPercentage,
    unusedCount,
    missingAltCount,
    failedCount,
  };
}
