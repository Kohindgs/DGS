import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getCmsBlogById, listBlogRevisions } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  try {
    const revisions = await listBlogRevisions(id);
    return NextResponse.json({ ok: true, blogId: id, revisions });
  } catch (error) {
    console.error("Failed to list blog revisions", error);
    return NextResponse.json({ ok: false, message: "Failed to list revisions" }, { status: 500 });
  }
}
