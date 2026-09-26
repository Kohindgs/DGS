import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { checkAndPublishScheduledBlogs } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

export async function POST(_request: Request) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

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
      message: `Triggered scheduled blog publication. Published ${publishedIds.length} post(s).`,
      publishedCount: publishedIds.length,
      publishedIds,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Admin scheduled publication trigger failed:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to publish scheduled blogs" },
      { status: 500 }
    );
  }
}
