import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { parseBlogDocx, imageMatchesSlug, type BlogImportImage } from "@/lib/cms/blog-import";
import { attachImportedBlogPackage, createCmsBlog, deleteCmsDraftBlog } from "@/lib/cms/blogs";
import { processUploadedImage } from "@/lib/cms/media-processor";
import { calculateBufferChecksum } from "@/lib/cms/media-storage";
import { createMediaAssetFromProcessed, getMediaAssetByChecksum, recordMediaUsage, updateMediaAssetMetadata, type MediaAsset } from "@/lib/cms/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DOCX_BYTES = 15 * 1024 * 1024;
const MAX_DOCUMENTS = 30;

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

function isDocxFile(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".docx");
}

function isImageFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type.startsWith("image/") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif")
  );
}

function errorMessage(error: unknown) {
  const value = error as { code?: unknown; errno?: unknown; message?: unknown };
  const code = String(value?.code || "");
  const errno = Number(value?.errno || 0);
  if (code === "ER_DUP_ENTRY" || errno === 1062) {
    return "A blog with this filename/slug already exists";
  }
  return String(value?.message || "Blog import failed");
}

export async function POST(request: Request) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const form = await request.formData();
  const documents = form
    .getAll("documents")
    .filter((item): item is File => item instanceof File && isDocxFile(item));
  const legacyDocument = form.get("document");
  if (!documents.length && legacyDocument instanceof File && isDocxFile(legacyDocument)) {
    documents.push(legacyDocument);
  }

  if (!documents.length) {
    return NextResponse.json(
      { ok: false, message: "At least one Word (.docx) file is required" },
      { status: 400 }
    );
  }

  if (documents.length > MAX_DOCUMENTS) {
    return NextResponse.json(
      { ok: false, message: `Upload up to ${MAX_DOCUMENTS} Word files per batch` },
      { status: 413 }
    );
  }

  if (documents.some((file) => file.size > MAX_DOCX_BYTES)) {
    return NextResponse.json(
      { ok: false, message: "Each Word file must be 15 MB or smaller" },
      { status: 413 }
    );
  }

  // Extract all uploaded images
  const imageFiles = form
    .getAll("images")
    .filter((item): item is File => item instanceof File && isImageFile(item));

  // 1. Process all uploaded images through native Media CMS
  const processedMediaByOriginalName = new Map<string, MediaAsset>();
  const rawImageBuffers: BlogImportImage[] = [];

  for (const imgFile of imageFiles) {
    try {
      const buffer = Buffer.from(await imgFile.arrayBuffer());
      rawImageBuffers.push({
        filename: imgFile.name,
        mimeType: imgFile.type || "image/jpeg",
        buffer,
      });

      const checksum = calculateBufferChecksum(buffer);
      let asset = await getMediaAssetByChecksum(checksum);

      if (!asset) {
        const processed = await processUploadedImage(buffer, imgFile.name);
        asset = await createMediaAssetFromProcessed(processed, "image", checksum, {
          category: "blog",
          source: "word-blog-bulk-import",
          altText: imgFile.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        });
      }

      processedMediaByOriginalName.set(imgFile.name, asset);
    } catch (err) {
      console.warn("Failed to process image through Media CMS:", imgFile.name, err);
    }
  }

  // 2. Parse Word documents, match images, and create draft/review posts
  const results: Array<Record<string, unknown>> = [];
  const failed: Array<{ filename: string; message: string }> = [];

  for (const document of documents) {
    let blogId: string | null = null;

    try {
      const docBuffer = Buffer.from(await document.arrayBuffer());
      const parsed = await parseBlogDocx(docBuffer, document.name);

      // Create draft in blog_posts
      const blog = await createCmsBlog({
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
        word_count: parsed.wordCount,
        reading_time_minutes: parsed.readingTimeMinutes,
        status: "review",
      });
      blogId = blog.id;

      // Find matching images for this blog
      const matchedImages: Array<{
        asset: MediaAsset;
        isFeatured: boolean;
        originalName: string;
      }> = [];

      // Extract H2 headings for contextual image alt descriptions
      const h2Headings = [...parsed.bodyHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
        .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
        .filter(Boolean);

      for (const [origName, asset] of processedMediaByOriginalName.entries()) {
        if (imageMatchesSlug(origName, parsed.slug)) {
          const isFeatured = /-(featured|hero|cover|banner)\.[^.]+$/i.test(origName);
          matchedImages.push({ asset, isFeatured, originalName: origName });
        }
      }

      // If no image is specifically tagged as featured, pick the first matched
      if (matchedImages.length > 0 && !matchedImages.some((m) => m.isFeatured)) {
        matchedImages[0].isFeatured = true;
      }

      // Generate contextual alt text for all matched blog images
      let inlineHeadingIdx = 0;
      for (const item of matchedImages) {
        let contextualAlt = "";
        const cleanName = item.originalName
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .replace(/\b(image|img|pic|photo|\d+)\b/gi, "")
          .trim();

        if (item.isFeatured) {
          contextualAlt = `${parsed.title} — Comprehensive overview and analysis`;
        } else {
          const nearestH2 = h2Headings[inlineHeadingIdx++] || parsed.title;
          contextualAlt = `${nearestH2} — ${cleanName || "Detailed visual demonstration"} in ${parsed.title}`;
        }

        item.asset.alt_text = contextualAlt;
        // Update database with contextual alt and AI_CONTEXTUAL source tag
        await updateMediaAssetMetadata(item.asset.id, {
          altText: contextualAlt,
          altSource: "AI_CONTEXTUAL",
          title: cleanName || parsed.title,
          category: "blog",
        }).catch((e) => console.warn("Failed to update blog image alt metadata:", e));
      }

      const featuredMatch = matchedImages.find((m) => m.isFeatured);
      const featuredImageUrl = featuredMatch?.asset.public_url || null;
      const featuredMediaAssetId = featuredMatch?.asset.id;

      // Format images list for blog content
      const storedImages = matchedImages.map((m) => ({
        filename: m.asset.filename,
        url: m.asset.public_url,
        mimeType: m.asset.mime_type,
        featured: m.isFeatured,
        altText: m.asset.alt_text || parsed.title,
        width: m.asset.width || undefined,
        height: m.asset.height || undefined,
        bytes: Number(m.asset.file_size || 0),
      }));

      // Inject inline images into body HTML after H2 tags if supporting images exist
      let bodyHtml = parsed.bodyHtml;
      const inlineImages = matchedImages.filter((m) => !m.isFeatured);
      if (inlineImages.length > 0) {
        let inlineIdx = 0;
        bodyHtml = bodyHtml.replace(/(<\/h2>)/gi, (match) => {
          const item = inlineImages[inlineIdx++];
          if (!item) return match;
          const altValue = (item.asset.alt_text || parsed.title).replace(/"/g, "&quot;");
          const figure = `<figure class="dgs-blog-inline-image"><img src="${item.asset.public_url}" alt="${altValue}" width="${item.asset.width || 1200}" height="${item.asset.height || 675}" loading="lazy" decoding="async" /></figure>`;
          return `${match}\n${figure}`;
        });
      }

      // Attach blog package and bind with Media CMS usage tracking
      await attachImportedBlogPackage({
        blogId: blog.id,
        slug: parsed.slug,
        title: parsed.title,
        featuredImageUrl: featuredImageUrl || undefined,
        featuredMediaAssetId,
        content: {
          version: 1,
          bodyHtml,
          sourceHash: parsed.sourceHash,
          optimization: parsed.optimization,
          images: storedImages,
        },
      });

      // Record usage for all matched images in Media CMS
      for (const m of matchedImages) {
        try {
          await recordMediaUsage({
            mediaId: m.asset.id,
            entityType: "blog_post",
            entityId: blog.id,
            route: `/blogs/${parsed.slug}/`,
            field: m.isFeatured ? "featured_image" : "inline_image",
          });
        } catch {
          // Non-blocking
        }
      }

      results.push({
        blog: {
          id: blog.id,
          slug: parsed.slug,
          title: parsed.title,
          status: "review",
          featured_image_url: featuredImageUrl,
          word_count: parsed.wordCount,
          reading_time_minutes: parsed.readingTimeMinutes,
          needs_review: true,
        },
        optimization: parsed.optimization,
        matchedImagesCount: matchedImages.length,
        featuredImage: featuredImageUrl,
        needsReview: true,
        message: "Draft created in Review status. Requires editor sign-off before publishing.",
      });
    } catch (error) {
      if (blogId) await deleteCmsDraftBlog(blogId);
      failed.push({ filename: document.name, message: errorMessage(error) });
      console.error("Word blog import failed:", document.name, error);
    }
  }

  if (!results.length) {
    return NextResponse.json(
      {
        ok: false,
        message: failed[0]?.message || "No blogs were imported",
        results,
        failed,
      },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      ok: failed.length === 0,
      results,
      failed,
      total: documents.length,
      imported: results.length,
    },
    { status: failed.length ? 207 : 201 }
  );
}
