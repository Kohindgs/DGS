import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";

/**
 * Shared auth guard for Off-Page admin API routes (V8.12.6 security fix).
 * Returns a NextResponse when the caller is not allowed, otherwise null.
 */
export async function guardOffPage(action: "view" | "create" | "edit" | "delete" | "manage" = "view"): Promise<NextResponse | null> {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const user = await getCurrentCmsUser();
  if (!user || !hasPermission(user.role, "off_page", action)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}
