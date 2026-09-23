import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, hashPassword, logAuditEvent, destroyAllUserSessions, type CmsRole, type CmsUser } from "@/lib/cms/auth-db";
import { cmsQuery, cmsExecute, isCmsDatabaseConfigured } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "users", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { rows: targets } = await cmsQuery<CmsUser>(
      "SELECT id, email, display_name, role, is_active FROM cms_users WHERE id = ? LIMIT 1",
      [id]
    );

    if (!targets || targets.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUser = targets[0];

    // If changing role or disabling, verify superadmin constraints
    if (body.role !== undefined || body.is_active !== undefined) {
      if (currentUser.role !== "superadmin" && targetUser.role === "superadmin") {
        return NextResponse.json({ error: "Only Superadmins can modify Superadmin accounts" }, { status: 403 });
      }

      // Check if disabling the last superadmin
      if (targetUser.role === "superadmin" && (body.is_active === 0 || body.role !== "superadmin")) {
        const { rows: superRes } = await cmsQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM cms_users WHERE role = 'superadmin' AND is_active = 1 AND id != ?",
          [id]
        );
        if ((superRes[0]?.count || 0) < 1) {
          return NextResponse.json({ error: "Cannot disable or demote the only active Superadmin" }, { status: 400 });
        }
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    const changes: Record<string, any> = {};

    if (body.display_name !== undefined) {
      updates.push("display_name = ?");
      values.push(String(body.display_name).trim());
      changes.display_name = body.display_name;
    }

    if (body.role !== undefined && ["superadmin", "admin", "manager"].includes(body.role)) {
      updates.push("role = ?");
      values.push(body.role);
      changes.role = body.role;
    }

    if (body.is_active !== undefined) {
      const activeVal = body.is_active ? 1 : 0;
      updates.push("is_active = ?");
      values.push(activeVal);
      changes.is_active = activeVal;
      if (activeVal === 0) {
        // Invalidate active sessions if user disabled
        await destroyAllUserSessions(id);
      }
    }

    if (body.new_password) {
      const pwdHash = hashPassword(String(body.new_password));
      updates.push("password_hash = ?");
      values.push(pwdHash);
      changes.password = "[UPDATED]";
      // Invalidate existing sessions on password reset
      await destroyAllUserSessions(id);
    }

    if (updates.length > 0) {
      values.push(id);
      await cmsExecute(`UPDATE cms_users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);

      await logAuditEvent({
        user_id: currentUser.id,
        actor_email: currentUser.email,
        role: currentUser.role,
        action: "user.update",
        resource: "users",
        resource_id: id,
        summary: `Updated user ${targetUser.email}: ${Object.keys(changes).join(", ")}`,
        before_state: targetUser,
        after_state: changes,
      });
    }

    return NextResponse.json({ ok: true, changes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || currentUser.role !== "superadmin") {
    return NextResponse.json({ error: "Only Superadmins can delete users" }, { status: 403 });
  }

  const { id } = await params;
  if (!isCmsDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { rows: targets } = await cmsQuery<CmsUser>(
      "SELECT id, email, role FROM cms_users WHERE id = ? LIMIT 1",
      [id]
    );

    if (!targets || targets.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUser = targets[0];

    // Prevent deleting last active superadmin
    if (targetUser.role === "superadmin") {
      const { rows: superRes } = await cmsQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM cms_users WHERE role = 'superadmin' AND is_active = 1 AND id != ?",
        [id]
      );
      if ((superRes[0]?.count || 0) < 1) {
        return NextResponse.json({ error: "Cannot delete the only active Superadmin" }, { status: 400 });
      }
    }

    // Invalidate sessions and delete
    await destroyAllUserSessions(id);
    await cmsExecute("DELETE FROM cms_users WHERE id = ?", [id]);

    await logAuditEvent({
      user_id: currentUser.id,
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "user.delete",
      resource: "users",
      resource_id: id,
      summary: `Deleted CMS user ${targetUser.email}`,
      before_state: targetUser,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}
