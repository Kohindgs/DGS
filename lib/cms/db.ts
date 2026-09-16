import "server-only";
import { Pool, type QueryResultRow } from "pg";

declare global {
  var __dgsCmsPool: Pool | undefined;
}

function getConnectionString() {
  return process.env.DGS_DATABASE_URL || process.env.DATABASE_URL || "";
}

export function isCmsDatabaseConfigured() {
  return Boolean(getConnectionString());
}

export function getCmsPool() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("DGS CMS database is not configured");
  }

  if (!global.__dgsCmsPool) {
    global.__dgsCmsPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.DGS_DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    });
  }
  return global.__dgsCmsPool;
}
export async function cmsQuery<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  const pool = getCmsPool();
  return pool.query<T>(text, values);
}
