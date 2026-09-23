import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionCookie,
  createAdminSessionToken,
  isAdminAuthConfigured,
  validateAdminCredentials,
} from "@/lib/cms/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicUrl(path: string) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.dgeniussolutions.com";

  return new URL(path, origin);
}

export async function POST(request: NextRequest) {
  if (process.env.DGS_ADMIN_ENABLED !== "true" || !isAdminAuthConfigured()) {
    return NextResponse.redirect(publicUrl("/admin/login/?error=unavailable"), 303);
  }

  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");

  if (!validateAdminCredentials(email, password)) {
    return NextResponse.redirect(publicUrl("/admin/login/?error=invalid"), 303);
  }

  const response = NextResponse.redirect(publicUrl("/admin/"), 303);
  response.cookies.set(adminSessionCookie.name, createAdminSessionToken(email.trim().toLowerCase()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: adminSessionCookie.maxAge,
  });
  return response;
}
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie.name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
