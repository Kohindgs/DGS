import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { scheduleCmsBlog, validateCmsBlogForPublish } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false }, { status: 503 });

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const body = await request.json();
  const scheduledFor = String(body?.scheduled_for || "").trim();

  if (!scheduledFor) {
    return NextResponse.json({ ok: false, message: "Scheduled date/time is required" }, { status: 400 });
  }

  const targetDate = new Date(scheduledFor);
  if (isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
    return NextResponse.json(
      { ok: false, message: "Scheduled publication time must be a valid future datetime" },
      { status: 400 }
    );
  }

  const qa = await validateCmsBlogForPublish(id);
  if (!qa.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: `Blog failed schedule QA checklist: ${qa.errors.join("; ")}`,
        qa,
      },
      { status: 422 }
    );
  }

  try {
    const blog = await scheduleCmsBlog(id, scheduledFor);
    if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

    await logAuditEvent({
      actor_email: "admin@dgeniussolutions.com",
      role: "admin",
      action: "BLOG_SCHEDULED",
      resource: "blog_post",
      resource_id: id,
      summary: `Scheduled blog "${blog.title}" for publication at ${scheduledFor}`,
      after_state: {
        title: blog.title,
        slug: blog.slug,
        status: "scheduled",
        scheduled_for: scheduledFor,
      },
      status: "success",
    });

    return NextResponse.json({ ok: true, blog, qa });
  } catch (error) {
    console.error("Failed to schedule blog", error);
    return NextResponse.json(
      { ok: false, message: (error as Error).message || "Failed to schedule blog" },
      { status: 500 }
    );
  }
}

