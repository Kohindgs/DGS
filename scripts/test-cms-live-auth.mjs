import fs from "node:fs/promises";
import path from "node:path";

async function loadEnvFile(file) {
  try {
    const text = await fs.readFile(file, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const match = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && !process.env[match[1]]) {
        let val = match[2];
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  } catch {}
}

await loadEnvFile(path.join(process.cwd(), ".env.production"));
await loadEnvFile(path.join(process.cwd(), ".env.local"));

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";
const adminEmail = process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com";
let adminPassword = process.env.DGS_ADMIN_PASSWORD;
if (adminPassword && ((adminPassword.startsWith('"') && adminPassword.endsWith('"')) || (adminPassword.startsWith("'") && adminPassword.endsWith("'")))) {
  adminPassword = adminPassword.slice(1, -1);
}

console.log(`=== TESTING CMS AUTHENTICATED ACCESS ON ${baseUrl} ===`);
console.log(`Admin email: ${adminEmail}`);
console.log(`Admin password length: ${adminPassword?.length}`);

async function testAuth() {
  const formData = new URLSearchParams();
  formData.append("email", adminEmail);
  formData.append("password", adminPassword);

  const loginRes = await fetch(`${baseUrl}/api/admin/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "DGS-CMS-Live-Test/1.0",
    },
    body: formData.toString(),
    redirect: "manual",
  });

  console.log(`Login POST response status: ${loginRes.status}`);
  const location = loginRes.headers.get("location");
  console.log(`Login Location header: ${location}`);

  const rawSetCookie = loginRes.headers.get("set-cookie");
  console.log(`Login set-cookie present: ${Boolean(rawSetCookie)}`);

  if (!rawSetCookie) {
    console.error("FAIL: No set-cookie header returned by login route.");
    return false;
  }

  // Extract cookies
  const cookies = [];
  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [rawSetCookie];
  for (const c of setCookies) {
    const part = c.split(";")[0];
    cookies.push(part);
  }
  const cookieHeader = cookies.join("; ");
  console.log(`Session cookie received: ${cookieHeader.replace(/=.*/, "=[REDACTED]")}`);

  const routes = [
    { path: "/admin/", name: "Admin Dashboard", expectTitle: "Operations Overview" },
    { path: "/admin/google-updates/", name: "Google Updates" },
    { path: "/admin/site-audits/", name: "Site Audits" },
    { path: "/admin/search-console/", name: "Search Console" },
    { path: "/admin/media/", name: "Media Library" },
    { path: "/admin/blogs/", name: "Blogs Management" },
  ];

  let allPassed = true;

  for (const route of routes) {
    const res = await fetch(`${baseUrl}${route.path}`, {
      headers: {
        Cookie: cookieHeader,
        "User-Agent": "DGS-CMS-Live-Test/1.0",
      },
      redirect: "manual",
    });

    const body = await res.text();
    const is200 = res.status === 200;
    const hasExpectedTitle = !route.expectTitle || body.includes(route.expectTitle);

    if (is200 && hasExpectedTitle) {
      console.log(`✓ ${route.name} (${route.path}): HTTP 200 OK${route.expectTitle ? ` - Found '${route.expectTitle}'` : ""}`);
    } else {
      console.error(`✗ ${route.name} (${route.path}): Status ${res.status}${!hasExpectedTitle ? ` - Missing expected title '${route.expectTitle}'` : ""}`);
      allPassed = false;
    }
  }

  return allPassed;
}

const success = await testAuth();
if (!success) {
  process.exit(1);
} else {
  console.log("\n==================================================");
  console.log("ALL CMS AUTHENTICATED ROUTES VERIFIED HTTP 200 OK!");
  console.log("==================================================");
}
