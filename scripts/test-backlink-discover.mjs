import fs from "node:fs/promises";

async function test() {
  const envContent = await fs.readFile(".env.production", "utf8");
  const get = (k) => (envContent.split(/\r?\n/).find((l) => l.startsWith(`${k}=`)) || "").slice(k.length + 1).trim().replace(/^['"](.*)['"]$/, "$1");
  const body = new URLSearchParams({ email: get("DGS_ADMIN_EMAIL"), password: get("DGS_ADMIN_PASSWORD") });
  const auth = await fetch("https://www.dgeniussolutions.com/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    redirect: "manual"
  });
  const cookie = (auth.headers.get("set-cookie") || "").split(";")[0];
  const headers = { Cookie: cookie, "Content-Type": "application/json" };
  const res = await fetch("https://www.dgeniussolutions.com/api/admin/off-page/backlinks/discover", {
    method: "POST",
    headers,
    body: JSON.stringify({ provider: "web_search", queries: ['"dgeniussolutions.com"'] })
  });
  const json = await res.json();
  console.log("Backlink discover response:", JSON.stringify(json, null, 2));
}

test().catch(console.error);
