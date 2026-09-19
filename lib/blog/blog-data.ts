import { readFile } from "node:fs/promises";
import { join } from "node:path";
import registryData from "@/data/migration/nextjs-route-registry.generated.json";
import innerMirrorIndex from "@/data/wordpress/mirrors/index.json";
import rawPostsData from "@/data/wordpress/raw/posts.json";
import rawMediaData from "@/data/wordpress/raw/media.json";
import { applyApprovedLinkCorrectionsToHtml } from "@/lib/wordpress/apply-mirror-link-corrections";
import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";

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

const BLOG_H1_CORRECTIONS: Record<string, string> = {
  "/blogs/geo-vs-seo-google-ai-search/": "GEO vs SEO: How to Rank in Google and AI Search",
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
      src: rewriteWpUrls(src),
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
      src: rewriteWpUrls(cmsmastersMatch[1]),
      alt: cmsmastersMatch[2] || "",
      width: 1200,
      height: 675,
    };
  }

  const anyImgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:webp|png|jpg|jpeg))["'][^>]*alt=["']([^"']*)["']/i);
  if (anyImgMatch) {
    return {
      src: rewriteWpUrls(anyImgMatch[1]),
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
    const idMatch = String(attrs).match(/\sid=["']([^"']+)["']/i);
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
      h1: BLOG_H1_CORRECTIONS[r.path] || r.h1 || r.title || "Blog Article",
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
  bodyHtml = rewriteWpUrls(bodyHtml);
  bodyHtml = bodyHtml.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>");
  const anchored = addHeadingAnchors(bodyHtml);
  bodyHtml = anchored.html;

  // Extract actual FAQs only from an explicit visible FAQ section.
  const faqs: BlogPostFaq[] = [];
  const headings = [...bodyHtml.matchAll(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi)];
  let faqHeading: RegExpMatchArray | undefined;
  for (const match of headings) {
    const text = match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (/\bfaqs?\b|frequently asked questions/i.test(text)) faqHeading = match;
  }
  const faqHeadingIdx = faqHeading?.index ?? -1;
  if (faqHeadingIdx !== -1) {
    const faqSnippet = bodyHtml.slice(faqHeadingIdx);
    const qMatches = [...faqSnippet.matchAll(/<h[234][^>]*>([\s\S]*?)<\/h[234]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)];
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

const RELATED_STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "cannot", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for",
  "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
  "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "lets", "me", "more",
  "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such",
  "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they",
  "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what",
  "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours",
  "yourself", "yourselves", "dgenius", "solutions", "guide", "need", "know", "complete", "ways", "powerful",
  "tips", "best", "vs", "2026", "helps", "smart", "proven", "simple", "step"
]);

const TOPIC_SYNONYMS: Record<string, string[]> = {
  geo: ["generative", "engine", "optimization", "aeo", "llm", "ai-search", "perplex"],
  generative: ["geo", "engine", "ai", "search", "llm", "overview"],
  llm: ["geo", "ai", "search", "models", "chatgpt", "perplexity", "copilot"],
  video: ["production", "visual", "reels", "media", "creative", "youtube"],
  ads: ["meta", "google", "campaigns", "ppc", "advertising", "leads", "ad"],
  website: ["design", "development", "cro", "traffic", "speed", "landing", "pages"],
  seo: ["ranking", "search", "optimization", "google", "audit", "organic"],
  leads: ["generation", "conversion", "traffic", "sales", "business", "growth"],
};

function tokenizeBlogText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .map((w) => w.trim())
    .filter((w) => (w.length > 2 || w === "ai" || w === "ad" || w === "ui") && !RELATED_STOP_WORDS.has(w));
}

function calculatePostRelevance(
  source: { slugTokens: string[]; titleTokens: string[]; descTokens: string[] },
  candidate: { slugTokens: string[]; titleTokens: string[]; descTokens: string[] }
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  for (const t of source.slugTokens) {
    if (candidate.slugTokens.includes(t)) {
      score += 8;
      reasons.push(`matching core topic term "${t}"`);
    } else if (candidate.titleTokens.includes(t)) {
      score += 5;
      reasons.push(`core term "${t}" in title`);
    } else if (TOPIC_SYNONYMS[t]) {
      for (const syn of TOPIC_SYNONYMS[t]) {
        if (candidate.slugTokens.includes(syn) || candidate.titleTokens.includes(syn)) {
          score += 3;
          reasons.push(`semantic relevance between "${t}" and "${syn}"`);
          break;
        }
      }
    }
  }

  for (const t of source.titleTokens) {
    if (candidate.slugTokens.includes(t) && !source.slugTokens.includes(t)) {
      score += 5;
      reasons.push(`title term "${t}" in slug`);
    } else if (candidate.titleTokens.includes(t) && !source.slugTokens.includes(t)) {
      score += 3;
      reasons.push(`shared title keyword "${t}"`);
    }
  }

  const commonDesc = source.descTokens.filter((t) => candidate.descTokens.includes(t) && !source.titleTokens.includes(t));
  if (commonDesc.length > 0) {
    score += Math.min(commonDesc.length, 4);
    reasons.push(`shared conceptual context (${commonDesc.slice(0, 3).join(", ")})`);
  }

  return {
    score,
    reason: [...new Set(reasons)].slice(0, 2).join("; ") || "related digital marketing strategy",
  };
}

export type RelatedBlogPostResult = BlogPostMeta & {
  relevanceScore: number;
  relevanceReason: string;
};

export async function getRelatedBlogPostsWithDetails(
  currentPath: string,
  limit = 3
): Promise<RelatedBlogPostResult[]> {
  const posts = await getAllBlogPosts();
  const current = posts.find((p) => p.path === currentPath);
  if (!current) {
    return posts.filter((p) => p.path !== currentPath).slice(0, limit).map((p) => ({
      ...p,
      relevanceScore: 0,
      relevanceReason: "fallback latest post",
    }));
  }

  const currentTokens = {
    slugTokens: tokenizeBlogText(current.slug),
    titleTokens: tokenizeBlogText(current.title || current.h1),
    descTokens: tokenizeBlogText(current.description),
  };

  const candidates = posts
    .filter((p) => p.path !== currentPath)
    .map((p) => {
      const candidateTokens = {
        slugTokens: tokenizeBlogText(p.slug),
        titleTokens: tokenizeBlogText(p.title || p.h1),
        descTokens: tokenizeBlogText(p.description),
      };
      const { score, reason } = calculatePostRelevance(currentTokens, candidateTokens);
      return {
        ...p,
        relevanceScore: score,
        relevanceReason: score > 0 ? reason : "fallback latest post",
      };
    });

  // Sort primary matches by score descending
  const scoredMatches = candidates.filter((c) => c.relevanceScore > 0);
  scoredMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // If fewer than limit, append unscored posts as fallback
  const fallbacks = candidates.filter((c) => c.relevanceScore === 0);
  const combined = [...scoredMatches, ...fallbacks];

  return combined.slice(0, limit);
}

export async function getRelatedBlogPosts(currentPath: string, limit = 3): Promise<BlogPostMeta[]> {
  const detailed = await getRelatedBlogPostsWithDetails(currentPath, limit);
  return detailed.map((p) => {
    const copy = { ...p } as Partial<RelatedBlogPostResult>;
    delete copy.relevanceScore;
    delete copy.relevanceReason;
    return copy as BlogPostMeta;
  });
}

