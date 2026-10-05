import { NextRequest, NextResponse } from "next/server";
import { guardOffPage } from "@/lib/off-page/route-auth";
import { parseSpreadsheetBuffer, previewParsedSpreadsheet, commitSpreadsheetRows, ColumnMapping } from "@/lib/off-page/sheet-sync";

export async function POST(req: NextRequest) {
  const denied = await guardOffPage("create");
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = (formData.get("mode") as string) || "preview"; // 'preview' | 'commit'
    const customMappingRaw = formData.get("mapping") as string | null;
    const autoVerify = formData.get("autoVerify") === "true";
    const tabName = (formData.get("tabName") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { headers, rawRows, availableTabs } = parseSpreadsheetBuffer(buffer, tabName);

    if (headers.length === 0 || rawRows.length === 0) {
      return NextResponse.json(
        { error: "Spreadsheet contains no valid header or data rows" },
        { status: 400 }
      );
    }

    let customMapping: Partial<ColumnMapping> | undefined;
    if (customMappingRaw) {
      try {
        customMapping = JSON.parse(customMappingRaw);
      } catch {}
    }

    if (mode === "preview") {
      const preview = previewParsedSpreadsheet(headers, rawRows, customMapping);
      return NextResponse.json({
        success: true,
        fileName: file.name,
        availableTabs,
        activeTab: tabName || availableTabs[0],
        preview,
      });
    }

    // Commit mode
    const preview = previewParsedSpreadsheet(headers, rawRows, customMapping);
    const activeMapping = {
      ...preview.suggestedMapping,
      ...(customMapping || {}),
    } as ColumnMapping;

    if (!activeMapping.source_url) {
      return NextResponse.json(
        { error: "Source URL column mapping is mandatory" },
        { status: 400 }
      );
    }

    const syncResult = await commitSpreadsheetRows(rawRows, {
      sourceType: file.name.endsWith(".csv") ? "CSV" : "EXCEL",
      fileName: file.name,
      tabName: tabName || availableTabs[0],
      mapping: activeMapping,
      autoVerify,
      actor: "admin",
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      result: syncResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed processing spreadsheet" },
      { status: 500 }
    );
  }
}
