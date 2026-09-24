import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import {
  getFreshAccessToken,
  listSearchConsoleSites,
  listGa4AccountSummaries,
  ensureGoogleTablesExist,
} from "@/lib/integrations/google";
import { cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({
      connected: false,
      accountEmail: null,
      gsc: { currentSite: null, sites: [] },
      ga4: { currentProperty: null, properties: [] },
      error: "Database not configured",
    });
  }

  await ensureGoogleTablesExist();

  let gscConn: any = null;
  let ga4Conn: any = null;

  try {
    const { rows } = await cmsQuery(
      `SELECT service, property_id, account_email, status, last_sync_at, last_error FROM google_connections WHERE service IN ('gsc', 'ga4')`
    );
    for (const r of rows as any[]) {
      if (r.service === "gsc") gscConn = r;
      if (r.service === "ga4") ga4Conn = r;
    }
  } catch (err) {
    console.error("Error fetching google connections:", err);
  }

  const token = await getFreshAccessToken("gsc");
  if (!token) {
    return NextResponse.json({
      connected: false,
      accountEmail: gscConn?.account_email || ga4Conn?.account_email || null,
      gsc: {
        currentSite: gscConn?.property_id || "https://www.dgeniussolutions.com/",
        sites: [],
      },
      ga4: {
        currentProperty: ga4Conn?.property_id || null,
        properties: [],
      },
      needsAuth: true,
    });
  }

  // Fetch real sites & properties concurrently
  const [sites, properties] = await Promise.all([
    listSearchConsoleSites(token),
    listGa4AccountSummaries(token),
  ]);

  return NextResponse.json({
    connected: true,
    accountEmail: gscConn?.account_email || ga4Conn?.account_email || null,
    gsc: {
      currentSite: gscConn?.property_id || "https://www.dgeniussolutions.com/",
      sites,
      lastSyncAt: gscConn?.last_sync_at || null,
      lastError: gscConn?.last_error || null,
    },
    ga4: {
      currentProperty: ga4Conn?.property_id || null,
      properties,
      lastSyncAt: ga4Conn?.last_sync_at || null,
      lastError: ga4Conn?.last_error || null,
    },
  });
}
