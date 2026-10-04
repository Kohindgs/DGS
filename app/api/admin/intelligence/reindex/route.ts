import { NextResponse } from "next/server";
import { authorizeSemanticAdmin } from "@/lib/intelligence/admin-auth";
import { rebuildSemanticIndex } from "@/lib/intelligence/semantic-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await authorizeSemanticAdmin("edit");
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: auth.status });
  const result = await rebuildSemanticIndex();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
