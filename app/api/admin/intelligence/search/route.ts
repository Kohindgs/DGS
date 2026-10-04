import { NextRequest, NextResponse } from "next/server";
import { authorizeSemanticAdmin } from "@/lib/intelligence/admin-auth";
import { semanticSearch } from "@/lib/intelligence/semantic-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeSemanticAdmin("view");
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: auth.status });
  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get("q") || "").trim();
  if (!query) return NextResponse.json({ ok: false, message: "q is required" }, { status: 400 });
  const kinds = String(searchParams.get("kinds") || "").split(",").map((x) => x.trim()).filter(Boolean);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 30);
  const result = await semanticSearch({ query, kinds, limit });
  return NextResponse.json({ ok: result.available, ...result }, { status: result.available ? 200 : 503 });
}
