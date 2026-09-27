import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getCmsSystemHealth } from "@/lib/cms/system-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") {
    return NextResponse.json({ enabled: false }, { status: 404 });
  }
  if (!(await hasAdminSession())) {
    return NextResponse.json({ enabled: true, authenticated: false }, { status: 401 });
  }

  const currentUser = await getCurrentCmsUser();
  const systemHealth = await getCmsSystemHealth();

  return NextResponse.json({
    enabled: true,
    authenticated: true,
    userRole: currentUser?.role || null,
    databaseConfigured: isCmsDatabaseConfigured(),
    systemHealth,
  });
}
