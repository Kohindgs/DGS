import { NextRequest, NextResponse } from "next/server";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";
import { stagingRobotsHeaderValue } from "@/lib/seo/robots-policy";
import { getRetiredRoute } from "@/lib/migration/retired-routes";
import { getApprovedRedirectDestination } from "@/lib/migration/route-decisions";
import redirectRegistry from "@/data/migration/redirects.approved.json";
import { normalizeSitePath } from "@/lib/seo/metadata";

const approvedRedirects = new Map(
  (redirectRegistry.redirects as Array<{ source: string; destination: string; statusCode?: number }>).map(
    (redirect) => [normalizeSitePath(redirect.source), redirect],
  ),
);

export function middleware(request: NextRequest) {
  const pathname = normalizeSitePath(request.nextUrl.pathname);
  const decisionRedirect = getApprovedRedirectDestination(pathname);
  const configRedirect = approvedRedirects.get(pathname);
  const redirectDestination = decisionRedirect || configRedirect?.destination;

  if (redirectDestination) {
    const url = request.nextUrl.clone();
    url.pathname = normalizeSitePath(redirectDestination);
    url.search = "";
    const response = NextResponse.redirect(url, configRedirect?.statusCode ?? 301);
    if (!isPublicIndexingEnabled()) {
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

  if (!isPublicIndexingEnabled()) {
    response.headers.set("X-Robots-Tag", stagingRobotsHeaderValue());
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
