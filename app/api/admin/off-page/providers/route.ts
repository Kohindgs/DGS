import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { getProviderHealthMatrix } from "@/lib/off-page/providers/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const providers = await getProviderHealthMatrix();
    return NextResponse.json({ ok: true, providers });
  } catch (err: any) {
    console.error("Failed fetching provider health matrix:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
