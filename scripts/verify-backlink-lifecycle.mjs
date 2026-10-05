import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const PROD_URL = "https://www.dgeniussolutions.com";

async function main() {
  console.log("================================================================================");
  console.log("DGS V8.12.3 LIVE BACKLINK LIFECYCLE & TELEMETRY VERIFICATION");
  console.log("TARGET: " + PROD_URL);
  console.log("================================================================================\n");

  // 1. Read production env
  const envContent = fs.readFileSync(".env.production", "utf8");
  const cfg = {};
  for (const line of envContent.split(/\r?\n/)) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      const val = line.slice(idx + 1).trim();
      cfg[line.slice(0, idx).trim()] = val.replace(/^['"]/, "").replace(/['"]$/, "");
    }
  }

  // 2. Connect to MariaDB
  const db = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || "127.0.0.1",
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  console.log("1. Preparing backlink test data in MariaDB...");

  // Remove dummy/broken test domain
  await db.query("DELETE FROM off_page_backlinks WHERE source_url LIKE '%test-partner-domain.org%'");
  console.log("✓ Removed dummy test-partner-domain.org record");

  // Ensure controlled test records exist
  const testBacklinks = [
    {
      id: "lnk_fixture_live_01",
      source_domain: "dgeniussolutions.com",
      source_url: `${PROD_URL}/api/test-fixtures/backlink-partner?mode=live`,
      target_url: `${PROD_URL}/`,
      anchor_text: "D'Genius Solutions Official",
      anchor_classification: "BRANDED",
      link_rel: "dofollow",
      dofollow: 1,
      nofollow: 0,
      status: "NEW",
      http_status: 200,
      source_country: "India",
      source_region: "GLOBAL",
      topical_category: "Partner Network",
      authority_score: 90,
    },
    {
      id: "lnk_external_lost_02",
      source_domain: "httpbin.org",
      source_url: "https://httpbin.org/html",
      target_url: `${PROD_URL}/`,
      anchor_text: "D'Genius Solutions",
      anchor_classification: "BRANDED",
      link_rel: "dofollow",
      dofollow: 1,
      nofollow: 0,
      status: "NEW",
      http_status: 200,
      source_country: "USA",
      source_region: "GLOBAL",
      topical_category: "Literature Publication",
      authority_score: 85,
    },
    {
      id: "lnk_external_broken_03",
      source_domain: "httpbin.org",
      source_url: "https://httpbin.org/status/404",
      target_url: `${PROD_URL}/`,
      anchor_text: "D'Genius Solutions",
      anchor_classification: "BRANDED",
      link_rel: "dofollow",
      dofollow: 1,
      nofollow: 0,
      status: "NEW",
      http_status: 404,
      source_country: "USA",
      source_region: "GLOBAL",
      topical_category: "Archived Web Resource",
      authority_score: 80,
    },
  ];

  for (const b of testBacklinks) {
    await db.query(
      `INSERT INTO off_page_backlinks (
        id, source_domain, source_url, target_url, target_page_type,
        anchor_text, anchor_classification, link_rel, dofollow, nofollow,
        first_seen_at, last_seen_at, status, http_status, source_country,
        source_region, topical_category, authority_score, check_priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'HOMEPAGE', ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, 'P0', NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        source_url = VALUES(source_url),
        status = VALUES(status),
        anchor_text = VALUES(anchor_text),
        link_rel = VALUES(link_rel),
        dofollow = VALUES(dofollow),
        nofollow = VALUES(nofollow)`,
      [
        b.id,
        b.source_domain,
        b.source_url,
        b.target_url,
        b.anchor_text,
        b.anchor_classification,
        b.link_rel,
        b.dofollow,
        b.nofollow,
        b.status,
        b.http_status,
        b.source_country,
        b.source_region,
        b.topical_category,
        b.authority_score,
      ]
    );
  }
  console.log(`✓ Synchronized ${testBacklinks.length} authentic test backlink records in DB.`);

  // 3. Acquire admin session
  console.log("\n2. Authenticating as Admin...");
  const loginParams = new URLSearchParams();
  loginParams.set("email", cfg.DGS_ADMIN_EMAIL);
  loginParams.set("password", cfg.DGS_ADMIN_PASSWORD);

  const loginRes = await fetch(`${PROD_URL}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: loginParams.toString(),
    redirect: "manual",
  });

  const cookieHeader = loginRes.headers.get("set-cookie");
  if (!cookieHeader) throw new Error("Failed acquiring admin session");
  const sessionCookie = cookieHeader.split(";")[0];
  console.log(`✓ Admin session acquired: ${sessionCookie.slice(0, 24)}...`);

  const authHeaders = {
    Cookie: sessionCookie,
    "Content-Type": "application/json",
  };

  // 4. Run batch backlink check
  console.log("\n3. Testing 'Check Backlinks Now' Batch Crawler (/api/admin/off-page/backlinks/check)...");
  const batchRes = await fetch(`${PROD_URL}/api/admin/off-page/backlinks/check`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({}),
  });
  const batchJson = await batchRes.json();
  console.log("Batch Check Summary:", {
    ok: batchJson.ok,
    checked: batchJson.checked,
    live: batchJson.live,
    lost: batchJson.lost,
    broken: batchJson.broken,
  });

  const results = batchJson.batchResults || [];
  const recA = results.find((r) => r.id === "lnk_fixture_live_01");
  const recB = results.find((r) => r.id === "lnk_external_lost_02");
  const recC = results.find((r) => r.id === "lnk_external_broken_03");

  console.log("\nBatch Check Verification:");
  console.log("  Record A (Controlled Fixture):", {
    status: recA?.status,
    httpStatus: recA?.httpStatus,
    linkFound: recA?.linkFound,
    anchorText: recA?.anchorText,
    linkRel: recA?.linkRel,
  });
  console.log("  Record B (External Reachable / Link Lost):", {
    status: recB?.status,
    httpStatus: recB?.httpStatus,
    linkFound: recB?.linkFound,
  });
  console.log("  Record C (External 404 / Broken Link):", {
    status: recC?.status,
    httpStatus: recC?.httpStatus,
  });

  if (recA?.status !== "LIVE") throw new Error(`Expected Record A status LIVE, got ${recA?.status}`);
  if (recB?.status !== "LOST") throw new Error(`Expected Record B status LOST, got ${recB?.status}`);
  if (recC?.status !== "BROKEN") throw new Error(`Expected Record C status BROKEN, got ${recC?.status}`);
  console.log("✓ Batch check verified: LIVE, LOST, and BROKEN accurately detected!");

  // 5. Test Controlled LIVE -> LOST Transition
  console.log("\n4. Testing Controlled LIVE -> LOST Transition...");
  await db.query(
    "UPDATE off_page_backlinks SET source_url = ? WHERE id = 'lnk_fixture_live_01'",
    [`${PROD_URL}/api/test-fixtures/backlink-partner?mode=lost`]
  );
  console.log("  Updated Record A source_url to mode=lost (link absent from HTML)");

  const checkLostRes = await fetch(`${PROD_URL}/api/admin/off-page/backlinks/check`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ id: "lnk_fixture_live_01" }),
  });
  const checkLostJson = await checkLostRes.json();
  const lostRes = checkLostJson.result;
  console.log("  Crawler Response for Record A:", {
    status: lostRes?.status,
    linkFound: lostRes?.linkFound,
    changesDetected: lostRes?.changesDetected,
    alertTriggered: lostRes?.alertTriggered,
  });

  if (lostRes?.status !== "LOST" || lostRes?.linkFound !== false) {
    throw new Error(`LIVE -> LOST transition failed: ${JSON.stringify(lostRes)}`);
  }
  const [[dbLost]] = await db.query(
    "SELECT status, lost_at, last_checked_at FROM off_page_backlinks WHERE id = 'lnk_fixture_live_01'"
  );
  console.log("  MariaDB Persisted State:", dbLost);
  if (dbLost.status !== "LOST" || !dbLost.lost_at) {
    throw new Error("MariaDB failed to record LOST status or lost_at timestamp");
  }
  console.log("✓ LIVE -> LOST Transition VERIFIED in database and API!");

  // 6. Test Controlled LOST -> RESTORED Transition
  console.log("\n5. Testing Controlled LOST -> RESTORED Transition...");
  await db.query(
    "UPDATE off_page_backlinks SET source_url = ? WHERE id = 'lnk_fixture_live_01'",
    [`${PROD_URL}/api/test-fixtures/backlink-partner?mode=live`]
  );
  console.log("  Restored Record A source_url to mode=live (link restored to HTML)");

  const checkRestoredRes = await fetch(`${PROD_URL}/api/admin/off-page/backlinks/check`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ id: "lnk_fixture_live_01" }),
  });
  const checkRestoredJson = await checkRestoredRes.json();
  const restoredRes = checkRestoredJson.result;
  console.log("  Crawler Response for Record A:", {
    status: restoredRes?.status,
    linkFound: restoredRes?.linkFound,
    changesDetected: restoredRes?.changesDetected,
    alertTriggered: restoredRes?.alertTriggered,
  });

  if (restoredRes?.status !== "LIVE" || restoredRes?.linkFound !== true) {
    throw new Error(`LOST -> RESTORED transition failed: ${JSON.stringify(restoredRes)}`);
  }
  const [[dbRestored]] = await db.query(
    "SELECT status, reclaimed_at, live_at, last_checked_at FROM off_page_backlinks WHERE id = 'lnk_fixture_live_01'"
  );
  console.log("  MariaDB Persisted State:", dbRestored);
  if (dbRestored.status !== "LIVE" || !dbRestored.reclaimed_at) {
    throw new Error("MariaDB failed to record LIVE status or reclaimed_at timestamp on restoration");
  }
  console.log("✓ LOST -> RESTORED Transition VERIFIED in database and API!");

  // 7. Test REL_CHANGED Detection (dofollow -> nofollow)
  console.log("\n6. Testing REL_CHANGED Detection (dofollow -> nofollow)...");
  await db.query(
    "UPDATE off_page_backlinks SET source_url = ? WHERE id = 'lnk_fixture_live_01'",
    [`${PROD_URL}/api/test-fixtures/backlink-partner?mode=rel_changed`]
  );

  const checkRelRes = await fetch(`${PROD_URL}/api/admin/off-page/backlinks/check`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ id: "lnk_fixture_live_01" }),
  });
  const checkRelJson = await checkRelRes.json();
  const relRes = checkRelJson.result;
  console.log("  Crawler Response for Record A:", {
    status: relRes?.status,
    linkRel: relRes?.linkRel,
    changesDetected: relRes?.changesDetected,
    alertTriggered: relRes?.alertTriggered,
  });

  if (!relRes?.linkRel?.includes("nofollow")) {
    throw new Error("REL_CHANGED detection failed");
  }
  console.log("✓ REL_CHANGED Detection VERIFIED!");

  // 8. Restore Record A to clean LIVE state
  await db.query(
    "UPDATE off_page_backlinks SET source_url = ?, status = 'LIVE' WHERE id = 'lnk_fixture_live_01'",
    [`${PROD_URL}/api/test-fixtures/backlink-partner?mode=live`]
  );
  await fetch(`${PROD_URL}/api/admin/off-page/backlinks/check`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ id: "lnk_fixture_live_01" }),
  });
  console.log("✓ Record A reset to healthy LIVE state.");

  console.log("\n================================================================================");
  console.log("ALL BACKLINK LIFECYCLE GATES (Sections 29, 30, 31, 32, 55) PASSED 100%!");
  console.log("================================================================================");

  await db.end();
}

main().catch((err) => {
  console.error("FATAL ERROR in backlink lifecycle suite:", err);
  process.exit(1);
});
