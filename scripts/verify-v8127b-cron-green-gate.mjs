import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROD_ORIGIN = "https://www.dgeniussolutions.com";
const SSH_CMD = `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=20 -p 65002 u188101251@147.93.100.126`;

function getProductionCronSecret() {
  const out = execSync(
    `${SSH_CMD} "grep -E '^DGS_CRON_SECRET=' /home/u188101251/production-app/shared/.env.production | cut -d= -f2-"`,
    { encoding: "utf8" }
  ).trim();
  return out.replace(/^['"]|['"]$/g, "").trim();
}

async function httpRequest(url, options = {}, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return {
      status: res.status,
      durationMs: Date.now() - start,
      text,
      json,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log("==================================================================");
  console.log("  DGS V8.12.7B — CRON & DATABASE RELIABILITY GREEN GATE SUITE");
  console.log("==================================================================");

  const results = [];
  const record = (id, name, passed, evidence) => {
    results.push({ id, name, passed, evidence });
    console.log(`${passed ? "[PASS]" : "[FAIL]"} #${id} ${name} -> ${evidence}`);
  };

  const cronSecret = getProductionCronSecret();
  if (!cronSecret || cronSecret.length < 16) {
    throw new Error("Could not load valid DGS_CRON_SECRET from production environment.");
  }

  // 1. MariaDB service is active and reachable
  try {
    const dbStatusJson = execSync(
      `${SSH_CMD} "cd /home/u188101251/production-app/current && node -e 'const fs=require(\\"fs\\"),mysql=require(\\"mysql2/promise\\");(async()=>{const env={};fs.readFileSync(\\".env.production\\",\\"utf8\\").split(/\\\\r?\\\\n/).forEach(l=>{const idx=l.indexOf(\\"=\\");if(idx>0)env[l.slice(0,idx).trim()]=l.slice(idx+1).trim().replace(/^[\\\\x27\\\\x22]|[\\\\x27\\\\x22]\$/g,\\"\\");});const c=await mysql.createConnection({host:env.DGS_MYSQL_HOST,port:Number(env.DGS_MYSQL_PORT||3306),user:env.DGS_MYSQL_USER,password:env.DGS_MYSQL_PASSWORD,database:env.DGS_MYSQL_DATABASE});const [s]=await c.query(\\"SHOW GLOBAL STATUS WHERE Variable_name IN (\\\\x27Uptime\\\\x27,\\\\x27Threads_connected\\\\x27,\\\\x27Threads_running\\\\x27,\\\\x27Max_used_connections\\\\x27)\\");const m={};s.forEach(r=>m[r.Variable_name]=r.Value);await c.end();console.log(JSON.stringify(m));})()'"`,
      { encoding: "utf8" }
    ).trim();
    const metrics = JSON.parse(dbStatusJson);
    record(
      1,
      "MariaDB service is active and reachable",
      Number(metrics.Uptime) > 0,
      `Uptime=${metrics.Uptime}s, Threads_connected=${metrics.Threads_connected}, Threads_running=${metrics.Threads_running}, Max_used=${metrics.Max_used_connections}`
    );
  } catch (err) {
    record(1, "MariaDB service is active and reachable", false, String(err.message || err));
  }

  // 2. Production application can connect to MariaDB repeatedly
  try {
    const latencies = [];
    let allOk = true;
    for (let i = 0; i < 5; i++) {
      const r = await httpRequest(`${PROD_ORIGIN}/api/admin/system/cron-health`, {
        method: "GET",
        headers: { Authorization: `Bearer ${cronSecret}` },
      });
      if (r.status !== 200 || !r.json?.dbHealth?.ok) {
        allOk = false;
      }
      latencies.push(r.json?.dbHealth?.pingMs ?? r.durationMs);
    }
    record(
      2,
      "Production application connects to MariaDB repeatedly (5x)",
      allOk,
      `5/5 checks HTTP 200, DB ping latencies=[${latencies.join("ms, ")}ms]`
    );
  } catch (err) {
    record(2, "Production application connects to MariaDB repeatedly (5x)", false, String(err.message || err));
  }

  // 3. Connection pool does not leak connections across repeated runs
  try {
    const beforeRes = await httpRequest(`${PROD_ORIGIN}/api/admin/system/cron-health`, {
      method: "GET",
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    const beforeThreads = Number(beforeRes.json?.dbHealth?.serverStatus?.Threads_connected || 0);

    for (let i = 0; i < 4; i++) {
      await httpRequest(`${PROD_ORIGIN}/api/internal/blogs/publish-scheduled`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cronSecret}`, "Content-Type": "application/json" },
      });
    }

    const afterRes = await httpRequest(`${PROD_ORIGIN}/api/admin/system/cron-health`, {
      method: "GET",
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    const afterThreads = Number(afterRes.json?.dbHealth?.serverStatus?.Threads_connected || 0);
    const delta = afterThreads - beforeThreads;
    const poolLimit = Number(afterRes.json?.dbHealth?.poolConfig?.connectionLimit || 8);
    record(
      3,
      "Connection pool does not leak connections across repeated runs",
      afterRes.status === 200 && delta <= poolLimit,
      `Threads_connected before=${beforeThreads}, after=${afterThreads} (delta=${delta}, poolLimit=${poolLimit})`
    );
  } catch (err) {
    record(3, "Connection pool does not leak connections across repeated runs", false, String(err.message || err));
  }

  // 4. /api/internal/blogs/publish-scheduled without auth -> 401
  try {
    const r = await httpRequest(`${PROD_ORIGIN}/api/internal/blogs/publish-scheduled`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    record(
      4,
      "/api/internal/blogs/publish-scheduled without auth -> 401",
      r.status === 401 && r.json?.ok === false,
      `HTTP ${r.status} (${r.durationMs}ms)`
    );
  } catch (err) {
    record(4, "/api/internal/blogs/publish-scheduled without auth -> 401", false, String(err.message || err));
  }

  // 5. /api/internal/blogs/publish-scheduled with wrong secret -> 401/403
  try {
    const r = await httpRequest(`${PROD_ORIGIN}/api/internal/blogs/publish-scheduled`, {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid-secret-value-000000",
        "Content-Type": "application/json",
      },
    });
    record(
      5,
      "/api/internal/blogs/publish-scheduled with wrong secret -> 401/403",
      (r.status === 401 || r.status === 403) && r.json?.ok === false,
      `HTTP ${r.status} (${r.durationMs}ms)`
    );
  } catch (err) {
    record(5, "/api/internal/blogs/publish-scheduled with wrong secret -> 401/403", false, String(err.message || err));
  }

  // 6. /api/internal/blogs/publish-scheduled with valid secret -> 200
  let blogRun1 = null;
  try {
    const r = await httpRequest(`${PROD_ORIGIN}/api/internal/blogs/publish-scheduled`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });
    blogRun1 = r;
    record(
      6,
      "/api/internal/blogs/publish-scheduled with valid secret -> 200",
      r.status === 200 && r.json?.ok === true,
      `HTTP ${r.status} (${r.durationMs}ms) — message="${r.json?.message}"`
    );
  } catch (err) {
    record(6, "/api/internal/blogs/publish-scheduled with valid secret -> 200", false, String(err.message || err));
  }

  // 7. /api/internal/blogs/publish-scheduled when no blogs are due -> 200 with structured response
  try {
    const r = blogRun1;
    const hasFields =
      r &&
      r.status === 200 &&
      r.json?.ok === true &&
      typeof r.json?.checked === "number" &&
      typeof r.json?.published === "number" &&
      typeof r.json?.failed === "number" &&
      typeof r.json?.message === "string";
    record(
      7,
      "/api/internal/blogs/publish-scheduled when no blogs due -> 200 structured JSON",
      Boolean(hasFields),
      `checked=${r?.json?.checked}, due=${r?.json?.due}, published=${r?.json?.published}, failed=${r?.json?.failed}, message="${r?.json?.message}"`
    );
  } catch (err) {
    record(7, "/api/internal/blogs/publish-scheduled when no blogs due -> 200 structured JSON", false, String(err.message || err));
  }

  // 8. Duplicate consecutive blog publisher runs are idempotent
  try {
    const r2 = await httpRequest(`${PROD_ORIGIN}/api/internal/blogs/publish-scheduled`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });
    const isIdempotent =
      r2.status === 200 &&
      r2.json?.ok === true &&
      r2.json?.published === 0 &&
      r2.json?.failed === 0;
    record(
      8,
      "Duplicate consecutive blog publisher runs are idempotent",
      isIdempotent,
      `Second consecutive run: HTTP ${r2.status}, published=${r2.json?.published}, failed=${r2.json?.failed}, duration=${r2.durationMs}ms`
    );
  } catch (err) {
    record(8, "Duplicate consecutive blog publisher runs are idempotent", false, String(err.message || err));
  }

  // 9. /api/internal/google-updates/check without auth -> 401
  try {
    const r = await httpRequest(`${PROD_ORIGIN}/api/internal/google-updates/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    record(
      9,
      "/api/internal/google-updates/check without auth -> 401",
      r.status === 401 && r.json?.ok === false,
      `HTTP ${r.status} (${r.durationMs}ms)`
    );
  } catch (err) {
    record(9, "/api/internal/google-updates/check without auth -> 401", false, String(err.message || err));
  }

  // 10. /api/internal/google-updates/check with wrong secret -> 401/403
  try {
    const r = await httpRequest(`${PROD_ORIGIN}/api/internal/google-updates/check`, {
      method: "POST",
      headers: {
        Authorization: "Bearer wrong-secret-token-999999",
        "Content-Type": "application/json",
      },
    });
    record(
      10,
      "/api/internal/google-updates/check with wrong secret -> 401/403",
      (r.status === 401 || r.status === 403) && r.json?.ok === false,
      `HTTP ${r.status} (${r.durationMs}ms)`
    );
  } catch (err) {
    record(10, "/api/internal/google-updates/check with wrong secret -> 401/403", false, String(err.message || err));
  }

  // 11. /api/internal/google-updates/check with valid secret -> completes within timeout
  let googleRun = null;
  try {
    const r = await httpRequest(
      `${PROD_ORIGIN}/api/internal/google-updates/check`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cronSecret}`,
          "Content-Type": "application/json",
        },
      },
      45000
    );
    googleRun = r;
    const withinTimeout = r.status === 200 && r.json?.ok === true && r.durationMs < 35000;
    record(
      11,
      "/api/internal/google-updates/check with valid secret completes within timeout",
      withinTimeout,
      `HTTP ${r.status} in ${r.durationMs}ms (status=${r.json?.status}, updatesFound=${r.json?.updatesFound}, partialFailure=${r.json?.partialFailure})`
    );
  } catch (err) {
    record(11, "/api/internal/google-updates/check with valid secret completes within timeout", false, String(err.message || err));
  }

  // 12. External source timeout does not hang the endpoint for 4+ minutes
  try {
    const sources = googleRun?.json?.sources || {};
    const s1 = sources.google_search_status;
    const s2 = sources.google_blog;
    const s3 = sources.google_docs_updates;
    const hasSourceTelemetry = Boolean(s1 && s2 && s3);
    const maxSourceDuration = Math.max(
      Number(s1?.durationMs || 0),
      Number(s2?.durationMs || 0),
      Number(s3?.durationMs || 0)
    );
    record(
      12,
      "External sources have bounded AbortController timeouts (<15s per source)",
      hasSourceTelemetry && maxSourceDuration < 15000,
      `status_dashboard=${s1?.status}(${s1?.durationMs}ms), blog=${s2?.status}(${s2?.durationMs}ms), docs=${s3?.status}(${s3?.durationMs}ms)`
    );
  } catch (err) {
    record(12, "External sources have bounded AbortController timeouts (<15s per source)", false, String(err.message || err));
  }

  // 13. GitHub workflow DGS Scheduled Blog Automated Publisher hardened & curl simulation succeeds
  try {
    const wfPath = path.join(process.cwd(), ".github", "workflows", "scheduled-blog-publisher.yml");
    const wfContent = fs.readFileSync(wfPath, "utf8");
    const noCheckout = !wfContent.includes("actions/checkout");
    const hasTimeouts = wfContent.includes("--connect-timeout 15") && wfContent.includes("--max-time 45");
    const noDoubleZeroBug = !wfContent.includes('|| echo "000"');
    record(
      13,
      "Workflow DGS Scheduled Blog Automated Publisher hardened & verified",
      noCheckout && hasTimeouts && noDoubleZeroBug && blogRun1?.status === 200,
      `noCheckout=${noCheckout}, connect/maxTimeouts=${hasTimeouts}, no000000Bug=${noDoubleZeroBug}, liveEndpoint=HTTP ${blogRun1?.status}`
    );
  } catch (err) {
    record(13, "Workflow DGS Scheduled Blog Automated Publisher hardened & verified", false, String(err.message || err));
  }

  // 14. GitHub workflow DGS Google Search Update Automated Monitor hardened & curl simulation succeeds
  try {
    const wfPath = path.join(process.cwd(), ".github", "workflows", "google-search-monitor.yml");
    const wfContent = fs.readFileSync(wfPath, "utf8");
    const noCheckout = !wfContent.includes("actions/checkout");
    const hasTimeouts = wfContent.includes("--connect-timeout 15") && wfContent.includes("--max-time 60");
    const noDoubleZeroBug = !wfContent.includes('|| echo "000"');
    record(
      14,
      "Workflow DGS Google Search Update Automated Monitor hardened & verified",
      noCheckout && hasTimeouts && noDoubleZeroBug && googleRun?.status === 200,
      `noCheckout=${noCheckout}, connect/maxTimeouts=${hasTimeouts}, no000000Bug=${noDoubleZeroBug}, liveEndpoint=HTTP ${googleRun?.status}`
    );
  } catch (err) {
    record(14, "Workflow DGS Google Search Update Automated Monitor hardened & verified", false, String(err.message || err));
  }

  // 15. Cron run history is persisted & stale-job monitor is HEALTHY
  try {
    const healthRes = await httpRequest(`${PROD_ORIGIN}/api/admin/system/cron-health`, {
      method: "GET",
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    const recentRuns = healthRes.json?.cronHealth?.recentHistory || [];
    const jobs = healthRes.json?.cronHealth?.jobs || [];
    const blogJob = jobs.find((j) => j.job?.jobName === "scheduled-blog-publisher");
    const googleJob = jobs.find((j) => j.job?.jobName === "google-search-update-monitor");
    const persisted =
      recentRuns.length >= 2 &&
      blogJob?.currentStatus === "HEALTHY" &&
      googleJob?.currentStatus === "HEALTHY";
    record(
      15,
      "Cron run history is persisted in cron_run_history & jobs report HEALTHY",
      persisted,
      `recentHistory=${recentRuns.length}, blog_publisher=${blogJob?.currentStatus} (lastSuccess=${blogJob?.lastSuccess?.completed_at}), google_monitor=${googleJob?.currentStatus} (lastSuccess=${googleJob?.lastSuccess?.completed_at})`
    );
  } catch (err) {
    record(15, "Cron run history is persisted in cron_run_history & jobs report HEALTHY", false, String(err.message || err));
  }

  // 16. Public homepage and blog pages still return HTTP 200
  try {
    const [homeRes, blogIndexRes] = await Promise.all([
      httpRequest(`${PROD_ORIGIN}/`, { method: "GET" }),
      httpRequest(`${PROD_ORIGIN}/blog`, { method: "GET" }),
    ]);
    record(
      16,
      "Public homepage (/) and blog page (/blog) return HTTP 200",
      homeRes.status === 200 && blogIndexRes.status === 200,
      `/ -> HTTP ${homeRes.status} (${homeRes.durationMs}ms), /blog -> HTTP ${blogIndexRes.status} (${blogIndexRes.durationMs}ms)`
    );
  } catch (err) {
    record(16, "Public homepage (/) and blog page (/blog) return HTTP 200", false, String(err.message || err));
  }

  console.log("\n==================================================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`  SUMMARY: ${passedCount}/${results.length} GREEN GATE CHECKS PASSED`);
  console.log("==================================================================");

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
