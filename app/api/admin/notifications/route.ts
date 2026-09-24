import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
} from "@/lib/notifications/engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 30)));

    const result = await getNotificationsForUser({
      userId: currentUser.id,
      userRole: currentUser.role,
      unreadOnly,
      limit,
    });

    return NextResponse.json({
      notifications: result.notifications,
      unreadCount: result.unreadCount,
    });
  } catch (err: any) {
    console.error("[notifications API GET]", err);
    return NextResponse.json({ error: err.message || "Failed to fetch notifications" }, { status: 500 });
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
      await markAllNotificationsAsRead(currentUser.role, currentUser.id);
      return NextResponse.json({ ok: true, action: "mark_all_read" });
    }

    if (body.id) {
      if (body.action === "dismiss") {
        await dismissNotification(String(body.id));
        return NextResponse.json({ ok: true, action: "dismissed" });
      }

      await markNotificationAsRead(String(body.id));
      return NextResponse.json({ ok: true, action: "marked_read" });
    }

    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  } catch (err: any) {
    console.error("[notifications API POST]", err);
    return NextResponse.json({ error: err.message || "Failed to process notification action" }, { status: 500 });
  }
}
