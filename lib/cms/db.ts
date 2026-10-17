import mysql, { type Pool, type PoolConnection } from "mysql2/promise";

declare global {
  var __dgsCmsPool: Pool | undefined;
  var __dgsCmsPoolStats:
    | {
        createdCount: number;
        lastCreatedAt: string | null;
        totalRetries: number;
        totalTransientErrors: number;
        lastErrorCode: string | null;
        lastErrorAt: string | null;
      }
    | undefined;
}

function getPoolStats() {
  if (!global.__dgsCmsPoolStats) {
    global.__dgsCmsPoolStats = {
      createdCount: 0,
      lastCreatedAt: null,
      totalRetries: 0,
      totalTransientErrors: 0,
      lastErrorCode: null,
      lastErrorAt: null,
    };
  }
  return global.__dgsCmsPoolStats;
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
  return Boolean(
    cleanVal(process.env.DGS_MYSQL_HOST) &&
      cleanVal(process.env.DGS_MYSQL_USER) &&
      cleanVal(process.env.DGS_MYSQL_DATABASE)
  );
}

export function isCmsDatabaseConfigured() {
  return Boolean(hasDiscreteConfig() || getConnectionUri());
}

/**
 * Shared production connection pool settings:
 * - connectionLimit: 8 (safe well below Hostinger max_user_connections=150)
 * - maxIdle: 4
 * - idleTimeout: 60000ms (60s, well below MariaDB wait_timeout=300s to prevent stale socket ECONNRESET)
 * - connectTimeout: 10000ms (prevents 4m30s TCP SYN/ACK hangs)
 * - enableKeepAlive: true, keepAliveInitialDelay: 10000ms
 */
export const CMS_POOL_CONFIG = {
  waitForConnections: true,
  connectionLimit: 8,
  maxIdle: 4,
  idleTimeout: 60000,
  queueLimit: 50,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // mysql2 "charset" selects the connection collation; match the utf8mb4_unicode_ci tables
  // to avoid "Illegal mix of collations" between coercible values (V8.12.6).
  charset: "UTF8MB4_UNICODE_CI",
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
} as const;

export function getCmsPool(): Pool {
  if (!isCmsDatabaseConfigured()) throw new Error("DGS CMS database is not configured");
  if (!global.__dgsCmsPool) {
    const stats = getPoolStats();
    const discrete = hasDiscreteConfig();
    const uri = getConnectionUri();

    if (discrete) {
      global.__dgsCmsPool = mysql.createPool({
        host: cleanVal(process.env.DGS_MYSQL_HOST) || "127.0.0.1",
        port: Number(cleanVal(process.env.DGS_MYSQL_PORT) || 3306),
        user: cleanVal(process.env.DGS_MYSQL_USER),
        password: cleanVal(process.env.DGS_MYSQL_PASSWORD),
        database: cleanVal(process.env.DGS_MYSQL_DATABASE),
        ...CMS_POOL_CONFIG,
      });
    } else {
      global.__dgsCmsPool = mysql.createPool({
        uri,
        ...CMS_POOL_CONFIG,
      });
    }

    stats.createdCount += 1;
    stats.lastCreatedAt = new Date().toISOString();
  }
  return global.__dgsCmsPool;
}

export async function resetCmsPool(): Promise<void> {
  const existing = global.__dgsCmsPool;
  global.__dgsCmsPool = undefined;
  if (existing) {
    try {
      await existing.end();
    } catch {
      // Ignore error closing dead pool
    }
  }
}

const RETRYABLE_DB_ERROR_CODES = new Set([
  "ECONNRESET",
  "PROTOCOL_CONNECTION_LOST",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EPIPE",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
  "ER_CON_COUNT_ERROR",
]);

