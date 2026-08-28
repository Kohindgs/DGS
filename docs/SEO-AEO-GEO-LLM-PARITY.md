# DGS SEO / AEO / GEO / LLM Parity

Status: in progress

## Objective

Move the public DGS site from WordPress/Elementor to Next.js without losing ranking signals, while removing technical causes of poor performance and crawl/indexing inefficiency.

## Critical protected pages

The following pages must be compared old vs new before cutover:

- `/services/seo-services-in-mumbai/`
- `/services/aeo-services-in-mumbai/`
- `/services/geo/`
- `/services/llm-seo-service/`
- `/services/ai-video-production-agency/`

The AEO, AI Production and LLM SEO pages are especially sensitive because they already have ranking value and should not be rewritten during migration.

## Per-page parity checklist

For each indexable page capture and compare:

- HTTP status
- URL
- title tag
- meta description
- canonical
- robots/indexability
- H1
- H2/H3 hierarchy
- visible body copy
- FAQ questions and answers
- internal links and anchor text
- breadcrumbs
- image URLs and alt text
- video references
- structured data types
- JSON-LD entity IDs and relationships
- Open Graph/Twitter data where relevant
- sitemap inclusion
- last-modified behavior where relevant

## SEO technical corrections allowed without content rewriting

- invalid or duplicate canonicals
- duplicate titles/descriptions caused by templates/plugins
- schema conflicts/duplication
- broken internal links
- redirect chains and loops
- orphaning/crawl-depth issues
- invalid heading markup
- missing semantic landmarks
- JS-only rendering of critical content
- oversized DOM and render-blocking assets
- unused Elementor/plugin CSS and JS
- unoptimized image delivery
- layout shift issues
- accessibility issues that affect usability/crawlability
- sitemap/robots inconsistencies

## AEO principles

- server-render answer-bearing content
- clear semantic heading relationships
- preserve verified FAQs
- concise answer sections only when they already exist or later receive content approval
- consistent Organization/Service entities
- BreadcrumbList where applicable
- no artificial keyword stuffing

## GEO principles

- preserve existing location/service relationships
- preserve geo-targeted routes that remain valid
- use `areaServed`, address/location and Service relationships only when factually supported
- avoid fabricated local offices or service claims

## LLM / AI-search principles

- semantic server-rendered HTML
- stable canonical URLs
- consistent company/service/entity facts
- clean internal relationships between SEO, AEO, GEO and LLM services
- valid structured data
- crawlable content without interaction requirements
- maintain `llms.txt` / `llms-full.txt` only from verified facts and routes

## Authenticated parity blocker

Rank Math private metadata/schema configuration is not available from the current public WordPress REST view. Full metadata/schema parity must therefore remain `REQUIRES AUTHENTICATED WORDPRESS ACCESS` until captured.
