import mysql, { type Pool } from "mysql2/promise";

declare global {
  var __dgsCmsPool: Pool | undefined;
}

function cleanVal(v?: string) {
  if (!v) return "";
  let val = v.trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  return val;
}

function getConnectionUri() {
  return cleanVal(process.env.DGS_DATABASE_URL || process.env.DATABASE_URL);
}

function hasDiscreteConfig() {
  return Boolean(process.env.DGS_MYSQL_HOST && process.env.DGS_MYSQL_USER && process.env.DGS_MYSQL_DATABASE);
}

export function isCmsDatabaseConfigured() {
  return Boolean(getConnectionUri() || hasDiscreteConfig());
}

export function getCmsPool() {
  if (!isCmsDatabaseConfigured()) throw new Error("DGS CMS database is not configured");
  if (!global.__dgsCmsPool) {
    const uri = getConnectionUri();
    global.__dgsCmsPool = uri
      ? mysql.createPool({
          uri,
          waitForConnections: true,
          connectionLimit: 10,
          enableKeepAlive: true,
          // mysql2 "charset" selects the connection collation; match the utf8mb4_unicode_ci tables
          // to avoid "Illegal mix of collations" between coercible values (V8.12.6).
          charset: "UTF8MB4_UNICODE_CI",
          dateStrings: true,
          supportBigNumbers: true,
          bigNumberStrings: true,
        })
      : mysql.createPool({
          host: cleanVal(process.env.DGS_MYSQL_HOST) || "127.0.0.1",
          port: Number(cleanVal(process.env.DGS_MYSQL_PORT) || 3306),
          user: cleanVal(process.env.DGS_MYSQL_USER),
          password: cleanVal(process.env.DGS_MYSQL_PASSWORD),
          database: cleanVal(process.env.DGS_MYSQL_DATABASE),
          waitForConnections: true,
          connectionLimit: 10,
          enableKeepAlive: true,
          // mysql2 "charset" selects the connection collation; match the utf8mb4_unicode_ci tables
          // to avoid "Illegal mix of collations" between coercible values (V8.12.6).
          charset: "UTF8MB4_UNICODE_CI",
          dateStrings: true,
          supportBigNumbers: true,
          bigNumberStrings: true,
        });
  }
  return global.__dgsCmsPool;
}

export async function cmsQuery<T>(text: string, values: any[] = []) {
  const [rows] = await getCmsPool().query(text, values);
  return { rows: rows as T[] };
}

export async function cmsExecute(text: string, values: any[] = []) {
  const [result] = await getCmsPool().execute(text, values);
  return result;
}
