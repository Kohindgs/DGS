import { NextResponse } from "next/server";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";
import { stagingRobotsHeaderValue } from "@/lib/seo/robots-policy";

export function middleware() {
  const response = NextResponse.next();

  if (!isPublicIndexingEnabled()) {
    response.headers.set("X-Robots-Tag", stagingRobotsHeaderValue());
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
