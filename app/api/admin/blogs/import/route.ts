import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { parseBlogDocx, type BlogImportImage } from "@/lib/cms/blog-import";
import { injectInlineBlogImages, removeStoredBlogImages, storeBlogImages } from "@/lib/cms/blog-media";
import { injectInlineBlogVideos, storeBlogVideos } from "@/lib/cms/blog-video";
import { attachImportedBlogPackage, createCmsBlog, deleteCmsDraftBlog } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DOCX_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENTS = 25;

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

function isDocxFile(file: File) {
  return file.name.toLowerCase().endsWith(".docx");
}

function isImageFile(file: File) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

function isVideoFile(file: File) {
  return file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
}
function errorMessage(error: unknown) {
  const value = error as { code?: unknown; errno?: unknown; message?: unknown };
  const code = String(value?.code || "");
  const errno = Number(value?.errno || 0);
  if (code === "ER_DUP_ENTRY" || errno === 1062) {
    return "A blog with this filename/slug already exists";
  }
  const message = String(value?.message || "");
  if (/ffmpeg|video conversion/i.test(message)) return "Video conversion failed";
  return "Blog import failed";
}

async function toAssets(files: File[]) {
  const assets: BlogImportImage[] = [];
  for (const file of files) {
    assets.push({
      filename: file.name,
      mimeType: file.type,
      buffer: Buffer.from(await file.arrayBuffer()),
    });
  }
  return assets;
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
    return NextResponse.json({ ok: false, message: "At least one .docx blog file is required" }, { status: 400 });
  }
  if (documents.length > MAX_DOCUMENTS) {
    return NextResponse.json({ ok: false, message: `Upload up to ${MAX_DOCUMENTS} Word files per batch` }, { status: 413 });
  }
  if (documents.some((file) => file.size > MAX_DOCX_BYTES)) {
    return NextResponse.json({ ok: false, message: "Each Word file must be 10 MB or smaller" }, { status: 413 });
  }

  const imageFiles = form
    .getAll("images")
    .filter((item): item is File => item instanceof File && isImageFile(item));
  const videoFiles = form
    .getAll("videos")
    .filter((item): item is File => item instanceof File && isVideoFile(item));

  const [images, videos] = await Promise.all([
    toAssets(imageFiles),
    toAssets(videoFiles),
  ]);

  const results: Array<Record<string, unknown>> = [];
  const failed: Array<{ filename: string; message: string }> = [];

  for (const document of documents) {
    let blogId: string | null = null;
    let slug: string | null = null;

    try {
      const parsed = await parseBlogDocx(
        Buffer.from(await document.arrayBuffer()),
        document.name,
      );
      slug = parsed.slug;
      const blog = await createCmsBlog({
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
      });
      blogId = blog.id;

      const storedImages = await storeBlogImages(parsed.slug, parsed.title, images);
      const storedVideos = await storeBlogVideos(parsed.slug, videos);
      const bodyHtml = injectInlineBlogVideos(
        injectInlineBlogImages(parsed.bodyHtml, storedImages),
        storedVideos,
      );

      await attachImportedBlogPackage({
        blogId: blog.id,
        slug: parsed.slug,
        title: parsed.title,
        content: {
          version: 1,
          bodyHtml,
          sourceHash: parsed.sourceHash,
          optimization: parsed.optimization,
          images: storedImages,
          videos: storedVideos,
        },
      });

      results.push({
        blog,
        optimization: parsed.optimization,
        images: storedImages,
        videos: storedVideos,
        originalsRetained: false,
      });
    } catch (error) {
      if (slug) await removeStoredBlogImages(slug);
      if (blogId) await deleteCmsDraftBlog(blogId);
      failed.push({ filename: document.name, message: errorMessage(error) });
      console.error("Word blog import failed", document.name, error);
    }
  }
  if (!results.length) {
    return NextResponse.json({
      ok: false,
      message: failed[0]?.message || "No blogs were imported",
      results,
      failed,
    }, { status: 409 });
  }

  return NextResponse.json({
    ok: failed.length === 0,
    results,
    failed,
    total: documents.length,
    imported: results.length,
  }, { status: failed.length ? 207 : 201 });
}
