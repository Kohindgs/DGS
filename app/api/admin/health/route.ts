import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") {
    return NextResponse.json({ enabled: false }, { status: 404 });
  }
  if (!(await hasAdminSession())) {
    return NextResponse.json({ enabled: true, authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    enabled: true,
    databaseConfigured: isCmsDatabaseConfigured(),
    wordpressBridgeOrigin: process.env.DGS_WORDPRESS_BACKEND_ORIGIN || "https://wp-origin.dgeniussolutions.com",
    nativeModules: {
      blogs: "foundation",
      leads: "foundation",
      media: "foundation",
      forms: "bridge",
      seo: "foundation",
      users: "foundation",
    },
  });
}
