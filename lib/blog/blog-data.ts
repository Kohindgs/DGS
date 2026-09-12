import { readFile } from "node:fs/promises";
import { join } from "node:path";
import registryData from "@/data/migration/nextjs-route-registry.generated.json";
import innerMirrorIndex from "@/data/wordpress/mirrors/index.json";

export type BlogPostMeta = {
  path: string;
  slug: string;
  title: string;
  h1: string;
  description: string;
  canonical: string;
  date: string;
  modified: string;
  featuredImage: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  category: string;
  readingTimeMinutes: number;
};

export type BlogPostFaq = {
  question: string;
  answer: string;
};

export type BlogPostDetail = BlogPostMeta & {
  bodyHtml: string;
  faqs: BlogPostFaq[];
};

const routeMap = new Map<string, typeof registryData.routes[0]>();
for (const r of registryData.routes) {
  if (r.path.startsWith("/blogs/") && r.path !== "/blogs/") {
    routeMap.set(r.path, r);
  }
}

const DEFAULT_IMAGE = "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SEO-Services.webp";

function extractFeaturedImageFromHtml(html: string): BlogPostMeta["featuredImage"] {
  const cmsmastersMatch = html.match(
    /class=["'][^"']*cmsmasters-post-featured-image[^"']*["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/i,
  );
  if (cmsmastersMatch) {
    return {
      src: cmsmastersMatch[1],
      alt: cmsmastersMatch[2] || "D'Genius Solutions Blog",
      width: 1200,
      height: 675,
    };
  }

  const anyImgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:webp|png|jpg|jpeg))["'][^>]*alt=["']([^"']*)["']/i);
  if (anyImgMatch) {
    return {
      src: anyImgMatch[1],
      alt: anyImgMatch[2] || "D'Genius Solutions Blog",
      width: 1200,
      height: 675,
    };
  }

  return {
    src: DEFAULT_IMAGE,
    alt: "D'Genius Solutions Blog",
    width: 1200,
    height: 675,
  };
}

function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(wordCount / 200));
}

function inferCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("ai") || lower.includes("llm") || lower.includes("chatgpt") || lower.includes("video")) {
    return "AI & Technology";
  }
  if (lower.includes("seo") || lower.includes("search") || lower.includes("google") || lower.includes("aeo") || lower.includes("geo")) {
    return "SEO & Search";
  }
  if (lower.includes("website") || lower.includes("development") || lower.includes("speed")) {
    return "Web & Tech";
  }
  return "Digital Marketing";
}

let cachedBlogMetas: BlogPostMeta[] | null = null;

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  if (cachedBlogMetas) return cachedBlogMetas;

  const mirrorIndex = innerMirrorIndex as { pages?: Record<string, string> };
  const posts: BlogPostMeta[] = [];

  for (const [path, r] of routeMap.entries()) {
    const filename = mirrorIndex.pages?.[path];
    let featuredImage = { src: DEFAULT_IMAGE, alt: r.title || "Blog Article" };
    let readingTime = 5;

    if (filename) {
      try {
        const raw = await readFile(join(process.cwd(), "data/wordpress/mirrors/pages", filename), "utf8");
        const mirror = JSON.parse(raw) as { body?: string };
        if (mirror.body) {
          featuredImage = extractFeaturedImageFromHtml(mirror.body);
          readingTime = calculateReadingTime(mirror.body);
        }
      } catch {
        /* use defaults */
      }
    }

    posts.push({
      path: r.path,
      slug: r.slug || r.path.replace(/^\/blogs\/|\/$/g, ""),
      title: r.title || r.h1 || "Blog Article",
      h1: r.h1 || r.title || "Blog Article",
      description: r.description || "",
      canonical: r.canonical || `https://www.dgeniussolutions.com${r.path}`,
      date: r.date || "2026-01-01T00:00:00",
      modified: r.modified || r.date || "2026-01-01T00:00:00",
      featuredImage,
      category: inferCategory(r.title || ""),
      readingTimeMinutes: readingTime,
    });
  }

  // Sort descending by date
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  cachedBlogMetas = posts;
  return posts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const normSlug = slug.replace(/^\/blogs\/|\/$/g, "");
  const path = `/blogs/${normSlug}/`;
  const route = routeMap.get(path);
  if (!route) return null;

  const allPosts = await getAllBlogPosts();
  const meta = allPosts.find((p) => p.slug === normSlug || p.path === path);
  if (!meta) return null;

  const mirrorIndex = innerMirrorIndex as { pages?: Record<string, string> };
  const filename = mirrorIndex.pages?.[path];
  if (!filename) return null;

  const raw = await readFile(join(process.cwd(), "data/wordpress/mirrors/pages", filename), "utf8");
  const mirror = JSON.parse(raw) as { body?: string };
  const html = mirror.body || "";

  // Extract clean article body from entry-content
  let bodyHtml = "";
  const entryStart = html.indexOf('<div class="entry-content">');
  if (entryStart !== -1) {
    const afterStart = html.slice(entryStart + '<div class="entry-content">'.length);
    const endMarkers = [
      '<div class="xs_social_share_widget',
      '<div class="elementor-widget-cmsmasters-post-navigation',
      '<nav class="navigation post-navigation',
      '</article>',
    ];
    let minEnd = afterStart.length;
    for (const marker of endMarkers) {
      const idx = afterStart.indexOf(marker);
      if (idx !== -1 && idx < minEnd) minEnd = idx;
    }
    bodyHtml = afterStart.slice(0, minEnd).trim();
  }

  if (!bodyHtml) {
    bodyHtml = html;
  }

  // Extract actual FAQs if article has an explicit FAQ section with answers
  const faqs: BlogPostFaq[] = [];
  const faqHeadingIdx = bodyHtml.search(/<h[23][^>]*>(?:FAQs?|Frequently Asked Questions)<\/h[23]>/i);
  if (faqHeadingIdx !== -1) {
    const faqSnippet = bodyHtml.slice(faqHeadingIdx);
    const qMatches = [...faqSnippet.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>\s*<p>([\s\S]*?)<\/p>/gi)];
    for (const qm of qMatches) {
      const q = qm[1].replace(/<[^>]+>/g, "").trim();
      const a = qm[2].replace(/<[^>]+>/g, "").trim();
      if (q && a && !q.toLowerCase().includes("faq") && !q.toLowerCase().includes("related post")) {
        faqs.push({ question: q, answer: a });
      }
    }
  }

  return {
    ...meta,
    bodyHtml,
    faqs,
  };
}

export async function getRelatedBlogPosts(currentPath: string, limit = 3): Promise<BlogPostMeta[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((p) => p.path !== currentPath).slice(0, limit);
}
