import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCmsLead } from "@/lib/cms/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePayload(value: string | Record<string, unknown>) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await params;
  const lead = await getCmsLead(id);
  if (!lead) {
    return NextResponse.json({ ok: false, message: "Lead not found" }, { status: 404 });
  }

  const payload = parsePayload(lead.payload);
  const portfolio = payload.portfolio as
    | { storedName?: string; originalName?: string; mimeType?: string }
    | undefined;

  if (!portfolio?.storedName) {
    return NextResponse.json(
      { ok: false, message: "No portfolio file attached to this candidate" },
      { status: 404 },
    );
  }

  const uploadRoot =
    process.env.DGS_PRIVATE_UPLOAD_DIR ||
    path.join(process.cwd(), "storage", "careers");
  const safeStoredName = path.basename(portfolio.storedName);
  if (safeStoredName !== portfolio.storedName) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const filePath = path.resolve(uploadRoot, safeStoredName);
    const file = await readFile(/* turbopackIgnore: true */ filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": portfolio.mimeType || "application/pdf",
        "Content-Disposition": `attachment; filename="${(
          portfolio.originalName || "candidate-portfolio.pdf"
        ).replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Portfolio file not found on server" },
      { status: 404 },
    );
  }
}
