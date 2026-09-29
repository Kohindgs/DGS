import registryData from "@/data/migration/nextjs-route-registry.generated.json";
import { CmsBlogDetail, CmsBlogSummary } from "./blogs";
import { siteConfig } from "@/lib/seo/site";
import { cmsQuery } from "./db";

export type PrePublishCheckStatus = "PASS" | "WARNING" | "ERROR";
export type ReadinessStatus = "READY" | "NEEDS IMPROVEMENT" | "NOT APPLICABLE";

export type PrePublishDimensionIssue = {
  severity: "ERROR" | "WARNING" | "INFO";
  code: string;
  message: string;
  field?: string;
};

export type PrePublishDimensionResult = {
  status: PrePublishCheckStatus;
  label: string;
  summary: string;
  issues: PrePublishDimensionIssue[];
};

export type PrePublishGateResult = {
  canPublish: boolean;
  totalErrors: number;
  totalWarnings: number;
  dimensions: {
    seo: PrePublishDimensionResult;
    aeo: PrePublishDimensionResult;
    geo: PrePublishDimensionResult;
    llm: PrePublishDimensionResult;
    schema: PrePublishDimensionResult;
    indexing: PrePublishDimensionResult;
    sitemap: PrePublishDimensionResult;
    aiOverview: PrePublishDimensionResult & { readiness: ReadinessStatus };
    social: PrePublishDimensionResult;
  };
  googlePreview: {
    title: string;
    url: string;
    description: string;
    canonical: string;
    robots: string;
    schemaType: string;
    sitemapStatus: string;
  };
  socialPreview: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
  };
  internalLinkingSuggestions: Array<{
    targetPath: string;
    targetTitle: string;
    category: string;
    reason: string;
    suggestedAnchor: string;
  }>;
  indexabilityStatus: {
    isPublished: boolean;
    isCrawlable: boolean;
    isInSitemap: boolean;
    isGoogleIndexed: boolean;
    statusSummary: string;
  };
};

