import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { updateLeadStatus } from "@/lib/cms/leads";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resolvedParams = await params;
  const body = await req.json();
  const { status } = body;
  try {
    await updateLeadStatus(resolvedParams.id, status);
    return NextResponse.json({ ok: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update status" }, { status: 400 });
  }
}
