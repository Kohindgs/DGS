import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";

export type TurboVecIndexName = "dgs-content" | "off-page";

export interface TurboVecHealth {
  ok: boolean;
  status: string;
  engine: string;
  version: string;
  model: string;
  dimension: number;
  stats: Record<string, { exists: boolean; fileSize: number; documentCount: number }>;
}

export interface TurboVecStatus {
  ok: boolean;
  available: boolean;
  engine?: string;
  model?: string;
  dimension?: number;
  bitWidth?: number;
  rootDir?: string;
  indexes?: Record<string, { exists: boolean; fileSize: number; documentCount: number }>;
  message?: string;
}

export interface TurboVecSearchResultItem {
  key: string;
  kind?: string;
  entity_type?: string;
  path?: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  score: number;
  [key: string]: any;
}

export interface TurboVecSearchResponse {
  ok: boolean;
  available: boolean;
  engine?: string;
  model?: string;
  results: TurboVecSearchResultItem[];
  total: number;
  message?: string;
}

export type DuplicateStatus = "UNIQUE" | "POSSIBLE_DUPLICATE" | "LIKELY_DUPLICATE";

export interface SemanticDuplicateResult {
  ok: boolean;
  status: DuplicateStatus;
  similarity: number;
  nearest: TurboVecSearchResultItem[];
  reason: string;
  recommended_action: string;
}

export interface TargetPageMatch {
  page: string;
  title: string;
  semantic_relevance: number;
  region_match: boolean;
  service_match: string;
  reason: string;
}

export interface TargetPageMatchResult {
  ok: boolean;
  target_pages: TargetPageMatch[];
}

export interface SupportingAsset {
  title: string;
  url: string;
  entity_type: string;
  semantic_relevance: number;
  why_matches: string;
}

export interface AssetMatchResult {
  ok: boolean;
  assets: SupportingAsset[];
}

export interface GroundDraftResult {
  ok: boolean;
  sources_used: Array<{ title: string; url: string; entity_type: string }>;
  talking_points: string[];
  recommended_target_page: string;
}

export interface VectorDocumentInput {
  key: string;
  id?: string;
  numeric_id?: number | string;
  text: string;
  entity_type?: string;
  entity_id?: string;
  region?: string;
  category?: string;
  target_page?: string;
  [k: string]: any;
}

export interface VectorDocumentRecord {
  id?: string;
  vector_id: bigint | string;
  entity_type: string;
  entity_id: string;
  content_hash: string;
  embedding_model?: string;
  embedding_model_version?: string;
  embedding_dimension?: number;
  index_name: TurboVecIndexName;
  index_version?: number;
  region?: string | null;
  category?: string | null;
  target_page?: string | null;
}

export function isTurboVecEnabled(): boolean {
  return process.env.DGS_SEMANTIC_ENABLED !== "false";
}

export function getTurboVecSocketPath(): string | null {
  if (process.env.DGS_TURBOVEC_SOCKET) {
    return process.env.DGS_TURBOVEC_SOCKET;
  }
  // Hostinger VPS production shared path
  const defaultProdSocket = "/home/u188101251/production-app/shared/turbovec/turbovec.sock";
  if (process.platform !== "win32" && fs.existsSync(defaultProdSocket)) {
    return defaultProdSocket;
  }
  return null;
}

export function getTurboVecBaseUrl(): string {
  if (process.env.DGS_TURBOVEC_URL) {
    return process.env.DGS_TURBOVEC_URL.replace(/\/$/, "");
  }
  const port = process.env.DGS_TURBOVEC_PORT || "5178";
  return `http://127.0.0.1:${port}`;
}

/**
 * Generates a deterministic 64-bit uint64 ID from a string key using SHA-256.
 * Guaranteed to fit in MySQL BIGINT UNSIGNED and TurboVec uint64.
 */
export function generateVectorId(key: string): bigint {
  const hash = crypto.createHash("sha256").update(String(key)).digest();
  return hash.readBigUInt64BE(0);
}

/**
 * Calculates a SHA-256 content hash for semantic change tracking.
 */
