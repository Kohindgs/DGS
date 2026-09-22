import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { listMediaAssets, getMediaStorageStats, type MediaFilterOptions } from "@/lib/cms/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const options: MediaFilterOptions = {
    type: (searchParams.get("type") as any) || "all",
    format: searchParams.get("format") || "all",
    usage: (searchParams.get("usage") as any) || "all",
    alt: (searchParams.get("alt") as any) || "all",
    status: (searchParams.get("status") as any) || "all",
    category: (searchParams.get("category") as any) || "all",
    search: searchParams.get("search") || "",
    sort: (searchParams.get("sort") as any) || "recent",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 24),
  };

  try {
    const [result, stats] = await Promise.all([
      listMediaAssets(options),
      getMediaStorageStats(),
    ]);

    return NextResponse.json({
      ok: true,
      ...result,
      stats,
    });
  } catch (err) {
    console.error("Failed to list media assets:", err);
    return NextResponse.json({ ok: false, error: "Failed to retrieve media library" }, { status: 500 });
  }
}
