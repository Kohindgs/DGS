import fs from 'node:fs';
import path from 'node:path';

const routeRegistry = JSON.parse(fs.readFileSync('data/migration/nextjs-route-registry.generated.json', 'utf8'));
const innerMirrorIndex = JSON.parse(fs.readFileSync('data/wordpress/mirrors/index.json', 'utf8'));

const blogRoutes = routeRegistry.routes.filter(r => r.path.startsWith('/blogs/') && r.path !== '/blogs/');

const DGS_SERVICES_MAP = [
  { match: ['seo', 'ranking', 'backlink', 'audit', 'organic', 'keywords', 'traffic'], service: 'Search Engine Optimization (SEO)', link: '/services/search-engine-optimization/' },
  { match: ['geo', 'llm', 'generative', 'ai search', 'chatgpt', 'perplexity', 'gemini', 'aeo', 'agentic'], service: 'AI Search & GEO Optimization', link: '/services/search-engine-optimization/' },
  { match: ['video', 'reels', 'youtube', 'visual'], service: 'AI Video & Creative Production', link: '/services/social-media-marketing/' },
  { match: ['ads', 'meta', 'ppc', 'campaigns', 'budget', 'roas', 'lead generation'], service: 'Performance Marketing & Paid Ads', link: '/services/performance-marketing/' },
  { match: ['website', 'design', 'development', 'cro', 'landing page', 'ui', 'speed'], service: 'Web Development & CRO', link: '/services/web-development/' },
  { match: ['social media', 'instagram', 'linkedin', 'branding', 'reach', 'brand'], service: 'Social Media Marketing & Brand Strategy', link: '/services/social-media-marketing/' },
  { match: ['content', 'copywriting', 'writing', 'strategy', 'blogging'], service: 'Content Marketing & SEO Copywriting', link: '/services/content-marketing/' }
];

function determineService(slug, title, desc) {
  const text = `${slug} ${title} ${desc}`.toLowerCase();
  for (const s of DGS_SERVICES_MAP) {
    if (s.match.some(m => text.includes(m))) {
      return { service: s.service, link: s.link };
    }
  }
  return { service: 'Digital Strategy & Consulting', link: '/services/' };
}

function determineTopic(slug, title) {
  const s = slug.toLowerCase();
  const t = title.toLowerCase();
  if (s.includes('geo') || s.includes('generative-engine') || t.includes('generative engine')) return 'Generative Engine Optimization (GEO)';
  if (s.includes('llm') || t.includes('llm')) return 'LLM SEO & AI Search Engines';
  if (s.includes('agentic') || t.includes('agentic')) return 'Agentic AI Search & Autonomous Browsing';
  if (s.includes('video') || t.includes('video')) return 'AI Video Production & Visual Storytelling';
  if (s.includes('ads') || s.includes('meta') || s.includes('google-ads') || t.includes('ads')) return 'Paid Advertising & Lead Generation';
  if (s.includes('website') || s.includes('design') || s.includes('development') || t.includes('design')) return 'Website Design & Conversion Rate Optimization';
  if (s.includes('content') || s.includes('writing') || t.includes('content')) return 'SEO Content Marketing & Editorial Strategy';
  if (s.includes('social') || s.includes('brand') || t.includes('social')) return 'Social Media Reach & Brand Authority';
  if (s.includes('seo') || s.includes('ranking') || s.includes('traffic')) return 'Technical & Organic SEO';
  return 'Digital Marketing & Growth Strategy';
}

function determineIntent(title, slug) {
  const t = title.toLowerCase();
  const s = slug.toLowerCase();
  if (s.includes('vs') || t.includes('vs') || t.includes('cost') || t.includes('services') || t.includes('agency')) {
    return 'Commercial Investigation / Comparison';
  }
  if (t.includes('how to') || t.includes('ways') || t.includes('guide') || t.includes('what is') || t.includes('rule')) {
    return 'Informational / Educational Deep-Dive';
  }
  return 'Informational / Strategic Perspective';
}

const roadmap = [];

