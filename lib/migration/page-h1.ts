import type { RouteRecord } from "@/lib/nextjs/routes";
import type { ContentBlock } from "@/lib/content/types";

const CONTACT_VISIBLE_H1 = "Let's build together.";
const CAREERS_VISIBLE_H1 = "Join Our Team";

export function resolvePageH1(route: RouteRecord, blocks: ContentBlock[] = []): string {
  if (route.path === "/contact-us/") {
    const visible = route.headings?.find((heading) => heading.text === CONTACT_VISIBLE_H1);
    if (visible) return visible.text;
  }

  if (route.path === "/career/") {
    const visible =
      blocks.find((block) => block.type === "heading" && block.level === 1 && block.text === CAREERS_VISIBLE_H1) ||
      route.headings?.find((heading) => heading.text === CAREERS_VISIBLE_H1);
    if (visible) return "text" in visible ? visible.text : CAREERS_VISIBLE_H1;
    return CAREERS_VISIBLE_H1;
  }

  return route.h1 || route.title || "Page";
}
