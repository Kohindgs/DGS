import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

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

function connectionOptions() {
  const uri = process.env.DGS_DATABASE_URL || process.env.DATABASE_URL;
  if (uri) {
    const url = new URL(uri);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: url.searchParams.get("ssl") === "true" ? {} : undefined,
    };
  }

  if (!process.env.DGS_MYSQL_HOST || !process.env.DGS_MYSQL_USER || !process.env.DGS_MYSQL_DATABASE) {
    throw new Error("CMS database configuration is missing");
  }
  return {
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD || "",
    database: process.env.DGS_MYSQL_DATABASE,
  };
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  }).toString("hex");
  return `scrypt$32768$8$1$${salt}$${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  if (storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    if (parts.length !== 6) return false;
    const [, nStr, rStr, pStr, salt, hash] = parts;
    const N = parseInt(nStr, 10);
    const r = parseInt(rStr, 10);
    const p = parseInt(pStr, 10);

    const targetBuf = Buffer.from(hash, "hex");
    const derivedBuf = scryptSync(password, salt, targetBuf.length, {
      N,
      r,
      p,
      maxmem: 64 * 1024 * 1024,
    });

    if (derivedBuf.length !== targetBuf.length) return false;
    return timingSafeEqual(derivedBuf, targetBuf);
  }
  return false;
}

const adminEmail = (process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com").trim().toLowerCase();
let adminPassword = process.env.DGS_ADMIN_PASSWORD?.trim();
if (adminPassword && ((adminPassword.startsWith('"') && adminPassword.endsWith('"')) || (adminPassword.startsWith("'") && adminPassword.endsWith("'")))) {
  adminPassword = adminPassword.slice(1, -1);
}

if (!adminPassword) {
  console.error("FATAL: DGS_ADMIN_PASSWORD is empty or undefined.");
  process.exit(1);
}

const connection = await mysql.createConnection(connectionOptions());
try {
  const [rows] = await connection.query(
    "SELECT id, email, role, is_active, failed_attempts, locked_until, password_hash FROM cms_users WHERE email = ? LIMIT 1",
    [adminEmail]
  );

  const newHash = hashPassword(adminPassword);

  if (!rows || rows.length === 0) {
    const id = (await import("node:crypto")).randomUUID();
    await connection.query(
      "INSERT INTO cms_users (id, email, password_hash, display_name, role, is_active) VALUES (?, ?, ?, 'DGS Superadmin', 'superadmin', 1)",
      [id, adminEmail, newHash]
    );
    console.log(JSON.stringify({ status: "seeded", email: adminEmail, id }, null, 2));
  } else {
    const user = rows[0];
    await connection.query(
      "UPDATE cms_users SET password_hash = ?, is_active = 1, failed_attempts = 0, locked_until = NULL WHERE id = ?",
      [newHash, user.id]
    );
    const verified = verifyPassword(adminPassword, newHash);
    console.log(JSON.stringify({
      status: "updated_and_verified",
      email: adminEmail,
      id: user.id,
      verified,
      passwordLength: adminPassword.length,
      hashPrefix: newHash.slice(0, 30),
    }, null, 2));
  }
} finally {
  await connection.end();
}
