import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { createGoogleOAuthUrl, getGoogleOAuthRedirectUri } from "@/lib/integrations/google";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const origin = req.nextUrl.origin;
    const redirectUri = getGoogleOAuthRedirectUri(origin);
    const state = randomBytes(24).toString("hex");

    const authUrl = createGoogleOAuthUrl(redirectUri, state);

    const res = NextResponse.redirect(authUrl, { status: 302 });
    res.cookies.set("dgs_google_oauth_state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    return res;
  } catch (err: any) {
    console.error("Google connect error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to initialize Google OAuth connection" },
      { status: 500 }
    );
  }
}
