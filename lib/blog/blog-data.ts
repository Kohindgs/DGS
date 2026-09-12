import { readFile } from "node:fs/promises";
import { join } from "node:path";
import registryData from "@/data/migration/nextjs-route-registry.generated.json";
import innerMirrorIndex from "@/data/wordpress/mirrors/index.json";
import rawPostsData from "@/data/wordpress/raw/posts.json";
import rawMediaData from "@/data/wordpress/raw/media.json";
import { applyApprovedLinkCorrectionsToHtml } from "@/lib/wordpress/apply-mirror-link-corrections";

export type BlogPostMeta = {
  path: string;
  slug: string;
  title: string;
  h1: string;
  description: string;
  canonical: string;
  date?: string;
  modified?: string;
  featuredImage?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  readingTimeMinutes: number;
};

export type BlogPostFaq = {
  question: string;
  answer: string;
};

export type BlogTocItem = { id: string; text: string; level: 2 | 3 };

export type BlogPostDetail = BlogPostMeta & {
  bodyHtml: string;
  faqs: BlogPostFaq[];
  toc: BlogTocItem[];
};

const routeMap = new Map<string, typeof registryData.routes[0]>();
for (const r of registryData.routes) {
  if (r.path.startsWith("/blogs/") && r.path !== "/blogs/") {
    routeMap.set(r.path, r);
  }
}

// Map WordPress raw posts and media for genuine data
const mediaMap = new Map<number, { src: string; alt: string }>();
for (const m of rawMediaData as Array<{ id: number; source_url?: string; guid?: { rendered?: string }; alt_text?: string; title?: { rendered?: string } }>) {
  const src = m.source_url || m.guid?.rendered;
  if (src) {
    mediaMap.set(m.id, {
      src,
      alt: m.alt_text || m.title?.rendered || "",
    });
  }
}

const rawPostMap = new Map<string, { date?: string; modified?: string; featured_media?: number }>();
for (const p of rawPostsData as Array<{ slug?: string; date?: string; modified?: string; featured_media?: number }>) {
  if (p.slug) {
    rawPostMap.set(p.slug, {
      date: p.date,
      modified: p.modified,
      featured_media: p.featured_media,
    });
  }
}

function extractFeaturedImageFromHtml(html: string): BlogPostMeta["featuredImage"] | undefined {
  const cmsmastersMatch = html.match(
    /class=["'][^"']*cmsmasters-post-featured-image[^"']*["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/i,
  );
  if (cmsmastersMatch) {
    return {
      src: cmsmastersMatch[1],
      alt: cmsmastersMatch[2] || "",
      width: 1200,
      height: 675,
    };
  }

  const anyImgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:webp|png|jpg|jpeg))["'][^>]*alt=["']([^"']*)["']/i);
  if (anyImgMatch) {
    return {
      src: anyImgMatch[1],
      alt: anyImgMatch[2] || "",
      width: 1200,
      height: 675,
    };
  }

  return undefined;
}

function slugifyHeading(text: string, index: number): string {
  const base = text.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base || `section-${index + 1}`;
}

function addHeadingAnchors(html: string): { html: string; toc: BlogTocItem[] } {
  const toc: BlogTocItem[] = [];
  const used = new Set<string>();
  const output = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, levelRaw, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return full;
    let idMatch = String(attrs).match(/\sid=["']([^"']+)["']/i);
    let id = idMatch?.[1] || slugifyHeading(text, toc.length);
    const base = id; let n = 2; while (used.has(id)) id = `${base}-${n++}`; used.add(id);
    toc.push({ id, text, level: Number(levelRaw) as 2 | 3 });
    const cleanAttrs = idMatch ? String(attrs).replace(/\sid=["'][^"']+["']/i, "") : String(attrs);
    return `<h${levelRaw}${cleanAttrs} id="${id}">${inner}</h${levelRaw}>`;
  });
  return { html: output, toc };
}

function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(wordCount / 200));
}

let cachedBlogMetas: BlogPostMeta[] | null = null;

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  if (cachedBlogMetas) return cachedBlogMetas;

  const mirrorIndex = innerMirrorIndex as { pages?: Record<string, string> };
  const posts: BlogPostMeta[] = [];

  for (const [path, r] of routeMap.entries()) {
    const slug = r.slug || r.path.replace(/^\/blogs\/|\/$/g, "");
    const rawPost = rawPostMap.get(slug);
    const date = rawPost?.date || r.date || undefined;
    const modified = rawPost?.modified || r.modified || undefined;

    let featuredImage: BlogPostMeta["featuredImage"] | undefined;
    if (rawPost?.featured_media && mediaMap.has(rawPost.featured_media)) {
      const media = mediaMap.get(rawPost.featured_media)!;
      featuredImage = {
        src: media.src,
        alt: media.alt || r.title || "",
        width: 1200,
        height: 675,
      };
    }

    const filename = mirrorIndex.pages?.[path];
    let readingTime = 5;

    if (filename) {
      try {
        const raw = await readFile(join(process.cwd(), "data/wordpress/mirrors/pages", filename), "utf8");
        const mirror = JSON.parse(raw) as { body?: string };
        if (mirror.body) {
          if (!featuredImage) {
            featuredImage = extractFeaturedImageFromHtml(mirror.body);
          }
          readingTime = calculateReadingTime(mirror.body);
        }
      } catch {
        /* ignore */
      }
    }

    posts.push({
      path: r.path,
      slug,
      title: r.title || r.h1 || "Blog Article",
      h1: r.h1 || r.title || "Blog Article",
      description: r.description || "",
      canonical: r.canonical || `https://www.dgeniussolutions.com${r.path}`,
      date,
      modified,
      featuredImage,
      readingTimeMinutes: readingTime,
    });
  }

  // Sort descending by date where present
  posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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

  bodyHtml = applyApprovedLinkCorrectionsToHtml(path, bodyHtml);
  const anchored = addHeadingAnchors(bodyHtml);
  bodyHtml = anchored.html;

  // Extract actual FAQs if article has an explicit FAQ section with answers for FAQPage schema
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
    toc: anchored.toc,
  };
}

export async function getRelatedBlogPosts(currentPath: string, limit = 3): Promise<BlogPostMeta[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((p) => p.path !== currentPath).slice(0, limit);
}