for (const r of blogRoutes) {
  const slug = r.slug || r.path.replace(/^\/blogs\/|\/$/g, '');
  const mirrorFile = innerMirrorIndex.pages?.[r.path];
  let body = '';
  let wordCount = 0;
  let h2Count = 0;
  let h3Count = 0;
  let hasFaq = false;

  if (mirrorFile) {
    try {
      const mirrorData = JSON.parse(fs.readFileSync(path.join('data/wordpress/mirrors/pages', mirrorFile), 'utf8'));
      body = mirrorData.body || '';
      const textOnly = body.replace(/<[^>]+>/g, ' ');
      wordCount = textOnly.trim().split(/\s+/).filter(Boolean).length;
      h2Count = (body.match(/<h2[^>]*>/gi) || []).length;
      h3Count = (body.match(/<h3[^>]*>/gi) || []).length;
      hasFaq = /<h[23][^>]*>(?:FAQs?|Frequently Asked Questions)<\/h[23]>/i.test(body);
    } catch {
      /* ignore */
    }
  }

  const primaryTopic = determineTopic(slug, r.title || r.h1 || '');
  const likelySearchIntent = determineIntent(r.title || r.h1 || '', slug);
  const serviceInfo = determineService(slug, r.title || r.h1 || '', r.description || '');

  // Content depth evaluation
  let contentDepth = '';
  if (wordCount >= 2000) {
    contentDepth = `Comprehensive Pillar (${wordCount.toLocaleString()} words, ${h2Count} H2s, ${h3Count} H3s)`;
  } else if (wordCount >= 1400) {
    contentDepth = `In-Depth Guide (${wordCount.toLocaleString()} words, ${h2Count} H2s, ${h3Count} H3s)`;
  } else if (wordCount >= 800) {
    contentDepth = `Standard Long-Form (${wordCount.toLocaleString()} words, ${h2Count} H2s, ${h3Count} H3s)`;
  } else {
    contentDepth = `Brief Strategic Post (${wordCount.toLocaleString()} words)`;
  }

  // Metadata health
  const titleLen = (r.title || '').length;
  const descLen = (r.description || '').length;
  const metaIssues = [];
  if (titleLen > 65) metaIssues.push(`Title length ${titleLen}c (recommend ≤60c)`);
  if (descLen < 120) metaIssues.push(`Description length ${descLen}c (recommend 140-160c)`);
  if (descLen > 165) metaIssues.push(`Description length ${descLen}c (recommend ≤160c)`);
  const metadataHealth = metaIssues.length === 0 
    ? `Optimal (Title: ${titleLen}c, Meta: ${descLen}c)` 
    : `Attention: ${metaIssues.join(', ')}`;

  // Internal link opportunity
  const internalLinkOpportunity = `High-intent contextual bridge to ${serviceInfo.service} (${serviceInfo.link}) and related topical cluster`;

  // Recommended future optimization
  let recommendedFutureOptimization = '';
  if (!hasFaq && wordCount > 1500) {
    recommendedFutureOptimization = 'Evaluate adding genuine expert Q&A section to capture long-tail voice and conversational search queries.';
  } else if (primaryTopic.includes('GEO') || primaryTopic.includes('LLM')) {
    recommendedFutureOptimization = 'Refresh quarterly with latest AI search citation patterns, ChatGPT search benchmarks, and entity grounding references.';
  } else if (primaryTopic.includes('Video')) {
    recommendedFutureOptimization = 'Incorporate multimedia video embeds, client production workflows, and comparative turnaround timeframes.';
  } else if (primaryTopic.includes('Paid Advertising')) {
    recommendedFutureOptimization = 'Update benchmark ROAS metrics and CPL ranges for Mumbai/India and international enterprise B2B campaigns.';
  } else if (primaryTopic.includes('Website Design')) {
    recommendedFutureOptimization = 'Integrate visual before-and-after CRO case studies and UX wireframe illustrations to elevate visual authority.';
  } else {
    recommendedFutureOptimization = 'Deepen semantic entity co-occurrences and strengthen bidirectional contextual links across related cluster articles.';
  }

  // Classification
  let classification = 'GOOD';
  if (wordCount < 800 || metaIssues.length >= 2) {
    classification = 'NEEDS IMPROVEMENT';
  } else if (wordCount < 500) {
    classification = 'CRITICAL';
  }

  roadmap.push({
    url: `https://www.dgeniussolutions.com${r.path}`,
    path: r.path,
    h1: r.h1 || r.title,
    primaryTopic,
    likelySearchIntent,
    contentDepth,
    metadataHealth,
    internalLinkOpportunity,
    relevantDgsService: serviceInfo.service,
    serviceLink: serviceInfo.link,
    recommendedFutureOptimization,
    classification
  });
}

fs.writeFileSync('data/audit/blog_search_intent_roadmap.json', JSON.stringify(roadmap, null, 2), 'utf8');

const summary = {
  total: roadmap.length,
  good: roadmap.filter(r => r.classification === 'GOOD').length,
  needsImprovement: roadmap.filter(r => r.classification === 'NEEDS IMPROVEMENT').length,
  critical: roadmap.filter(r => r.classification === 'CRITICAL').length
};

console.log('Search Intent Roadmap built successfully:');
console.log(JSON.stringify(summary, null, 2));
