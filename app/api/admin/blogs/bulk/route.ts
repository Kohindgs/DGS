import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { trashCmsBlog, restoreCmsBlog, permanentlyDeleteCmsBlog, getCmsBlogById } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

  const currentUser = await getCurrentCmsUser();
  if (!currentUser) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  let body: { action: "trash" | "restore" | "delete"; ids: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON payload" }, { status: 400 });
  }

  const { action, ids } = body;
  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ ok: false, message: "Valid action and blog IDs array required" }, { status: 400 });
  }

  if (action === "delete" && !hasPermission(currentUser.role, "blogs", "delete")) {
    return NextResponse.json({ ok: false, error: "Forbidden: Superadmin required for bulk permanent delete" }, { status: 403 });
  }
  if ((action === "trash" || action === "restore") && !hasPermission(currentUser.role, "blogs", "edit")) {
    return NextResponse.json({ ok: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const results: { id: string; success: boolean; error?: string }[] = [];

  for (const id of ids) {
    try {
      const blog = await getCmsBlogById(id);
      if (!blog) {
        results.push({ id, success: false, error: "Blog not found" });
        continue;
      }

      if (action === "trash") {
        await trashCmsBlog(id, currentUser.id);
        results.push({ id, success: true });
      } else if (action === "restore") {
        await restoreCmsBlog(id);
        results.push({ id, success: true });
      } else if (action === "delete") {
        await permanentlyDeleteCmsBlog(id, blog.slug);
        results.push({ id, success: true });
      }
    } catch (err) {
      results.push({ id, success: false, error: (err as Error).message });
    }
  }

  await logAuditEvent({
    user_id: currentUser.id,
    actor_email: currentUser.email,
    role: currentUser.role,
    action: `BLOG_BULK_${action.toUpperCase()}`,
    resource: "blog_post",
    resource_id: ids.join(","),
    summary: `Bulk ${action} executed for ${ids.length} blogs (${results.filter((r) => r.success).length} succeeded)`,
    status: "success",
  });

  revalidatePath("/blogs/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms.md");

  return NextResponse.json({
    ok: true,
    action,
    total: ids.length,
    processed: results.length,
    results,
  });
}
