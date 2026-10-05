import { randomUUID } from "node:crypto";
import * as XLSX from "xlsx";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import { checkLiveBacklink } from "./backlinks";
import type { OffPageBacklink, OffPageSheetConnection, OffPageSyncHistory, RegionCode } from "./types";

export interface ColumnMapping {
  source_url: string;
  target_url?: string;
  anchor_text?: string;
  team_status?: string;
  link_rel?: string;
  owner?: string;
  submitted_date?: string;
  cost?: string;
  contact_name?: string;
  contact_email?: string;
  proof_url?: string;
  notes?: string;
  category?: string;
  region?: string;
}

export interface ParsedRowResult {
  rowNumber: number;
  source_url: string;
  target_url: string;
  anchor_text: string;
  team_status: string;
  link_rel: string;
  owner: string | null;
  submitted_date: string | null;
  cost: number;
  contact_name: string | null;
  contact_email: string | null;
  proof_url: string | null;
  notes: string | null;
  category: string;
  region: RegionCode;
  isValid: boolean;
  validationError?: string;
}

export interface SheetParsePreview {
  headers: string[];
  suggestedMapping: Record<string, string>;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  sampleRows: ParsedRowResult[];
}

export interface SyncCommitOptions {
  connectionId?: string;
  sourceType: "GOOGLE_SHEETS" | "EXCEL" | "CSV";
  fileName?: string;
  tabName?: string;
  mapping: ColumnMapping;
  autoVerify: boolean;
  actor?: string;
}

export interface SyncExecutionResult {
  historyId: string;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  duplicatesSkipped: number;
  invalidRows: number;
  mismatchesDetected: number;
  verifiedCount: number;
  status: "COMPLETED" | "PARTIAL" | "FAILED";
  errors: string[];
}

const ALIAS_MAP: Record<keyof ColumnMapping, string[]> = {
  source_url: [
    "source url", "backlink url", "live link", "live url", "source link", "website",
    "domain", "source domain", "url", "site", "page url", "guest post url", "post url",
    "article url", "published url", "link"
  ],
  target_url: [
    "target url", "target page", "target link", "landing page", "dgs url", "link to",
    "linked page", "destination url", "destination", "target"
  ],
  anchor_text: [
    "anchor text", "anchor", "keyword", "keywords", "anchor phrase", "link text", "target keyword"
  ],
  team_status: [
    "status", "team status", "link status", "current status", "state", "stage", "progress"
  ],
  link_rel: [
    "rel", "link rel", "link type", "dofollow/nofollow", "attribute", "follow", "type"
  ],
  owner: [
    "owner", "assigned to", "executive", "team member", "created by", "author", "pic", "person", "done by"
  ],
  submitted_date: [
    "submitted date", "submission date", "date", "live date", "published date", "date added", "created date"
  ],
  cost: [
    "cost", "price", "fee", "amount", "paid amount", "charges", "rate"
  ],
  contact_name: [
    "contact name", "contact", "webmaster", "author name", "editor", "publisher", "person name"
  ],
  contact_email: [
    "contact email", "email", "webmaster email", "contact mail", "mail"
  ],
  proof_url: [
    "proof url", "proof", "screenshot", "evidence", "live proof"
  ],
  notes: [
    "notes", "remarks", "comments", "comment", "description"
  ],
  category: [
    "category", "niche", "niche / category", "type of site", "placement"
  ],
  region: [
    "region", "country", "geo", "target region"
  ],
};

/**
 * Automatically suggests a column mapping based on standard header aliases.
 */
export function autoDetectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lowerHeaders = headers.map((h) => h.trim().toLowerCase());

  for (const [canonicalField, aliases] of Object.entries(ALIAS_MAP)) {
    for (const alias of aliases) {
      const idx = lowerHeaders.findIndex((h) => h === alias || h.includes(alias));
      if (idx !== -1 && !Object.values(mapping).includes(headers[idx])) {
        mapping[canonicalField] = headers[idx];
        break;
      }
    }
  }

  return mapping;
}

/**
 * Parses raw file buffer (Excel or CSV) using SheetJS into structured row objects.
 */
