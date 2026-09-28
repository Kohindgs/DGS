/**
 * scripts/monitor-cms-health-cron.mjs
 * 
 * DGS V8.8.4 Non-Destructive CMS Health Monitor
 * 
 * Probes:
 *   - / (Homepage) -> Expects HTTP 200
 *   - /admin/login/ -> Expects HTTP 200
 * 
 * Rules:
 *   - Non-destructive: Probes public endpoints without mutating state
 *   - ALERT ONLY: If CMS fails, prints alert to stderr/stdout; DO NOT auto-deploy or auto-rollback
 *   - Records: timestamp, HTTP status, release BUILD_ID, healthy flag
 *   - Output log: data/audit/cms-health-monitor.log
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOG_FILE = path.join(ROOT, "data/audit/cms-health-monitor.log");
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com").replace(/\/$/, "");

export async function probeUrl(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "DGS-Health-Monitor/1.0 (+https://www.dgeniussolutions.com)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "manual",
    });
    const durationMs = Date.now() - start;
    const body = await res.text();

    // Extract BUILD_ID from script tag or next-f if present
    const buildIdMatch = body.match(/"b":"([^"]+)"/) || body.match(/\/_next\/static\/([^/]+)\/_buildManifest\.js/);
    const buildId = buildIdMatch ? buildIdMatch[1] : "UNKNOWN";

    return {
      status: res.status,
      durationMs,
      buildId,
      location: res.headers.get("location") || null,
      ok: res.status === 200,
      bodyExcerpt: body.slice(0, 200),
    };
  } catch (err) {
    return {
      status: 0,
      durationMs: Date.now() - start,
      buildId: "UNREACHABLE",
      location: null,
      ok: false,
      error: err.message,
    };
  }
}

export async function runHealthCheck() {
  const timestamp = new Date().toISOString();
  const homeRes = await probeUrl(`${SITE_URL}/`);
  const loginRes = await probeUrl(`${SITE_URL}/admin/login/`);

  const healthy = homeRes.ok && loginRes.ok;
  const buildId = loginRes.buildId !== "UNKNOWN" ? loginRes.buildId : homeRes.buildId;

  let alert = null;
  if (!homeRes.ok) {
    alert = `[ALERT] Homepage returned HTTP ${homeRes.status} (expected 200)`;
  }
  if (!loginRes.ok) {
    const loginMsg = `[ALERT] Admin login returned HTTP ${loginRes.status} (expected 200)`;
    alert = alert ? `${alert}; ${loginMsg}` : loginMsg;
  }

  const record = {
    timestamp,
    siteUrl: SITE_URL,
    homeStatus: homeRes.status,
    homeDurationMs: homeRes.durationMs,
    loginStatus: loginRes.status,
    loginDurationMs: loginRes.durationMs,
    buildId,
    healthy,
    alert,
  };

  // Ensure log directory exists
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.appendFileSync(LOG_FILE, JSON.stringify(record) + "\n", "utf8");

  if (!healthy) {
    console.error(`\n🚨 [CMS HEALTH MONITOR ALERT] at ${timestamp}`);
    console.error(`   ${alert}`);
    console.error(`   Recorded: Home=${homeRes.status}, Login=${loginRes.status}, BuildID=${buildId}`);
    console.error(`   NOTICE: DO NOT auto-deploy or auto-rollback. Alert only.`);
  } else {
    console.log(`✓ [CMS HEALTH MONITOR] at ${timestamp}: Home=200, Login=200, BuildID=${buildId} (Healthy)`);
  }

  return record;
}

// Execution entry point
if (process.argv[1] && process.argv[1].endsWith("monitor-cms-health-cron.mjs")) {
  const isLoop = process.argv.includes("--daemon") || process.argv.includes("--interval");
  
  if (isLoop) {
    console.log("Starting 15-minute periodic CMS health monitoring...");
    runHealthCheck();
    setInterval(runHealthCheck, 15 * 60 * 1000);
  } else {
    runHealthCheck()
      .then((record) => {
        if (!record.healthy) {
          process.exitCode = 1;
        }
      })
      .catch((err) => {
        console.error("Monitor failed:", err);
        process.exitCode = 1;
      });
  }
}
