import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { runFullPageSpeed, isPageSpeedConfigured } from "@/lib/seo/pagespeed";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const url = body.url;
    const force = Boolean(body.force);

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const { mobile, desktop } = await runFullPageSpeed(url, force);

    return NextResponse.json({
      ok: true,
      url,
      mobile,
      desktop,
      config: isPageSpeedConfigured(),
    });
  } catch (err: any) {
    console.error("PageSpeed run error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to run PageSpeed test" },
      { status: 500 }
    );
  }
}
