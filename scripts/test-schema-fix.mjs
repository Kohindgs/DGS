import { articleSchema } from '../lib/schema/builders.ts';
import { buildGlobalEntitySchemas } from '../lib/schema/page-schemas.ts';
import { validatePageJsonLd } from './build-sitewide-ranking-recovery-baseline.mjs';

async function main() {
  const globalSchemas = buildGlobalEntitySchemas();
  const blogPosting = articleSchema({
    headline: 'Test Blog Post',
    description: 'Test description',
    path: '/blogs/aeo-in-2026/',
    datePublished: '2026-09-10T12:41:35.000Z',
    dateModified: '2026-09-10T12:42:35.000Z',
    publisherId: 'https://www.dgeniussolutions.com/#organization',
    authorName: "D'Genius Solutions",
  });
  
  const html = `<html><head>
    <script type="application/ld+json">${JSON.stringify(blogPosting)}</script>
    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': globalSchemas })}</script>
  </head><body><h1>Test</h1></body></html>`;
  
  const result = validatePageJsonLd(html, 'https://www.dgeniussolutions.com/blogs/aeo-in-2026/');
  console.log('Result parse valid:', result.schema_parse_valid);
  console.log('Errors:', result.schema_validation_errors);
  console.log('Conflicting count:', result.conflicting_entities_count);
  console.log('Valid references:', result.valid_references_count);
}

main();