export function parseSpreadsheetBuffer(
  buffer: Buffer,
  tabName?: string
): { headers: string[]; rawRows: Record<string, any>[]; availableTabs: string[] } {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const availableTabs = workbook.SheetNames;
  const sheetToUse = tabName && availableTabs.includes(tabName) ? tabName : availableTabs[0];

  const worksheet = workbook.Sheets[sheetToUse];
  if (!worksheet) {
    return { headers: [], rawRows: [], availableTabs };
  }

  const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  if (!rawJson || rawJson.length === 0) {
    return { headers: [], rawRows: [], availableTabs };
  }

  // Find header row (first non-empty array)
  let headerRowIndex = 0;
  while (headerRowIndex < rawJson.length && (!rawJson[headerRowIndex] || rawJson[headerRowIndex].filter(Boolean).length === 0)) {
    headerRowIndex++;
  }

  if (headerRowIndex >= rawJson.length) {
    return { headers: [], rawRows: [], availableTabs };
  }

  const headers: string[] = rawJson[headerRowIndex].map((h: any) => String(h || "").trim());

  const rawRows: Record<string, any>[] = [];
  for (let r = headerRowIndex + 1; r < rawJson.length; r++) {
    const rowArray = rawJson[r];
    if (!rowArray || rowArray.filter(Boolean).length === 0) continue;

    const rowObj: Record<string, any> = {};
    for (let c = 0; c < headers.length; c++) {
      if (headers[c]) {
        rowObj[headers[c]] = rowArray[c] !== undefined ? rowArray[c] : "";
      }
    }
    rawRows.push(rowObj);
  }

  return { headers, rawRows, availableTabs };
}

/**
 * Normalizes raw row values into canonical format.
 */
export function normalizeRow(
  raw: Record<string, any>,
  mapping: ColumnMapping,
  rowNumber: number
): ParsedRowResult {
  const getVal = (field?: string): string => {
    if (!field || raw[field] === undefined) return "";
    return String(raw[field]).trim();
  };

  const rawSourceUrl = getVal(mapping.source_url);
  let cleanSourceUrl = rawSourceUrl;

  // Add protocol if missing
  if (cleanSourceUrl && !cleanSourceUrl.startsWith("http://") && !cleanSourceUrl.startsWith("https://")) {
    if (cleanSourceUrl.includes(".")) {
      cleanSourceUrl = "https://" + cleanSourceUrl;
    }
  }

  let isValid = true;
  let validationError: string | undefined;

  try {
    const parsed = new URL(cleanSourceUrl);
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      isValid = false;
      validationError = "Invalid domain structure in Source URL";
    }
  } catch {
    isValid = false;
    validationError = "Malformed Source URL";
  }

  let targetUrl = getVal(mapping.target_url) || "https://digitalgrowthschool.com";
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  const anchor = getVal(mapping.anchor_text) || "Digital Growth School";

  // Team status mapping
  let rawStatus = getVal(mapping.team_status).toUpperCase();
  let teamStatus = "LIVE";
  if (rawStatus.includes("SUBMIT") || rawStatus.includes("PENDING")) {
    teamStatus = "SUBMITTED";
  } else if (rawStatus.includes("PROGRESS") || rawStatus.includes("DRAFT")) {
    teamStatus = "IN_PROGRESS";
  } else if (rawStatus.includes("PAID") || rawStatus.includes("BUY")) {
    teamStatus = "PAID";
  } else if (rawStatus.includes("LOST") || rawStatus.includes("DEAD") || rawStatus.includes("REMOVED")) {
    teamStatus = "LOST";
  } else if (rawStatus.includes("LIVE") || rawStatus.includes("ACTIVE") || rawStatus.includes("YES") || rawStatus.includes("DONE")) {
    teamStatus = "LIVE";
  }

  // Rel mapping
  let rawRel = getVal(mapping.link_rel).toLowerCase();
  let linkRel = "dofollow";
  if (rawRel.includes("no") || rawRel.includes("nofollow")) {
    linkRel = "nofollow";
  } else if (rawRel.includes("spon") || rawRel.includes("sponsored")) {
    linkRel = "sponsored";
  } else if (rawRel.includes("ugc")) {
    linkRel = "ugc";
  }

  // Cost parsing
  const rawCost = getVal(mapping.cost).replace(/[^0-9.]/g, "");
  const cost = parseFloat(rawCost) || 0;

  // Region
  let rawRegion = getVal(mapping.region).toUpperCase();
  let region: RegionCode = "GLOBAL";
  if (rawRegion.includes("INDIA") || rawRegion.includes("IN")) region = "INDIA";
  else if (rawRegion.includes("UAE") || rawRegion.includes("DUBAI")) region = "UAE";
  else if (rawRegion.includes("USA") || rawRegion.includes("US")) region = "USA";

  return {
    rowNumber,
    source_url: cleanSourceUrl,
    target_url: targetUrl,
    anchor_text: anchor,
    team_status: teamStatus,
    link_rel: linkRel,
    owner: getVal(mapping.owner) || null,
    submitted_date: getVal(mapping.submitted_date) || null,
    cost,
    contact_name: getVal(mapping.contact_name) || null,
    contact_email: getVal(mapping.contact_email) || null,
    proof_url: getVal(mapping.proof_url) || null,
    notes: getVal(mapping.notes) || null,
    category: getVal(mapping.category) || "Digital Marketing",
    region,
    isValid,
    validationError,
  };
}

