# Robots and Sitemap Migration

## Current robots baseline

The 2026-08-25 live crawl captured a dynamically generated WordPress robots file with these important behaviors:

- default crawlers are allowed
- WordPress admin/login and preview/search-style URLs are restricted
- the public sitemap index is declared
- OAI-SearchBot is explicitly allowed
- ChatGPT-User is explicitly allowed
- GPTBot is explicitly allowed
- ClaudeBot is explicitly allowed
- PerplexityBot is explicitly allowed
- Google-Extended is explicitly allowed
- Applebot-Extended is explicitly allowed

This is migration evidence, not a file to copy byte-for-byte. WordPress-specific restrictions may no longer apply to the public Next frontend, while the WordPress backend may move behind a different origin/path.

## Current sitemap baseline

The first crawl discovered 5 sitemap documents and 88 sitemap resource URLs.

The public WordPress REST inventory was larger than the sitemap set. Most importantly, the protected AEO route `/services/aeo-services-in-mumbai/` was published/live but absent from the discovered sitemap set.

Therefore **source sitemap parity is not sufficient**. The new sitemap must be generated from the approved indexability manifest, not cloned from the old sitemap output.

## New sitemap rule

The future Next.js sitemap may include a route only when:

- the route is approved/deployable;
- the route is intended to be indexable;
- `includeInSitemap` is true;
- the route is not merely a redirect source;
- the route is not a private/internal/test/utility endpoint unless there is a verified reason for indexing it.

All Tier-0 protected routes must appear in the final sitemap.

## New robots rule

The future robots output must be derived only after the deployment architecture is known.

Do not blindly retain `/wp-admin/` or other WordPress paths on the public frontend if WordPress is moved elsewhere. Conversely, do not accidentally expose a backend path merely because the public frontend changed.

AI/search crawler permissions must be a deliberate business decision and must not be changed incidentally during redesign.

## Canonical relationship

Every indexable sitemap URL should normally self-canonicalize unless an explicit approved exception exists.

A URL that canonicalizes to a different page should not be casually included as an independent indexable sitemap entry.

The current AEO canonical mismatch is explicitly quarantined and must not be reproduced.

## Cutover checks

Before production cutover verify:

1. every intended indexable Next route is represented once in the sitemap;
2. every Tier-0 route is present;
3. no redirect source is submitted as a destination page;
4. no noindex page is included;
5. canonicals agree with sitemap URLs;
6. robots does not block intended search resources;
7. robots does not expose private/backend paths;
8. all sitemap URLs return the intended final status directly;
9. no staging/preview hostname appears;
10. non-HTML resources such as KML are classified intentionally rather than treated as normal pages.

Do not activate a new Next.js `app/sitemap.ts` or `app/robots.ts` merely to complete scaffolding. Implement them only when the approved route/indexability and deployment architecture are ready.
