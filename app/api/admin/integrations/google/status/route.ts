import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import {
  getGoogleEnvDiagnostics,
  ensureGoogleTablesExist,
} from "@/lib/integrations/google";
import { isPageSpeedConfigured } from "@/lib/seo/pagespeed";
import { cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Admin authentication required" },
      { status: 401 }
    );
  }

  if (!hasPermission(currentUser.role, "integrations", "view")) {
    return NextResponse.json(
      { error: "Forbidden", message: "Insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    const envDiag = getGoogleEnvDiagnostics();
    const psiConfig = isPageSpeedConfigured();
    const configured = Boolean(envDiag.hasClientId && envDiag.hasClientSecret);

    let gscDbConn: any = null;
    let ga4DbConn: any = null;

    if (isCmsDatabaseConfigured()) {
      await ensureGoogleTablesExist();
      try {
        const { rows } = await cmsQuery(
          "SELECT service, property_id, account_email, status, encrypted_tokens, last_sync_at, last_error FROM google_connections WHERE service IN ('gsc', 'ga4')"
        );
        for (const row of rows as any[]) {
          if (row.service === "gsc") gscDbConn = row;
          if (row.service === "ga4") ga4DbConn = row;
        }
      } catch (err) {
        console.error("Failed to query google_connections:", err);
      }
    }

    const searchConsoleConnected = Boolean(
      gscDbConn?.status === "connected" && gscDbConn?.encrypted_tokens
    );
    const ga4Connected = Boolean(
      ga4DbConn?.status === "connected" && ga4DbConn?.encrypted_tokens
    );
    const authorized = Boolean(searchConsoleConnected || ga4Connected);

    let state = "WAITING_USER_AUTHORIZATION";
    if (!configured) {
      state = "CONFIGURATION_REQUIRED";
    } else if (authorized) {
      state = "CONNECTED";
    }

    return NextResponse.json({
      configured,
      authorized,
      state,
      searchConsoleConnected,
      ga4Connected,
      pageSpeedConfigured: psiConfig.configured,
      accountEmail: gscDbConn?.account_email || ga4DbConn?.account_email || null,
      gscProperty: gscDbConn?.property_id || null,
      ga4Property: ga4DbConn?.property_id || null,
      diagnostics: {
        hasClientId: envDiag.hasClientId,
        hasClientSecret: envDiag.hasClientSecret,
        hasEncryptionKey: envDiag.hasEncryptionKey,
        isRedirectUriExplicit: envDiag.isRedirectUriExplicit,
        redirectUri: envDiag.redirectUri,
        pageSpeedKeySource: psiConfig.keySource,
      },
    });
  } catch (err: any) {
    console.error("Google status check error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
