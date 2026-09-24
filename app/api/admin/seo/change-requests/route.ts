import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import {
  createChangeRequest,
  listChangeRequests,
  type ChangeType,
  type RiskLevel,
} from "@/lib/seo/change-requests";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const pageUrl = searchParams.get("pageUrl") || undefined;
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  const items = await listChangeRequests({ status, pageUrl, limit });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "seo", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.page_url || !body.change_type || !body.reason) {
      return NextResponse.json(
        { error: "Missing required fields: page_url, change_type, and reason are mandatory." },
        { status: 400 }
      );
    }

    const id = await createChangeRequest({
      source_type: body.source_type || "KEYWORD_STRATEGY",
      source_id: body.source_id,
      page_url: body.page_url,
      keyword: body.keyword,
      issue_code: body.issue_code,
      change_type: body.change_type as ChangeType,
      risk_level: body.risk_level as RiskLevel,
      before_state: body.before_state,
      proposed_state: body.proposed_state || {},
      reason: body.reason,
      evidence: body.evidence,
      implementation_plan: body.implementation_plan || [],
      created_by: currentUser.display_name || currentUser.email || "Admin",
    });

    return NextResponse.json({ ok: true, id, message: `Created Change Request #${id}` });
  } catch (err: any) {
    console.error("Create change request error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
