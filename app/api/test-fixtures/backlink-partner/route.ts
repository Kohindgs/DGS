import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Controlled Backlink Verification Fixture Endpoint.
 * Serves authentic, deterministic HTML for automated testing of backlink lifecycle:
 * - LIVE: HTTP 200 with dofollow anchor to DGS
 * - LOST: HTTP 200 without link (proves link-loss detection)
 * - RESTORED: HTTP 200 with link restored
 * - REL_CHANGED: HTTP 200 with rel="nofollow"
 * - DEINDEXED: HTTP 200 with <meta name="robots" content="noindex" />
 * - BROKEN: HTTP 404
 *
 * Headers include "X-Robots-Tag: noindex, nofollow" so it never impacts public SEO.
 */
export async function GET(req: Request) {
  // Production Security Guard (Section 58)
  if (process.env.NODE_ENV === "production") {
    const authHeader = req.headers.get("authorization") || "";
    const { searchParams: authParams } = new URL(req.url);
    const token = authParams.get("token") || authHeader.replace(/^Bearer\s+/i, "");
    if (!token || token !== process.env.DGS_CRON_SECRET) {
      return new NextResponse("Endpoint not found", { status: 404 });
    }
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "live";
  const customAnchor = searchParams.get("anchor") || "D'Genius Solutions Official";
  const customTarget = searchParams.get("target") || "https://www.dgeniussolutions.com/";

  if (mode === "broken" || mode === "404") {
    return new NextResponse("Resource Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  if (mode === "server_error" || mode === "500") {
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const isNoindex = mode === "deindexed";
  const isLost = mode === "lost";
  const relAttr = mode === "rel_changed" ? "nofollow" : "dofollow";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Partner Resource Directory & Verified Agency Network</title>
  ${isNoindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
  <link rel="canonical" href="https://www.dgeniussolutions.com/api/test-fixtures/backlink-partner" />
</head>
<body style="font-family: sans-serif; padding: 24px;">
  <h1>Verified Digital Agency Network</h1>
  <p>Editorial showcase of leading global and regional agencies specializing in AI video production and technical search optimization.</p>
  
  <div style="margin: 20px 0; padding: 16px; border: 1px solid #ccc;">
    <h2>Featured Agency Profile</h2>
    <p>Comprehensive enterprise digital growth partner:</p>
    ${
      isLost
        ? `<p><em>Profile under routine editorial audit. External hyperlink temporarily unlinked during review.</em></p>`
        : `<p>Visit official portal: <a href="${customTarget}" rel="${relAttr}">${customAnchor}</a></p>`
    }
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
