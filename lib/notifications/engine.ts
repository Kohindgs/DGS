import "server-only";
import { randomUUID } from "node:crypto";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";

export type NotificationSeverity = "info" | "success" | "warning" | "danger";

export type NotificationEventType =
  | "new_lead"
  | "new_application"
  | "assessment_submitted"
  | "assessment_review_required"
  | "google_oauth_expired"
  | "google_sync_failed"
  | "site_audit_issues"
  | "security_alert"
  | "system_notice";

export type NotificationRecord = {
  id: string;
  recipient_id: string | null;
  recipient_role: string | null;
  title: string;
  message: string;
  type: string;
  severity: NotificationSeverity;
  resource_type: string | null;
  resource_id: string | null;
  resource_url: string | null;
  link: string | null;
  is_read: number;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
};

export type CreateNotificationParams = {
  title: string;
  message: string;
  type?: NotificationEventType | string;
  severity?: NotificationSeverity;
  recipient_role?: "all" | "superadmin" | "admin" | "hr" | "marketing" | "editor";
  recipient_id?: string | null;
  resource_type?: string;
  resource_id?: string;
  resource_url?: string;
  link?: string;
};

let schemaEnsured = false;

export async function ensureNotificationSchema(): Promise<void> {
  if (schemaEnsured || !isCmsDatabaseConfigured()) return;

  try {
    // 1. Ensure table exists
    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS cms_notifications (
        id VARCHAR(64) PRIMARY KEY,
        recipient_id VARCHAR(64) NULL,
        recipient_role VARCHAR(50) NULL DEFAULT 'all',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'info',
        link VARCHAR(512) NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cms_notif_read (is_read, created_at),
        INDEX idx_cms_notif_role (recipient_role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Safely add missing columns
    const { rows: columns } = await cmsQuery<{ Field: string }>("DESCRIBE cms_notifications");
    const existing = new Set((columns || []).map((c) => c.Field.toLowerCase()));

    const alterStatements: { col: string; sql: string }[] = [
      { col: "severity", sql: "ALTER TABLE cms_notifications ADD COLUMN severity VARCHAR(20) NOT NULL DEFAULT 'info'" },
      { col: "resource_type", sql: "ALTER TABLE cms_notifications ADD COLUMN resource_type VARCHAR(64) NULL" },
      { col: "resource_id", sql: "ALTER TABLE cms_notifications ADD COLUMN resource_id VARCHAR(64) NULL" },
      { col: "resource_url", sql: "ALTER TABLE cms_notifications ADD COLUMN resource_url VARCHAR(512) NULL" },
      { col: "read_at", sql: "ALTER TABLE cms_notifications ADD COLUMN read_at DATETIME NULL" },
      { col: "dismissed_at", sql: "ALTER TABLE cms_notifications ADD COLUMN dismissed_at DATETIME NULL" },
    ];

    for (const stmt of alterStatements) {
      if (!existing.has(stmt.col.toLowerCase())) {
        try {
          await cmsExecute(stmt.sql);
        } catch (colErr) {
          // If already exists or concurrent migration, continue gracefully
          console.warn(`[notifications] Column addition notice for ${stmt.col}:`, colErr);
        }
      }
    }

    schemaEnsured = true;
  } catch (err) {
    console.error("[notifications] Failed to ensure notification schema:", err);
  }
}

/**
 * Publish a real system notification event.
 * Never throws to avoid breaking calling user operations.
 */
export async function publishNotificationEvent(params: CreateNotificationParams): Promise<string | null> {
  if (!isCmsDatabaseConfigured()) return null;

  try {
    await ensureNotificationSchema();

    const id = randomUUID();
    const link = params.resource_url || params.link || null;
    const severity = params.severity || "info";
    const type = params.type || "system_notice";
    const role = params.recipient_role || "all";

    await cmsExecute(
      `INSERT INTO cms_notifications (
        id, recipient_id, recipient_role, title, message, type,
        severity, resource_type, resource_id, resource_url, link, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [
        id,
        params.recipient_id || null,
        role,
        params.title,
        params.message,
        type,
        severity,
        params.resource_type || null,
        params.resource_id || null,
        link,
        link,
      ]
    );

    return id;
  } catch (err) {
    console.error("[notifications] Failed to publish notification event:", err);
    return null;
  }
}

export type GetNotificationsOptions = {
  userId?: string | null;
  userRole?: string | null;
  unreadOnly?: boolean;
  limit?: number;
};

/**
 * Query notifications with RBAC filtering.
 * Superadmin & admin: see all notifications.
 * HR: sees hr and all.
 * Marketing: sees marketing and all.
 * Dismissed notifications are strictly excluded.
 */
export async function getNotificationsForUser(options: GetNotificationsOptions = {}): Promise<{
  notifications: NotificationRecord[];
  unreadCount: number;
}> {
  if (!isCmsDatabaseConfigured()) {
    return { notifications: [], unreadCount: 0 };
  }

  try {
    await ensureNotificationSchema();

    const { userId, userRole, unreadOnly = false, limit = 30 } = options;
    const isFullAdmin = userRole === "superadmin" || userRole === "admin";

    // Build WHERE clause
    const whereConditions: string[] = ["dismissed_at IS NULL"];
    const params: any[] = [];

    if (!isFullAdmin) {
      if (userRole === "hr") {
        whereConditions.push("(recipient_role IN ('all', 'hr') OR recipient_id = ?)");
        params.push(userId || "");
      } else if (userRole === "marketing") {
        whereConditions.push("(recipient_role IN ('all', 'marketing') OR recipient_id = ?)");
        params.push(userId || "");
      } else if (userRole) {
        whereConditions.push("(recipient_role IN ('all', ?) OR recipient_id = ?)");
        params.push(userRole, userId || "");
      } else {
        whereConditions.push("recipient_role = 'all'");
      }
    }

    // Calculate unread count with same role scoping
    const countWhere = [...whereConditions, "is_read = 0"].join(" AND ");
    const { rows: countRows } = await cmsQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM cms_notifications WHERE ${countWhere}`,
      params
    );
    const unreadCount = Number(countRows[0]?.count || 0);

    // Filter by unreadOnly if requested
    if (unreadOnly) {
      whereConditions.push("is_read = 0");
    }

    const finalWhere = whereConditions.join(" AND ");
    const querySql = `
      SELECT
        id,
        recipient_id,
        recipient_role,
        title,
        message,
        type,
        COALESCE(severity, 'info') as severity,
        resource_type,
        resource_id,
        COALESCE(resource_url, link) as resource_url,
        COALESCE(link, resource_url) as link,
        is_read,
        read_at,
        dismissed_at,
        created_at
      FROM cms_notifications
      WHERE ${finalWhere}
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const { rows } = await cmsQuery<NotificationRecord>(querySql, [...params, limit]);
    return {
      notifications: rows || [],
      unreadCount,
    };
  } catch (err) {
    console.error("[notifications] Failed to fetch notifications:", err);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  if (!isCmsDatabaseConfigured()) return false;
  try {
    await ensureNotificationSchema();
    await cmsExecute(
      "UPDATE cms_notifications SET is_read = 1, read_at = NOW() WHERE id = ?",
      [id]
    );
    return true;
  } catch (err) {
    console.error("[notifications] Failed to mark read:", err);
    return false;
  }
}

/**
 * Mark all notifications as read for current user role
 */
export async function markAllNotificationsAsRead(userRole?: string | null, userId?: string | null): Promise<boolean> {
  if (!isCmsDatabaseConfigured()) return false;
  try {
    await ensureNotificationSchema();
    const isFullAdmin = userRole === "superadmin" || userRole === "admin";

    if (isFullAdmin) {
      await cmsExecute("UPDATE cms_notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0");
    } else if (userRole === "hr") {
      await cmsExecute(
        "UPDATE cms_notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0 AND (recipient_role IN ('all', 'hr') OR recipient_id = ?)",
        [userId || ""]
      );
    } else if (userRole === "marketing") {
      await cmsExecute(
        "UPDATE cms_notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0 AND (recipient_role IN ('all', 'marketing') OR recipient_id = ?)",
        [userId || ""]
      );
    } else {
      await cmsExecute(
        "UPDATE cms_notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0 AND (recipient_role = 'all' OR recipient_id = ?)",
        [userId || ""]
      );
    }
    return true;
  } catch (err) {
    console.error("[notifications] Failed to mark all read:", err);
    return false;
  }
}

/**
 * Dismiss a notification (soft delete)
 */
export async function dismissNotification(id: string): Promise<boolean> {
  if (!isCmsDatabaseConfigured()) return false;
  try {
    await ensureNotificationSchema();
    await cmsExecute(
      "UPDATE cms_notifications SET dismissed_at = NOW() WHERE id = ?",
      [id]
    );
    return true;
  } catch (err) {
    console.error("[notifications] Failed to dismiss notification:", err);
    return false;
  }
}
