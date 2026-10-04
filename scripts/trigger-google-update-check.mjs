import fs from "node:fs";

const env = fs.readFileSync(".env.production", "utf8");
const cfg = {};
for (const l of env.split("\n")) {
  const m = l.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m) {
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    cfg[m[1]] = val;
  }
}

async function main() {
  const form = new URLSearchParams();
  form.append("email", cfg.DGS_ADMIN_EMAIL);
  form.append("password", cfg.DGS_ADMIN_PASSWORD);

  const loginRes = await fetch("https://www.dgeniussolutions.com/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "manual",
  });

  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("Login failed");

  const res = await fetch("https://www.dgeniussolutions.com/api/admin/google-updates/check", {
    method: "POST",
    headers: { Cookie: cookie, Accept: "application/json" },
  });

  console.log("Check Status:", res.status);
  const data = await res.json();
  console.log("Check Result:", JSON.stringify(data, null, 2));
}

main().catch(console.error);
