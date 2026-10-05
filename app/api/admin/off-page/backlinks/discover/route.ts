import { NextRequest, NextResponse } from "next/server";
import { guardOffPage } from "@/lib/off-page/route-auth";
import { executeBacklinkDiscovery } from "@/lib/off-page/backlink-discovery";

export async function POST(req: NextRequest) {
  const denied = await guardOffPage("create");
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const { provider, queries } = body;

    const result = await executeBacklinkDiscovery({
      provider: provider || "google_news",
      queries: queries || undefined,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