const NON_RETRYABLE_DB_ERROR_CODES = new Set([
  "ER_ACCESS_DENIED_ERROR",
  "ER_DBACCESS_DENIED_ERROR",
  "ER_TABLEACCESS_DENIED_ERROR",
  "ER_PARSE_ERROR",
  "ER_BAD_FIELD_ERROR",
  "ER_NO_SUCH_TABLE",
  "ER_DUP_ENTRY",
  "ER_BAD_NULL_ERROR",
  "ER_DATA_TOO_LONG",
  "ER_TRUNCATED_WRONG_VALUE",
]);

export function isRetryableDbError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as { code?: string; errno?: number; message?: string; fatal?: boolean };
  const code = String(anyErr.code || "").trim();

  if (code && NON_RETRYABLE_DB_ERROR_CODES.has(code)) {
    return false;
  }
  if (code && RETRYABLE_DB_ERROR_CODES.has(code)) {
    return true;
  }

  const msg = String(anyErr.message || "");
  if (
    /ECONNRESET|PROTOCOL_CONNECTION_LOST|Connection lost: The server closed the connection|Can't add new command when connection is in closed state|ETIMEDOUT|ECONNREFUSED|EPIPE/i.test(
      msg
    )
  ) {
    return true;
  }

  return false;
}

