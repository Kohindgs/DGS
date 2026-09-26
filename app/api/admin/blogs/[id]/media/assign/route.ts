import { NextResponse, NextRequest } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { logAuditEvent } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { getCmsBlogById, updateCmsBlog } from "@/lib/cms/blogs";
import { getMediaAssetById, recordMediaUsage } from "@/lib/cms/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return 404;
  if (!(await hasAdminSession())) return 401;
  if (!isCmsDatabaseConfigured()) return 503;
  return 200;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "Blog ID required" }, { status: 400 });

  const blog = await getCmsBlogById(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Blog not found" }, { status: 404 });

  const body = await request.json();
  const { assetId, action, altText } = body;

  if (!assetId || !action) {
    return NextResponse.json({ ok: false, message: "assetId and action are required" }, { status: 400 });
  }

  const asset = await getMediaAssetById(assetId);
  if (!asset && action !== "ignore") {
    return NextResponse.json({ ok: false, message: "Media asset not found in Media CMS" }, { status: 404 });
  }

  if (action === "ignore") {
    await logAuditEvent({
      actor_email: "admin@dgeniussolutions.com",
      role: "admin",
      action: "BLOG_MEDIA_IGNORED",
      resource: "blog_post",
      resource_id: id,
      summary: `Ignored ambiguous media asset "${asset?.filename || assetId}" for blog "${blog.title}"`,
      status: "success",
    });
    return NextResponse.json({ ok: true, message: "Media asset ignored.", action: "ignore" });
  }

  if (action === "featured") {
    if (!asset) return NextResponse.json({ ok: false, message: "Media asset not found" }, { status: 404 });

    await updateCmsBlog(id, {
      featured_image_url: asset.public_url,
    });

    try {
      await recordMediaUsage({
        mediaId: asset.id,
        entityType: "blog_post",
        entityId: id,
        route: `/blogs/${blog.slug}/`,
        field: "featured_image",
      });
    } catch {
      // non-blocking
    }

    await logAuditEvent({
      actor_email: "admin@dgeniussolutions.com",
      role: "admin",
      action: "BLOG_MEDIA_ASSIGNED",
      resource: "blog_post",
      resource_id: id,
      summary: `Manually assigned media "${asset.filename}" as featured image for blog "${blog.title}"`,
      after_state: {
        featured_image_url: asset.public_url,
        assetId: asset.id,
        filename: asset.filename,
        action: "featured",
      },
      status: "success",
    });

    const updated = await getCmsBlogById(id);
    return NextResponse.json({
      ok: true,
      message: `Assigned "${asset.filename}" as featured image.`,
      action: "featured",
      blog: updated,
    });
  }

  if (action === "inline") {
    if (!asset) return NextResponse.json({ ok: false, message: "Media asset not found" }, { status: 404 });

    const cleanAlt = (altText || asset.alt_text || blog.title).replace(/"/g, "&quot;");
    const figureHtml = `\n<figure class="dgs-blog-inline-image"><img src="${asset.public_url}" alt="${cleanAlt}" width="${asset.width || 1200}" height="${asset.height || 675}" loading="lazy" decoding="async" /></figure>\n`;

    const currentBody = blog.content?.bodyHtml || "";
    let newBody = currentBody;
    if (currentBody.includes("</h2>")) {
      newBody = currentBody.replace("</h2>", `</h2>\n${figureHtml}`);
    } else {
      newBody = currentBody + figureHtml;
    }

    const existingImages = blog.content?.images || [];
    const updatedImages = [
      ...existingImages.filter((img) => img.url !== asset.public_url),
      {
        filename: asset.filename,
        url: asset.public_url,
        mimeType: asset.mime_type,
        featured: false,
        altText: cleanAlt,
        width: asset.width || undefined,
        height: asset.height || undefined,
        bytes: Number(asset.file_size || 0),
      },
    ];

    await updateCmsBlog(id, {
      bodyHtml: newBody,
      images: updatedImages,
    });

    try {
      await recordMediaUsage({
        mediaId: asset.id,
        entityType: "blog_post",
        entityId: id,
        route: `/blogs/${blog.slug}/`,
        field: "inline_image",
      });
    } catch {
      // non-blocking
    }

    await logAuditEvent({
      actor_email: "admin@dgeniussolutions.com",
      role: "admin",
      action: "BLOG_MEDIA_ASSIGNED",
      resource: "blog_post",
      resource_id: id,
      summary: `Manually inserted media "${asset.filename}" inline into blog "${blog.title}"`,
      after_state: {
        assetId: asset.id,
        filename: asset.filename,
        action: "inline",
      },
      status: "success",
    });

    const updated = await getCmsBlogById(id);
    return NextResponse.json({
      ok: true,
      message: `Inserted "${asset.filename}" as inline image.`,
      action: "inline",
      blog: updated,
    });
  }

  return NextResponse.json({ ok: false, message: "Invalid action" }, { status: 400 });
}
