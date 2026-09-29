import type { RouteRecord } from "@/lib/nextjs/routes";
import type { BreadcrumbItem } from "@/lib/schema/builders";

export type InnerPageVariant =
  | "service"
  | "blog"
  | "blog-archive"
  | "listing"
  | "contact"
  | "career"
  | "page";

export function resolveInnerPageVariant(path: string, wordpressType: RouteRecord["wordpressType"]): InnerPageVariant {
  if (wordpressType === "service") return "service";
  if (wordpressType === "post") return "blog";
  if (path === "/blogs/") return "blog-archive";
  if (path === "/our-services/" || path === "/case_studies/") return "listing";
  if (path === "/contact-us/") return "contact";
  if (path === "/career/") return "career";
  return "page";
}

import { getPageSeoOverride } from "@/lib/seo/page-overrides";

export function buildPageBreadcrumbs(
  path: string,
  route: Pick<RouteRecord, "path" | "wordpressType" | "title">,
): BreadcrumbItem[] {
  const segments = path.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ name: "Home", path: "/" }];
  const seoOverride = getPageSeoOverride(path);

  if (route.wordpressType === "service" && segments[0] === "services") {
    crumbs.push({ name: "Services", path: "/our-services/" });
    crumbs.push({ name: seoOverride?.breadcrumbLabel || route.title || "Service", path });
  } else if (route.wordpressType === "post" && segments[0] === "blogs") {
    crumbs.push({ name: "Blogs", path: "/blogs/" });
    crumbs.push({ name: seoOverride?.breadcrumbLabel || route.title || "Post", path });
  } else if (path === "/") {
    return [];
  } else {
    let built = "";
    for (let i = 0; i < segments.length; i++) {
      built += "/" + segments[i];
      const isLast = i === segments.length - 1;
      const name = isLast && seoOverride?.breadcrumbLabel
        ? seoOverride.breadcrumbLabel
        : segments[i].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({ name, path: built + "/" });
    }
  }

  return crumbs;
}
