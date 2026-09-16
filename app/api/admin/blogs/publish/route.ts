import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { publishCmsBlog } from "@/lib/cms/blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await hasAdminSession())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isCmsDatabaseConfigured()) return NextResponse.json({ ok: false }, { status: 503 });

  const body = await request.json();
  const id = String(body?.id || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ ok: false, message: "Valid blog id required" }, { status: 400 });

  const blog = await publishCmsBlog(id);
  if (!blog) return NextResponse.json({ ok: false, message: "Draft not found or already published" }, { status: 404 });
  return NextResponse.json({ ok: true, blog });
}
