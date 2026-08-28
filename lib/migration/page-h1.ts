import type { RouteRecord } from "@/lib/nextjs/routes";

const CONTACT_VISIBLE_H1 = "Let's build together.";

export function resolvePageH1(route: RouteRecord): string {
  if (route.path === "/contact-us/") {
    const visible = route.headings?.find((heading) => heading.text === CONTACT_VISIBLE_H1);
    if (visible) return visible.text;
  }

  return route.h1 || route.title || "Page";
}
