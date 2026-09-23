import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, logAuditEvent } from "@/lib/cms/auth-db";
import { getPrivateCandidateDocument } from "@/lib/cms/assessments";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !["superadmin", "admin", "manager"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Unauthorized access to private document." }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Document ID required." }, { status: 400 });
  }

  const doc = await getPrivateCandidateDocument(id, currentUser.role);
  if (!doc) {
    return NextResponse.json({ error: "Document not found or unavailable." }, { status: 404 });
  }

  await logAuditEvent({
    user_id: currentUser.id,
    actor_email: currentUser.email,
    role: currentUser.role,
    action: "hr.document.access",
    resource: "hr_document",
    resource_id: id,
    summary: `Accessed private document: ${doc.filename}`,
    after_state: { filename: doc.filename, mimeType: doc.mimeType },
  });

  return new NextResponse(new Uint8Array(doc.buffer), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.filename)}"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
