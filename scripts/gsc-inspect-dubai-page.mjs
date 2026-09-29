import fs from "node:fs";
import mysql from "mysql2/promise";
import { createHash, createDecipheriv } from "node:crypto";

function loadEnv() {
  for (const envFile of [
    "/home/u188101251/production-app/shared/.env.production",
    "/home/u188101251/production-app/current/.env.production",
    ".env.production",
    ".env.local",
    ".env"
  ]) {
    if (fs.existsSync(envFile)) {
      for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
        const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
        }
      }
    }
  }
}

loadEnv();

const ALGORITHM = "aes-256-gcm";
function decryptSecret(encryptedPayload) {
  try {
    const rawKey = process.env.DGS_ENCRYPTION_KEY || process.env.DGS_ADMIN_SESSION_SECRET || "dgs-secure-encryption-key-32bytes!";
    const key = createHash("sha256").update(rawKey).digest();
    const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(":");
    if (!ivHex || !authTagHex || !encryptedText) return null;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

async function run() {
  const pool = mysql.createPool({
    host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
  });

  console.log("=== CHECKING GOOGLE SEARCH CONSOLE TELEMETRY & CONNECTION ===");

  // 1. Check GSC metrics from DB for the Dubai AI Video page
  const targetUrl = "https://www.dgeniussolutions.com/services/ai-production-dubai-page/";
  const [metricRows] = await pool.query(
    "SELECT * FROM gsc_page_metrics WHERE page_url = ? OR page_url = ? ORDER BY updated_at DESC",
    [targetUrl, targetUrl.replace(/\/$/, "")]
  );
  console.log("\n1. Database GSC Page Metrics for Dubai page:", metricRows);

  const [queryRows] = await pool.query(
    "SELECT query_text, clicks, impressions, position, period_type, updated_at FROM gsc_page_query_metrics WHERE page_url = ? OR page_url = ? ORDER BY impressions DESC",
    [targetUrl, targetUrl.replace(/\/$/, "")]
  );
  console.log("\n2. Database GSC Queries for Dubai page:", queryRows);

  // 2. Check Google Connection tokens in DB
  const [connRows] = await pool.query("SELECT * FROM google_connections WHERE service = 'search_console'");
  if (!connRows || connRows.length === 0) {
    console.log("\nNo search_console row in google_connections table.");
    await pool.end();
    return;
  }

  const conn = connRows[0];
  console.log("\n3. Google Connection found:", {
    service: conn.service,
    account_email: conn.account_email,
    search_console_property: conn.search_console_property,
    updated_at: conn.updated_at,
  });

  const decryptedToken = decryptSecret(conn.access_token_encrypted);
  const refreshToken = decryptSecret(conn.refresh_token_encrypted);

  let accessToken = decryptedToken;
  // If expired or refresh needed, refresh it
  if (conn.token_expiry && new Date(conn.token_expiry) <= new Date()) {
    console.log("Access token expired, refreshing with Google OAuth...");
    const params = new URLSearchParams({
      client_id: process.env.DGS_GOOGLE_CLIENT_ID,
      client_secret: process.env.DGS_GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json();
    if (data.access_token) {
      accessToken = data.access_token;
      console.log("Successfully refreshed access token.");
    } else {
      console.log("Failed to refresh token:", data);
    }
  }

  if (!accessToken) {
    console.log("No valid access token available.");
    await pool.end();
    return;
  }

  // 3. Call URL Inspection API
  console.log("\n4. Calling Google Search Console URL Inspection API...");
  const siteUrl = conn.search_console_property || "sc-domain:dgeniussolutions.com";
  const inspectRes = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inspectionUrl: targetUrl,
      siteUrl: siteUrl,
    }),
  });

  console.log("Inspection API HTTP Status:", inspectRes.status);
  const inspectData = await inspectRes.json();
  console.log("Inspection API Result:\n", JSON.stringify(inspectData, null, 2));

  await pool.end();
}

run().catch(console.error);
