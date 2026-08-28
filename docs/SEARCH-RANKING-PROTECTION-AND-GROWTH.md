# Search Ranking Protection and Growth Policy

This migration has two simultaneous objectives:

1. Protect pages that already have search visibility so the migration does not unnecessarily damage rankings.
2. Give weak/non-ranking pages a stronger technical, semantic, internal-link and crawl foundation so they have a better chance to rank after migration.

No migration can guarantee a fixed Google ranking position. The release process must instead remove avoidable migration risk and maximize the technical conditions that support organic visibility.

## Tier 0 — Ranking protection

The following routes are release-blocking protected routes:

- `/services/ai-video-production-agency/`
- `/services/aeo-services-in-mumbai/`
- `/services/geo/`
- `/services/llm-seo-service/`
- `/services/seo-services-in-mumbai/`

Additional routes with verified search visibility must be added to this tier before cutover.

### Tier 0 preservation rule

For each Tier 0 route, do not change the search intent or visible WordPress copy during migration unless an explicit content change is approved.

Preserve or correctly reproduce:

- exact public URL
- successful HTTP status
- indexability
- title tag
- meta description
- canonical
- robots directives
- H1 and meaningful H2/H3 hierarchy
- full visible copy
- FAQ questions and answers
- breadcrumb relationships
- internal inbound and outbound links
- important anchor text relationships
- relevant images and alt text
- structured data that is valid and useful
- organization/service/entity relationships
- sitemap inclusion
- hreflang if any is verified
- relevant VideoObject/ImageObject relationships where valid

The implementation itself must be rebuilt cleanly. Elementor, Envira, plugin CSS/JS and other legacy frontend code are not ranking signals to preserve.

## Tier 0 cutover gates

A Tier 0 page blocks release if any of the following is unresolved:

- URL changes without an approved one-hop 301 plan
- accidental noindex
- canonical points to the wrong route
- materially missing visible copy
- missing primary H1
- broken FAQ content
- broken internal links
- missing important inbound links from the DGS service cluster
- missing or conflicting schema
- invalid breadcrumb relationship
- page removed from sitemap without a documented reason
- JavaScript-only critical copy
- unexpected 404/5xx
- severe rendering/hydration errors

## Ranking-cluster protection

Maintain the strong DGS search relationship between:

SEO ↔ AEO ↔ GEO ↔ LLM SEO ↔ AI Production where contextually relevant.

Do not remove useful existing contextual links merely because the new design is cleaner. If the old implementation has poor navigation markup, rebuild the relationship semantically rather than deleting it.

## Tier 1 — Growth pages

Pages that are not ranking strongly should not simply receive a visual clone. They must receive a technical growth audit and clean Next.js implementation.

Known service growth candidates include:

- `/services/performance-marketing/`
- `/services/website-development-amc/`
- `/services/social-media-marketing/`
- `/services/branding/`
- `/services/content-creation/`

Additional service, geo and blog routes discovered during the full inventory must be classified individually.

### Tier 1 technical growth checklist

For every growth route verify and improve, without silently rewriting source copy:

- 200/indexable response where appropriate
- correct self-canonical
- unique and accurate metadata using verified source data
- one clear H1
- logical H2/H3 structure
- crawlable server-rendered main content
- clean semantic HTML
- useful breadcrumbs
- inclusion in the correct sitemap
- no orphan-page state
- contextual inbound links from relevant authoritative DGS pages
- contextual outbound links to related services/resources
- no redirect chains
- no links to 404/noindex/staging URLs
- valid page/service/breadcrumb schema where appropriate
- FAQ schema only where the visible page contains qualifying FAQ content
- clear Organization/Service/entity relationships
- optimized images and meaningful alt text
- mobile accessibility
- strong Core Web Vitals
- no duplicate canonical/schema/title implementations
- no plugin-generated conflicting metadata

## AEO requirements

Where content supports it:

- preserve visible question-and-answer structures
- use semantic heading relationships
- keep concise direct answers crawlable in HTML
- avoid hidden answer content that only appears after client-side execution
- avoid duplicate FAQ schema
- maintain entity clarity and service relationships

## GEO requirements

GEO means Generative Engine Optimization in the DGS service context, while geographic landing pages must also preserve genuine location relevance.

For AI/generative discovery:

- expose clear organization and service facts
- maintain consistent naming and entity relationships
- use semantic server-rendered content
- avoid contradictory company/service facts

For geographic service pages:

- preserve genuine location-specific content already present
- use accurate areaServed/location relationships only when factually supported
- do not fabricate addresses, offices or service claims
- avoid doorway-page templating or accidental duplication

## LLM / AI-search requirements

- keep important content accessible without JavaScript interaction
- maintain consistent D'Genius Solutions entity facts
- preserve/update `llms.txt` and `llms-full.txt` only with verified facts
- use descriptive internal links
- provide clean breadcrumbs and service relationships
- avoid contradictory schema and page copy
- ensure robots rules do not unintentionally block intended AI/search crawlers

## Non-ranking page growth principle

The migration may fix technical and structural causes of weak visibility, but content changes are still controlled by the source-of-truth rule. If a page is technically clean but its existing copy is insufficient for the target query, record:

`CONTENT GROWTH RECOMMENDATION — NOT IMPLEMENTED`

with the recommended change, supporting evidence and affected query/intent. Do not silently rewrite the page during the migration.

## Post-launch monitoring

After cutover, compare Tier 0 and Tier 1 pages against the pre-migration baseline using available Search Console/analytics data. Track:

- indexed status
- impressions
- clicks
- average position
- query coverage
- crawl errors
- Core Web Vitals
- canonical selection
- rich-result/schema errors

Tier 0 regressions get priority investigation. Tier 1 pages should be assessed for technical health first, then content/internal-link opportunities.
