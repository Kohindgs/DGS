import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { verifyChangeRequest } from "@/lib/seo/change-requests";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const result = await verifyChangeRequest(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Verification failed" }, { status: 400 });
  }

  return NextResponse.json(result);
}
