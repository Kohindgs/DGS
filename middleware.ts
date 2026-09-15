import { NextRequest, NextResponse } from "next/server";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";
import { stagingRobotsHeaderValue } from "@/lib/seo/robots-policy";
import { getRetiredRoute } from "@/lib/migration/retired-routes";
import { getApprovedRedirectDestination } from "@/lib/migration/route-decisions";
import redirectRegistry from "@/data/migration/redirects.approved.json";
import { normalizeSitePath } from "@/lib/seo/metadata";

type RedirectEntry = { source: string; destination: string; statusCode?: number };

const approvedRedirects = new Map<string, RedirectEntry>();
for (const redirect of (redirectRegistry.redirects as RedirectEntry[])) {
  const norm = normalizeSitePath(redirect.source);
  approvedRedirects.set(norm, redirect);
  approvedRedirects.set(redirect.source, redirect);
  if (redirect.source.endsWith("/")) {
    approvedRedirects.set(redirect.source.slice(0, -1), redirect);
  } else {
    approvedRedirects.set(redirect.source + "/", redirect);
  }
}

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  const proto = (request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "")).toLowerCase();
  const isStaging = host.includes("hostingersite.com") || host.includes("localhost") || host.includes("127.0.0.1");
  const shouldApplyStagingRobots = isStaging || !isPublicIndexingEnabled();

  const rawPath = request.nextUrl.pathname;
  const pathname = normalizeSitePath(rawPath);
  const decisionRedirect = getApprovedRedirectDestination(pathname) || getApprovedRedirectDestination(rawPath);
  const configRedirect = approvedRedirects.get(pathname) || approvedRedirects.get(rawPath);
  const redirectDestination = decisionRedirect || configRedirect?.destination;

  // 1. Single-hop path redirect: if path matches an approved redirect, redirect directly
  // to the canonical production URL (or staging origin) in a single hop.
  if (redirectDestination) {
    const targetPath = normalizeSitePath(redirectDestination);
    const targetUrl = !isStaging
      ? new URL(targetPath, "https://www.dgeniussolutions.com")
      : new URL(targetPath, request.nextUrl.origin);
    const response = NextResponse.redirect(targetUrl, configRedirect?.statusCode ?? 301);
    if (shouldApplyStagingRobots) {
      response.headers.set("X-Robots-Tag", stagingRobotsHeaderValue());
    }
    return response;
  }

  // 2. Single-hop host & protocol canonicalization: if no path redirect is needed,
  // ensure requests on dgeniussolutions.com or plain http land on https://www.dgeniussolutions.com
  if (!isStaging && (host === "dgeniussolutions.com" || (host === "www.dgeniussolutions.com" && proto === "http"))) {
    const canonicalUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, "https://www.dgeniussolutions.com");
    const response = NextResponse.redirect(canonicalUrl, 301);
    if (shouldApplyStagingRobots) {
      response.headers.set("X-Robots-Tag", stagingRobotsHeaderValue());
    }
    return response;
  }

  const retired = getRetiredRoute(request.nextUrl.pathname);
  if (retired?.statusCode === 410) {
    return new NextResponse("Gone", {
      status: 410,
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  const response = NextResponse.next();

  if (shouldApplyStagingRobots) {
    response.headers.set("X-Robots-Tag", stagingRobotsHeaderValue());
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
