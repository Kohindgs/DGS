import fs from "node:fs/promises";

const BASE_URL = "https://www.dgeniussolutions.com";

async function main() {
  const laneId = process.argv[2] || "ARTICLE_CONTRIBUTIONS";
  console.log(`=== RUNNING LANE: ${laneId} ===`);

  const envContent = await fs.readFile(".env.production", "utf8");
  const get = (k) => (envContent.split(/\r?\n/).find((l) => l.startsWith(`${k}=`)) || "").slice(k.length + 1).trim().replace(/^['"](.*)['"]$/, "$1");
  const body = new URLSearchParams({ email: get("DGS_ADMIN_EMAIL"), password: get("DGS_ADMIN_PASSWORD") });
  const auth = await fetch(`${BASE_URL}/api/admin/session`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString(), redirect: "manual" });
  const cookie = (auth.headers.get("set-cookie") || "").split(";")[0];
  const headers = { Cookie: cookie, "Content-Type": "application/json" };

  const runRes = await fetch(`${BASE_URL}/api/admin/off-page/lanes`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action: "run", lane: laneId, maxQueries: 2, perQuery: 8 }),
  });
  console.log("Run response:", await runRes.json());

  console.log("Waiting for lane to finish...");
  let done = false;
  let attempts = 0;
  while (!done && attempts < 25) {
    await new Promise((r) => setTimeout(r, 3000));
    attempts++;
    const checkRes = await fetch(`${BASE_URL}/api/admin/off-page/lanes`, { headers });
    const checkJson = await checkRes.json();
    const isRunning = (checkJson.running || []).some((r) => r.lane === laneId);
    if (!isRunning) {
      done = true;
      const lastRun = (checkJson.recentRuns || [])[0];
      console.log("\nLane run completed!");
      console.log(JSON.stringify(lastRun, null, 2));
    } else {
      process.stdout.write(".");
    }
  }
}

main().catch(console.error);
