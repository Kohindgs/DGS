import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const envPath = path.join(ROOT, ".env.production");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2];
    }
  }
}

const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
const email = process.env.DGS_ADMIN_EMAIL;
const password = process.env.DGS_ADMIN_PASSWORD;

console.log("================================================================================");
console.log("                 DGS SEARCH CONSOLE SYNC RUNNER                                ");
console.log("================================================================================");

// 1. Authenticate
const form = new URLSearchParams();
form.append("email", email);
form.append("password", password);

const loginRes = await fetch(`${origin}/api/admin/session`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: form.toString(),
  redirect: "manual",
});

const setCookie = loginRes.headers.get("set-cookie");
if (!setCookie) {
  console.error("Failed to authenticate: no set-cookie header returned", loginRes.status);
  process.exit(1);
}

const sessionCookie = setCookie.split(";")[0];
console.log("✓ Authentication: Session token acquired.");

// 2. Trigger GSC sync
console.log(`Executing POST ${origin}/api/admin/integrations/google/sync ...`);
const t0 = Date.now();
const syncRes = await fetch(`${origin}/api/admin/integrations/google/sync`, {
  method: "POST",
  headers: {
    Cookie: sessionCookie,
    Accept: "application/json",
  },
});

const duration = ((Date.now() - t0) / 1000).toFixed(1);
const data = await syncRes.json().catch(() => ({}));
console.log(`Sync status: HTTP ${syncRes.status} (${duration}s)`);
console.log("Sync response:", JSON.stringify(data, null, 2));
