import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { publishCmsBlog, validateCmsBlogForPublish } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false }, { status: 503 });

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const qa = await validateCmsBlogForPublish(id);
  if (!qa.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: `Blog failed publish QA checklist: ${qa.errors.join("; ")}`,
        qa,
      },
      { status: 422 }
    );
  }

  try {
    const blog = await publishCmsBlog(id);
    if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

    revalidatePath("/blogs/");
    revalidatePath(`/blogs/${blog.slug}/`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");
    revalidatePath("/llms.md");
    revalidatePath("/llms-full.txt");
    revalidatePath("/llms-full.md");

    return NextResponse.json({ ok: true, blog, qa });
  } catch (error) {
    console.error("Failed to publish blog", error);
    return NextResponse.json(
      { ok: false, message: (error as Error).message || "Failed to publish blog" },
      { status: 500 }
    );
  }
}
