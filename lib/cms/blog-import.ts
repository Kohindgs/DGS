import { createHash } from "node:crypto";
import mammoth from "mammoth";

export type BlogImportImage = {
  filename: string;
  mimeType: string;
  buffer: Buffer;
};

export type InternalLinkSuggestion = {
  url: string;
  title: string;
  anchorText: string;
};

export type BlogOptimizationPackage = {
  seo: {
    title: string;
    description: string;
    h1: string;
    canonicalPath: string;
    focusKeyword: string;
    secondaryKeywords: string[];
  };
  aeo: {
    conciseAnswer: string;
    questions: string[];
  };
  geo: {
    entities: string[];
    topics: string[];
    keyFacts: string[];
  };
  llm: {
    answerSummary: string;
    citableFacts: string[];
    semanticHeadings: string[];
  };
  schemas: Record<string, unknown>[];
  internalLinks: InternalLinkSuggestion[];
};

export type ParsedBlogDocument = {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  sourceHash: string;
  wordCount: number;
  readingTimeMinutes: number;
  optimization: BlogOptimizationPackage;
};

export const DGS_INTERNAL_LINK_TARGETS = [
  {
    url: "/services/seo-services-in-mumbai/",
    title: "SEO Services in Mumbai",
    patterns: [
      /\b(seo services in mumbai|seo company in mumbai|seo agency in mumbai|search engine optimization services)\b/i,
      /\b(search engine optimization|seo services|seo agency)\b/i,
    ],
  },
  {
    url: "/services/ai-video-production-agency/",
    title: "AI Video Production Agency in Mumbai",
    patterns: [
      /\b(ai video production agency|ai video production company|ai brand films|generative ai video)\b/i,
      /\b(ai video production|ai video agency|ai ads)\b/i,
    ],
  },
  {
    url: "/services/performance-marketing/",
    title: "Performance Marketing Agency in Mumbai",
    patterns: [
      /\b(performance marketing agency|performance marketing services|google ads management|paid media roi)\b/i,
      /\b(performance marketing|google ads agency|meta ads agency)\b/i,
    ],
  },
  {
    url: "/services/aeo-services-in-mumbai/",
    title: "AEO Services in Mumbai",
    patterns: [
      /\b(aeo services in mumbai|answer engine optimization|answer engine optimisation)\b/i,
      /\b(aeo services|answer engine optimization)\b/i,
    ],
  },
  {
    url: "/services/geo/",
    title: "GEO Services in Mumbai",
    patterns: [
      /\b(geo services|generative engine optimization|generative engine optimisation)\b/i,
      /\b(generative engine optimization|generative engine optimisation)\b/i,
    ],
  },
  {
    url: "/services/llm-seo-service/",
    title: "LLM SEO Services in Mumbai",
    patterns: [
      /\b(llm seo services|llm search optimization|optimizing for chatgpt|ai search optimization)\b/i,
      /\b(llm seo|chatgpt search|ai search visibility)\b/i,
    ],
  },
  {
    url: "/services/website-development-amc/",
    title: "Website Development & AMC in Mumbai",
    patterns: [
      /\b(website development company in mumbai|website development amc|web development services)\b/i,
      /\b(website development|web design agency)\b/i,
    ],
  },
  {
    url: "/services/social-media-marketing/",
    title: "Social Media Marketing Agency in Mumbai",
    patterns: [
      /\b(social media marketing agency in mumbai|social media agency in mumbai|smm services)\b/i,
      /\b(social media marketing|social media agency)\b/i,
    ],
  },
  {
    url: "/services/branding/",
    title: "Branding Agency in Mumbai",
    patterns: [
      /\b(branding agency in mumbai|brand identity design|brand strategy services)\b/i,
      /\b(branding agency|brand identity)\b/i,
    ],
  },
  {
    url: "/services/content-creation/",
    title: "Content Creation Services in Mumbai",
    patterns: [
      /\b(content creation agency|content strategy services|content writing agency)\b/i,
      /\b(content creation|content strategy)\b/i,
    ],
  },
];

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function sentenceList(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractHeadings(html: string): string[] {
  return [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter(Boolean);
}

function extractFaqPairs(html: string): Array<{ question: string; answer: string }> {
  const pairs: Array<{ question: string; answer: string }> = [];
  for (const match of html.matchAll(/<h[23][^>]*>([\s\S]*?\?)<\/h[23]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const question = stripHtml(match[1]);
    const answer = stripHtml(match[2]);
    if (question && answer && answer.length >= 20) {
      pairs.push({ question, answer });
    }
  }
  return pairs.slice(0, 8);
}

function keywordCandidates(text: string): string[] {
  const stop = new Set([
    "the", "and", "for", "with", "that", "this", "from", "your", "you", "are",
    "was", "were", "have", "has", "had", "into", "about", "their", "they", "our",
    "can", "will", "how", "what", "when", "where", "why", "which", "these", "those",
    "been", "being", "more", "most", "also", "than", "then", "some", "such", "only",
    "other", "its", "over", "well", "even", "after", "before", "while", "here", "there"
  ]);
  const counts = new Map<string, number>();
  for (const token of text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []) {
    if (stop.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key)
    .slice(0, 10);
}

// Strict HTML sanitization for Word document imports
export function sanitizeBlogHtml(rawHtml: string): string {
  let html = rawHtml;

  // 1. Remove dangerous script, iframe, object, embed, style, form tags entirely
  html = html.replace(/<(script|iframe|object|embed|applet|form|input|button|style|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  html = html.replace(/<(script|iframe|object|embed|applet|form|input|button|style|svg|math)\b[^>]*\/?>/gi, "");

  // 2. Remove comments, XML processing instructions, Word VML tags
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<\?xml[^>]*>/gi, "");
  html = html.replace(/<[a-z]:[a-z][^>]*>[\s\S]*?<\/[a-z]:[a-z]>/gi, "");
  html = html.replace(/<[a-z]:[a-z][^>]*\/?>/gi, "");

  // 3. Demote document H1 tags to H2 (page hero holds H1)
  html = html.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>");

  // 4. Strip inline styles, dirty Word attributes, and event handlers
  html = html.replace(/\s+(?:style|class|align|face|color|size|bgcolor|border|cellspacing|cellpadding|valign)=["'][^"']*["']/gi, "");
  html = html.replace(/\s+on[a-z]+=["'][^"']*["']/gi, "");
  html = html.replace(/\s+href=["']\s*javascript:[^"']*["']/gi, ' href="#"');

  // 5. Clean redundant formatting wrappers: <span> tags without attributes
  html = html.replace(/<\/?span[^>]*>/gi, "");
  html = html.replace(/<\/?font[^>]*>/gi, "");

  // 6. Clean empty paragraphs
  html = html.replace(/<p\s*>\s*(?:&nbsp;|\s)*<\/p>/gi, "");

  return html.trim();
}

// Generate smart internal link opportunities
export function detectInternalLinks(html: string): { suggestions: InternalLinkSuggestion[]; linkedHtml: string } {
  const suggestions: InternalLinkSuggestion[] = [];
  const usedTargets = new Set<string>();
  let linkedHtml = html;

  for (const target of DGS_INTERNAL_LINK_TARGETS) {
    if (usedTargets.has(target.url) || suggestions.length >= 4) continue;

    for (const pattern of target.patterns) {
      const match = pattern.exec(stripHtml(html));
      if (match && match[0]) {
        suggestions.push({
          url: target.url,
          title: target.title,
          anchorText: match[0],
        });
        usedTargets.add(target.url);
        break;
      }
    }
  }

  // Inject links safely into first matching <p> paragraphs that do not already contain links
  for (const suggestion of suggestions) {
    const escapedAnchor = suggestion.anchorText.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const pRegex = new RegExp(`(<p(?:\\s+[^>]*)?>)([^<]*?\\b)(${escapedAnchor})(\\b[^<]*?)(<\\/p>)`, "i");

    if (pRegex.test(linkedHtml)) {
      linkedHtml = linkedHtml.replace(pRegex, (_full, open, before, anchor, after, close) => {
        return `${open}${before}<a href="${suggestion.url}" title="${suggestion.title}">${anchor}</a>${after}${close}`;
      });
    }
  }

  return { suggestions, linkedHtml };
}

// Build comprehensive SEO, AEO, GEO, and LLM SEO package
export function buildOptimization(title: string, slug: string, html: string): BlogOptimizationPackage {
  const text = stripHtml(html);
  const sentences = sentenceList(text);
  const headings = extractHeadings(html);
  const faqPairs = extractFaqPairs(html);
  const keywords = keywordCandidates(`${title} ${text}`);
  const focusKeyword = keywords[0] || title.toLowerCase();

  // SEO Title: max 60 chars, append DGS brand if space permits
  const brandSuffix = " | DGS";
  let seoTitle = title.trim();
  if (seoTitle.length + brandSuffix.length <= 60) {
    seoTitle = `${seoTitle}${brandSuffix}`;
  } else if (seoTitle.length > 60) {
    seoTitle = seoTitle.slice(0, 57).replace(/\s+\S*$/, "").trim() + "...";
  }

  // Meta Description: 140-155 characters
  const descriptionBase = sentences.slice(0, 2).join(" ");
  let description = descriptionBase.slice(0, 155).replace(/\s+\S*$/, "").trim();
  if (description.length < 80) {
    description = `${title}. Strategic insights, practical framework and expert execution from D’Genius Solutions Mumbai.`;
    if (description.length > 155) description = description.slice(0, 155).replace(/\s+\S*$/, "").trim();
  }

  // AEO: Concise direct answer block (40-60 words)
  const answerSentences = sentences.slice(0, 3).join(" ");
  const conciseAnswer = answerSentences.length > 320 ? answerSentences.slice(0, 317).replace(/\s+\S*$/, "").trim() + "..." : answerSentences;

  const canonicalPath = `/blogs/${slug}/`;
  const canonicalUrl = `https://www.dgeniussolutions.com${canonicalPath}`;

  // GEO: Entities, topics, key facts
  const facts = sentences
    .filter((s) => /\d|\b(is|are|means|helps|includes|requires|proven|increases|delivers)\b/i.test(s))
    .slice(0, 8);
  const entities = [
    ...new Set(
      text.match(/\b[A-Z][A-Za-z0-9.&'-]+(?:\s+[A-Z][A-Za-z0-9.&'-]+){0,3}\b/g) || []
    ),
  ]
    .filter((e) => e.length > 2 && !/^(The|And|For|With|This|That|From|Our|Your)$/i.test(e))
    .slice(0, 12);

  // Schema generation
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

  if (faqPairs.length > 0) {
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

  const { suggestions: internalLinks } = detectInternalLinks(html);

  return {
    seo: {
      title: seoTitle,
      description,
      h1: title,
      canonicalPath,
      focusKeyword,
      secondaryKeywords: keywords.slice(1, 7),
    },
    aeo: {
      conciseAnswer,
      questions: faqPairs.map((item) => item.question),
    },
    geo: {
      entities,
      topics: keywords.slice(0, 8),
      keyFacts: facts,
    },
    llm: {
      answerSummary: conciseAnswer,
      citableFacts: facts,
      semanticHeadings: headings.slice(0, 12),
    },
    schemas,
    internalLinks,
  };
}

export async function parseBlogDocx(buffer: Buffer, filename: string): Promise<ParsedBlogDocument> {
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      includeDefaultStyleMap: true,
      styleMap: [
        "p[style-name='Heading 1'] => h2:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
      ],
    }
  );

  let rawHtml = result.value.trim();

  // Extract initial title from H1 or first H2 before sanitization/demotion
  const h1Match = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2Match = rawHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const filenameTitle = filename
    .replace(/\.docx$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  const title = stripHtml(h1Match?.[1] || h2Match?.[1] || "") || filenameTitle || "Untitled Blog";
  const slug = slugify(filenameTitle || title) || slugify(title);

  // Sanitize semantic HTML
  const bodyHtml = sanitizeBlogHtml(rawHtml);
  const text = stripHtml(bodyHtml);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const sentences = sentenceList(text);
  const excerpt = sentences.slice(0, 2).join(" ").slice(0, 250);
  const sourceHash = createHash("sha256").update(buffer).digest("hex");

  const optimization = buildOptimization(title, slug, bodyHtml);

  return {
    title,
    slug,
    excerpt,
    bodyHtml,
    sourceHash,
    wordCount,
    readingTimeMinutes,
    optimization,
  };
}

export type MediaMatchConfidence = "EXACT" | "HIGH" | "MEDIUM" | "LOW" | "UNMATCHED";

export type MediaMatchResult = {
  matched: boolean;
  confidence: MediaMatchConfidence;
  score: number;
  reason: string;
  blogSlug: string;
  filename: string;
  isFeaturedCandidate: boolean;
  sequenceNumber: number | null;
};

export function evaluateMediaMatch(
  imageFilename: string,
  blogSlug: string,
  blogTitle?: string
): MediaMatchResult {
  const filename = imageFilename.trim();
  const cleanImageStem = slugify(filename.replace(/\.[^.]+$/, ""));
  const cleanBlogSlug = slugify(blogSlug);

  // Check for featured indicator
  const isFeaturedCandidate = /-(?:featured|hero|cover|banner|thumbnail|thumb)(?:-\d+)?$/i.test(cleanImageStem);

  // Check for sequence indicator
  const seqMatch = cleanImageStem.match(/(?:-(?:inline|img|image|figure|photo))?-?0*(\d+)$/i);
  const sequenceNumber = seqMatch ? parseInt(seqMatch[1], 10) : null;

  // Stripped stem removing roles and numbers
  const strippedStem = cleanImageStem
    .replace(/-(?:featured|hero|cover|banner|thumb|thumbnail|image|img|inline|figure|photo)(?:-\d+)?$/i, "")
    .replace(/-\d+$/i, "");

  // 1. EXACT: Direct equality or equality after role suffix removal
  if (cleanImageStem === cleanBlogSlug) {
    return {
      matched: true,
      confidence: "EXACT",
      score: 100,
      reason: "Exact filename match to blog slug",
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  if (strippedStem === cleanBlogSlug && strippedStem.length > 0) {
    return {
      matched: true,
      confidence: "EXACT",
      score: 95,
      reason: "Exact slug match with media role or sequence suffix",
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  // 2. HIGH: Strong prefix / substring alignment or >=80% token overlap
  if (
    strippedStem.length >= 8 &&
    cleanBlogSlug.length >= 8 &&
    (cleanBlogSlug.startsWith(strippedStem) || strippedStem.startsWith(cleanBlogSlug))
  ) {
    return {
      matched: true,
      confidence: "HIGH",
      score: 85,
      reason: "Strong stem prefix alignment with blog slug",
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  const imageTokens = cleanImageStem.split("-").filter((t) => t.length > 2);
  const blogTokens = cleanBlogSlug.split("-").filter((t) => t.length > 2);
  const blogTokenSet = new Set(blogTokens);

  let tokenMatches = 0;
  for (const token of imageTokens) {
    if (blogTokenSet.has(token)) tokenMatches++;
  }

  const tokenRatio = blogTokens.length > 0 ? tokenMatches / blogTokens.length : 0;
  const imageTokenRatio = imageTokens.length > 0 ? tokenMatches / imageTokens.length : 0;

  if (tokenMatches >= 3 && (tokenRatio >= 0.75 || imageTokenRatio >= 0.75)) {
    return {
      matched: true,
      confidence: "HIGH",
      score: 80,
      reason: `High token overlap (${tokenMatches} common terms)`,
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  // 3. MEDIUM: >= 50% overlap of image tokens or >= 40% of blog tokens and >= 2 significant tokens, or title token match
  if (tokenMatches >= 2 && (imageTokenRatio >= 0.5 || tokenRatio >= 0.4 || tokenMatches >= 3)) {
    return {
      matched: true,
      confidence: "MEDIUM",
      score: 65,
      reason: `Moderate token overlap (${tokenMatches} matching terms)`,
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  if (blogTitle) {
    const cleanTitleTokens = slugify(blogTitle).split("-").filter((t) => t.length > 2);
    const titleTokenSet = new Set(cleanTitleTokens);
    let titleMatches = 0;
    for (const token of imageTokens) {
      if (titleTokenSet.has(token)) titleMatches++;
    }
    const imageTitleRatio = imageTokens.length > 0 ? titleMatches / imageTokens.length : 0;
    if (titleMatches >= 2 && (imageTitleRatio >= 0.5 || titleMatches >= cleanTitleTokens.length * 0.3)) {
      return {
        matched: true,
        confidence: "MEDIUM",
        score: 60,
        reason: `Matched via blog title tokens (${titleMatches} terms)`,
        blogSlug: cleanBlogSlug,
        filename,
        isFeaturedCandidate,
        sequenceNumber,
      };
    }
  }


  // 4. LOW: 1 match or low overlap (< 50%)
  if (tokenMatches >= 1) {
    return {
      matched: false,
      confidence: "LOW",
      score: 35,
      reason: `Weak keyword overlap (${tokenMatches} term) — manual assignment required`,
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  // 5. UNMATCHED
  return {
    matched: false,
    confidence: "UNMATCHED",
    score: 0,
    reason: "No meaningful alignment with blog slug or title",
    blogSlug: cleanBlogSlug,
    filename,
    isFeaturedCandidate,
    sequenceNumber,
  };
}

export function imageMatchesSlug(imageFilename: string, blogSlug: string): boolean {
  return evaluateMediaMatch(imageFilename, blogSlug).matched;
}

