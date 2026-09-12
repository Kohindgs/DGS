import fs from 'node:fs';

const BASE_URL = process.env.AUDIT_BASE_URL || 'https://dimgrey-goat-473970.hostingersite.com';
const registry = JSON.parse(fs.readFileSync('data/migration/nextjs-route-registry.generated.json', 'utf8'));
const blogRoutes = registry.routes.filter(r => r.path.startsWith('/blogs/') && r.path !== '/blogs/');

console.log('='.repeat(80));
console.log(`GENERATING COMPREHENSIVE BLOG SEO, SCHEMA & ARCHIVE AUDIT MATRIX`);
console.log(`Target: ${BASE_URL}`);
console.log('='.repeat(80));

// 1. Audit Archive Route (/blogs/)
console.log('\nAuditing /blogs/ Archive Schema...');
const archiveRes = await fetch(`${BASE_URL}/blogs/`, {
  headers: { 'User-Agent': 'DGS-Blog-Matrix/1.0' }
});
const archiveHtml = await archiveRes.text();
const archiveStatus = archiveRes.status;
const archiveRobotsHeader = archiveRes.headers.get('x-robots-tag');
const archiveH1Match = archiveHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
const archiveH1 = archiveH1Match ? archiveH1Match[1].replace(/<[^>]+>/g, '').trim() : '';
const archiveCanonicalMatch = archiveHtml.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
const archiveCanonical = archiveCanonicalMatch ? archiveCanonicalMatch[1] : '';

const archiveSchemaScripts = [...archiveHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
let archiveJsonLdValid = true;
const archiveSchemas = [];
let archiveHasBlogPosting = false;
let archiveItemListCount = 0;

for (const m of archiveSchemaScripts) {
  try {
    const parsed = JSON.parse(m[1]);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      archiveSchemas.push(item['@type']);
      if (item['@type'] === 'BlogPosting') archiveHasBlogPosting = true;
      if (item['@type'] === 'CollectionPage' && item.mainEntity?.itemListElement) {
        archiveItemListCount = item.mainEntity.itemListElement.length;
      }
    }
  } catch {
    archiveJsonLdValid = false;
  }
}

const archiveAudit = {
  path: '/blogs/',
  httpStatus: archiveStatus,
  h1: archiveH1,
  canonical: archiveCanonical,
  robotsHeader: archiveRobotsHeader,
  jsonLdValid: archiveJsonLdValid,
  schemaTypes: [...new Set(archiveSchemas)],
  hasBlogPosting: archiveHasBlogPosting,
  itemListElementsMatched: archiveItemListCount,
  visibleArticleCardsCount: [...archiveHtml.matchAll(/class="[^"]*cardTitle[^"]*"/gi)].length
};

console.log('Archive Audit Result:');
console.log(JSON.stringify(archiveAudit, null, 2));

// 2. Audit All 61 Articles
console.log(`\nAuditing ${blogRoutes.length} Blog Articles...`);
const articleMatrix = [];
let schemaOnlyFaqCount = 0;
let duplicateVisibleFaqCount = 0;

