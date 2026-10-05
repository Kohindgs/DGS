import { NextRequest, NextResponse } from "next/server";
import { guardOffPage } from "@/lib/off-page/route-auth";
import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";
import {
  fetchGoogleSheetCsv,
  parseSpreadsheetBuffer,
  previewParsedSpreadsheet,
  commitSpreadsheetRows,
  ColumnMapping,
} from "@/lib/off-page/sheet-sync";
import type { OffPageSheetConnection, OffPageSyncHistory } from "@/lib/off-page/types";

export async function GET(req: NextRequest) {
  const denied = await guardOffPage("view");
  if (denied) return denied;

  try {
    await ensureOffPageTablesExist();

    const { rows: connections } = await cmsQuery<OffPageSheetConnection>(
      `SELECT * FROM off_page_sheet_connections ORDER BY created_at DESC`
    );

    const { rows: history } = await cmsQuery<OffPageSyncHistory>(
      `SELECT * FROM off_page_sync_history ORDER BY started_at DESC LIMIT 20`
    );

    return NextResponse.json({
      success: true,
      connections: connections.map((c) => ({
        ...c,
        column_mapping: typeof c.column_mapping === "string" ? JSON.parse(c.column_mapping) : c.column_mapping,
      })),
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await guardOffPage("create");
  if (denied) return denied;

  try {
    await ensureOffPageTablesExist();
    const body = await req.json();
    const { action } = body;

    if (action === "preview") {
      const { sheetUrl, customMapping } = body;
      if (!sheetUrl) {
        return NextResponse.json({ error: "sheetUrl is required for preview" }, { status: 400 });
      }

      const { buffer, error } = await fetchGoogleSheetCsv(sheetUrl);
      if (error || buffer.length === 0) {
        return NextResponse.json({ error: error || "Failed to download Google Sheet" }, { status: 400 });
      }

      const { headers, rawRows, availableTabs } = parseSpreadsheetBuffer(buffer);
      if (headers.length === 0 || rawRows.length === 0) {
        return NextResponse.json({ error: "Spreadsheet contains no valid rows" }, { status: 400 });
      }

      const preview = previewParsedSpreadsheet(headers, rawRows, customMapping);
      return NextResponse.json({
        success: true,
        availableTabs,
        preview,
      });
    }

    if (action === "create") {
      const { name, sheetUrl, columnMapping, autoSyncEnabled, syncIntervalHours, autoVerify } = body;
      if (!name || !sheetUrl) {
        return NextResponse.json({ error: "Name and sheetUrl are required" }, { status: 400 });
      }

      const id = randomUUID();
      let sheetId: string | null = null;
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        sheetId = match[1];
      }

      await cmsExecute(
        `INSERT INTO off_page_sheet_connections (
          id, name, source_type, sheet_url, sheet_id, column_mapping,
          auto_sync_enabled, sync_interval_hours, auto_verify_on_sync, created_at, updated_at
        ) VALUES (?, ?, 'GOOGLE_SHEETS', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          name,
          sheetUrl,
          sheetId,
          JSON.stringify(columnMapping || {}),
          autoSyncEnabled ? 1 : 0,
          syncIntervalHours || 24,
          autoVerify ? 1 : 0,
        ]
      );

      return NextResponse.json({ success: true, connectionId: id });
    }

    if (action === "sync") {
      const { connectionId, sheetUrl, customMapping, autoVerify } = body;
      let targetUrl = sheetUrl;
      let targetMapping: ColumnMapping = customMapping || {};
      let activeAutoVerify = autoVerify !== false;

      if (connectionId) {
        const { rows } = await cmsQuery<OffPageSheetConnection>(
          `SELECT * FROM off_page_sheet_connections WHERE id = ? LIMIT 1`,
          [connectionId]
        );
        if (!rows[0]) {
          return NextResponse.json({ error: "Connection not found" }, { status: 404 });
        }
        targetUrl = rows[0].sheet_url;
        targetMapping = typeof rows[0].column_mapping === "string" ? JSON.parse(rows[0].column_mapping) : rows[0].column_mapping;
        activeAutoVerify = Boolean(rows[0].auto_verify_on_sync);
      }

      if (!targetUrl) {
        return NextResponse.json({ error: "Sheet URL is required to sync" }, { status: 400 });
      }

      const { buffer, error } = await fetchGoogleSheetCsv(targetUrl);
      if (error || buffer.length === 0) {
        return NextResponse.json({ error: error || "Failed to download Google Sheet" }, { status: 400 });
      }

      const { headers, rawRows } = parseSpreadsheetBuffer(buffer);
      const preview = previewParsedSpreadsheet(headers, rawRows, targetMapping);
      const finalMapping = {
        ...preview.suggestedMapping,
        ...targetMapping,
      } as ColumnMapping;

      const result = await commitSpreadsheetRows(rawRows, {
        connectionId,
        sourceType: "GOOGLE_SHEETS",
        fileName: "Google Sheet Sync",
        mapping: finalMapping,
        autoVerify: activeAutoVerify,
        actor: "admin",
      });

      return NextResponse.json({ success: true, result });
    }

    if (action === "delete") {
      const { connectionId } = body;
      if (!connectionId) {
        return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
      }
      await cmsExecute(`DELETE FROM off_page_sheet_connections WHERE id = ?`, [connectionId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
