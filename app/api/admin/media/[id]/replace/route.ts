import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { validateUploadedFile } from "@/lib/cms/media-security";
import { replaceMediaAssetContent } from "@/lib/cms/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file.name !== "string" || !file.size) {
    return NextResponse.json({ ok: false, error: "No replacement file provided" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateUploadedFile(file.name, buffer);

    if (!validation.valid) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 422 });
    }

    const updated = await replaceMediaAssetContent(id, buffer, file.name);
    return NextResponse.json({ ok: true, asset: updated });
  } catch (err) {
    console.error(`Failed to replace media asset ${id}:`, err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
