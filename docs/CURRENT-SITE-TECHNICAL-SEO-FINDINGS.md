# Current DGS Site — Technical Search Baseline

Baseline date: 2026-08-25

This file records problems observed on the current WordPress site. These are migration inputs, not implementation requirements. The new Next.js build must preserve successful search equity while preventing these defects from being reproduced.

## Baseline inventory

The public WordPress extraction returned:

- 26 pages
- 18 service records
- 60 posts
- 1,843 media records

The sitemap crawl discovered:

- 5 sitemap documents
- 88 sitemap URLs
- 88 audited sitemap resources
- 5,019 internal-link edges
- 11 routes with zero inbound links from the crawled sitemap set
- 2 sitemap routes currently redirecting

The combined WordPress REST + sitemap route-parity set contained 106 routes. Of these, the first baseline classified 18 published REST routes as missing from the discovered sitemap set and therefore requiring review.

## Critical protected-page finding — AEO

`/services/aeo-services-in-mumbai/` is a protected migration route.

Observed live state:

- HTTP 200
- indexable
- live title: `AEO Services in Mumbai : 7 Proven Ways to Win AI Answers`
- live H1: `AEO Services in Mumbai from a Mumbai-Based AEO Agency`
- live canonical: `https://www.dgeniussolutions.com/services/aeo/`
- the protected route was also absent from the sitemap URL set discovered by the baseline crawl

### Migration decision

Do **not** carry the current canonical mismatch forward.

The new implementation must keep `/services/aeo-services-in-mumbai/` as a protected route and use a correct self-canonical by default. Before final production cutover, Search Console evidence should be checked for Google-selected canonical and query/page performance so this decision is confirmed with first-party search data.

The protected route must not disappear merely because the source sitemap omitted it.

## Tier-0 pages confirmed live

The baseline verified HTTP 200/indexable responses for:

- `/services/ai-video-production-agency/`
- `/services/aeo-services-in-mumbai/`
- `/services/geo/`
- `/services/llm-seo-service/`
- `/services/seo-services-in-mumbai/`

These pages remain release-blocking protected routes.

## Semantic HTML defects

The crawl found a missing H1 on:

- `/contact-us/`

Two H1 elements were detected on:

- `/blogs/ai-search-optimization-ecommerce/`
- `/blogs/brand-mentions-for-ai-tools/`
- `/blogs/core-update-strategy/`
- `/blogs/llm-seo-ai-search/`

The migration should preserve heading text but rebuild the semantic hierarchy so each normal content page has one clear primary H1.

## Redirect findings

`/career/` currently redirects in one hop to the homepage. This is not automatically approved for the new site; the intended careers route must be verified.

`/wp-file-download-search/` currently redirects through the non-www homepage and then to the canonical www homepage. If this legacy URL is retained, the new redirect policy should normalize it to a single approved hop.

No redirect discovered on the source site is automatically copied. All redirects must exist in `data/migration/redirects.approved.json` before Next.js is allowed to implement them.

## Orphan review set

The sitemap crawl found zero inbound internal links for the following crawled routes:

- `/aeo-dubai/`
- `/australia-page/`
- `/better-ceasons-case-study/`
- `/blogs/website-design-lead-generation-mumbai/`
- `/indriya-test/`
- `/locations.kml`
- `/motion-graphics/`
- `/seo-pricing/`
- `/services/`
- `/thank-you/`
- `/us-landing-page/`

This list is a **review set**, not an instruction to add links to every route. Utility, test, thank-you, paid landing or machine-readable resources may intentionally be absent from normal navigation. Each route must be classified before migration.

## Published WordPress routes missing from discovered sitemap set

The first parity pass found these published REST routes outside the discovered sitemap set:

- `/aeo-services-mumbai-google-ads-landing-page/`
- `/ai-motion-graphic-designer/`
- `/ai-production-videos-google-ads-landing-page/`
- `/blogs/ai-content-optimization/`
- `/blogs/ai-marketing-strategies-2026/`
- `/blogs/ai-tools-marketing-agencies/`
- `/blogs/content-strategy-high-intent-traffic/`
- `/blogs/google-ai-overviews-and-the-growth-of-zero-click-searches/`
- `/blogs/seo-services-india-2026/`
- `/blogs/topical-authority-seo/`
- `/blogs/website-development-leads/`
- `/blogs/website-development-mistakes/`
- `/blogs/website-performance-conversions/`
- `/seo-executive-assessment/`
- `/seo-manager-assessment/`
- `/seo-services-mumbai-google-ads-landing-page/`
- `/services/aeo-services-in-mumbai/`
- `/website-development-services-in-mumbai-dgenius-solutions/`

These require classification as one of:

- indexable and should be in sitemap
- intentionally noindex/paid landing/utility
- historical redirect source
- private/internal workflow route
- candidate for retirement, approval required

No route is removed automatically.

## Non-HTML resource handling

`/locations.kml` was included in the sitemap crawl. The original audit produced false missing-title and missing-H1 errors because the resource was tested like HTML.

The migration audit must classify resources by content type. KML/XML/media resources do not require HTML titles or H1 elements.

## Next controls

The new repository now treats these source findings as quarantined defects. The following controls are being implemented before page recreation:

1. protected-route override independent of source sitemap quality
2. self-canonical policy for protected routes unless explicitly approved otherwise
3. approved-only redirect registry
4. non-HTML-aware crawl QA
5. sitemap/indexability classification
6. internal-link and orphan review
7. exact Tier-0 content baseline
8. semantic heading checks
9. schema validation and de-duplication
10. server-rendered crawlable critical content

The migration does not inherit the current WordPress implementation merely because it exists. Search evidence is preserved; implementation defects are corrected.
