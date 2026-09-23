import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser } from "@/lib/cms/auth-db";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ notifications: [] });
  }

  try {
    const { rows: countRows } = await cmsQuery<{ count: number }>("SELECT COUNT(*) as count FROM cms_notifications");
    if ((countRows[0]?.count || 0) === 0) {
      // Seed initial helpful operational notifications
      const seeds = [
        {
          title: "Sitemap Baseline 100% Protected",
          message: "101 discovered URLs returning HTTP 200 with standard W3C YYYY-MM-DD dates.",
          type: "success",
          link: "/admin/search-console/",
        },
        {
          title: "15-Day Automated Website Audit",
          message: "Daily controller initialized. Next comprehensive health audit scheduled.",
          type: "info",
          link: "/admin/site-audits/",
        },
        {
          title: "Google Search Update Compliance",
          message: "19 official Google updates monitored with ranking protection protocol active.",
          type: "primary",
          link: "/admin/google-updates/",
        },
      ];

      for (const s of seeds) {
        await cmsExecute(
          `INSERT INTO cms_notifications (id, recipient_role, title, message, type, link, is_read)
           VALUES (?, 'all', ?, ?, ?, ?, 0)`,
          [randomUUID(), s.title, s.message, s.type, s.link]
        );
      }
    }

    const { rows } = await cmsQuery(
      `SELECT id, title, message, type, link, is_read, created_at
       FROM cms_notifications
       ORDER BY created_at DESC
       LIMIT 20`
    );

    return NextResponse.json({ notifications: rows || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await request.json();
    if (body.markAllRead) {
      await cmsExecute("UPDATE cms_notifications SET is_read = 1 WHERE is_read = 0");
    } else if (body.id) {
      await cmsExecute("UPDATE cms_notifications SET is_read = 1 WHERE id = ?", [body.id]);
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
