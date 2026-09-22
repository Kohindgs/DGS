import { open, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { headers as getHeaders } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getCmsMediaRoot } from "@/lib/cms/media-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SUBDIRS = new Set(["blogs", "uploads", "originals", "thumbnails", "posters"]);

function getMimeType(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!path?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Security: check path components (no traversal, no control chars)
  if (path.some((part) => !/^[a-zA-Z0-9._-]+$/.test(part) || part === ".." || part === ".")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const subdir = path[0];
  if (!ALLOWED_SUBDIRS.has(subdir)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filename = path[path.length - 1];
  const contentType = getMimeType(filename);
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = join(getCmsMediaRoot(), ...path);
    const incomingHeaders = await getHeaders();
    const range = request.headers.get("range") || incomingHeaders.get("range") || "";

    if (range) {
      const size = (await stat(filePath)).size;
      const match = range.match(/bytes=(\d*)-(\d*)/);
      const start = Math.min(Number(match?.[1] || 0), Math.max(size - 1, 0));
      const requestedEnd = match?.[2] ? Number(match[2]) : start + 2 * 1024 * 1024 - 1; // 2MB chunk
      const end = Math.min(Number.isFinite(requestedEnd) ? requestedEnd : size - 1, size - 1);
      const length = Math.max(end - start + 1, 0);

      const handle = await open(filePath, "r");
      const body = Buffer.alloc(length);
      try {
        await handle.read(body, 0, length, start);
      } finally {
        await handle.close();
      }

      return new NextResponse(new Uint8Array(body), {
        status: 206,
        statusText: "Partial Content",
        headers: {
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": String(length),
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const body = await readFile(filePath);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
