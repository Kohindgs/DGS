import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { validateUploadedFile } from "@/lib/cms/media-security";
import { computeFileChecksum } from "@/lib/cms/media-storage";
import { processUploadedImage, processUploadedVideo } from "@/lib/cms/media-processor";
import { createMediaAssetFromProcessed, getMediaAssetByChecksum } from "@/lib/cms/media";
import { generateAltTextSuggestion } from "@/lib/seo/alt-fixer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("file") as File[];
  if (!files.length) {
    const multiFiles = formData.getAll("files") as File[];
    if (multiFiles.length) files.push(...multiFiles);
  }

  if (!files.length) {
    return NextResponse.json({ ok: false, error: "No file provided for upload" }, { status: 400 });
  }

  const forceDuplicate = formData.get("forceDuplicate") === "true";
  const title = (formData.get("title") as string)?.trim() || undefined;
  const altText = (formData.get("altText") as string)?.trim() || undefined;
  const isDecorative = formData.get("isDecorative") === "true";
  const caption = (formData.get("caption") as string)?.trim() || undefined;
  const description = (formData.get("description") as string)?.trim() || undefined;
  const category = (formData.get("category") as any) || "general";

  const uploaded = [];
  const duplicates = [];
  const errors = [];

  for (const file of files) {
    if (!file || typeof file.name !== "string" || !file.size) continue;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const validation = validateUploadedFile(file.name, buffer);

      if (!validation.valid) {
        errors.push({ filename: file.name, error: validation.error });
        continue;
      }

      const checksum = computeFileChecksum(buffer);
      const existing = await getMediaAssetByChecksum(checksum);

      if (existing && !forceDuplicate) {
        duplicates.push({
          filename: file.name,
          checksum,
          existingAsset: existing,
          message: "This exact file has already been uploaded.",
        });
        continue;
      }

      let processed;
      if (validation.mediaType === "image") {
        processed = await processUploadedImage(buffer, file.name, title);
      } else {
        processed = await processUploadedVideo(buffer, file.name, title);
      }

      let resolvedAlt = altText;
      let resolvedAltSource: "MANUAL" | "AI_CONTEXTUAL" | "DECORATIVE" | "EMPTY" = "EMPTY";

      if (isDecorative) {
        resolvedAlt = "";
        resolvedAltSource = "DECORATIVE";
      } else if (altText && altText.trim().length > 0) {
        resolvedAlt = altText.trim();
        resolvedAltSource = "MANUAL";
      } else if (validation.mediaType === "image") {
        try {
          const suggested = await generateAltTextSuggestion({
            pageUrl: "/media/",
            filename: file.name,
            imageSrc: processed.publicUrl,
            surroundingContext: title || description || category,
          });
          if (suggested && suggested.trim().length > 0) {
            resolvedAlt = suggested.trim();
            resolvedAltSource = "AI_CONTEXTUAL";
          }
        } catch (err) {
          console.warn("AI alt text generation warning on upload:", err);
          resolvedAltSource = "EMPTY";
        }
      }

      const asset = await createMediaAssetFromProcessed(
        processed,
        validation.mediaType,
        checksum,
        {
          altText: resolvedAlt,
          altSource: resolvedAltSource,
          isDecorative,
          title,
          caption,
          description,
          category,
          source: "upload",
        }
      );

      uploaded.push(asset);
    } catch (err) {
      console.error(`Error processing upload ${file.name}:`, err);
      errors.push({ filename: file.name, error: (err as Error).message });
    }
  }

  const ok = uploaded.length > 0 || (duplicates.length > 0 && errors.length === 0);
  const status = uploaded.length > 0 ? 200 : duplicates.length > 0 ? 409 : 422;

  return NextResponse.json(
    {
      ok,
      uploaded,
      duplicates,
      errors,
    },
    { status }
  );
}