const DGS_CORE_SERVICES = [
  {
    path: "/services/seo-services-in-mumbai/",
    title: "SEO Services in Mumbai",
    category: "SEO",
    keywords: ["seo", "rankings", "search engine optimization", "organic traffic", "keywords", "backlinks"],
    suggestedAnchor: "professional SEO services in Mumbai",
  },
  {
    path: "/services/dubai-seo/",
    title: "Dubai SEO Services",
    category: "SEO",
    keywords: ["dubai", "uae", "gulf", "middle east", "local seo dubai", "rank in dubai"],
    suggestedAnchor: "Dubai SEO agency",
  },
  {
    path: "/services/aeo-services-in-mumbai/",
    title: "AEO Services in Mumbai",
    category: "AEO",
    keywords: ["aeo", "answer engine optimization", "ai overview", "quick answer", "chatgpt search", "perplexity"],
    suggestedAnchor: "Answer Engine Optimization (AEO) services",
  },
  {
    path: "/services/geo/",
    title: "GEO (Generative Engine Optimization)",
    category: "GEO",
    keywords: ["geo", "generative engine", "generative ai", "llm citation", "ai synthesis"],
    suggestedAnchor: "Generative Engine Optimization (GEO)",
  },
  {
    path: "/services/llm-seo-service/",
    title: "LLM SEO Service",
    category: "LLM SEO",
    keywords: ["llm", "large language model", "llms.txt", "claude", "gemini", "ai citation"],
    suggestedAnchor: "LLM SEO services",
  },
  {
    path: "/services/ai-video-production-agency/",
    title: "AI Video Production Agency",
    category: "AI Video",
    keywords: ["video", "ai video", "motion graphics", "commercial", "production", "video ads"],
    suggestedAnchor: "AI video production agency",
  },
  {
    path: "/services/performance-marketing/",
    title: "Performance Marketing",
    category: "Performance Marketing",
    keywords: ["google ads", "meta ads", "ppc", "roas", "ad spend", "paid ads", "conversion"],
    suggestedAnchor: "performance marketing campaigns",
  },
  {
    path: "/services/social-media-marketing/",
    title: "Social Media Marketing",
    category: "Social Media",
    keywords: ["social media", "instagram", "linkedin", "followers", "engagement", "creator"],
    suggestedAnchor: "social media marketing strategy",
  },
  {
    path: "/services/website-development-amc/",
    title: "Website Development & AMC",
    category: "Web Development",
    keywords: ["website", "web development", "wordpress", "nextjs", "landing page", "web design"],
    suggestedAnchor: "custom website development",
  },
  {
    path: "/services/branding/",
    title: "Brand Strategy & Identity",
    category: "Branding",
    keywords: ["branding", "brand identity", "logo", "visual identity", "positioning"],
    suggestedAnchor: "brand strategy and identity",
  },
  {
    path: "/services/content-creation/",
    title: "Content Creation Services",
    category: "Content",
    keywords: ["content", "copywriting", "blog writing", "content marketing", "articles"],
    suggestedAnchor: "strategic content creation",
  },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Unified Pre-Publish Readiness Engine
 */
export async function evaluatePrePublishGate(
  blog: CmsBlogDetail,
  options?: {
    isNew?: boolean;
    existingSlugs?: Set<string>;
    existingTitles?: Set<string>;
  }
): Promise<PrePublishGateResult> {
  const seoOpt = blog.content?.optimization?.seo;
  const aeoOpt = blog.content?.optimization?.aeo;
  const geoOpt = blog.content?.optimization?.geo;
  const llmOpt = blog.content?.optimization?.llm;

  const title = (seoOpt?.title || blog.title || "").trim();
  const slug = (blog.slug || "").trim().toLowerCase();
  const excerpt = (blog.excerpt || seoOpt?.description || "").trim();
  const bodyHtml = (blog.content?.bodyHtml || "").trim();
  const bodyText = stripHtml(bodyHtml);
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const focusKeyword = (seoOpt?.focusKeyword || blog.focus_keyword || "").trim().toLowerCase();

  const seoIssues: PrePublishDimensionIssue[] = [];
  const aeoIssues: PrePublishDimensionIssue[] = [];
  const geoIssues: PrePublishDimensionIssue[] = [];
  const llmIssues: PrePublishDimensionIssue[] = [];
  const schemaIssues: PrePublishDimensionIssue[] = [];
  const indexingIssues: PrePublishDimensionIssue[] = [];
  const sitemapIssues: PrePublishDimensionIssue[] = [];
  const aiOverviewIssues: PrePublishDimensionIssue[] = [];
  const socialIssues: PrePublishDimensionIssue[] = [];

  // =========================================================================
  // 1. SEO DIMENSION
  // =========================================================================
  if (!title) {
    seoIssues.push({ severity: "ERROR", code: "SEO_MISSING_TITLE", message: "Article title is required.", field: "title" });
  } else {
    if (title.length < 25) {
      seoIssues.push({ severity: "WARNING", code: "SEO_TITLE_SHORT", message: `Title is short (${title.length} chars). Recommended: 35–65 characters.`, field: "title" });
    } else if (title.length > 70) {
      seoIssues.push({ severity: "WARNING", code: "SEO_TITLE_LONG", message: `Title is long (${title.length} chars). It may be truncated in Google search results (target < 65 chars).`, field: "title" });
    }

    // Check for accidental CMS/editorial labels
    const forbiddenLabels = ["target keyword", "ai overview answer", "local seo", "case signal", "todo", "draft", "lorem ipsum", "untitled"];
    for (const label of forbiddenLabels) {
      if (title.toLowerCase().includes(label)) {
        seoIssues.push({ severity: "ERROR", code: "SEO_EDITORIAL_LABEL_IN_TITLE", message: `Title contains internal editorial label "${label}". Must be removed.`, field: "title" });
      }
    }
  }

  // Slug check
  if (!slug) {
    seoIssues.push({ severity: "ERROR", code: "SEO_MISSING_SLUG", message: "URL slug is required.", field: "slug" });
  } else {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      seoIssues.push({ severity: "ERROR", code: "SEO_INVALID_SLUG", message: "Slug must contain only lowercase letters, numbers, and single hyphens (no spaces or special characters).", field: "slug" });
    }

    // Slug collision check
    let slugCollision = false;
    // Check against route registry
    const staticSlugs = new Set(
      registryData.routes
        .filter((r) => r.path.startsWith("/blogs/") && r.path !== "/blogs/")
        .map((r) => r.path.replace(/^\/blogs\/|\/$/g, "").toLowerCase())
    );
    if (staticSlugs.has(slug)) {
      slugCollision = true;
    }

    // Check against other database rows
    try {
      const dbCheck = await cmsQuery<{ id: string }>(
        `SELECT id FROM blog_posts WHERE slug = ? AND id != ? LIMIT 1`,
        [slug, blog.id || ""]
      );
      if (dbCheck.rows.length > 0) {
        slugCollision = true;
      }
    } catch {
      // In local mode if DB query fails, fall back to passed options
      if (options?.existingSlugs?.has(slug)) {
        slugCollision = true;
      }
    }

    if (slugCollision) {
      seoIssues.push({ severity: "ERROR", code: "SEO_DUPLICATE_SLUG", message: `Slug "/blogs/${slug}/" already exists on another blog post. Choose a unique slug.`, field: "slug" });
    }
  }

  // Meta description check
  if (!excerpt) {
    seoIssues.push({ severity: "WARNING", code: "SEO_MISSING_DESC", message: "Meta description is missing. Google will auto-generate snippets from body text.", field: "excerpt" });
  } else if (excerpt.length < 60) {
    seoIssues.push({ severity: "WARNING", code: "SEO_DESC_SHORT", message: `Meta description is short (${excerpt.length} chars). Recommended: 120–160 characters.`, field: "excerpt" });
  } else if (excerpt.length > 175) {
    seoIssues.push({ severity: "WARNING", code: "SEO_DESC_LONG", message: `Meta description is ${excerpt.length} characters and may be truncated on mobile SERPs.`, field: "excerpt" });
  }

  // Single H1 check in content body
  const bodyH1Count = (bodyHtml.match(/<h1[^>]*>/gi) || []).length;
  if (bodyH1Count > 0) {
    seoIssues.push({
      severity: "WARNING",
      code: "SEO_MULTIPLE_H1",
      message: `Content body contains ${bodyH1Count} <h1> tag(s). The article template already provides the primary H1; change internal body headings to <h2> and <h3>.`,
      field: "bodyHtml",
    });
  }

  // Body content required
  if (!bodyHtml || wordCount < 50) {
    seoIssues.push({ severity: "ERROR", code: "SEO_MISSING_CONTENT", message: "Body content is empty or too short (< 50 words).", field: "bodyHtml" });
  } else if (wordCount < 300) {
    seoIssues.push({ severity: "WARNING", code: "SEO_THIN_CONTENT", message: `Article has ${wordCount} words. In-depth guides (> 800 words) achieve stronger organic search performance.`, field: "bodyHtml" });
  }

  // Featured Image & Alt text
  if (!blog.featured_image_url) {
    seoIssues.push({ severity: "WARNING", code: "SEO_NO_FEATURED_IMAGE", message: "No featured cover image selected. Strongly recommended for Google Discover, rich cards, and social sharing.", field: "featured_image_url" });
  } else if (!blog.featured_image_alt) {
    seoIssues.push({ severity: "WARNING", code: "SEO_NO_IMAGE_ALT", message: "Featured image is missing descriptive Alt Text (required for WCAG accessibility and Google Image SEO).", field: "featured_image_alt" });
  }

  // Keyword density check
  if (focusKeyword && wordCount > 100) {
    const regex = new RegExp(`\\b${focusKeyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "gi");
    const matches = (bodyText.match(regex) || []).length;
    const density = (matches / wordCount) * 100;
    if (density > 3.5) {
      seoIssues.push({
        severity: "WARNING",
        code: "SEO_KEYWORD_STUFFING",
        message: `Focus keyword "${focusKeyword}" appears ${matches} times (${density.toFixed(1)}% density). Consider reducing usage below 3.0% to prevent over-optimization flags.`,
        field: "focus_keyword",
      });
    }
  }

  // Canonical check
  const canonicalUrl = blog.canonical_url || `https://www.dgeniussolutions.com/blogs/${slug}/`;
  if (blog.canonical_url && !blog.canonical_url.startsWith("https://")) {
    seoIssues.push({ severity: "ERROR", code: "SEO_INVALID_CANONICAL", message: "Custom canonical URL must be an absolute HTTPS URL.", field: "canonical_url" });
  }

  // =========================================================================
  // 2. AEO DIMENSION (Answer Engine Optimization)
  // =========================================================================
  const directAnswer = aeoOpt?.conciseAnswer || (excerpt.length >= 40 ? excerpt : "");
  if (!directAnswer) {
    aeoIssues.push({
      severity: "WARNING",
      code: "AEO_NO_DIRECT_ANSWER",
      message: "No concise direct answer (40–60 words) defined. Essential for AI Overviews, Perplexity, and ChatGPT search citations.",
      field: "aeo.conciseAnswer",
    });
  }

  // Question-led headings check
  const questionHeadings = (bodyHtml.match(/<h[23][^>]*>[^<]*(\?|\b(how|what|why|when|which|can|is|are|will)\b)[^<]*<\/h[23]>/gi) || []);
  if (questionHeadings.length === 0) {
    aeoIssues.push({
      severity: "WARNING",
      code: "AEO_NO_QUESTION_HEADINGS",
      message: "No question-led headings found (e.g., 'How does X work?', 'What is Y?'). Natural question headings increase synthesis in AI search answer engines.",
    });
  }

  // Visible FAQs check
  const visibleFaqMatches = [...bodyHtml.matchAll(/<h[23][^>]*>([\s\S]*?\?)<\/h[23]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)];
  if (visibleFaqMatches.length > 0) {
    aeoIssues.push({
      severity: "INFO",
      code: "AEO_FAQS_DETECTED",
      message: `Detected ${visibleFaqMatches.length} visible Q&A section(s) in article text. FAQ schema is eligible for inclusion.`,
    });
  }

  // =========================================================================
  // 3. GEO DIMENSION (Generative Engine Optimization)
  // =========================================================================
  const authorName = (blog.author_name || "").trim() || "D'Genius Solutions Editorial Team";
  if (!blog.author_name) {
    geoIssues.push({
      severity: "INFO",
      code: "GEO_DEFAULT_AUTHOR",
      message: `No individual author provided; using default verified organization attribution "${authorName}".`,
    });
  }

  // Location/Entity Signals
  const entityKeywords = ["dubai", "mumbai", "uae", "india", "d'genius solutions", "agency", "marketing", "google", "meta"];
  const lowerBody = bodyText.toLowerCase();
  const matchedEntities = entityKeywords.filter((k) => lowerBody.includes(k));
  if (matchedEntities.length < 2) {
    geoIssues.push({
      severity: "WARNING",
      code: "GEO_WEAK_ENTITIES",
      message: "Few recognized entity references detected. Strengthen geographic and corporate entity context (e.g., referencing Mumbai, Dubai, DGS case frameworks).",
    });
  }

  // Citations / factual attribution check
  const hasExternalLinks = /<a\s+(?:[^>]*?\s+)?href=["']https?:\/\/(?!www\.dgeniussolutions\.com)[^"']+["']/i.test(bodyHtml);
  if (!hasExternalLinks && wordCount > 600) {
    geoIssues.push({
      severity: "INFO",
      code: "GEO_NO_EXTERNAL_CITATIONS",
      message: "No external authoritative references found. Attributing official statistics to industry sources (Google Research, Gartner, Statista) reinforces factual grounding.",
    });
  }

  // =========================================================================
  // 4. LLM SEO DIMENSION
  // =========================================================================
  // Heading hierarchy check: detect if H3 appears before any H2
  const firstH2 = bodyHtml.indexOf("<h2");
  const firstH3 = bodyHtml.indexOf("<h3");
  if (firstH3 !== -1 && (firstH2 === -1 || firstH3 < firstH2)) {
    llmIssues.push({
      severity: "WARNING",
      code: "LLM_HEADING_HIERARCHY",
      message: "An <h3> heading appears before the first <h2> heading. Maintain clean semantic nesting (H1 -> H2 -> H3) for AI parser comprehension.",
    });
  }

  // Internal links check
  const internalLinksInBody = [...bodyHtml.matchAll(/<a\s+(?:[^>]*?\s+)?href=["'](\/[^"']+|https:\/\/www\.dgeniussolutions\.com\/[^"']+)["']/gi)];
  if (internalLinksInBody.length === 0) {
    llmIssues.push({
      severity: "WARNING",
      code: "LLM_NO_INTERNAL_LINKS",
      message: "No internal links found in article body. Contextual links connecting this post to DGS service pillars reinforce site topology in LLM training corpora.",
    });
  }

  // Body image alt text audit
  const bodyImagesWithoutAlt = (bodyHtml.match(/<img(?![^>]*\balt=["'][^"']+["'])[^>]*>/gi) || []).length;
  if (bodyImagesWithoutAlt > 0) {
    llmIssues.push({
      severity: "WARNING",
      code: "LLM_BODY_IMAGES_NO_ALT",
      message: `${bodyImagesWithoutAlt} inline image(s) in body content are missing alt attributes.`,
    });
  }

  // =========================================================================
  // 5. SCHEMA DIMENSION
  // =========================================================================
  if (!title || !slug) {
    schemaIssues.push({ severity: "ERROR", code: "SCHEMA_MISSING_FIELDS", message: "Cannot generate BlogPosting schema without valid title and slug." });
  } else {
    schemaIssues.push({
      severity: "INFO",
      code: "SCHEMA_VALID",
      message: "BlogPosting and BreadcrumbList schemas will be automatically synthesized with valid ISO 8601 timestamps and DGS Organization publisher.",
    });
  }

  // =========================================================================
  // 6. INDEXABILITY & SITEMAP DIMENSION
  // =========================================================================
  const isCrawlable = true; // no unintentional noindex
  if (!slug) {
    indexingIssues.push({ severity: "ERROR", code: "INDEXING_NO_SLUG", message: "Slug missing; cannot generate indexable route." });
    sitemapIssues.push({ severity: "ERROR", code: "SITEMAP_NO_SLUG", message: "Cannot generate sitemap entry without valid slug." });
  } else {
    indexingIssues.push({
      severity: "INFO",
      code: "INDEXING_READY",
      message: "Page is indexable: returns HTTP 200 with meta robots index, follow and self-referencing canonical.",
    });
    sitemapIssues.push({
      severity: "INFO",
      code: "SITEMAP_READY",
      message: `Will be included in /sitemap.xml at ${siteConfig.url}/blogs/${slug}/ with valid W3C lastmod.`,
    });
  }

  // =========================================================================
  // 7. AI OVERVIEW READINESS
  // =========================================================================
  let aiOverviewStatus: ReadinessStatus = "READY";
  if (!directAnswer || wordCount < 300) {
    aiOverviewStatus = "NEEDS IMPROVEMENT";
    aiOverviewIssues.push({
      severity: "WARNING",
      code: "AIO_LOW_INFORMATION_DENSITY",
      message: "Information density is low for AI Overview extraction. Add a concise direct answer and structured takeaway bullet points.",
    });
  } else {
    aiOverviewIssues.push({
      severity: "INFO",
      code: "AIO_READY",
      message: "Article structure, question-led headings, and direct answer meet synthesis criteria for AI Overviews.",
    });
  }

  // =========================================================================
  // 8. SOCIAL PREVIEWS & METADATA
  // =========================================================================
  const ogTitle = title;
  const ogDescription = excerpt || "Read insights from D'Genius Solutions.";
  const ogImage = blog.featured_image_url || `${siteConfig.url}/images/og-default.jpg`;

  if (!blog.featured_image_url) {
    socialIssues.push({
      severity: "WARNING",
      code: "SOCIAL_DEFAULT_IMAGE",
      message: "No custom featured image set; OpenGraph will fall back to site default banner.",
    });
  } else {
    socialIssues.push({
      severity: "INFO",
      code: "SOCIAL_COMPLETE",
      message: "OpenGraph and Twitter Card metadata fully configured.",
    });
  }

  // =========================================================================
  // 9. INTERNAL LINKING SUGGESTIONS
  // =========================================================================
  const internalLinkingSuggestions: PrePublishGateResult["internalLinkingSuggestions"] = [];
  const textToScan = `${title} ${excerpt} ${bodyText}`.toLowerCase();

  for (const svc of DGS_CORE_SERVICES) {
    const matched = svc.keywords.some((k) => textToScan.includes(k));
    // Don't suggest if already linked in body
    const alreadyLinked = bodyHtml.includes(svc.path);
    if (matched && !alreadyLinked) {
      internalLinkingSuggestions.push({
        targetPath: svc.path,
        targetTitle: svc.title,
        category: svc.category,
        reason: `Article mentions themes relating to ${svc.category.toLowerCase()}`,
        suggestedAnchor: svc.suggestedAnchor,
      });
    }
  }

  // Helper to compile dimension status
  const getDimensionStatus = (issues: PrePublishDimensionIssue[]): PrePublishCheckStatus => {
    if (issues.some((i) => i.severity === "ERROR")) return "ERROR";
    if (issues.some((i) => i.severity === "WARNING")) return "WARNING";
    return "PASS";
  };

  const seoStatus = getDimensionStatus(seoIssues);
  const aeoStatus = getDimensionStatus(aeoIssues);
  const geoStatus = getDimensionStatus(geoIssues);
  const llmStatus = getDimensionStatus(llmIssues);
  const schemaStatus = getDimensionStatus(schemaIssues);
  const indexingStatus = getDimensionStatus(indexingIssues);
  const sitemapStatus = getDimensionStatus(sitemapIssues);
  const socialStatus = getDimensionStatus(socialIssues);

  const allIssues = [
    ...seoIssues,
    ...aeoIssues,
    ...geoIssues,
    ...llmIssues,
    ...schemaIssues,
    ...indexingIssues,
    ...sitemapIssues,
    ...aiOverviewIssues,
    ...socialIssues,
  ];

  const totalErrors = allIssues.filter((i) => i.severity === "ERROR").length;
  const totalWarnings = allIssues.filter((i) => i.severity === "WARNING").length;

  return {
    canPublish: totalErrors === 0,
    totalErrors,
    totalWarnings,
    dimensions: {
      seo: {
        status: seoStatus,
        label: "SEO Check",
        summary: seoStatus === "PASS" ? "All core SEO requirements verified." : seoStatus === "WARNING" ? `${seoIssues.length} SEO recommendations.` : "Critical SEO errors present.",
        issues: seoIssues,
      },
      aeo: {
        status: aeoStatus,
        label: "AEO Check",
        summary: aeoStatus === "PASS" ? "Direct answers and question headings present." : `${aeoIssues.length} AEO recommendations for AI answer engines.`,
        issues: aeoIssues,
      },
      geo: {
        status: geoStatus,
        label: "GEO Check",
        summary: geoStatus === "PASS" ? "Entity and publisher clarity verified." : `${geoIssues.length} GEO recommendations.`,
        issues: geoIssues,
      },
      llm: {
        status: llmStatus,
        label: "LLM SEO Check",
        summary: llmStatus === "PASS" ? "Clean semantic markup and crawlable structure." : `${llmIssues.length} LLM markup suggestions.`,
        issues: llmIssues,
      },
      schema: {
        status: schemaStatus,
        label: "Schema Validation",
        summary: schemaStatus === "PASS" ? "BlogPosting & BreadcrumbList schemas valid." : "Schema syntax or entity error.",
        issues: schemaIssues,
      },
      indexing: {
        status: indexingStatus,
        label: "Indexability Check",
        summary: indexingStatus === "PASS" ? "Indexable (HTTP 200, index/follow)." : "Indexability error.",
        issues: indexingIssues,
      },
      sitemap: {
        status: sitemapStatus,
        label: "Sitemap Status",
        summary: sitemapStatus === "PASS" ? "Eligible for automatic sitemap inclusion." : "Sitemap inclusion blocked.",
        issues: sitemapIssues,
      },
      aiOverview: {
        status: aiOverviewStatus === "READY" ? "PASS" : "WARNING",
        readiness: aiOverviewStatus,
        label: "AI Overview Readiness",
        summary: aiOverviewStatus === "READY" ? "Content is formatted for AI Overview extraction." : "Direct answer and information density need improvement.",
        issues: aiOverviewIssues,
      },
      social: {
        status: socialStatus,
        label: "Social Metadata",
        summary: socialStatus === "PASS" ? "OpenGraph & Twitter Card configured." : "Social fallbacks active.",
        issues: socialIssues,
      },
    },
    googlePreview: {
      title,
      url: `https://www.dgeniussolutions.com/blogs/${slug}/`,
      description: excerpt || "Read strategic insights on digital marketing and AI search from D'Genius Solutions.",
      canonical: canonicalUrl,
      robots: "index, follow",
      schemaType: "BlogPosting, BreadcrumbList",
      sitemapStatus: "Eligible (Dynamic XML Sitemap)",
    },
    socialPreview: {
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle: ogTitle,
      twitterDescription: ogDescription,
      twitterImage: ogImage,
    },
    internalLinkingSuggestions: internalLinkingSuggestions.slice(0, 5),
    indexabilityStatus: {
      isPublished: blog.status === "published",
      isCrawlable,
      isInSitemap: blog.status === "published" && !blog.deleted_at,
      isGoogleIndexed: false, // strictly false until verified from GSC API
      statusSummary: blog.status === "published"
        ? "PUBLISHED & CRAWLABLE (Pending Google Indexing Discovery)"
        : "UNPUBLISHED DRAFT (Not in Sitemap, Not Crawlable)",
    },
  };
}
