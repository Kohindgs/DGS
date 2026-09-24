import "server-only";
import { scryptSync, randomBytes, timingSafeEqual, createHmac, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "./db";

export type CmsRole = "superadmin" | "admin" | "manager";

export type CmsUser = {
  id: string;
  email: string;
  display_name: string;
  role: CmsRole;
  avatar_url: string | null;
  is_active: number | boolean;
  failed_attempts: number;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsSession = {
  id: string;
  user_id: string;
  session_token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  created_at: string;
};

export type CmsAuditEntry = {
  id?: string;
  user_id?: string | null;
  actor_email: string;
  role: string;
  action: string;
  resource: string;
  resource_id?: string | null;
  summary: string;
  before_state?: any;
  after_state?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  status?: "success" | "failure";
};

const SESSION_COOKIE = "dgs_cms_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// ---------------------------------------------------------------------------
// Password Hashing (OWASP-compliant scrypt)
// ---------------------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  }).toString("hex");
  return `scrypt$32768$8$1$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;

  // Support scrypt$N$r$p$salt$hash format
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

  // Fallback for direct constant-time match (e.g. env password during transition)
  const a = Buffer.from(password);
  const b = Buffer.from(storedHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Audit Logging (Append-Only, Superadmin-visible)
// ---------------------------------------------------------------------------

export async function logAuditEvent(entry: CmsAuditEntry): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  try {
    const id = randomUUID();
    // Filter sensitive fields
    const sanitize = (data: any) => {
      if (!data || typeof data !== "object") return data;
      const clone = { ...data };
      const sensitiveKeys = ["password", "password_hash", "token", "refresh_token", "secret", "api_key"];
      for (const k of Object.keys(clone)) {
        if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
          clone[k] = "[REDACTED]";
        }
      }
      return clone;
    };

    await cmsExecute(
      `INSERT INTO cms_audit_log (id, user_id, actor_email, role, action, resource, resource_id, summary, before_state, after_state, ip_address, user_agent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        entry.user_id || null,
        entry.actor_email,
        entry.role,
        entry.action,
        entry.resource,
        entry.resource_id || null,
        entry.summary,
        entry.before_state ? JSON.stringify(sanitize(entry.before_state)) : null,
        entry.after_state ? JSON.stringify(sanitize(entry.after_state)) : null,
        entry.ip_address || null,
        entry.user_agent || null,
        entry.status || "success",
      ]
    );
  } catch (err) {
    console.error("Failed to log audit event:", err);
  }
}

// ---------------------------------------------------------------------------
// Role-Based Access Control (RBAC)
// ---------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<CmsRole, Record<string, string[]>> = {
  superadmin: {
    dashboard: ["view"],
    search_console: ["view", "manage"],
    analytics: ["view", "manage"],
    audits: ["view", "run", "manage"],
    google_updates: ["view", "review", "manage"],
    blogs: ["view", "create", "edit", "delete", "publish"],
    media: ["view", "create", "edit", "delete", "manage"],
    portfolio: ["view", "create", "edit", "delete"],
    careers: ["view", "create", "edit", "delete", "publish"],
    applications: ["view", "export", "manage"],
    assessments: ["view", "create", "edit", "approve", "assign", "delete"],
    hr: ["view", "create", "edit", "delete", "manage"],
    leads: ["view", "export", "manage"],
    forms: ["view", "manage"],
    seo: ["view", "edit", "manage"],
    users: ["view", "create", "edit", "delete", "manage"],
    activity_log: ["view"],
    integrations: ["view", "manage"],
    settings: ["view", "edit", "manage"],
  },
  admin: {
    dashboard: ["view"],
    search_console: ["view"],
    analytics: ["view"],
    audits: ["view"],
    google_updates: ["view", "review"],
    blogs: ["view", "create", "edit", "publish"],
    media: ["view", "create", "edit"],
    portfolio: ["view", "create", "edit"],
    careers: ["view", "create", "edit", "publish"],
    applications: ["view", "export"],
    assessments: ["view", "create", "edit", "approve", "assign"],
    hr: ["view", "create", "edit"],
    leads: ["view", "export"],
    forms: ["view"],
    seo: ["view", "edit"],
    users: ["view"],
    activity_log: [],
    integrations: ["view"],
    settings: ["view"],
  },
  manager: {
    dashboard: ["view"],
    search_console: ["view"],
    analytics: ["view"],
    audits: ["view"],
    google_updates: ["view"],
    blogs: ["view", "create", "edit"],
    media: ["view", "create"],
    portfolio: ["view"],
    careers: ["view"],
    applications: ["view"],
    assessments: ["view", "assign"],
    hr: ["view"],
    leads: ["view"],
    forms: ["view"],
    seo: ["view"],
    users: [],
    activity_log: [],
    integrations: [],
    settings: [],
  },
};

