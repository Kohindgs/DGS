import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";
import { publishNotificationEvent } from "@/lib/notifications/engine";
import {
  canonicalPageKey,
  normalizeSearchQuery,
  normalizeSitePageUrl,
  getNonOverlapping28DayWindows,
} from "@/lib/seo/search-normalization";
export { getNonOverlapping28DayWindows };


const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const rawKey = process.env.DGS_ENCRYPTION_KEY || process.env.DGS_ADMIN_SESSION_SECRET || "dgs-secure-encryption-key-32bytes!";
  return createHash("sha256").update(rawKey).digest();
}

export function encryptSecret(plainText: string): string {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptSecret(encryptedPayload: string): string | null {
  try {
    const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(":");
    if (!ivHex || !authTagHex || !encryptedText) return null;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = getEncryptionKey();
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// DB Table Initializer
// ---------------------------------------------------------------------------

let tablesEnsured = false;
export async function ensureGoogleTablesExist(): Promise<void> {
  if (tablesEnsured || !isCmsDatabaseConfigured()) return;
  try {
    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS google_connections (
        id VARCHAR(64) PRIMARY KEY,
        service VARCHAR(50) NOT NULL UNIQUE,
        property_id VARCHAR(255) NULL,
        account_email VARCHAR(320) NULL,
        encrypted_tokens TEXT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
        last_sync_at DATETIME NULL,
        last_successful_sync_at DATETIME NULL,
        last_error TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS gsc_sync_runs (
        id VARCHAR(64) PRIMARY KEY,
        status VARCHAR(50) NOT NULL DEFAULT 'completed',
        clicks INT DEFAULT 0,
        impressions INT DEFAULT 0,
        ctr DECIMAL(5,4) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        window_start DATE NULL,
        window_end DATE NULL,
        rows_fetched INT DEFAULT 0,
        rows_stored INT DEFAULT 0,
        is_truncated BOOLEAN DEFAULT FALSE,
        started_at DATETIME NOT NULL,
        completed_at DATETIME NULL,
        error_message TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS gsc_daily_metrics (
        id VARCHAR(64) PRIMARY KEY,
        metric_date DATE NOT NULL UNIQUE,
        clicks INT DEFAULT 0,
        impressions INT DEFAULT 0,
        ctr DECIMAL(5,4) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS gsc_query_metrics (
        id VARCHAR(64) PRIMARY KEY,
        query_text VARCHAR(512) NOT NULL,
        clicks INT DEFAULT 0,
        impressions INT DEFAULT 0,
        ctr DECIMAL(5,4) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        period_type VARCHAR(50) DEFAULT '28d',
        updated_at DATETIME NOT NULL,
        INDEX idx_gsc_qm_clicks (clicks DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS gsc_page_metrics (
        id VARCHAR(64) PRIMARY KEY,
        page_url VARCHAR(512) NOT NULL,
        clicks INT DEFAULT 0,
        impressions INT DEFAULT 0,
        ctr DECIMAL(5,4) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        period_type VARCHAR(50) DEFAULT '28d',
        updated_at DATETIME NOT NULL,
        INDEX idx_gsc_pm_clicks (clicks DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS gsc_page_query_metrics (
        id VARCHAR(64) PRIMARY KEY,
        metric_date DATE NOT NULL,
        period_type VARCHAR(50) DEFAULT '28d',
        page_url VARCHAR(512) NOT NULL,
        query_text VARCHAR(512) NOT NULL,
        canonical_page_key VARCHAR(512) NULL,
        query_text_normalized VARCHAR(512) NULL,
        clicks INT DEFAULT 0,
        impressions INT DEFAULT 0,
        ctr DECIMAL(5,4) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        country VARCHAR(10) NULL,
        device VARCHAR(50) NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_gsc_pq_page (page_url(255)),
        INDEX idx_gsc_pq_query (query_text(255)),
        INDEX idx_gsc_pq_canon (canonical_page_key(255)),
        INDEX idx_gsc_pq_norm (query_text_normalized(255)),
        UNIQUE KEY uq_gsc_pq_current (period_type, canonical_page_key(255), query_text_normalized(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS gsc_ranking_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        snapshot_date DATE NOT NULL,
        entity_type VARCHAR(32) NOT NULL,
        identifier VARCHAR(512) NOT NULL,
        page_url VARCHAR(512) NULL,
        query_text VARCHAR(512) NULL,
        period_type VARCHAR(50) DEFAULT '28d',
        clicks INT DEFAULT 0,
        impressions INT DEFAULT 0,
        ctr DECIMAL(5,4) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        created_at DATETIME NOT NULL,
        INDEX idx_snap_entity (entity_type, identifier(255)),
        INDEX idx_snap_date (snapshot_date),
        INDEX idx_snap_period (period_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS ga4_sync_runs (
        id VARCHAR(64) PRIMARY KEY,
        status VARCHAR(50) NOT NULL DEFAULT 'completed',
        active_users INT DEFAULT 0,
        sessions INT DEFAULT 0,
        engaged_sessions INT DEFAULT 0,
        engagement_rate DECIMAL(5,4) DEFAULT 0,
        views INT DEFAULT 0,
        key_events INT DEFAULT 0,
        window_start DATE NULL,
        window_end DATE NULL,
        started_at DATETIME NOT NULL,
        completed_at DATETIME NULL,
        error_message TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS ga4_daily_metrics (
        id VARCHAR(64) PRIMARY KEY,
        metric_date DATE NOT NULL UNIQUE,
        active_users INT DEFAULT 0,
        sessions INT DEFAULT 0,
        engaged_sessions INT DEFAULT 0,
        engagement_rate DECIMAL(5,4) DEFAULT 0,
        views INT DEFAULT 0,
        key_events INT DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS ga4_page_metrics (
        id VARCHAR(64) PRIMARY KEY,
        page_path VARCHAR(512) NOT NULL,
        canonical_page_key VARCHAR(512) NULL,
        views INT DEFAULT 0,
        sessions INT DEFAULT 0,
        engagement_rate DECIMAL(5,4) DEFAULT 0,
        period_type VARCHAR(50) DEFAULT '28d',
        updated_at DATETIME NOT NULL,
        INDEX idx_ga4_pm_views (views DESC),
        INDEX idx_ga4_pm_canon (canonical_page_key(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    tablesEnsured = true;
  } catch (err) {
    console.error("ensureGoogleTablesExist error:", err);
  }
}

// ---------------------------------------------------------------------------
// Google OAuth Configuration & Scopes
// ---------------------------------------------------------------------------

export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getGoogleOAuthRedirectUri(origin?: string): string {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  const base = origin || process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
  return `${base.replace(/\/$/, "")}/api/admin/integrations/google/callback`;
}

export function createGoogleOAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in server environment variables.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_OAUTH_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type StoredGoogleTokens = {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
  token_type?: string;
  scope?: string;
};

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<StoredGoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET).");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
    token_type: data.token_type,
    scope: data.scope,
  };
}

export async function getGoogleUserEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.email || null;
  } catch {
    return null;
  }
}

export async function saveGoogleTokens(tokens: StoredGoogleTokens, email?: string | null): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  await ensureGoogleTablesExist();

  const encrypted = encryptSecret(JSON.stringify(tokens));

  // Save for GSC
  await cmsExecute(
    `INSERT INTO google_connections (id, service, account_email, encrypted_tokens, status, updated_at)
     VALUES ('google_gsc', 'gsc', ?, ?, 'connected', NOW())
     ON DUPLICATE KEY UPDATE
       account_email = COALESCE(?, account_email),
       encrypted_tokens = VALUES(encrypted_tokens),
       status = 'connected',
       updated_at = NOW()`,
    [email || null, encrypted, email || null]
  );

  // Save for GA4
  await cmsExecute(
    `INSERT INTO google_connections (id, service, account_email, encrypted_tokens, status, updated_at)
     VALUES ('google_ga4', 'ga4', ?, ?, 'connected', NOW())
     ON DUPLICATE KEY UPDATE
       account_email = COALESCE(?, account_email),
       encrypted_tokens = VALUES(encrypted_tokens),
       status = 'connected',
       updated_at = NOW()`,
    [email || null, encrypted, email || null]
  );
}

export async function getFreshAccessToken(service: "gsc" | "ga4" = "gsc"): Promise<string | null> {
  if (!isCmsDatabaseConfigured()) return null;
  await ensureGoogleTablesExist();

  // Deterministic service matching: query exact service first
  let { rows } = await cmsQuery<{ encrypted_tokens: string; account_email: string }>(
    `SELECT encrypted_tokens, account_email FROM google_connections
     WHERE service = ? AND encrypted_tokens IS NOT NULL
     ORDER BY updated_at DESC LIMIT 1`,
    [service]
  );

  // Fallback to any active connection only if specific service row not found
  if (!rows || rows.length === 0 || !rows[0].encrypted_tokens) {
    const fallback = await cmsQuery<{ encrypted_tokens: string; account_email: string }>(
      `SELECT encrypted_tokens, account_email FROM google_connections
       WHERE encrypted_tokens IS NOT NULL
       ORDER BY updated_at DESC LIMIT 1`
    );
    rows = fallback.rows;
  }

  if (!rows || rows.length === 0 || !rows[0].encrypted_tokens) return null;

  const decrypted = decryptSecret(rows[0].encrypted_tokens);
  if (!decrypted) return null;

  let tokens: StoredGoogleTokens;
  try {
    tokens = JSON.parse(decrypted);
  } catch {
    return null;
  }

  // Token valid for at least 5 more minutes?
  const isExpiring = tokens.expiry_date ? Date.now() > tokens.expiry_date - 300000 : false;
  if (!isExpiring && tokens.access_token) {
    return tokens.access_token;
  }

  // Refresh token required
  if (!tokens.refresh_token) {
    return tokens.access_token || null;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return tokens.access_token || null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Failed to refresh Google access token:", errText);
      await publishNotificationEvent({
        type: "google_oauth_expired",
        severity: "danger",
        title: "Google OAuth Session Expired",
        message: "Google Search Console and Analytics tokens could not be refreshed. Please re-authorize in Integrations.",
        resource_type: "integration",
        resource_id: "google_oauth",
        resource_url: "/admin/integrations/google/setup/",
        recipient_role: "admin",
      }).catch(() => {});
      return tokens.access_token || null;
    }

    const data = await res.json();
    const updatedTokens: StoredGoogleTokens = {
      ...tokens,
      access_token: data.access_token,
      expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
      scope: data.scope || tokens.scope,
    };

    const encrypted = encryptSecret(JSON.stringify(updatedTokens));
    await cmsExecute(
      `UPDATE google_connections SET encrypted_tokens = ?, updated_at = NOW() WHERE encrypted_tokens IS NOT NULL`,
      [encrypted]
    );

    return updatedTokens.access_token;
  } catch (err) {
    console.error("Error refreshing Google token:", err);
    return tokens.access_token || null;
  }
}

// ---------------------------------------------------------------------------
// Google Search Console APIs
// ---------------------------------------------------------------------------

export async function listSearchConsoleSites(accessToken: string): Promise<Array<{ siteUrl: string; permissionLevel: string }>> {
  try {
    const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.warn("Search Console sites list error:", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    const siteEntries = data.siteEntry || [];
    return siteEntries.map((e: any) => ({
      siteUrl: e.siteUrl,
      permissionLevel: e.permissionLevel || "siteOwner",
    }));
  } catch (err) {
    console.error("Failed to list Search Console sites:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Google Analytics 4 APIs
// ---------------------------------------------------------------------------

export async function listGa4AccountSummaries(accessToken: string): Promise<Array<{ propertyId: string; displayName: string; accountName: string }>> {
  try {
    const res = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.warn("GA4 account summaries error:", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    const items: Array<{ propertyId: string; displayName: string; accountName: string }> = [];
    for (const acc of data.accountSummaries || []) {
      for (const prop of acc.propertySummaries || []) {
        items.push({
          propertyId: prop.property, // Format: "properties/123456"
          displayName: prop.displayName || prop.property,
          accountName: acc.displayName || acc.account,
        });
      }
    }
    return items;
  } catch (err) {
    console.error("Failed to list GA4 properties:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Save Property Selections
// ---------------------------------------------------------------------------

export async function saveGoogleProperties(gscSiteUrl?: string, ga4PropertyId?: string): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  await ensureGoogleTablesExist();

  if (gscSiteUrl) {
    await cmsExecute(
      `UPDATE google_connections SET property_id = ?, status = 'connected', updated_at = NOW() WHERE service = 'gsc'`,
      [gscSiteUrl]
    );
  }

  if (ga4PropertyId) {
    const formattedGa4 = ga4PropertyId.startsWith("properties/") ? ga4PropertyId : `properties/${ga4PropertyId}`;
    await cmsExecute(
      `UPDATE google_connections SET property_id = ?, status = 'connected', updated_at = NOW() WHERE service = 'ga4'`,
      [formattedGa4]
    );
  }
}

// ---------------------------------------------------------------------------
// Disconnect
// ---------------------------------------------------------------------------

export async function disconnectGoogle(): Promise<boolean> {
  if (!isCmsDatabaseConfigured()) return true;
  await ensureGoogleTablesExist();

  await cmsExecute(
    `UPDATE google_connections
     SET status = 'disconnected',
         encrypted_tokens = NULL,
         last_error = NULL,
         updated_at = NOW()
     WHERE service IN ('gsc', 'ga4')`
  );
  return true;
}

// ---------------------------------------------------------------------------
// Non-overlapping 28-day Windows & Pagination Helpers
// ---------------------------------------------------------------------------


async function fetchGscSearchAnalyticsPaginated(
  siteUrl: string,
  accessToken: string,
  body: {
    startDate: string;
    endDate: string;
    dimensions: string[];
    dimensionFilterGroups?: any[];
  },
  maxRows: number = 5000
): Promise<{ rows: any[]; isTruncated: boolean; rowsFetched: number }> {
  const rows: any[] = [];
  let startRow = 0;
  const rowLimit = 1000;
  let isTruncated = false;

  while (startRow < maxRows) {
    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          startRow,
          rowLimit,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`GSC pagination fetch error at startRow ${startRow}:`, res.status, errText);
      break;
    }

    const data = await res.json();
    const batch = data.rows || [];
    rows.push(...batch);

    if (batch.length < rowLimit) {
      break;
    }
    startRow += batch.length;
    if (startRow >= maxRows) {
      isTruncated = true;
      break;
    }
  }

  return { rows, isTruncated, rowsFetched: rows.length };
}

// ---------------------------------------------------------------------------
// Live Data Synchronization (ZERO FAKE DATA)
// ---------------------------------------------------------------------------

export async function syncGoogleData(): Promise<{
  success: boolean;
  partial?: boolean;
  gsc?: any;
  ga4?: any;
  error?: string;
}> {
  if (!isCmsDatabaseConfigured()) {
    return { success: false, error: "Database not configured" };
  }
  await ensureGoogleTablesExist();

  const accessToken = await getFreshAccessToken("gsc");
  if (!accessToken) {
    return { success: false, error: "No valid Google OAuth token available. Please reconnect Google." };
  }

  const windows = getNonOverlapping28DayWindows();
  const syncStartTime = new Date();
  const todayStr = syncStartTime.toISOString().slice(0, 10);

  let gscResult: any = null;
  let gscError: string | null = null;
  let ga4Result: any = null;
  let ga4Error: string | null = null;

  // 1. Fetch & Store Google Search Console Data
  try {
    const { rows: gscRows } = await cmsQuery<{ property_id: string }>(
      `SELECT property_id FROM google_connections WHERE service = 'gsc' LIMIT 1`
    );
    const rawSiteUrl = gscRows[0]?.property_id || "https://www.dgeniussolutions.com/";
    const siteUrl = rawSiteUrl.trim();

    // 1a. True summary aggregate metrics (dimensionless searchAnalytics query)
    let aggregateClicks = 0;
    let aggregateImpressions = 0;
    let aggregateCtr = 0;
    let aggregatePos = 0;

    try {
      const summaryRes = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: windows.currentStart,
            endDate: windows.currentEnd,
            dimensions: [],
          }),
        }
      );
      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        const r = sumData.rows?.[0];
        if (r) {
          aggregateClicks = Math.round(r.clicks || 0);
          aggregateImpressions = Math.round(r.impressions || 0);
          aggregateCtr = Number(r.ctr || 0);
          aggregatePos = Number(r.position || 0);
        }
      }
    } catch (sumErr) {
      console.warn("GSC dimensionless summary query warning:", sumErr);
    }

    // 1b. Daily metrics for trend charts
    const dailyRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: windows.currentStart,
          endDate: windows.currentEnd,
          dimensions: ["date"],
          rowLimit: 35,
        }),
      }
    );

    let sumDailyClicks = 0;
    let sumDailyImpressions = 0;

    if (dailyRes.ok) {
      const dailyData = await dailyRes.json();
      const rows = dailyData.rows || [];
      for (const row of rows) {
        const date = row.keys[0];
        const clicks = Math.round(row.clicks || 0);
        const impressions = Math.round(row.impressions || 0);
        const ctr = Number(row.ctr || 0);
        const position = Number(row.position || 0);

        sumDailyClicks += clicks;
        sumDailyImpressions += impressions;

        await cmsExecute(
          `INSERT INTO gsc_daily_metrics (id, metric_date, clicks, impressions, ctr, position)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE clicks = VALUES(clicks), impressions = VALUES(impressions), ctr = VALUES(ctr), position = VALUES(position)`,
          [`gsc_${date}`, date, clicks, impressions, ctr, position]
        );
      }
    }

    // Fallback if dimensionless returned 0 but daily had data
    if (aggregateClicks === 0 && sumDailyClicks > 0) {
      aggregateClicks = sumDailyClicks;
      aggregateImpressions = sumDailyImpressions;
      if (aggregateImpressions > 0) {
        aggregateCtr = aggregateClicks / aggregateImpressions;
      }
    }

    // 1c. Historical comparison window (Previous 28 days, non-overlapping)
    const prevQueryMap = new Map<string, { clicks: number; impressions: number; ctr: number; position: number }>();
    const prevPageMap = new Map<string, { clicks: number; impressions: number; ctr: number; position: number }>();
    const prevPqMap = new Map<string, { clicks: number; impressions: number; ctr: number; position: number }>();

    try {
      const prevQueryData = await fetchGscSearchAnalyticsPaginated(
        siteUrl,
        accessToken,
        {
          startDate: windows.previousStart,
          endDate: windows.previousEnd,
          dimensions: ["query"],
        },
        1000
      );
      for (const r of prevQueryData.rows) {
        const qText = (r.keys[0] || "").slice(0, 500);
        prevQueryMap.set(normalizeSearchQuery(qText), {
          clicks: Math.round(r.clicks || 0),
          impressions: Math.round(r.impressions || 0),
          ctr: Number(r.ctr || 0),
          position: Number(r.position || 0),
        });
      }

      const prevPageData = await fetchGscSearchAnalyticsPaginated(
        siteUrl,
        accessToken,
        {
          startDate: windows.previousStart,
          endDate: windows.previousEnd,
          dimensions: ["page"],
        },
        1000
      );
      for (const r of prevPageData.rows) {
        const pUrl = (r.keys[0] || "").slice(0, 500);
        prevPageMap.set(canonicalPageKey(pUrl), {
          clicks: Math.round(r.clicks || 0),
          impressions: Math.round(r.impressions || 0),
          ctr: Number(r.ctr || 0),
          position: Number(r.position || 0),
        });
      }

      const prevPqData = await fetchGscSearchAnalyticsPaginated(
        siteUrl,
        accessToken,
        {
          startDate: windows.previousStart,
          endDate: windows.previousEnd,
          dimensions: ["page", "query"],
        },
        2000
      );
      for (const r of prevPqData.rows) {
        const pUrl = (r.keys[0] || "").slice(0, 500);
        const qText = (r.keys[1] || "").slice(0, 500);
        prevPqMap.set(`${canonicalPageKey(pUrl)}|||${normalizeSearchQuery(qText)}`, {
          clicks: Math.round(r.clicks || 0),
          impressions: Math.round(r.impressions || 0),
          ctr: Number(r.ctr || 0),
          position: Number(r.position || 0),
        });
      }
    } catch (prevErr) {
      console.warn("Could not fetch previous 28d GSC window for comparison:", prevErr);
    }

    // 1d. Top Queries (Current 28d)
    const currentQueryData = await fetchGscSearchAnalyticsPaginated(
      siteUrl,
      accessToken,
      {
        startDate: windows.currentStart,
        endDate: windows.currentEnd,
        dimensions: ["query"],
      },
      1000
    );

    for (const row of currentQueryData.rows) {
      const queryText = (row.keys[0] || "").slice(0, 500);
      const normQ = normalizeSearchQuery(queryText);
      const clicks = Math.round(row.clicks || 0);
      const impressions = Math.round(row.impressions || 0);
      const ctr = Number(row.ctr || 0);
      const position = Number(row.position || 0);
      const prev = prevQueryMap.get(normQ);
      const prevPosition = prev ? prev.position : null;
      const prevClicks = prev ? prev.clicks : 0;
      const prevImpressions = prev ? prev.impressions : 0;

      const rowId = createHash("md5").update(`q_${normQ}`).digest("hex");

      await cmsExecute(
        `INSERT INTO gsc_query_metrics (id, query_text, clicks, impressions, ctr, position, prev_position, prev_clicks, prev_impressions, period_type, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '28d', NOW())
         ON DUPLICATE KEY UPDATE clicks = VALUES(clicks), impressions = VALUES(impressions), ctr = VALUES(ctr), position = VALUES(position), prev_position = VALUES(prev_position), prev_clicks = VALUES(prev_clicks), prev_impressions = VALUES(prev_impressions), updated_at = NOW()`,
        [rowId, queryText, clicks, impressions, ctr, position, prevPosition, prevClicks, prevImpressions]
      );

      // Snapshot record
      const snapId = createHash("md5").update(`snap_q_${todayStr}_${normQ}`).digest("hex");
      await cmsExecute(
        `INSERT INTO gsc_ranking_snapshots (id, snapshot_date, entity_type, identifier, query_text, period_type, clicks, impressions, ctr, position, created_at)
         VALUES (?, ?, 'query', ?, ?, 'current_28d', ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE clicks = VALUES(clicks), impressions = VALUES(impressions), ctr = VALUES(ctr), position = VALUES(position)`,
        [snapId, todayStr, queryText, queryText, clicks, impressions, ctr, position]
      );
    }

    // 1e. Top Pages (Current 28d)
    const currentPageData = await fetchGscSearchAnalyticsPaginated(
      siteUrl,
      accessToken,
      {
        startDate: windows.currentStart,
        endDate: windows.currentEnd,
        dimensions: ["page"],
      },
      1000
    );

    for (const row of currentPageData.rows) {
      const pageUrl = (row.keys[0] || "").slice(0, 500);
      const canonKey = canonicalPageKey(pageUrl);
      const clicks = Math.round(row.clicks || 0);
      const impressions = Math.round(row.impressions || 0);
      const ctr = Number(row.ctr || 0);
      const position = Number(row.position || 0);
      const prev = prevPageMap.get(canonKey);
      const prevPosition = prev ? prev.position : null;
      const prevClicks = prev ? prev.clicks : 0;
      const prevImpressions = prev ? prev.impressions : 0;

      const rowId = createHash("md5").update(`p_${canonKey}`).digest("hex");

      await cmsExecute(
        `INSERT INTO gsc_page_metrics (id, page_url, clicks, impressions, ctr, position, prev_position, prev_clicks, prev_impressions, period_type, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '28d', NOW())
         ON DUPLICATE KEY UPDATE clicks = VALUES(clicks), impressions = VALUES(impressions), ctr = VALUES(ctr), position = VALUES(position), prev_position = VALUES(prev_position), prev_clicks = VALUES(prev_clicks), prev_impressions = VALUES(prev_impressions), updated_at = NOW()`,
        [rowId, pageUrl, clicks, impressions, ctr, position, prevPosition, prevClicks, prevImpressions]
      );

      // Snapshot record
      const snapId = createHash("md5").update(`snap_p_${todayStr}_${canonKey}`).digest("hex");
      await cmsExecute(
        `INSERT INTO gsc_ranking_snapshots (id, snapshot_date, entity_type, identifier, page_url, period_type, clicks, impressions, ctr, position, created_at)
         VALUES (?, ?, 'page', ?, ?, 'current_28d', ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE clicks = VALUES(clicks), impressions = VALUES(impressions), ctr = VALUES(ctr), position = VALUES(position)`,
        [snapId, todayStr, pageUrl, pageUrl, clicks, impressions, ctr, position]
      );
    }

    // 1f. Page + Query Matrix (Current 28d, paginated up to 5000 rows)
    const currentPqData = await fetchGscSearchAnalyticsPaginated(
      siteUrl,
      accessToken,
      {
        startDate: windows.currentStart,
        endDate: windows.currentEnd,
        dimensions: ["page", "query"],
      },
      5000
    );

    let pqStored = 0;
    for (const row of currentPqData.rows) {
      const pageUrl = (row.keys[0] || "").slice(0, 500);
      const queryText = (row.keys[1] || "").slice(0, 500);
      const canonKey = canonicalPageKey(pageUrl);
      const normQ = normalizeSearchQuery(queryText);
      const clicks = Math.round(row.clicks || 0);
      const impressions = Math.round(row.impressions || 0);
      const ctr = Number(row.ctr || 0);
      const position = Number(row.position || 0);
      const prev = prevPqMap.get(`${canonKey}|||${normQ}`);
      const prevPosition = prev ? prev.position : null;
      const prevClicks = prev ? prev.clicks : 0;
      const prevImpressions = prev ? prev.impressions : 0;

      // Deterministic current identity: one row per canonical page and normalized query
      const rowId = createHash("md5").update(`pq_current|28d|${canonKey}|${normQ}`).digest("hex");

      await cmsExecute(
        `INSERT INTO gsc_page_query_metrics (
           id, metric_date, period_type, page_url, query_text,
           canonical_page_key, query_text_normalized,
           clicks, impressions, ctr, position,
           prev_position, prev_clicks, prev_impressions, updated_at
         )
         VALUES (?, ?, '28d', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           page_url = VALUES(page_url),
           query_text = VALUES(query_text),
           canonical_page_key = VALUES(canonical_page_key),
           query_text_normalized = VALUES(query_text_normalized),
           clicks = VALUES(clicks),
           impressions = VALUES(impressions),
           ctr = VALUES(ctr),
           position = VALUES(position),
           prev_position = VALUES(prev_position),
           prev_clicks = VALUES(prev_clicks),
           prev_impressions = VALUES(prev_impressions),
           metric_date = VALUES(metric_date),
           updated_at = NOW()`,
        [rowId, todayStr, pageUrl, queryText, canonKey, normQ, clicks, impressions, ctr, position, prevPosition, prevClicks, prevImpressions]
      );
      pqStored++;

      // Daily snapshot record in gsc_ranking_snapshots for historical tracking
      const snapId = createHash("md5").update(`snap_pq_${todayStr}_${canonKey}_${normQ}`).digest("hex");
      await cmsExecute(
        `INSERT INTO gsc_ranking_snapshots (id, snapshot_date, entity_type, identifier, page_url, query_text, period_type, clicks, impressions, ctr, position, created_at)
         VALUES (?, ?, 'page_query', ?, ?, ?, 'current_28d', ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE clicks = VALUES(clicks), impressions = VALUES(impressions), ctr = VALUES(ctr), position = VALUES(position)`,
        [snapId, todayStr, `${pageUrl}|||${queryText}`, pageUrl, queryText, clicks, impressions, ctr, position]
      );
    }

    // 1g. Prune stale current rows that were not updated in this sync run
    await cmsExecute(
      `DELETE FROM gsc_page_query_metrics WHERE period_type = '28d' AND updated_at < ?`,
      [syncStartTime]
    );

    // 1h. Record sync run with true aggregate metrics
    await cmsExecute(
      `INSERT INTO gsc_sync_runs (id, status, clicks, impressions, ctr, position, window_start, window_end, rows_fetched, rows_stored, is_truncated, started_at, completed_at)
       VALUES (?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        `run_${Date.now()}`,
        aggregateClicks,
        aggregateImpressions,
        aggregateCtr,
        aggregatePos,
        windows.currentStart,
        windows.currentEnd,
        currentPqData.rowsFetched,
        pqStored,
        currentPqData.isTruncated,
        syncStartTime,
      ]
    );

    await cmsExecute(
      `UPDATE google_connections
       SET status = 'connected', last_sync_at = NOW(), last_successful_sync_at = NOW(), last_error = NULL
       WHERE service = 'gsc'`
    );

    gscResult = {
      success: true,
      clicks: aggregateClicks,
      impressions: aggregateImpressions,
      avgCtr: aggregateCtr,
      avgPos: aggregatePos,
      rowsFetched: currentPqData.rowsFetched,
      rowsStored: pqStored,
      isTruncated: currentPqData.isTruncated,
      windowStart: windows.currentStart,
      windowEnd: windows.currentEnd,
    };
  } catch (err: any) {
    gscError = err?.message || "GSC Sync Error";
    console.error("GSC sync error:", err);
    await cmsExecute(
      `UPDATE google_connections SET last_error = ?, last_sync_at = NOW() WHERE service = 'gsc'`,
      [gscError]
    );
    await publishNotificationEvent({
      type: "google_sync_failed",
      severity: "warning",
      title: "Google Search Console Sync Warning",
      message: `Failed to sync GSC metrics: ${gscError}`,
      resource_type: "integration",
      resource_id: "google_gsc",
      resource_url: "/admin/search-console/",
      recipient_role: "admin",
    }).catch(() => {});
  }

  // 2. Fetch & Store Google Analytics 4 Data
  try {
    const { rows: ga4Rows } = await cmsQuery<{ property_id: string }>(
      `SELECT property_id FROM google_connections WHERE service = 'ga4' LIMIT 1`
    );
    let propId = ga4Rows[0]?.property_id || "";
    if (propId && !propId.startsWith("properties/")) {
      propId = `properties/${propId}`;
    }

    if (propId) {
      // 2a. Dimensionless aggregate runReport for true 28-day KPI metrics
      let aggActiveUsers = 0;
      let aggSessions = 0;
      let aggEngagedSessions = 0;
      let aggEngagementRate = 0;
      let aggViews = 0;
      let aggKeyEvents = 0;

      try {
        const aggRes = await fetch(
          `https://analyticsdata.googleapis.com/v1beta/${propId}:runReport`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              dateRanges: [{ startDate: "28daysAgo", endDate: "yesterday" }],
              dimensionFilter: {
                filter: {
                  fieldName: "hostName",
                  stringFilter: {
                    matchType: "CONTAINS",
                    value: "dgeniussolutions.com",
                  },
                },
              },
              metrics: [
                { name: "activeUsers" },
                { name: "sessions" },
                { name: "engagedSessions" },
                { name: "engagementRate" },
                { name: "screenPageViews" },
                { name: "keyEvents" },
              ],
            }),
          }
        );

        if (aggRes.ok) {
          const aggData = await aggRes.json();
          const r = aggData.rows?.[0];
          if (r) {
            aggActiveUsers = Number(r.metricValues?.[0]?.value || 0);
            aggSessions = Number(r.metricValues?.[1]?.value || 0);
            aggEngagedSessions = Number(r.metricValues?.[2]?.value || 0);
            aggEngagementRate = Number(r.metricValues?.[3]?.value || 0);
            aggViews = Number(r.metricValues?.[4]?.value || 0);
            aggKeyEvents = Number(r.metricValues?.[5]?.value || 0);
          }
        }
      } catch (aggErr) {
        console.warn("GA4 aggregate KPI runReport warning:", aggErr);
      }

      // 2b. Daily report for trend charts
      const dailyGa4Res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/${propId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate: "28daysAgo", endDate: "yesterday" }],
            dimensions: [{ name: "date" }],
            metrics: [
              { name: "activeUsers" },
              { name: "sessions" },
              { name: "engagedSessions" },
              { name: "engagementRate" },
              { name: "screenPageViews" },
              { name: "keyEvents" },
            ],
          }),
        }
      );

      if (dailyGa4Res.ok) {
        const ga4Data = await dailyGa4Res.json();
        const rows = ga4Data.rows || [];
        for (const row of rows) {
          const rawDate = row.dimensionValues?.[0]?.value || ""; // Format: YYYYMMDD
          const metricDate = rawDate.length === 8
            ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
            : rawDate;

          const activeUsers = Number(row.metricValues?.[0]?.value || 0);
          const sessions = Number(row.metricValues?.[1]?.value || 0);
          const engagedSessions = Number(row.metricValues?.[2]?.value || 0);
          const engagementRate = Number(row.metricValues?.[3]?.value || 0);
          const views = Number(row.metricValues?.[4]?.value || 0);
          const keyEvents = Number(row.metricValues?.[5]?.value || 0);

          await cmsExecute(
            `INSERT INTO ga4_daily_metrics (id, metric_date, active_users, sessions, engaged_sessions, engagement_rate, views, key_events)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               active_users = VALUES(active_users),
               sessions = VALUES(sessions),
               engaged_sessions = VALUES(engaged_sessions),
               engagement_rate = VALUES(engagement_rate),
               views = VALUES(views),
               key_events = VALUES(key_events)`,
            [`ga4_${metricDate}`, metricDate, activeUsers, sessions, engagedSessions, engagementRate, views, keyEvents]
          );
        }
      }

      // 2c. Top pages report (filtered to dgeniussolutions.com)
      const pageGa4Res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/${propId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate: "28daysAgo", endDate: "yesterday" }],
            dimensionFilter: {
              filter: {
                fieldName: "hostName",
                stringFilter: {
                  matchType: "CONTAINS",
                  value: "dgeniussolutions.com",
                },
              },
            },
            dimensions: [{ name: "pagePath" }],
            metrics: [
              { name: "screenPageViews" },
              { name: "sessions" },
              { name: "engagementRate" },
            ],
            limit: 100,
          }),
        }
      );

      let ga4PagesStored = 0;
      if (pageGa4Res.ok) {
        const pageData = await pageGa4Res.json();
        const rows = pageData.rows || [];
        for (const row of rows) {
          const pagePath = (row.dimensionValues?.[0]?.value || "").slice(0, 500);
          const canonKey = canonicalPageKey(pagePath);
          const views = Number(row.metricValues?.[0]?.value || 0);
          const sessions = Number(row.metricValues?.[1]?.value || 0);
          const engagementRate = Number(row.metricValues?.[2]?.value || 0);
          const rowId = createHash("md5").update(`ga4_${canonKey}`).digest("hex");

          await cmsExecute(
            `INSERT INTO ga4_page_metrics (id, page_path, canonical_page_key, views, sessions, engagement_rate, period_type, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, '28d', NOW())
             ON DUPLICATE KEY UPDATE
               page_path = VALUES(page_path),
               canonical_page_key = VALUES(canonical_page_key),
               views = VALUES(views),
               sessions = VALUES(sessions),
               engagement_rate = VALUES(engagement_rate),
               updated_at = NOW()`,
            [rowId, pagePath, canonKey, views, sessions, engagementRate]
          );
          ga4PagesStored++;
        }
      }

      // 2d. Prune stale GA4 page metrics
      await cmsExecute(
        `DELETE FROM ga4_page_metrics WHERE period_type = '28d' AND updated_at < ?`,
        [syncStartTime]
      );

      // 2e. Record GA4 sync run with true aggregate KPIs
      await cmsExecute(
        `INSERT INTO ga4_sync_runs (id, status, active_users, sessions, engaged_sessions, engagement_rate, views, key_events, window_start, window_end, started_at, completed_at)
         VALUES (?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          `ga4_run_${Date.now()}`,
          aggActiveUsers,
          aggSessions,
          aggEngagedSessions,
          aggEngagementRate,
          aggViews,
          aggKeyEvents,
          windows.currentStart,
          windows.currentEnd,
          syncStartTime,
        ]
      );

      await cmsExecute(
        `UPDATE google_connections
         SET status = 'connected', last_sync_at = NOW(), last_successful_sync_at = NOW(), last_error = NULL
         WHERE service = 'ga4'`
      );

      ga4Result = {
        success: true,
        activeUsers: aggActiveUsers,
        sessions: aggSessions,
        engagedSessions: aggEngagedSessions,
        engagementRate: aggEngagementRate,
        views: aggViews,
        keyEvents: aggKeyEvents,
        pagesStored: ga4PagesStored,
        windowStart: windows.currentStart,
        windowEnd: windows.currentEnd,
      };
    }
  } catch (err: any) {
    ga4Error = err?.message || "GA4 Sync Error";
    console.error("GA4 sync error:", err);
    await cmsExecute(
      `UPDATE google_connections SET last_error = ?, last_sync_at = NOW() WHERE service = 'ga4'`,
      [ga4Error]
    );
    await publishNotificationEvent({
      type: "google_sync_failed",
      severity: "warning",
      title: "Google Analytics 4 Sync Warning",
      message: `Failed to sync GA4 metrics: ${ga4Error}`,
      resource_type: "integration",
      resource_id: "google_ga4",
      resource_url: "/admin/analytics/",
      recipient_role: "admin",
    }).catch(() => {});
  }

  const hasGsc = Boolean(gscResult && gscResult.success);
  const hasGa4 = Boolean(ga4Result && ga4Result.success);
  const partial = (hasGsc && Boolean(ga4Error)) || (hasGa4 && Boolean(gscError));

  return {
    success: hasGsc || hasGa4,
    partial,
    gsc: gscResult || (gscError ? { success: false, error: gscError } : undefined),
    ga4: ga4Result || (ga4Error ? { success: false, error: ga4Error } : undefined),
    error: gscError && ga4Error ? `GSC: ${gscError} | GA4: ${ga4Error}` : (gscError || ga4Error || undefined),
  };
}

// ---------------------------------------------------------------------------
// Integration Statuses
// ---------------------------------------------------------------------------

export type IntegrationStatus = {
  service: "gsc" | "ga4" | "gemini" | "smtp" | "search_monitor";
  name: string;
  status: "connected" | "ready_to_connect" | "disconnected" | "error";
  propertyOrAccount?: string | null;
  accountEmail?: string | null;
  lastSyncAt?: string | null;
  lastSuccessfulSyncAt?: string | null;
  lastError?: string | null;
  requiredScopes?: string[];
  missingConfig?: string[];
};

export type GoogleEnvDiagnostics = {
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasEncryptionKey: boolean;
  isRedirectUriExplicit: boolean;
  redirectUri: string;
};

export function getGoogleEnvDiagnostics(): GoogleEnvDiagnostics {
  return {
    hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    hasEncryptionKey: Boolean(process.env.DGS_ENCRYPTION_KEY || process.env.DGS_ADMIN_SESSION_SECRET),
    isRedirectUriExplicit: Boolean(process.env.GOOGLE_REDIRECT_URI),
    redirectUri: getGoogleOAuthRedirectUri(),
  };
}

export async function getIntegrationStatuses(): Promise<IntegrationStatus[]> {
  await ensureGoogleTablesExist();
  const results: IntegrationStatus[] = [];

  // Google OAuth Credentials status
  const googleMissing: string[] = [];
  if (!process.env.GOOGLE_CLIENT_ID) googleMissing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) googleMissing.push("GOOGLE_CLIENT_SECRET");

  let gscDbConn: any = null;
  let ga4DbConn: any = null;

  if (isCmsDatabaseConfigured()) {
    try {
      const { rows } = await cmsQuery("SELECT * FROM google_connections WHERE service IN ('gsc', 'ga4')");
      for (const row of rows as any[]) {
        if (row.service === "gsc") gscDbConn = row;
        if (row.service === "ga4") ga4DbConn = row;
      }
    } catch {}
  }

  // 1. Google Search Console
  const gscConnected = gscDbConn?.status === "connected" && Boolean(gscDbConn?.encrypted_tokens);
  results.push({
    service: "gsc",
    name: "Google Search Console",
    status: gscConnected
      ? "connected"
      : googleMissing.length === 0
        ? "ready_to_connect"
        : "disconnected",
    propertyOrAccount: gscDbConn?.property_id || "https://www.dgeniussolutions.com/",
    accountEmail: gscDbConn?.account_email || null,
    lastSyncAt: gscDbConn?.last_sync_at || null,
    lastSuccessfulSyncAt: gscDbConn?.last_successful_sync_at || null,
    lastError: gscDbConn?.last_error || null,
    requiredScopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    missingConfig: googleMissing,
  });

  // 2. Google Analytics 4
  const ga4Connected = ga4DbConn?.status === "connected" && Boolean(ga4DbConn?.encrypted_tokens);
  results.push({
    service: "ga4",
    name: "Google Analytics 4",
    status: ga4Connected
      ? "connected"
      : googleMissing.length === 0
        ? "ready_to_connect"
        : "disconnected",
    propertyOrAccount: ga4DbConn?.property_id || null,
    accountEmail: ga4DbConn?.account_email || null,
    lastSyncAt: ga4DbConn?.last_sync_at || null,
    lastSuccessfulSyncAt: ga4DbConn?.last_successful_sync_at || null,
    lastError: ga4DbConn?.last_error || null,
    requiredScopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    missingConfig: googleMissing,
  });

  // 3. Gemini AI
  const geminiKey = process.env.GEMINI_API_KEY || "";
  results.push({
    service: "gemini",
    name: "Google Gemini AI (2.5 Flash)",
    status: geminiKey.length > 10 ? "connected" : "ready_to_connect",
    propertyOrAccount: geminiKey.length > 10 ? "gemini-2.5-flash & fallback: 2.5-flash-lite" : null,
    missingConfig: geminiKey.length > 10 ? [] : ["GEMINI_API_KEY"],
  });

  // 4. SMTP Email
  const smtpHost = process.env.DGS_SMTP_HOST || process.env.SMTP_HOST || "";
  const smtpUser = process.env.DGS_SMTP_USER || process.env.SMTP_USER || "";
  results.push({
    service: "smtp",
    name: "Transactional SMTP Email",
    status: smtpHost && smtpUser ? "connected" : "ready_to_connect",
    propertyOrAccount: smtpUser || "smtp.hostinger.com",
    missingConfig: !smtpHost ? ["DGS_SMTP_HOST", "DGS_SMTP_USER", "DGS_SMTP_PASS"] : [],
  });

  // 5. Google Update Monitor
  results.push({
    service: "search_monitor",
    name: "Google Search Update Monitor",
    status: "connected",
    propertyOrAccount: "Daily Cron + Status Dashboard",
    lastSyncAt: new Date().toISOString(),
  });

  return results;
}

// ---------------------------------------------------------------------------
// GSC Cached Snapshot Queries
// ---------------------------------------------------------------------------

export async function getGscDashboardMetrics(days: number = 28) {
  if (!isCmsDatabaseConfigured()) {
    return {
      connected: false,
      summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      daily: [],
      topQueries: [],
      topPages: [],
    };
  }
  await ensureGoogleTablesExist();

  try {
    const { rows: daily } = await cmsQuery(
      `SELECT metric_date, clicks, impressions, ctr, position
       FROM gsc_daily_metrics
       ORDER BY metric_date DESC
       LIMIT ?`,
      [days]
    );

    const { rows: topQueries } = await cmsQuery(
      `SELECT query_text, clicks, impressions, ctr, position
       FROM gsc_query_metrics
       WHERE period_type = '28d'
       ORDER BY clicks DESC
       LIMIT 25`
    );

    const { rows: topPages } = await cmsQuery(
      `SELECT page_url, clicks, impressions, ctr, position
       FROM gsc_page_metrics
       WHERE period_type = '28d'
       ORDER BY clicks DESC
       LIMIT 25`
    );

    // Prefer true Google aggregate metrics from latest successful sync run
    const { rows: syncRuns } = await cmsQuery<any>(
      `SELECT clicks, impressions, ctr, position
       FROM gsc_sync_runs
       WHERE status = 'completed' AND impressions > 0
       ORDER BY completed_at DESC LIMIT 1`
    );

    let totalClicks = 0;
    let totalImpressions = 0;
    let avgCtr = 0;
    let avgPos = 0;

    if (syncRuns && syncRuns.length > 0) {
      totalClicks = Number(syncRuns[0].clicks || 0);
      totalImpressions = Number(syncRuns[0].impressions || 0);
      avgCtr = Number((Number(syncRuns[0].ctr || 0) * 100).toFixed(2));
      avgPos = Number(Number(syncRuns[0].position || 0).toFixed(1));
    } else {
      let sumPos = 0;
      for (const d of daily as any[]) {
        totalClicks += Number(d.clicks || 0);
        totalImpressions += Number(d.impressions || 0);
        sumPos += Number(d.position || 0);
      }
      avgPos = daily.length > 0 ? Number((sumPos / daily.length).toFixed(1)) : 0;
      avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
    }

    return {
      connected: (daily && daily.length > 0) || (syncRuns && syncRuns.length > 0),
      summary: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: avgCtr,
        position: avgPos,
      },
      daily: (daily as any[]).reverse(),
      topQueries,
      topPages,
    };
  } catch {
    return {
      connected: false,
      summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      daily: [],
      topQueries: [],
      topPages: [],
    };
  }
}

// ---------------------------------------------------------------------------
// GA4 Cached Snapshot Queries (ZERO FAKE DATA)
// ---------------------------------------------------------------------------

export async function getGa4DashboardMetrics(days: number = 28) {
  if (!isCmsDatabaseConfigured()) {
    return {
      connected: false,
      summary: { activeUsers: 0, sessions: 0, engagedSessions: 0, engagementRate: 0, views: 0 },
      daily: [],
      topPages: [],
    };
  }
  await ensureGoogleTablesExist();

  try {
    const { rows: daily } = await cmsQuery(
      `SELECT metric_date, active_users, sessions, engaged_sessions, engagement_rate, views, key_events
       FROM ga4_daily_metrics
       ORDER BY metric_date DESC
       LIMIT ?`,
      [days]
    );

    const { rows: topPages } = await cmsQuery(
      `SELECT page_path, views, sessions, engagement_rate
       FROM ga4_page_metrics
       WHERE period_type = '28d'
       ORDER BY views DESC
       LIMIT 25`
    );

    // Prefer true GA4 aggregate KPI metrics from sync run (never sum daily active users)
    const { rows: syncRuns } = await cmsQuery<any>(
      `SELECT active_users, sessions, engaged_sessions, engagement_rate, views
       FROM ga4_sync_runs
       WHERE status = 'completed' AND (active_users > 0 OR sessions > 0)
       ORDER BY completed_at DESC LIMIT 1`
    );

    let totalActiveUsers = 0;
    let totalSessions = 0;
    let totalEngagedSessions = 0;
    let avgEngRate = 0;
    let totalViews = 0;

    if (syncRuns && syncRuns.length > 0) {
      totalActiveUsers = Number(syncRuns[0].active_users || 0);
      totalSessions = Number(syncRuns[0].sessions || 0);
      totalEngagedSessions = Number(syncRuns[0].engaged_sessions || 0);
      avgEngRate = Number((Number(syncRuns[0].engagement_rate || 0) * 100).toFixed(1));
      totalViews = Number(syncRuns[0].views || 0);
    } else {
      let sumEngRate = 0;
      for (const d of daily as any[]) {
        totalActiveUsers += Number(d.active_users || 0);
        totalSessions += Number(d.sessions || 0);
        totalEngagedSessions += Number(d.engaged_sessions || 0);
        totalViews += Number(d.views || 0);
        sumEngRate += Number(d.engagement_rate || 0);
      }
      avgEngRate = daily.length > 0 ? Number(((sumEngRate / daily.length) * 100).toFixed(1)) : 0;
    }

    return {
      connected: (daily && daily.length > 0) || (syncRuns && syncRuns.length > 0),
      summary: {
        activeUsers: totalActiveUsers,
        sessions: totalSessions,
        engagedSessions: totalEngagedSessions,
        engagementRate: avgEngRate,
        views: totalViews,
      },
      daily: (daily as any[]).reverse(),
      topPages,
    };
  } catch {
    return {
      connected: false,
      summary: { activeUsers: 0, sessions: 0, engagedSessions: 0, engagementRate: 0, views: 0 },
      daily: [],
      topPages: [],
    };
  }
}
