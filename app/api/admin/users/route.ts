import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, hashPassword, logAuditEvent, type CmsRole, type CmsUser } from "@/lib/cms/auth-db";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "users", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ users: [] });
  }

  const { rows } = await cmsQuery<CmsUser>(
    `SELECT id, email, display_name, role, avatar_url, is_active, failed_attempts, locked_until, last_login_at, created_at, updated_at
     FROM cms_users
     ORDER BY created_at ASC`
  );

  return NextResponse.json({ users: rows });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "users", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const displayName = String(body.display_name || "").trim();
    const role = String(body.role || "manager").toLowerCase() as CmsRole;
    const password = String(body.password || "");

    if (!email || !displayName || !password) {
      return NextResponse.json({ error: "Email, display name, and password are required" }, { status: 400 });
    }

    if (!["superadmin", "admin", "manager"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Only superadmin can create another superadmin
    if (role === "superadmin" && currentUser.role !== "superadmin") {
      return NextResponse.json({ error: "Only Superadmins can create other Superadmins" }, { status: 403 });
    }

    const { rows: existing } = await cmsQuery("SELECT id FROM cms_users WHERE email = ? LIMIT 1", [email]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const id = randomUUID();
    const passwordHash = hashPassword(password);

    await cmsExecute(
      `INSERT INTO cms_users (id, email, password_hash, display_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [id, email, passwordHash, displayName, role]
    );

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "user.create",
      resource: "users",
      resource_id: id,
      summary: `Created new CMS user ${email} with role ${role}`,
      after_state: { id, email, display_name: displayName, role },
    });

    return NextResponse.json({
      ok: true,
      user: { id, email, display_name: displayName, role, is_active: 1 },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}