function sanitizeDbErrorMessage(msg: string): string {
  return String(msg || "Database operation failed")
    .replace(/mysql:\/\/[^\s'"]+/gi, "mysql://[REDACTED]")
    .replace(/password\s*=\s*[^\s,;]+/gi, "password=[REDACTED]");
}

export type DbRetryContext = {
  endpoint?: string;
  operation?: string;
  maxRetries?: number;
  baseDelayMs?: number;
};

/**
 * Reusable Production DB Execution Layer with Transient Connection Recovery.
 * - Retries ONLY transient connection errors (ECONNRESET, PROTOCOL_CONNECTION_LOST, ETIMEDOUT, ECONNREFUSED, EPIPE)
 * - Maximum 2 retries with short exponential backoff (200ms, 500ms)
 * - Never retries authentication, permission, syntax, or schema errors
 * - Logs structured diagnostics without ever exposing credentials
 */
export async function executeWithDbRetry<T>(
  operationFn: () => Promise<T>,
  context: DbRetryContext = {}
): Promise<T> {
  const maxRetries = Math.min(Math.max(context.maxRetries ?? 2, 0), 2);
  const baseDelayMs = context.baseDelayMs ?? 200;
  const endpoint = context.endpoint || "internal";
  const operation = context.operation || "db_query";
  const startedAt = Date.now();
  const stats = getPoolStats();

  let attempt = 0;
  while (true) {
    try {
      return await operationFn();
    } catch (err: any) {
      const durationMs = Date.now() - startedAt;
      const errorCode = String(err?.code || err?.errno || "UNKNOWN_DB_ERROR");
      const retryable = isRetryableDbError(err);

      stats.lastErrorCode = errorCode;
      stats.lastErrorAt = new Date().toISOString();

      if (retryable && attempt < maxRetries) {
        attempt += 1;
        stats.totalRetries += 1;
        stats.totalTransientErrors += 1;
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1);

        console.warn(
          JSON.stringify({
            level: "warn",
            event: "db_transient_retry",
            timestamp: new Date().toISOString(),
            endpoint,
            operation,
            errorCode,
            retryCount: attempt,
            maxRetries,
            delayMs,
            durationMs,
            message: sanitizeDbErrorMessage(err?.message || ""),
          })
        );

        // If connection was reset or pool entered fatal state, recycle pool before retry
        if (
          errorCode === "ECONNRESET" ||
          errorCode === "PROTOCOL_CONNECTION_LOST" ||
          errorCode === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"
        ) {
          await resetCmsPool();
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      console.error(
        JSON.stringify({
          level: "error",
          event: "db_operation_failed",
          timestamp: new Date().toISOString(),
          endpoint,
          operation,
          errorCode,
          retryable,
          retryCount: attempt,
          durationMs,
          message: sanitizeDbErrorMessage(err?.message || ""),
        })
      );

      throw err;
    }
  }
}

export async function cmsQuery<T>(text: string, values: any[] = [], context?: DbRetryContext) {
  const opLabel = text.trim().split(/\s+/).slice(0, 3).join(" ").toUpperCase() || "SQL_QUERY";
  return executeWithDbRetry(
    async () => {
      const [rows] = await getCmsPool().query(text, values);
      return { rows: rows as T[] };
    },
    {
      endpoint: context?.endpoint || "cmsQuery",
      operation: context?.operation || opLabel,
      maxRetries: context?.maxRetries,
    }
  );
}

export async function cmsExecute(text: string, values: any[] = [], context?: DbRetryContext) {
  const opLabel = text.trim().split(/\s+/).slice(0, 3).join(" ").toUpperCase() || "SQL_EXEC";
  return executeWithDbRetry(
    async () => {
      const [result] = await getCmsPool().query(text, values);
      return result as any;
    },
    {
      endpoint: context?.endpoint || "cmsExecute",
      operation: context?.operation || opLabel,
      maxRetries: context?.maxRetries,
    }
  );
}

export async function withCmsTransaction<T>(
  callback: (conn: PoolConnection) => Promise<T>,
  context?: DbRetryContext
): Promise<T> {
  return executeWithDbRetry(
    async () => {
      const pool = getCmsPool();
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const result = await callback(conn);
        await conn.commit();
        return result;
      } catch (error) {
        try {
          await conn.rollback();
        } catch (rbErr) {
          console.error("Failed to rollback CMS transaction:", rbErr);
        }
        throw error;
      } finally {
        conn.release();
      }
    },
    {
      endpoint: context?.endpoint || "withCmsTransaction",
      operation: context?.operation || "DB_TRANSACTION",
      maxRetries: context?.maxRetries ?? 1,
    }
  );
}

export async function getCmsDatabaseHealthMetrics() {
  const t0 = Date.now();
  const stats = getPoolStats();
  if (!isCmsDatabaseConfigured()) {
    return {
      ok: false,
      configured: false,
      pingMs: 0,
      poolConfig: CMS_POOL_CONFIG,
      poolStats: stats,
      serverStatus: null,
      serverVariables: null,
    };
  }

  try {
    await cmsQuery("SELECT 1 AS ok", [], { endpoint: "health", operation: "DB_PING" });
    const pingMs = Date.now() - t0;

    const [statusRes, varRes] = await Promise.all([
      cmsQuery<{ Variable_name: string; Value: string }>(
        `SHOW GLOBAL STATUS WHERE Variable_name IN (
          'Uptime', 'Threads_connected', 'Threads_running', 'Connections',
          'Aborted_clients', 'Aborted_connects', 'Max_used_connections'
        )`
      ),
      cmsQuery<{ Variable_name: string; Value: string }>(
        `SHOW GLOBAL VARIABLES WHERE Variable_name IN (
          'version', 'max_connections', 'max_user_connections',
          'wait_timeout', 'interactive_timeout', 'connect_timeout'
        )`
      ),
    ]);

    const serverStatus = Object.fromEntries(statusRes.rows.map((r) => [r.Variable_name, r.Value]));
    const serverVariables = Object.fromEntries(varRes.rows.map((r) => [r.Variable_name, r.Value]));

    return {
      ok: true,
      configured: true,
      pingMs,
      poolConfig: CMS_POOL_CONFIG,
      poolStats: stats,
      serverStatus,
      serverVariables,
    };
  } catch (err: any) {
    return {
      ok: false,
      configured: true,
      pingMs: Date.now() - t0,
      poolConfig: CMS_POOL_CONFIG,
      poolStats: stats,
      serverStatus: null,
      serverVariables: null,
      error: sanitizeDbErrorMessage(err?.message || "DB health check failed"),
      errorCode: String(err?.code || "UNKNOWN"),
    };
  }
}
