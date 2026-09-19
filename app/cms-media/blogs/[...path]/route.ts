import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getCmsMediaRoot } from "@/lib/cms/blog-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!path?.length || path.some((part) => !/^[a-zA-Z0-9._-]+$/.test(part))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const extension = path[path.length - 1].toLowerCase();
  if (!extension.endsWith(".webp") && !extension.endsWith(".webm")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = join(getCmsMediaRoot(), "blogs", ...path);
    const body = await readFile(filePath);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": extension.endsWith(".webm") ? "video/webm" : "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}