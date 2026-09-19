import { NextResponse } from "next/server";

const WP_ORIGIN = (process.env.DGS_WORDPRESS_BACKEND_ORIGIN || "https://wp-origin.dgeniussolutions.com").replace(/\/+$/, "");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = new URL("/wp-json/dgs/v1/form-context", WP_ORIGIN);
    url.searchParams.set("form_id", "15");
    url.searchParams.set("post_id", "55238");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DGS-Career-Form/1.0",
      },
      cache: "no-store",
    });

    const payload = await response.json();
    if (!response.ok || typeof payload?.html !== "string") {
      return NextResponse.json(
        { ok: false, message: payload?.message || "Career form unavailable." },
        { status: 502 },
      );
    }

    const html = payload.html
      .replaceAll("https://wp-origin.dgeniussolutions.com/wp-admin/admin-ajax.php", "/api/career/fluent")
      .replaceAll("https:\/\/wp-origin.dgeniussolutions.com\/wp-admin\/admin-ajax.php", "\/api\/career\/fluent");

    return NextResponse.json(
      { ok: true, html },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to load the career application form." },
      { status: 502 },
    );
  }
}