export function hasPermission(role: CmsRole, resource: string, action: string): boolean {
  if (role === "superadmin") return true;
  const resPerms = ROLE_PERMISSIONS[role]?.[resource];
  if (!resPerms) return false;
  return resPerms.includes(action) || resPerms.includes("manage");
}

// ---------------------------------------------------------------------------
// User Management & Seeding
// ---------------------------------------------------------------------------

export async function ensureSuperadminSeeded(): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  const adminEmail = (process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com").trim().toLowerCase();
  const adminPassword = process.env.DGS_ADMIN_PASSWORD || "DGS#Admin!27Kx9Qp4Mv8Ls";

  try {
    const { rows } = await cmsQuery<CmsUser>("SELECT id, password_hash, is_active FROM cms_users WHERE email = ? LIMIT 1", [
      adminEmail,
    ]);

    if (!rows || rows.length === 0) {
      const id = randomUUID();
      const pwdHash = hashPassword(adminPassword);
      await cmsExecute(
        `INSERT INTO cms_users (id, email, password_hash, display_name, role, is_active)
         VALUES (?, ?, ?, 'DGS Superadmin', 'superadmin', 1)`,
        [id, adminEmail, pwdHash]
      );
      await logAuditEvent({
        actor_email: "system",
        role: "system",
        action: "user.seed",
        resource: "users",
        resource_id: id,
        summary: `Initial superadmin user seeded: ${adminEmail}`,
      });
    } else {
      const existing = rows[0] as any;
      if (!existing.password_hash || !existing.password_hash.startsWith("scrypt$32768$") || !verifyPassword(adminPassword, existing.password_hash)) {
        const newHash = hashPassword(adminPassword);
        await cmsExecute(
          `UPDATE cms_users SET password_hash = ?, is_active = 1, failed_attempts = 0, locked_until = NULL WHERE id = ?`,
          [newHash, existing.id]
        );
      }
    }
  } catch (err) {
    console.error("Error ensuring superadmin is seeded:", err);
  }
}

export async function getCmsUserForAuth(email: string): Promise<(CmsUser & { password_hash: string }) | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<CmsUser & { password_hash: string }>(
    "SELECT id, email, password_hash, display_name, role, avatar_url, is_active, failed_attempts, locked_until, last_login_at, created_at, updated_at FROM cms_users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  );
  return rows[0] || null;
}

export async function getCmsUserByEmail(email: string): Promise<CmsUser | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<CmsUser>(
    "SELECT id, email, display_name, role, avatar_url, is_active, failed_attempts, locked_until, last_login_at, created_at, updated_at FROM cms_users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  );
  return rows[0] || null;
}