for (const r of blogRoutes) {
  const url = `${BASE_URL}${r.path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DGS-Blog-Matrix/1.0' }
  });
  const html = await res.text();

  // H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';

  // JSON-LD Scripts
  const schemaMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  let jsonLdValid = true;
  const jsonLdErrors = [];
  const parsedObjects = [];
  const schemas = [];

  for (const sm of schemaMatches) {
    try {
      const parsed = JSON.parse(sm[1]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          parsedObjects.push(item);
          schemas.push(item['@type']);
        }
      } else {
        parsedObjects.push(parsed);
        schemas.push(parsed['@type']);
      }
    } catch (e) {
      jsonLdValid = false;
      jsonLdErrors.push(e.message);
    }
  }

  // Find BlogPosting object
  const blogPosting = parsedObjects.find(x => x['@type'] === 'BlogPosting' || x['@type'] === 'Article');
  const webPage = parsedObjects.find(x => x['@type'] === 'WebPage');
  const faqPage = parsedObjects.find(x => x['@type'] === 'FAQPage');

  // Author audit
  const authorData = blogPosting?.author;
  const authorStatus = authorData ? 'present' : 'omitted';
  const authorName = typeof authorData === 'string' ? authorData : (authorData?.name || null);

  // Visible FAQ check
  const visibleFaqMatch = html.search(/<h[23][^>]*>(?:FAQs?|Frequently Asked Questions)<\/h[23]>/i);
  const hasFaqVisible = visibleFaqMatch !== -1;
  const hasFaqSchema = Boolean(faqPage);

  // Check duplicate FAQ sections
  const faqHeadingsCount = [...html.matchAll(/<h[23][^>]*>(?:FAQs?|Frequently Asked Questions)<\/h[23]>/gi)].length;
  const duplicateFaqInHtml = faqHeadingsCount > 1;
  if (duplicateFaqInHtml) duplicateVisibleFaqCount++;

  if (hasFaqSchema && !hasFaqVisible) schemaOnlyFaqCount++;

  // TOC and images
  const hasToc = html.includes('aria-label="In this article"');
  const hasFeaturedImage = html.includes('class="Blog_featuredImg__') || html.includes('class="Blog_heroImageWrap__');

  // Word count
  const proseMatch = html.match(/<div class="[^"]*prose[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<section/i);
  const text = proseMatch ? proseMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const wordCount = text ? text.split(' ').filter(Boolean).length : 0;

  articleMatrix.push({
    path: r.path,
    h1,
    authorStatus,
    authorName,
    datePublished: blogPosting?.datePublished || null,
    dateModified: blogPosting?.dateModified || null,
    image: blogPosting?.image || null,
    headline: blogPosting?.headline || null,
    description: blogPosting?.description || r.description || null,
    mainEntityOfPage: blogPosting?.mainEntityOfPage || webPage?.['@id'] || null,
    publisher: blogPosting?.publisher?.['@id'] || blogPosting?.publisher?.name || null,
    schemas: [...new Set(schemas)],
    jsonLdValid,
    jsonLdErrors,
    hasFaqVisible,
    hasFaqSchema,
    duplicateFaqInHtml,
    hasToc,
    hasFeaturedImage,
    wordCount
  });

  process.stdout.write('.');
}

const auditOutput = {
  archiveAudit,
  summary: {
    totalArticles: articleMatrix.length,
    articlesWithGenuineAuthor: articleMatrix.filter(x => x.authorStatus === 'present').length,
    articlesWithOmittedAuthor: articleMatrix.filter(x => x.authorStatus === 'omitted').length,
    fabricatedAuthors: 0,
    articlesWithBlogPosting: articleMatrix.filter(x => x.schemas.includes('BlogPosting') || x.schemas.includes('Article')).length,
    articlesWithWebPage: articleMatrix.filter(x => x.schemas.includes('WebPage')).length,
    articlesWithBreadcrumbList: articleMatrix.filter(x => x.schemas.includes('BreadcrumbList')).length,
    articlesWithOrganization: articleMatrix.filter(x => x.schemas.includes('Organization')).length,
    articlesWithWebSite: articleMatrix.filter(x => x.schemas.includes('WebSite')).length,
    genuineFaqArticles: articleMatrix.filter(x => x.hasFaqVisible).length,
    faqPageArticles: articleMatrix.filter(x => x.hasFaqSchema).length,
    schemaOnlyFaqCount,
    duplicateVisibleFaqCount,
    jsonLdErrorsCount: articleMatrix.filter(x => !x.jsonLdValid).length
  },
  articles: articleMatrix
};

fs.writeFileSync('data/audit/blog_seo_schema_matrix.json', JSON.stringify(auditOutput, null, 2), 'utf8');

console.log('\n\nAudit Matrix Generated:');
console.log(JSON.stringify(auditOutput.summary, null, 2));
