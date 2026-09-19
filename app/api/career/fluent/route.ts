import { NextResponse } from "next/server";

const WP_ORIGIN = (process.env.DGS_WORDPRESS_BACKEND_ORIGIN || "https://wp-origin.dgeniussolutions.com").replace(/\/+$/, "");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.arrayBuffer();
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Accept", "application/json, text/javascript, */*; q=0.01");
    headers.set("X-Requested-With", "XMLHttpRequest");
    headers.set("Referer", "https://www.dgeniussolutions.com/career/");
    headers.set("User-Agent", "DGS-Career-Form-Proxy/1.0");

    const upstream = await fetch(`${WP_ORIGIN}/wp-admin/admin-ajax.php`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const responseBody = await upstream.arrayBuffer();
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, data: { message: "Career form request failed. Please try again." } },
      { status: 502 },
    );
  }
}
