import { NextRequest, NextResponse } from "next/server";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";
import { stagingRobotsHeaderValue } from "@/lib/seo/robots-policy";
import { getRetiredRoute } from "@/lib/migration/retired-routes";

export function middleware(request: NextRequest) {
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
