import "server-only";
import { createHash } from "node:crypto";
import mammoth from "mammoth";

export type BlogImportImage = {
  filename: string;
  mimeType: string;
  buffer: Buffer;
};

export type BlogOptimizationPackage = {
  seo: { title: string; description: string; h1: string; canonicalPath: string; focusKeyword: string; secondaryKeywords: string[] };
  aeo: { conciseAnswer: string; questions: string[] };
  geo: { entities: string[]; topics: string[]; keyFacts: string[] };
  llm: { answerSummary: string; citableFacts: string[]; semanticHeadings: string[] };
  schemas: Record<string, unknown>[];
};

export type ParsedBlogDocument = {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  sourceHash: string;
  optimization: BlogOptimizationPackage;
};
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function sentenceList(text: string) {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function extractHeadings(html: string) {
  return [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter(Boolean);
}

function extractFaqPairs(html: string) {
  const pairs: Array<{ question: string; answer: string }> = [];
  for (const match of html.matchAll(/<h[23][^>]*>([\s\S]*?\?)<\/h[23]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const question = stripHtml(match[1]);
    const answer = stripHtml(match[2]);
    if (question && answer) pairs.push({ question, answer });
  }
  return pairs.slice(0, 8);
}
function keywordCandidates(text: string) {
  const stop = new Set(["the","and","for","with","that","this","from","your","you","are","was","were","have","has","had","into","about","their","they","our","can","will","how","what","when","where","why"]);
  const counts = new Map<string, number>();
  for (const token of text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []) {
    if (stop.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key).slice(0, 10);
}

function buildOptimization(title: string, slug: string, html: string): BlogOptimizationPackage {
  const text = stripHtml(html);
  const sentences = sentenceList(text);
  const headings = extractHeadings(html);
  const faqPairs = extractFaqPairs(html);
  const keywords = keywordCandidates(`${title} ${text}`);
  const focusKeyword = keywords[0] || title.toLowerCase();
  const descriptionBase = sentences.slice(0, 2).join(" ");
  const description = descriptionBase.slice(0, 155).replace(/\s+\S*$/, "").trim() || title;
  const conciseAnswer = sentences.slice(0, 2).join(" ").slice(0, 320);
  const canonicalPath = `/blogs/${slug}/`;
  const canonicalUrl = `https://www.dgeniussolutions.com${canonicalPath}`;
  const facts = sentences.filter((s) => /\d|\b(is|are|means|helps|includes|requires)\b/i.test(s)).slice(0, 8);
  const entities = [...new Set(text.match(/\b[A-Z][A-Za-z0-9.&'-]+(?:\s+[A-Z][A-Za-z0-9.&'-]+){0,3}\b/g) || [])].slice(0, 12);
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      mainEntityOfPage: canonicalUrl,
      headline: title,
      description,
      publisher: { "@id": "https://www.dgeniussolutions.com/#organization" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.dgeniussolutions.com/" },
        { "@type": "ListItem", position: 2, name: "Blogs", item: "https://www.dgeniussolutions.com/blogs/" },
        { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
      ],
    },
  ];
  if (faqPairs.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqPairs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  return {
    seo: {
      title: title.slice(0, 60),
      description,
      h1: title,
      canonicalPath,
      focusKeyword,
      secondaryKeywords: keywords.slice(1, 7),
    },
    aeo: { conciseAnswer, questions: faqPairs.map((item) => item.question) },
    geo: { entities, topics: keywords.slice(0, 8), keyFacts: facts },
    llm: { answerSummary: conciseAnswer, citableFacts: facts, semanticHeadings: headings.slice(0, 12) },
    schemas,
  };
}

export async function parseBlogDocx(buffer: Buffer, filename: string): Promise<ParsedBlogDocument> {
  const result = await mammoth.convertToHtml({ buffer }, { includeDefaultStyleMap: true });
  let bodyHtml = result.value.trim();
  const h1 = bodyHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const filenameTitle = filename.replace(/\.docx$/i, "").replace(/[-_]+/g, " ").trim();
  const title = stripHtml(h1?.[1] || "") || filenameTitle || "Untitled Blog";
  const slug = slugify(filenameTitle || title) || slugify(title);
  bodyHtml = bodyHtml.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>");
  const text = stripHtml(bodyHtml);
  const excerpt = sentenceList(text).slice(0, 2).join(" ").slice(0, 320);
  const sourceHash = createHash("sha256").update(buffer).digest("hex");
  return { title, slug, excerpt, bodyHtml, sourceHash, optimization: buildOptimization(title, slug, bodyHtml) };
}

export function imageMatchesSlug(filename: string, slug: string) {
  const stem = slugify(filename.replace(/\.[^.]+$/, ""));
  const normalized = stem
    .replace(/-(featured|hero|cover)(-\d+)?$/i, "")
    .replace(/-(image|img|video)-?\d*$/i, "")
    .replace(/-\d+$/i, "");
  return normalized === slug;
}
