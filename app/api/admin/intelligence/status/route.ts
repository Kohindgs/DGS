import { NextResponse } from "next/server";
import { authorizeSemanticAdmin } from "@/lib/intelligence/admin-auth";
import { getSemanticStatus, isSemanticIntelligenceEnabled } from "@/lib/intelligence/semantic-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authorizeSemanticAdmin("view");
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: auth.status });
  const status = await getSemanticStatus();
  return NextResponse.json({ enabled: isSemanticIntelligenceEnabled(), ...status });
}
