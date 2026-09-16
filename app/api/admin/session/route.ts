import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionCookie,
  createAdminSessionToken,
  isAdminAuthConfigured,
  validateAdminCredentials,
} from "@/lib/cms/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (process.env.DGS_ADMIN_ENABLED !== "true" || !isAdminAuthConfigured()) {
    return NextResponse.redirect(new URL("/admin/login/?error=unavailable", request.url), 303);
  }

  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");

  if (!validateAdminCredentials(email, password)) {
    return NextResponse.redirect(new URL("/admin/login/?error=invalid", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin/", request.url), 303);
  response.cookies.set(adminSessionCookie.name, createAdminSessionToken(email.trim().toLowerCase()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
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
    path: "/admin",
    maxAge: 0,
  });
  return response;
}
