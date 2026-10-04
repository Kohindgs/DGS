import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { generateOutreachPitchDraft } from "@/lib/off-page/outreach";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const draft = generateOutreachPitchDraft({
      siteName: body.site_name || "Target Site",
      publication: body.publication || body.domain || "Publication",
      category: body.category || "RESOURCE_PAGE",
      targetPage: body.target_page || "https://www.dgeniussolutions.com/",
      service: body.service || "Digital Marketing & AI",
      contactName: body.contact_name,
      pitchType: body.pitch_type,
    });

    return NextResponse.json({ ok: true, draft });
  } catch (err: any) {
    console.error("Draft generation error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
