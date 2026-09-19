import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { parseBlogDocx, type BlogImportImage } from "@/lib/cms/blog-import";
import { injectInlineBlogImages, removeStoredBlogImages, storeBlogImages } from "@/lib/cms/blog-media";
import { attachImportedBlogPackage, createCmsBlog } from "@/lib/cms/blogs";

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

function isMediaFile(file: File) {
  return ["image/jpeg", "image/png", "image/webp", "video/mp4"].includes(file.type);
}

function duplicateError(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  const code = String((error as { code?: unknown }).code || "");
  return code === "23505" || code === "ER_DUP_ENTRY";
}
export async function POST(request: Request) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const form = await request.formData();
  const documents = [
    ...form.getAll("documents"),
    ...form.getAll("document"),
  ].filter((item): item is File => item instanceof File && item.name.toLowerCase().endsWith(".docx"));

  if (!documents.length) {
    return NextResponse.json({ ok: false, message: "At least one .docx blog file is required" }, { status: 400 });
  }
  if (documents.length > MAX_DOCUMENTS) {
    return NextResponse.json({ ok: false, message: `Maximum ${MAX_DOCUMENTS} Word files per batch` }, { status: 413 });
  }
  if (documents.some((document) => document.size > MAX_DOCX_BYTES)) {
    return NextResponse.json({ ok: false, message: "One or more Word files exceed 10 MB" }, { status: 413 });
  }

  const mediaFiles = form.getAll("images").filter((item): item is File => item instanceof File && isMediaFile(item));
  const media: BlogImportImage[] = [];
  for (const file of mediaFiles) {
    media.push({ filename: file.name, mimeType: file.type, buffer: Buffer.from(await file.arrayBuffer()) });
  }

  const results: Array<Record<string, unknown>> = [];
  const failures: Array<{ filename: string; message: string }> = [];
  for (const document of documents) {
    const parsed = await parseBlogDocx(Buffer.from(await document.arrayBuffer()), document.name);
    let storedImages = [] as Awaited<ReturnType<typeof storeBlogImages>>;
    try {
      storedImages = await storeBlogImages(parsed.slug, parsed.title, media);
      const blog = await createCmsBlog({
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
      });
      await attachImportedBlogPackage({
        blogId: blog.id,
        slug: parsed.slug,
        title: parsed.title,
        content: {
          version: 1,
          bodyHtml: injectInlineBlogImages(parsed.bodyHtml, storedImages),
          sourceHash: parsed.sourceHash,
          optimization: parsed.optimization,
          images: storedImages,
        },
      });
      results.push({
        blog,
        sourceFilename: document.name,
        optimization: parsed.optimization,
        images: storedImages,
        originalsRetained: false,
      });
    } catch (error) {
      await removeStoredBlogImages(parsed.slug);
      failures.push({
        filename: document.name,
        message: duplicateError(error) ? "A blog with this title/slug already exists" : "Blog import failed",
      });
      if (!duplicateError(error)) console.error("Word blog import failed", document.name, error);
    }
  }
  const responseStatus = results.length && failures.length ? 207 : results.length ? 201 : 400;
  return NextResponse.json({
    ok: failures.length === 0,
    imported: results.length,
    failed: failures.length,
    results,
    failures,
  }, { status: responseStatus });
}
