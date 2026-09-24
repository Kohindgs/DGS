import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission, logAuditEvent } from "@/lib/cms/auth-db";
import {
  exchangeCodeForTokens,
  getGoogleOAuthRedirectUri,
  getGoogleUserEmail,
  saveGoogleTokens,
} from "@/lib/integrations/google";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "integrations", "edit")) {
    return NextResponse.redirect(new URL("/admin/login/", req.url));
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth error from callback:", error);
    return NextResponse.redirect(
      new URL(`/admin/integrations/?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/integrations/?error=missing_code", req.url)
    );
  }

  const storedState = req.cookies.get("dgs_google_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL("/admin/integrations/?error=invalid_state_csrf", req.url)
    );
  }

  try {
    const origin = req.nextUrl.origin;
    const redirectUri = getGoogleOAuthRedirectUri(origin);

    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const email = await getGoogleUserEmail(tokens.access_token);

    await saveGoogleTokens(tokens, email);

    await logAuditEvent({
      actor_email: currentUser.email,
      role: currentUser.role,
      action: "connect",
      resource: "google_integrations",
      summary: `Connected Google OAuth account: ${email || "authorized"}`,
      status: "success",
    });

    const redirectResponse = NextResponse.redirect(
      new URL("/admin/integrations/google/setup/?connected=true", req.url)
    );

    // Clear state cookie
    redirectResponse.cookies.delete("dgs_google_oauth_state");

    return redirectResponse;
  } catch (err: any) {
    console.error("Failed to process Google OAuth callback:", err);
    return NextResponse.redirect(
      new URL(`/admin/integrations/?error=${encodeURIComponent(err?.message || "oauth_failed")}`, req.url)
    );
  }
}
