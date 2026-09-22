import mysql, { type Pool } from "mysql2/promise";

declare global {
  var __dgsCmsPool: Pool | undefined;
}

function getConnectionUri() {
  return process.env.DGS_DATABASE_URL || process.env.DATABASE_URL || "";
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
    global.__dgsCmsPool = uri ? mysql.createPool(uri) : mysql.createPool({
      host: process.env.DGS_MYSQL_HOST,
      port: Number(process.env.DGS_MYSQL_PORT || 3306),
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD || "",
      database: process.env.DGS_MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true,
      charset: "utf8mb4",
      dateStrings: true,
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
