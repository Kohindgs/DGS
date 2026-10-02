import fs from "node:fs";

function getCredentials() {
  const envFile = fs.existsSync("/home/u188101251/production-app/shared/.env.production")
    ? "/home/u188101251/production-app/shared/.env.production"
    : ".env.production";
  const content = fs.readFileSync(envFile, "utf8");
  let email = "";
  let password = "";
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DGS_ADMIN_EMAIL=")) {
      email = trimmed.substring("DGS_ADMIN_EMAIL=".length).trim().replace(/^['"]|['"]$/g, "");
    }
    if (trimmed.startsWith("DGS_ADMIN_PASSWORD=")) {
      password = trimmed.substring("DGS_ADMIN_PASSWORD=".length).trim().replace(/^['"]|['"]$/g, "");
    }
  }
  return { email, password };
}

async function login() {
  const creds = getCredentials();
  console.log("Attempting login for:", creds.email, "Has pass:", Boolean(creds.password));
  const res = await fetch("https://www.dgeniussolutions.com/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email: creds.email, password: creds.password }).toString(),
    redirect: "manual",
  });
  console.log("Status:", res.status);
  console.log("Location:", res.headers.get("location"));
  const cookies = res.headers.get("set-cookie");
  console.log("Set-Cookie header:", cookies ? "PRESENT" : "MISSING");
  if (cookies) {
    console.log("Cookies:", cookies);
  }
}

login().catch(console.error);
