import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionCookie,
  isAdminAuthConfigured,
  validateAdminCredentials,
} from "@/lib/cms/auth";
import {
  getCmsUserByEmail,
  getCmsUserForAuth,
  verifyPassword,
  createDbSession,
  destroyCurrentSession,
  cmsSessionCookieConfig,
  ensureSuperadminSeeded,
  logAuditEvent,
  type CmsUser,
} from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured, cmsExecute } from "@/lib/cms/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicUrl(path: string) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.dgeniussolutions.com";

  return new URL(path, origin);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") {
    return NextResponse.redirect(publicUrl("/admin/login/?error=unavailable"), 303);
  }

  const form = await request.formData();
  const rawEmail = String(form.get("email") || "").trim().toLowerCase();
  const rawPassword = String(form.get("password") || "");
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";

  if (!rawEmail || !rawPassword) {
    return NextResponse.redirect(publicUrl("/admin/login/?error=missing"), 303);
  }

  let authenticatedUser: CmsUser | null = null;
  let dbUserFound = false;

  // 1. Try DB-backed authentication if configured
  if (isCmsDatabaseConfigured()) {
    await ensureSuperadminSeeded();
    const user = await getCmsUserForAuth(rawEmail);
    if (user) {
      dbUserFound = true;

      if (user.is_active !== 1 && user.is_active !== true) {
        await logAuditEvent({
          user_id: user.id,
          actor_email: rawEmail,
          role: user.role,
          action: "auth.inactive_account_rejected",
          resource: "auth",
          summary: `Login attempt rejected for deactivated account: ${rawEmail}`,
          ip_address: ip,
          user_agent: userAgent,
          status: "failure",
        });
        return NextResponse.redirect(publicUrl("/admin/login/?error=inactive"), 303);
      }

      // Check account lockout
      if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
        await logAuditEvent({
          user_id: user.id,
          actor_email: rawEmail,
          role: user.role,
          action: "auth.account_locked",
          resource: "auth",
          summary: `Login attempt on locked account for ${rawEmail}`,
          ip_address: ip,
          user_agent: userAgent,
          status: "failure",
        });
        return NextResponse.redirect(publicUrl("/admin/login/?error=locked"), 303);
      }

      if (verifyPassword(rawPassword, user.password_hash)) {
        authenticatedUser = user;
        // Successful login resets failed attempts and lockout
        await cmsExecute(
          `UPDATE cms_users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?`,
          [user.id]
        );
      } else {
        // Record failed attempt and apply lockout if consecutive failures >= 5
        const nextAttempts = (Number(user.failed_attempts) || 0) + 1;
        const isLocked = nextAttempts >= 5;
        const lockUntil = isLocked
          ? new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ")
          : null;

        await cmsExecute(
          `UPDATE cms_users SET failed_attempts = ?, locked_until = ? WHERE id = ?`,
          [nextAttempts, lockUntil, user.id]
        );

        await logAuditEvent({
          user_id: user.id,
          actor_email: rawEmail,
          role: user.role,
          action: isLocked ? "auth.account_locked" : "auth.failed_login",
          resource: "auth",
          summary: isLocked
            ? `Account locked for 15 minutes due to 5 consecutive failed attempts (${rawEmail})`
            : `Failed password attempt (${nextAttempts}/5) for ${rawEmail}`,
          ip_address: ip,
          user_agent: userAgent,
          status: "failure",
        });

        if (isLocked) {
          return NextResponse.redirect(publicUrl("/admin/login/?error=locked"), 303);
        }

        // DB user found with invalid password: do not allow env credential fallback
        return NextResponse.redirect(publicUrl("/admin/login/?error=invalid"), 303);
      }
    }
  }

  // 2. Fallback to env-based admin credentials (strictly disallowed if DB user found or DB is configured and active)
  if (!authenticatedUser && !dbUserFound && !isCmsDatabaseConfigured() && isAdminAuthConfigured()) {
    if (validateAdminCredentials(rawEmail, rawPassword)) {
      authenticatedUser = {
        id: "env-superadmin",
        email: rawEmail,
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
  }

  if (!authenticatedUser) {
    await logAuditEvent({
      actor_email: rawEmail,
      role: "unknown",
      action: "auth.failed_login",
      resource: "auth",
      summary: `Failed CMS login attempt for ${rawEmail}`,
      ip_address: ip,
      user_agent: userAgent,
      status: "failure",
    });
    return NextResponse.redirect(publicUrl("/admin/login/?error=invalid"), 303);
  }

  const response = NextResponse.redirect(publicUrl("/admin/"), 303);

  // Set database-backed authoritative session token
  const dbToken = await createDbSession(authenticatedUser, ip, userAgent);
  response.cookies.set(cmsSessionCookieConfig.name, dbToken, {
    httpOnly: cmsSessionCookieConfig.httpOnly,
    secure: cmsSessionCookieConfig.secure,
    sameSite: cmsSessionCookieConfig.sameSite,
    path: cmsSessionCookieConfig.path,
    maxAge: cmsSessionCookieConfig.maxAge,
  });

  return response;
}

export async function GET(request: NextRequest) {
  // Support GET /api/admin/session?logout=1
  const { searchParams } = new URL(request.url);
  if (searchParams.get("logout") === "1") {
    await destroyCurrentSession();
    const response = NextResponse.redirect(publicUrl("/admin/login/?logged_out=1"), 303);
    response.cookies.set(cmsSessionCookieConfig.name, "", { path: "/", maxAge: 0 });
    response.cookies.set(adminSessionCookie.name, "", { path: "/", maxAge: 0 });
    return response;
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  await destroyCurrentSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cmsSessionCookieConfig.name, "", { path: "/", maxAge: 0 });
  response.cookies.set(adminSessionCookie.name, "", { path: "/", maxAge: 0 });
  return response;
}
