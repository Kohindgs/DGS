import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { checkAndPublishScheduledBlogs } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cronSecret = process.env.DGS_CRON_SECRET;

  if (!cronSecret || cronSecret.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "DGS_CRON_SECRET is not configured on server" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  // Strict dedicated cron authentication only
  if (!token || token !== cronSecret.trim()) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized. Invalid or missing DGS_CRON_SECRET bearer token." },
      { status: 401 }
    );
  }

  try {
    const publishedIds = await checkAndPublishScheduledBlogs();

    if (publishedIds.length > 0) {
      revalidatePath("/blogs/");
      revalidatePath("/sitemap.xml");
      revalidatePath("/llms.txt");
      revalidatePath("/llms.md");
      revalidatePath("/llms-full.txt");
      revalidatePath("/llms-full.md");
    }

    return NextResponse.json({
      ok: true,
      message: `Scheduled blog publication completed. Published ${publishedIds.length} due post(s).`,
      publishedCount: publishedIds.length,
      publishedIds,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Scheduled blog publisher worker failed:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to publish scheduled blogs" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Method Not Allowed. Use POST." },
    {
      status: 405,
      headers: { Allow: "POST" },
    }
  );
}
