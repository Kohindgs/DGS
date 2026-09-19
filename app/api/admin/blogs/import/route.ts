import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { parseBlogDocx, type BlogImportImage } from "@/lib/cms/blog-import";
import { injectInlineBlogImages, removeStoredBlogImages, storeBlogImages } from "@/lib/cms/blog-media";
import { injectInlineBlogVideos, storeBlogVideos } from "@/lib/cms/blog-video";
import { attachImportedBlogPackage, createCmsBlog } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DOCX_BYTES = 10 * 1024 * 1024;

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

function isImageFile(file: File) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

function isVideoFile(file: File) {
  return file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
}
export async function POST(request: Request) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const form = await request.formData();
  const document = form.get("document");
  if (!(document instanceof File) || !document.name.toLowerCase().endsWith(".docx")) {
    return NextResponse.json({ ok: false, message: "A .docx blog file is required" }, { status: 400 });
  }
  if (document.size > MAX_DOCX_BYTES) {
    return NextResponse.json({ ok: false, message: "Word file exceeds 10 MB" }, { status: 413 });
  }

  const parsed = await parseBlogDocx(Buffer.from(await document.arrayBuffer()), document.name);
  const imageFiles = form.getAll("images").filter((item): item is File => item instanceof File && isImageFile(item));
  const images: BlogImportImage[] = [];
  for (const file of imageFiles) {
    images.push({ filename: file.name, mimeType: file.type, buffer: Buffer.from(await file.arrayBuffer()) });
  }
  const videoFiles = form.getAll("videos").filter((item): item is File => item instanceof File && isVideoFile(item));
  const videos: BlogImportImage[] = [];
  for (const file of videoFiles) {
    videos.push({ filename: file.name, mimeType: file.type || "video/mp4", buffer: Buffer.from(await file.arrayBuffer()) });
  }

  let storedImages = [] as Awaited<ReturnType<typeof storeBlogImages>>;
  let storedVideos = [] as Awaited<ReturnType<typeof storeBlogVideos>>;
  try {
    storedImages = await storeBlogImages(parsed.slug, parsed.title, images);
    storedVideos = await storeBlogVideos(parsed.slug, videos);
    const blog = await createCmsBlog({ title: parsed.title, slug: parsed.slug, excerpt: parsed.excerpt });
    await attachImportedBlogPackage({
      blogId: blog.id,
      slug: parsed.slug,
      title: parsed.title,
      content: {
        version: 1,
        bodyHtml: injectInlineBlogVideos(injectInlineBlogImages(parsed.bodyHtml, storedImages), storedVideos),
        sourceHash: parsed.sourceHash,
        optimization: parsed.optimization,
        images: storedImages,
        videos: storedVideos,
      },
    });
    return NextResponse.json({ ok: true, blog, optimization: parsed.optimization, images: storedImages, videos: storedVideos, originalsRetained: false }, { status: 201 });
  } catch (error) {
    await removeStoredBlogImages(parsed.slug);
    const pgCode = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code || "") : "";
    if (pgCode === "23505") return NextResponse.json({ ok: false, message: "A blog with this slug already exists" }, { status: 409 });
    console.error("Word blog import failed", error);
    return NextResponse.json({ ok: false, message: "Blog import failed" }, { status: 500 });
  }
}
