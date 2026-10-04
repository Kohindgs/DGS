import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import {
  revalidateOpportunityUrls,
  runOpportunityDiscoverySuite,
} from "@/lib/off-page/discovery";

export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const discovery = await runOpportunityDiscoverySuite();
    const revalRes = await revalidateOpportunityUrls(25);

    return NextResponse.json({
      ok: true,
      discovery,
      insertedCount: discovery.new_records_added,
      message: discovery.message,
      revalidation: revalRes,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Discovery run error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