/**
 * Previews parsed rows and returns statistics.
 */
export function previewParsedSpreadsheet(
  headers: string[],
  rawRows: Record<string, any>[],
  customMapping?: Partial<ColumnMapping>
): SheetParsePreview {
  const suggestedMapping = autoDetectColumnMapping(headers);
  const activeMapping: ColumnMapping = {
    source_url: customMapping?.source_url || suggestedMapping.source_url || headers[0] || "",
    target_url: customMapping?.target_url || suggestedMapping.target_url,
    anchor_text: customMapping?.anchor_text || suggestedMapping.anchor_text,
    team_status: customMapping?.team_status || suggestedMapping.team_status,
    link_rel: customMapping?.link_rel || suggestedMapping.link_rel,
    owner: customMapping?.owner || suggestedMapping.owner,
    submitted_date: customMapping?.submitted_date || suggestedMapping.submitted_date,
    cost: customMapping?.cost || suggestedMapping.cost,
    contact_name: customMapping?.contact_name || suggestedMapping.contact_name,
    contact_email: customMapping?.contact_email || suggestedMapping.contact_email,
    proof_url: customMapping?.proof_url || suggestedMapping.proof_url,
    notes: customMapping?.notes || suggestedMapping.notes,
    category: customMapping?.category || suggestedMapping.category,
    region: customMapping?.region || suggestedMapping.region,
  };

  const parsedRows: ParsedRowResult[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = normalizeRow(rawRows[i], activeMapping, i + 1);
    if (row.isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
    if (parsedRows.length < 10) {
      parsedRows.push(row);
    }
  }

  return {
    headers,
    suggestedMapping,
    totalRows: rawRows.length,
    validRowsCount: validCount,
    invalidRowsCount: invalidCount,
    sampleRows: parsedRows,
  };
}

/**
 * Commits parsed rows into MySQL/MariaDB off_page_backlinks with full two-status tracking.
 */
export async function commitSpreadsheetRows(
  rawRows: Record<string, any>[],
  options: SyncCommitOptions
): Promise<SyncExecutionResult> {
  await ensureOffPageTablesExist();

  const historyId = randomUUID();
  const errors: string[] = [];

  // Log sync history start
  await cmsExecute(
    `INSERT INTO off_page_sync_history (
      id, connection_id, source_type, file_name, tab_name, started_at, total_rows, status, created_by
    ) VALUES (?, ?, ?, ?, ?, NOW(), ?, 'RUNNING', ?)`,
    [
      historyId,
      options.connectionId || null,
      options.sourceType,
      options.fileName || null,
      options.tabName || null,
      rawRows.length,
      options.actor || "system",
    ]
  );

  let insertedCount = 0;
  let updatedCount = 0;
  let duplicatesSkipped = 0;
  let invalidRows = 0;
  let mismatchesDetected = 0;
  let verifiedCount = 0;

  const backlinkIdsToVerify: string[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const normalized = normalizeRow(rawRows[i], options.mapping, i + 1);

    if (!normalized.isValid) {
      invalidRows++;
      errors.push(`Row ${normalized.rowNumber}: ${normalized.validationError || "Invalid URL"}`);
      continue;
    }

    try {
      const sourceDomain = new URL(normalized.source_url).hostname.replace(/^www\./, "");
      const isDofollow = normalized.link_rel === "dofollow";
      const isNofollow = normalized.link_rel === "nofollow";
      const isSponsored = normalized.link_rel === "sponsored";
      const isUgc = normalized.link_rel === "ugc";

      // Check if backlink already exists
      const { rows: existing } = await cmsQuery<OffPageBacklink>(
        `SELECT id, team_status, verified_status, mismatch_status FROM off_page_backlinks WHERE source_url = ? LIMIT 1`,
        [normalized.source_url]
      );

      if (existing[0]) {
        // Update existing record with incoming human metadata without wiping verified telemetry
        const cur = existing[0];
        const newTeamStatus = normalized.team_status || cur.team_status || "LIVE";
        const verifiedStatus = cur.verified_status || "NOT_VERIFIED";

        let mismatchStatus = cur.mismatch_status || "MATCH";
        let mismatchReason: string | null = null;
        let mismatchDetectedAt: string | null = null;

        if (verifiedStatus !== "NOT_VERIFIED" && newTeamStatus !== verifiedStatus) {
          mismatchStatus = "MISMATCH";
          mismatchReason = `Team status is ${newTeamStatus} but crawler verified status is ${verifiedStatus}`;
          mismatchDetectedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
          mismatchesDetected++;
        }

        await cmsExecute(
          `UPDATE off_page_backlinks SET
            team_status = ?,
            owner = COALESCE(?, owner),
            cost = ?,
            contact_name = COALESCE(?, contact_name),
            contact_email = COALESCE(?, contact_email),
            proof_url = COALESCE(?, proof_url),
            submitted_date = COALESCE(?, submitted_date),
            notes = COALESCE(?, notes),
            mismatch_status = ?,
            mismatch_reason = ?,
            mismatch_detected_at = COALESCE(?, mismatch_detected_at),
            original_sheet_row_id = ?,
            sheet_connection_id = ?,
            updated_at = NOW()
           WHERE id = ?`,
          [
            newTeamStatus,
            normalized.owner,
            normalized.cost,
            normalized.contact_name,
            normalized.contact_email,
            normalized.proof_url,
            normalized.submitted_date,
            normalized.notes,
            mismatchStatus,
            mismatchReason,
            mismatchDetectedAt,
            String(normalized.rowNumber),
            options.connectionId || null,
            cur.id,
          ]
        );

        updatedCount++;
        if (options.autoVerify) {
          backlinkIdsToVerify.push(cur.id);
        }
      } else {
        // Insert new canonical backlink record
        const newId = randomUUID();
        const initialStatus = normalized.team_status === "LOST" ? "LOST" : "LIVE";

        await cmsExecute(
          `INSERT INTO off_page_backlinks (
            id, source_domain, source_url, target_url, target_page_type, anchor_text, anchor_classification,
            link_rel, dofollow, nofollow, ugc, sponsored, unknown_link_type,
            first_seen_at, last_seen_at, status, team_status, verified_status, mismatch_status,
            http_status, source_indexable, source_region, topical_category, source_type,
            owner, cost, contact_name, contact_email, proof_url, submitted_date,
            original_sheet_row_id, sheet_connection_id, notes, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, 'TARGET_LANDING', ?, 'BRANDED',
            ?, ?, ?, ?, ?, 0,
            NOW(), NOW(), ?, ?, 'NOT_VERIFIED', 'MATCH',
            200, 1, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, NOW(), NOW()
          )`,
          [
            newId,
            sourceDomain,
            normalized.source_url,
            normalized.target_url,
            normalized.anchor_text,
            normalized.link_rel,
            isDofollow ? 1 : 0,
            isNofollow ? 1 : 0,
            isUgc ? 1 : 0,
            isSponsored ? 1 : 0,
            initialStatus,
            normalized.team_status,
            normalized.region,
            normalized.category,
            options.sourceType === "GOOGLE_SHEETS" ? "google_sheet" : options.sourceType === "CSV" ? "csv_import" : "excel_import",
            normalized.owner,
            normalized.cost,
            normalized.contact_name,
            normalized.contact_email,
            normalized.proof_url,
            normalized.submitted_date,
            String(normalized.rowNumber),
            options.connectionId || null,
            normalized.notes,
          ]
        );

        insertedCount++;
        if (options.autoVerify) {
          backlinkIdsToVerify.push(newId);
        }
      }
    } catch (err: any) {
      errors.push(`Row ${normalized.rowNumber} DB error: ${err.message}`);
    }
  }

  // Trigger automated crawler verification if requested (limited to first 25 immediately to stay responsive)
  if (options.autoVerify && backlinkIdsToVerify.length > 0) {
    const toCheck = backlinkIdsToVerify.slice(0, 25);
    for (const bId of toCheck) {
      try {
        const verifyRes = await checkLiveBacklink(bId);
        verifiedCount++;
        if (verifyRes.status === "LOST" || verifyRes.status === "BROKEN") {
          mismatchesDetected++;
        }
      } catch (checkErr: any) {
        // Non-blocking crawler check failure
      }
    }
  }

  // Update connection stats if linked
  if (options.connectionId) {
    await cmsExecute(
      `UPDATE off_page_sheet_connections SET
        last_synced_at = NOW(),
        last_sync_status = ?,
        total_rows_synced = total_rows_synced + ?,
        last_sync_error = ?
       WHERE id = ?`,
      [
        errors.length === 0 ? "SUCCESS" : insertedCount > 0 || updatedCount > 0 ? "PARTIAL" : "ERROR",
        insertedCount + updatedCount,
        errors.slice(0, 5).join("; ") || null,
        options.connectionId,
      ]
    );
  }

  const finalStatus: "COMPLETED" | "PARTIAL" | "FAILED" =
    errors.length === 0 ? "COMPLETED" : (insertedCount > 0 || updatedCount > 0) ? "PARTIAL" : "FAILED";

  // Update sync history log
  await cmsExecute(
    `UPDATE off_page_sync_history SET
      completed_at = NOW(),
      inserted_count = ?,
      updated_count = ?,
      duplicates_skipped = ?,
      invalid_rows = ?,
      mismatches_detected = ?,
      verified_count = ?,
      status = ?,
      error_log = ?
     WHERE id = ?`,
    [
      insertedCount,
      updatedCount,
      duplicatesSkipped,
      invalidRows,
      mismatchesDetected,
      verifiedCount,
      finalStatus,
      errors.slice(0, 20).join("\n") || null,
      historyId,
    ]
  );

  return {
    historyId,
    totalRows: rawRows.length,
    insertedCount,
    updatedCount,
    duplicatesSkipped,
    invalidRows,
    mismatchesDetected,
    verifiedCount,
    status: finalStatus,
    errors,
  };
}

/**
 * Fetches a Google Sheet published CSV or exported CSV via public URL.
 */
export async function fetchGoogleSheetCsv(sheetUrl: string): Promise<{ buffer: Buffer; error?: string }> {
  try {
    // Extract spreadsheet ID from URL
    // e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
    let exportUrl = sheetUrl;
    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];
      const gidMatch = sheetUrl.match(/gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : "0";
      exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    }

    const res = await fetch(exportUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DGS-SheetSync/1.0)",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return {
        buffer: Buffer.alloc(0),
        error: `Failed to download Google Sheet CSV: HTTP ${res.status} ${res.statusText}. Ensure spreadsheet is shared with link or published to web.`,
      };
    }

    const arrayBuf = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuf) };
  } catch (err: any) {
    return {
      buffer: Buffer.alloc(0),
      error: `Error connecting to Google Sheet: ${err.message}`,
    };
  }
}