export async function getCmsUserById(id: string): Promise<CmsUser | null> {
  if (!isCmsDatabaseConfigured()) return null;
  const { rows } = await cmsQuery<CmsUser>(
    "SELECT id, email, display_name, role, avatar_url, is_active, failed_attempts, locked_until, last_login_at, created_at, updated_at FROM cms_users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

// ---------------------------------------------------------------------------
// Session & Token Management
// ---------------------------------------------------------------------------

function hashToken(rawToken: string): string {
  return createHmac("sha256", process.env.DGS_ADMIN_SESSION_SECRET || "dgs-fallback-secret-2026")
    .update(rawToken)
    .digest("hex");
}

export async function createDbSession(user: CmsUser, ip?: string, userAgent?: string): Promise<string> {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString().slice(0, 19).replace("T", " ");

  if (isCmsDatabaseConfigured()) {
    await cmsExecute(
      `INSERT INTO cms_sessions (id, user_id, session_token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, user.id, tokenHash, ip || null, userAgent ? userAgent.slice(0, 500) : null, expiresAt]
    );

    await cmsExecute("UPDATE cms_users SET last_login_at = CURRENT_TIMESTAMP, failed_attempts = 0 WHERE id = ?", [
      user.id,
    ]);

    await logAuditEvent({
      user_id: user.id,
      actor_email: user.email,
      role: user.role,
      action: "auth.login",
      resource: "auth",
      resource_id: sessionId,
      summary: `Successful CMS login by ${user.email} (${user.role})`,
      ip_address: ip,
      user_agent: userAgent,
    });
  }

  return rawToken;
}

export async function getCurrentCmsUser(): Promise<CmsUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) {
      const { hasLegacyAdminSession } = await import("./auth");
      if (await hasLegacyAdminSession()) {
        return {
          id: "env-superadmin",
          email: process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com",
          display_name: "DGS Superadmin",
          role: "superadmin",
          avatar_url: null,
          is_active: 1,
          failed_attempts: 0,
          locked_until: null,
          last_login_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return null;
    }

    if (!isCmsDatabaseConfigured()) {
      // Fallback for single-admin mode if DB is momentarily unreachable
      const { hasLegacyAdminSession } = await import("./auth");
      if (await hasLegacyAdminSession()) {
        return {
          id: "env-superadmin",
          email: process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com",
          display_name: "DGS Superadmin",
          role: "superadmin",
          avatar_url: null,
          is_active: 1,
          failed_attempts: 0,
          locked_until: null,
          last_login_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return null;
    }

    const tokenHash = hashToken(token);
    const { rows: sessionRows } = await cmsQuery<CmsSession>(
      `SELECT id, user_id, session_token_hash, expires_at FROM cms_sessions WHERE session_token_hash = ? AND expires_at > NOW() LIMIT 1`,
      [tokenHash]
    );

    if (sessionRows && sessionRows.length > 0) {
      const session = sessionRows[0];
      if (session.user_id === "env-superadmin") {
        return {
          id: "env-superadmin",
          email: process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com",
          display_name: "DGS Superadmin",
          role: "superadmin",
          avatar_url: null,
          is_active: 1,
          failed_attempts: 0,
          locked_until: null,
          last_login_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const { rows: userRows } = await cmsQuery<CmsUser>(
        `SELECT id, email, display_name, role, avatar_url, is_active, failed_attempts, locked_until, last_login_at, created_at, updated_at
         FROM cms_users
         WHERE id = ? AND is_active = 1
         LIMIT 1`,
        [session.user_id]
      );

      if (userRows && userRows.length > 0) {
        return userRows[0];
      }
    }
    const { hasLegacyAdminSession } = await import("./auth");
    if (await hasLegacyAdminSession()) {
      return {
        id: "env-superadmin",
        email: process.env.DGS_ADMIN_EMAIL || "admin@dgeniussolutions.com",
        display_name: "DGS Superadmin",
        role: "superadmin",
        avatar_url: null,
        is_active: 1,
        failed_attempts: 0,
        locked_until: null,
        last_login_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error("Error retrieving current CMS user:", err);
  }
  return null;
}

export async function destroyCurrentSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token && isCmsDatabaseConfigured()) {
      const tokenHash = hashToken(token);
      await cmsExecute("DELETE FROM cms_sessions WHERE session_token_hash = ?", [tokenHash]);
    }
    cookieStore.delete(SESSION_COOKIE);
  } catch (err) {
    console.error("Error destroying session:", err);
  }
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  if (!isCmsDatabaseConfigured()) return;
  await cmsExecute("DELETE FROM cms_sessions WHERE user_id = ?", [userId]);
}

export const cmsSessionCookieConfig = {
  name: SESSION_COOKIE,
  maxAge: SESSION_TTL_SECONDS,
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};
