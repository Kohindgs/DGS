import { NextResponse } from "next/server";
import { parse } from "node:path";
import { hasAdminSession } from "@/lib/cms/auth";
import { validateUploadedFile } from "@/lib/cms/media-security";
import { computeFileChecksum } from "@/lib/cms/media-storage";
import { processUploadedImage, processUploadedVideo } from "@/lib/cms/media-processor";
import { createMediaAssetFromProcessed, getMediaAssetByChecksum } from "@/lib/cms/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const mediaUrl = body.url?.trim();
  if (!mediaUrl || typeof mediaUrl !== "string") {
    return NextResponse.json({ ok: false, error: "Missing media URL to import" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(mediaUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json({ ok: false, error: "Only HTTP and HTTPS URLs can be imported" }, { status: 400 });
    }

    const response = await fetch(mediaUrl, {
      headers: { "User-Agent": "DGS-CMS-Media-Importer/1.0" },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `Failed to fetch external media: HTTP ${response.status} ${response.statusText}` },
        { status: 422 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract filename from URL
    const pathname = parsedUrl.pathname;
    let filename = parse(pathname).base || "imported-asset.jpg";
    // If filename has query or invalid chars, clean it
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    const validation = validateUploadedFile(filename, buffer);
    if (!validation.valid) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 422 });
    }

    const checksum = computeFileChecksum(buffer);
    const existing = await getMediaAssetByChecksum(checksum);
    if (existing) {
      return NextResponse.json({
        ok: true,
        asset: existing,
        duplicate: true,
        message: "This asset is already present in the Media Library.",
      });
    }

    let processed;
    if (validation.mediaType === "image") {
      processed = await processUploadedImage(buffer, filename, body.title);
    } else {
      processed = await processUploadedVideo(buffer, filename, body.title);
    }

    const asset = await createMediaAssetFromProcessed(
      processed,
      validation.mediaType,
      checksum,
      {
        altText: body.altText,
        isDecorative: body.isDecorative,
        title: body.title,
        caption: body.caption,
        description: body.description,
        category: body.category || "general",
        source: "wordpress_import",
        sourceId: mediaUrl,
      }
    );

    return NextResponse.json({ ok: true, asset, duplicate: false });
  } catch (err) {
    console.error("Failed to import media from URL:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
