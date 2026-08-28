# Live WordPress Baseline Findings

Snapshot source: `https://www.dgeniussolutions.com`

This document records issues discovered by the new migration audit. These are source-site observations, not instructions to reproduce the same behavior in Next.js.

## Current public inventory observed

- 26 WordPress pages via REST
- 18 WordPress services via REST
- 60 WordPress posts via REST
- 1,843 media records via REST
- 5 sitemap documents discovered from the public sitemap system
- 88 URLs present in the discovered sitemaps
- 88 sitemap URLs returned as indexable 200 pages in the first crawl
- 5,019 internal-link edges observed across the crawled sitemap URLs

Counts are point-in-time and may change while WordPress remains live.

## Tier-0 finding: AEO canonical and sitemap mismatch

Protected route:

`/services/aeo-services-in-mumbai/`

Observed behavior:

- route returns HTTP 200
- robots meta is index/follow
- title and H1 are present
- WordPress REST service ID is `62373`
- the page has a high number of observed internal inbound links in the crawl
- the page was not present in the discovered sitemap URL set
- the live canonical points to `/services/aeo/` instead of the protected public route

Migration decision:

- do **not** copy the incorrect canonical automatically
- keep `/services/aeo-services-in-mumbai/` as a protected route
- the Next.js target must self-canonicalize to the protected route unless later search evidence proves a different consolidation strategy is safer
- include the protected route in the new sitemap if it remains the intended indexable URL
- verify the current `/services/aeo/` canonical target before cutover

This source mismatch is quarantined as a legacy technical issue, not preserved as ranking equity.

## Redirect findings

Two sitemap URLs currently redirect:

1. `/career/` → `/` via one 301
2. `/wp-file-download-search/` → non-www homepage → www homepage, producing a multi-hop chain

Migration rule:

- do not copy either redirect automatically
- verify historical traffic/backlinks and current business intent first
- if a redirect is genuinely required, normalize it to one hop
- no Tier-0 route may be redirected without explicit approval

## Crawl/HTML findings

Observed source issues include:

- `/contact-us/` has no H1 in the crawled HTML
- four blog URLs produced two H1 elements:
  - `/blogs/ai-search-optimization-ecommerce/`
  - `/blogs/brand-mentions-for-ai-tools/`
  - `/blogs/core-update-strategy/`
  - `/blogs/llm-seo-ai-search/`
- `/locations.kml` appeared in the sitemap crawl and is not a normal HTML page; HTML title/H1 checks do not apply to it

Migration rule:

- use one clear semantic H1 per normal content page unless a deliberate exception is documented
- do not treat non-HTML resources such as KML as HTML content pages
- preserve the visible WordPress copy while correcting semantic implementation issues

## Internal-link orphan candidates

The first crawl found sitemap URLs with zero observed inbound HTML links from other sitemap pages. These are **candidates**, not final orphan declarations, because navigation generated outside the captured HTML or other crawl sources may change the result.

Candidates:

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

Each must be classified before migration as intentional utility/landing content, indexable growth content, protected content, or retirement/redirect candidate. No page is removed solely because it appears on this list.

## REST routes missing from discovered sitemap crawl

The first parity map found 18 WordPress REST routes that were not present in the discovered sitemap URL crawl:

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

These routes require individual classification. Landing pages, hiring assessments and utility pages may intentionally be excluded from search discovery; content/service pages may indicate a technical omission.

## Migration rule from these findings

The new Next.js site will not inherit source behavior by default. Every source issue is classified as one of:

- `PRESERVE SEARCH EQUITY`
- `FIX IN NEXT.JS`
- `REVIEW BEFORE MIGRATION`
- `CONTENT CHANGE RECOMMENDATION — NOT IMPLEMENTED`

Only verified beneficial behavior is preserved.