export function calculateContentHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function requestOverUnixSocket<T>(
  socketPath: string,
  endpoint: string,
  payload?: Record<string, any>,
  timeoutMs = 4000
): Promise<T | null> {
  return new Promise((resolve) => {
    const secret = process.env.DGS_TURBOVEC_SECRET || "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (secret) {
      headers["Authorization"] = `Bearer ${secret}`;
    }

    const postData = payload ? JSON.stringify(payload) : undefined;
    if (postData) {
      headers["Content-Length"] = String(Buffer.byteLength(postData));
    }

    const req = http.request(
      {
        socketPath,
        path: endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
        method: payload ? "POST" : "GET",
        headers,
        timeout: timeoutMs,
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(raw) as T);
            } catch {
              resolve(null);
            }
          } else {
            console.warn(`[TURBOVEC_CLIENT] ${endpoint} returned HTTP ${res.statusCode} over Unix socket`);
            resolve(null);
          }
        });
      }
    );

    req.on("error", (err) => {
      console.warn(`[TURBOVEC_CLIENT] Error connecting to Unix socket ${socketPath}: ${err.message}`);
      resolve(null);
    });

    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function callTurboVec<T>(endpoint: string, payload?: Record<string, any>, timeoutMs = 4000): Promise<T | null> {
  if (!isTurboVecEnabled()) return null;

  // 1. If Unix domain socket is available (Hostinger VPS / Linux), prefer it for speed and zero port overhead
  const socketPath = getTurboVecSocketPath();
  if (socketPath) {
    return requestOverUnixSocket<T>(socketPath, endpoint, payload, timeoutMs);
  }

  // 2. Otherwise fall back to TCP fetch (e.g. Windows local development)
  const baseUrl = getTurboVecBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const secret = process.env.DGS_TURBOVEC_SECRET || "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) {
    headers["Authorization"] = `Bearer ${secret}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: payload ? "POST" : "GET",
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[TURBOVEC_CLIENT] ${endpoint} returned HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err: any) {
    clearTimeout(timer);
    // Fail-safe: log warning but never crash the host application
    if (err?.name !== "AbortError") {
      console.warn(`[TURBOVEC_CLIENT] Error connecting to ${url}: ${err?.message || err}`);
    }
    return null;
  }
}

/**
 * Health check for the TurboVec HTTP daemon.
 */
export async function checkTurboVecHealth(): Promise<TurboVecHealth | { ok: false; available: false }> {
  const res = await callTurboVec<TurboVecHealth>("/health", undefined, 2500);
  if (!res) {
    return { ok: false, available: false };
  }
  return res;
}

/**
 * Status of both logical indexes (dgs-content and off-page).
 */
export async function getTurboVecStatus(): Promise<TurboVecStatus> {
  const res = await callTurboVec<TurboVecStatus>("/api/status", {}, 3000);
  if (!res) {
    return {
      ok: false,
      available: false,
      engine: "TurboVec",
      message: "TurboVec HTTP service is unreachable or offline.",
    };
  }
  return res;
}

/**
 * High-performance vector search with optional kinds and allowlist filtering.
 */
export async function searchTurboVec(params: {
  indexName?: TurboVecIndexName;
  query: string;
  k?: number;
  limit?: number;
  kinds?: string[];
  excludeKeys?: string[];
  minScore?: number;
  allowlist?: Array<string | number>;
}): Promise<TurboVecSearchResponse> {
  const payload = {
    index_name: params.indexName || "dgs-content",
    query: params.query,
    k: params.k || 10,
    limit: params.limit || 10,
    kinds: params.kinds,
    exclude_keys: params.excludeKeys,
    min_score: params.minScore ?? -1.0,
    allowlist: params.allowlist,
  };

  const res = await callTurboVec<TurboVecSearchResponse>("/api/search", payload, 5000);
  if (!res) {
    return {
      ok: false,
      available: false,
      results: [],
      total: 0,
      message: "Vector search unavailable.",
    };
  }
  return res;
}

/**
 * Batch indexes documents into specified index and persists via TurboVec.sync().
 */
export async function indexTurboVecBatch(params: {
  indexName: TurboVecIndexName;
  documents: VectorDocumentInput[];
}): Promise<{ ok: boolean; indexed: number; total?: number; items?: Array<{ key: string; vector_id: string }> }> {
  // Ensure every document has numeric_id explicitly set
  const docsWithIds = params.documents.map((d) => {
    const key = d.key || d.id || `doc:${Date.now()}`;
    const nid = d.numeric_id ? String(d.numeric_id) : generateVectorId(key).toString();
    return {
      ...d,
      key,
      numeric_id: nid,
    };
  });

  const res = await callTurboVec<{ ok: boolean; indexed: number; total?: number; items?: Array<{ key: string; vector_id: string }> }>(
    "/api/index-batch",
    {
      index_name: params.indexName,
      documents: docsWithIds,
    },
    30000 // allow up to 30s for large embedding batches
  );

  return res || { ok: false, indexed: 0 };
}

/**
 * Removes documents from TurboVec by numeric uint64 vector IDs.
 */
export async function removeTurboVecIds(params: {
  indexName: TurboVecIndexName;
  ids: Array<string | number | bigint>;
}): Promise<{ ok: boolean; removed: number }> {
  const stringIds = params.ids.map((x) => x.toString());
  const res = await callTurboVec<{ ok: boolean; removed: number }>("/api/remove", {
    index_name: params.indexName,
    ids: stringIds,
  });
  return res || { ok: false, removed: 0 };
}

/**
 * Semantic duplicate detection for net-new opportunity candidate text.
 * Thresholds:
 * - < 0.78: UNIQUE
 * - 0.78 - 0.88: POSSIBLE_DUPLICATE
 * - >= 0.88: LIKELY_DUPLICATE
 */
export async function checkSemanticDuplicate(params: {
  text: string;
  domain?: string;
  url?: string;
  thresholdPossible?: number;
  thresholdLikely?: number;
}): Promise<SemanticDuplicateResult> {
  const res = await callTurboVec<SemanticDuplicateResult>("/api/deduplicate", {
    text: params.text,
    domain: params.domain,
    url: params.url,
    threshold_possible: params.thresholdPossible ?? 0.78,
    threshold_likely: params.thresholdLikely ?? 0.88,
  });

  if (!res) {
    return {
      ok: false,
      status: "UNIQUE",
      similarity: 0.0,
      nearest: [],
      reason: "Semantic service offline; fallback to exact deduplication.",
      recommended_action: "ALLOW_INSERTION",
    };
  }
  return res;
}

/**
 * Smart target page matching for an opportunity intent.
 * Queries DGS Content Index and returns ranked DGS service pages.
 */
export async function matchTargetPages(params: {
  query: string;
  region?: string;
  limit?: number;
}): Promise<TargetPageMatchResult> {
  const res = await callTurboVec<TargetPageMatchResult>("/api/match-target-pages", {
    query: params.query,
    region: params.region,
    limit: params.limit || 5,
  });

  if (!res) {
    return {
      ok: false,
      target_pages: [
        {
          page: "/services/seo-services-in-mumbai/",
          title: "SEO Services in Mumbai",
          semantic_relevance: 0.7,
          region_match: true,
          service_match: "SEO Services",
          reason: "Standard fallback target page (vector service offline).",
        },
      ],
    };
  }
  return res;
}

/**
 * Best supporting DGS asset matching (case studies, blogs, research, portfolio).
 */
export async function matchSupportingAssets(params: {
  query: string;
  limit?: number;
}): Promise<AssetMatchResult> {
  const res = await callTurboVec<AssetMatchResult>("/api/match-assets", {
    query: params.query,
    limit: params.limit || 4,
  });

  if (!res) {
    return {
      ok: false,
      assets: [],
    };
  }
  return res;
}

/**
 * Outreach draft grounding: retrieves verified DGS assets and talking points.
 */
export async function groundOutreachDraft(params: {
  opportunityText: string;
  publicationName: string;
  targetPage?: string;
}): Promise<GroundDraftResult> {
  const res = await callTurboVec<GroundDraftResult>("/api/ground-draft", {
    opportunity_text: params.opportunityText,
    publication_name: params.publicationName,
    target_page: params.targetPage,
  });

  if (!res) {
    return {
      ok: false,
      sources_used: [
        {
          title: "D'Genius Solutions Official Portal",
          url: "https://www.dgeniussolutions.com/",
          entity_type: "HOMEPAGE",
        },
      ],
      talking_points: [
        "D'Genius Solutions provides technical SEO and AI video production across India, UAE, and global markets.",
        "Verified case studies and client frameworks available on dgeniussolutions.com.",
      ],
      recommended_target_page: params.targetPage || "https://www.dgeniussolutions.com/",
    };
  }
  return res;
}

/**
 * MySQL Registry: Records or updates a vector document in off_page_vector_documents.
 */
export async function recordVectorDocumentInDb(record: VectorDocumentRecord): Promise<void> {
  const id = record.id || `vdoc_${record.index_name}_${record.entity_id}`;
  const model = record.embedding_model || process.env.DGS_SEMANTIC_EMBEDDING_MODEL || "nomic-embed-text";
  const modelVersion = record.embedding_model_version || "v1";
  const dimension = record.embedding_dimension || 768;
  const version = record.index_version || 1;

  await cmsExecute(
    `INSERT INTO off_page_vector_documents (
      id, vector_id, entity_type, entity_id, content_hash,
      embedding_model, embedding_model_version, embedding_dimension,
      index_name, index_version, region, category, target_page,
      indexed_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      content_hash = VALUES(content_hash),
      embedding_model = VALUES(embedding_model),
      embedding_dimension = VALUES(embedding_dimension),
      region = VALUES(region),
      category = VALUES(category),
      target_page = VALUES(target_page),
      updated_at = NOW(),
      deleted_at = NULL`,
    [
      id,
      record.vector_id.toString(),
      record.entity_type,
      record.entity_id,
      record.content_hash,
      model,
      modelVersion,
      dimension,
      record.index_name,
      version,
      record.region || null,
      record.category || null,
      record.target_page || null,
    ]
  );
}

/**
 * MySQL Registry: Marks a vector document as deleted and removes it from TurboVec index.
 */
export async function removeVectorDocumentFromDbAndIndex(params: {
  indexName: TurboVecIndexName;
  entityType: string;
  entityId: string;
}): Promise<void> {
  const { rows } = await cmsQuery<{ vector_id: string }>(
    `SELECT vector_id FROM off_page_vector_documents
      WHERE index_name = ? AND entity_type = ? AND entity_id = ? AND deleted_at IS NULL
      LIMIT 1`,
    [params.indexName, params.entityType, params.entityId]
  );

  if (rows.length > 0) {
    const vectorId = rows[0].vector_id;
    // Mark as deleted in MySQL
    await cmsExecute(
      `UPDATE off_page_vector_documents SET deleted_at = NOW(), updated_at = NOW()
        WHERE index_name = ? AND entity_type = ? AND entity_id = ?`,
      [params.indexName, params.entityType, params.entityId]
    );
    // Remove from TurboVec
    await removeTurboVecIds({
      indexName: params.indexName,
      ids: [vectorId],
    });
  }
}
