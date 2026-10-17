import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { checkAndPublishScheduledBlogsDetailed } from "@/lib/cms/blogs";
import { recordCronRun } from "@/lib/cms/cron-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const startedAt = new Date();
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

  const triggerSource =
    request.headers.get("x-trigger-source") ||
    (request.headers.get("x-github-run-id") ? "github_actions" : "cron_api");

  try {
    const result = await checkAndPublishScheduledBlogsDetailed();

    if (result.published > 0) {
      revalidatePath("/blogs/");
      for (const slug of result.publishedSlugs) {
        revalidatePath(`/blogs/${slug}/`);
      }
      revalidatePath("/sitemap.xml");
      revalidatePath("/llms.txt");
      revalidatePath("/llms.md");
      revalidatePath("/llms-full.txt");
      revalidatePath("/llms-full.md");
    }

    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const hasHardFailure = result.failed > 0 && result.published === 0;
    const status =
      result.failed === 0
        ? "SUCCESS"
        : result.published > 0
        ? "PARTIAL"
        : "FAILED";
    const httpStatus = hasHardFailure ? 500 : 200;

    await recordCronRun({
      jobName: "scheduled-blog-publisher",
      endpoint: "/api/internal/blogs/publish-scheduled",
      triggerSource,
      startedAt,
      completedAt,
      durationMs,
      status,
      httpStatus,
      recordsChecked: result.checked,
      recordsProcessed: result.published,
      recordsFailed: result.failed,
      errorCode: result.failed > 0 ? "BLOG_PUBLISH_QA_OR_DB_ERROR" : null,
      errorSummary: result.errors.length > 0 ? result.errors.join("; ") : null,
      metadata: {
        due: result.due,
        publishedIds: result.publishedIds,
        publishedSlugs: result.publishedSlugs,
        skippedAlreadyPublished: result.skippedAlreadyPublished,
      },
    });

    const message =
      result.due === 0 && result.published === 0
        ? "No scheduled blogs due"
        : `Scheduled blog publication completed. Published ${result.published} due post(s).`;

    return NextResponse.json(
      {
        ok: !hasHardFailure,
        checked: result.checked,
        due: result.due,
        published: result.published,
        failed: result.failed,
        skippedAlreadyPublished: result.skippedAlreadyPublished,
        publishedCount: result.published,
        publishedIds: result.publishedIds,
        publishedSlugs: result.publishedSlugs,
        errors: result.errors,
        durationMs,
        message,
        timestamp: completedAt.toISOString(),
      },
      { status: httpStatus }
    );
  } catch (err: any) {
    const completedAt = new Date();
    const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
    const errCode = String(err?.code || "BLOG_SCHEDULER_ERROR");
    const errMsg = String(err?.message || "Failed to publish scheduled blogs");

    console.error("Scheduled blog publisher worker failed:", err);

    await recordCronRun({
      jobName: "scheduled-blog-publisher",
      endpoint: "/api/internal/blogs/publish-scheduled",
      triggerSource,
      startedAt,
      completedAt,
      durationMs,
      status: "FAILED",
      httpStatus: 500,
      recordsChecked: 0,
      recordsProcessed: 0,
      recordsFailed: 1,
      errorCode: errCode,
      errorSummary: errMsg,
    });

    return NextResponse.json(
      {
        ok: false,
        checked: 0,
        published: 0,
        failed: 1,
        errorCode: errCode,
        message: errMsg,
        durationMs,
        timestamp: completedAt.toISOString(),
      },
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
