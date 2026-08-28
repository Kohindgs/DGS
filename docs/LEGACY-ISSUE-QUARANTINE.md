# DGS Legacy Issue Quarantine

This document is a hard migration rule. The new Next.js site must preserve verified content, URLs, ranking equity and valid search structures without carrying forward WordPress/Elementor/plugin implementation defects.

## Preserve, do not copy blindly

Preserve when verified:

- visible WordPress content
- ranking-critical URLs
- successful headings and information architecture
- valid metadata and canonicals
- valid structured data semantics
- useful internal-link relationships
- legitimate redirects
- sitemap/indexability intent
- AEO/GEO/LLM entity and answer structures
- media/alt text that is still correct
- WordPress/Fluent Forms backend behavior

Do NOT carry forward implementation simply because WordPress currently uses it.

## Code quarantine

The new public frontend must not import or transplant:

- Elementor DOM/layout wrappers
- Elementor frontend CSS/JS
- Envira frontend CSS/JS/lightbox/filter code
- legacy theme presentation code
- WordPress plugin-generated presentation markup
- duplicated inline CSS/JS
- known experimental DGS UI code from the legacy repository unless independently reviewed and explicitly approved
- PHP/plugin hacks as frontend dependencies

Every new component must be native, semantic Next.js/React code.

## Technical-error quarantine

Do not reproduce:

- hydration/runtime/console errors
- broken assets or network 404s
- oversized DOM structures
- render-blocking plugin assets
- unnecessary third-party scripts
- duplicate libraries
- layout shifts caused by missing dimensions
- unoptimized images/video
- inaccessible markup
- JS-only critical content

Cutover requires build, type, runtime, crawl, accessibility and performance validation.

## Redirect quarantine

The existing redirect estate is evidence, not executable truth.

For every legacy redirect:

1. identify source URL
2. identify current destination
3. determine whether the redirect is still required
4. detect chains
5. detect loops
6. detect redirects to 404/noindex/non-canonical destinations
7. collapse valid permanent moves to one hop where possible
8. preserve high-value historical URLs and backlinks

Do NOT bulk-copy old `.htaccess`, Rank Math, Redirection-plugin or server redirect rules into Next.js.

Create one canonical redirect map for the new site.

## SEO quarantine

Do not copy known or suspected defects such as:

- duplicate/missing titles
- duplicate/missing descriptions
- incorrect canonical URLs
- multiple canonical tags
- accidental noindex/nofollow
- conflicting robots directives
- broken breadcrumbs
- invalid or duplicated schema
- duplicate H1s caused by templates/builders
- wrong heading hierarchy
- orphan pages
- broken internal links
- redirecting internal links where direct links are available
- sitemap URLs that redirect/404/noindex
- thin template artifacts

Metadata and technical SEO must be implemented centrally in Next.js and validated route by route.

## AEO quarantine

Preserve answer structures that are genuinely helping ranking/discovery, especially protected pages, but do not copy plugin/builder markup defects.

Validate:

- clear H1/topic entity
- question/answer relationships
- concise answer passages where already present
- FAQ semantics where appropriate
- breadcrumb/entity relationships
- server-rendered answers
- no duplicate FAQ/schema output
- no hidden or contradictory answer blocks

## GEO quarantine

Preserve legitimate location relevance and existing geo-targeted content/URLs.

Do not carry forward:

- contradictory business/location data
- unsupported areaServed claims
- duplicate location schema
- inconsistent NAP/entity facts
- malformed location markup
- geo pages accidentally canonicalized to another city
- boilerplate technical errors shared across city pages

## LLM / AI-search quarantine

Preserve verified company/service facts and useful semantic relationships while rebuilding machine-readable discovery cleanly.

Validate:

- semantic server-rendered HTML
- entity consistency
- Organization/Service relationships
- breadcrumbs
- factual schema
- crawlability
- `llms.txt` / `llms-full.txt` accuracy if retained
- no invented facts or claims
- no contradictory duplicate machine-readable content

## Ranking-protected migration gates

The following are protected at minimum:

- `/services/aeo-services-in-mumbai/`
- `/services/ai-video-production-agency/`
- `/services/llm-seo-service/`
- `/services/seo-services-in-mumbai/`
- `/services/geo/`

Any additional route with proven search visibility becomes protected automatically.

For protected routes, compare old vs new for:

- HTTP status
- URL
- indexability
- visible copy
- H1/H2/H3 content and hierarchy
- title/meta description
- canonical
- robots
- breadcrumbs
- JSON-LD/schema
- FAQs
- internal links
- image alt text
- sitemap inclusion
- structured answer/entity signals

Do not cut over a protected route while a material parity difference remains unexplained.

## Non-ranking/weak pages

These pages are NOT allowed to inherit their current technical weaknesses.

Their copy remains preserved unless a content change is separately approved, but the rebuild must correct systemic technical causes that may be limiting performance/ranking.

## Final rule

Migration source-of-truth does not mean implementation source-of-truth.

WORDPRESS = content/search evidence.

NEXT.JS = new clean implementation.

Only verified good signals cross the migration boundary. Known, suspected or unverified legacy defects stay quarantined until independently validated.
