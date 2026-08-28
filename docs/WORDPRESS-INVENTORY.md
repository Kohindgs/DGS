# DGS WordPress Migration Inventory

Status: in progress
Branch: `migration/wordpress-to-nextjs`

## Purpose

Create a complete inventory of the current WordPress site before rebuilding the frontend in Next.js. The WordPress site remains the content/search source of truth during migration. This document separates verified data from items that still require authenticated WordPress or Hostinger access.

## Ranking-protected core routes

| Route | WP ID | Type | Protection |
| --- | ---: | --- | --- |
| `/` | 63505 | page | High |
| `/services/seo-services-in-mumbai/` | 40278 | service | Critical |
| `/services/aeo-services-in-mumbai/` | 62373 | service | Critical |
| `/services/geo/` | 62317 | service | Critical |
| `/services/llm-seo-service/` | 62322 | service | Critical |
| `/services/ai-video-production-agency/` | 40114 | service | Critical |
| `/about-us/` | 38769 | page | High |
| `/services/performance-marketing/` | 64616 | service | High |
| `/services/website-development-amc/` | 41418 | service | High |
| `/services/social-media-marketing/` | 40112 | service | High |
| `/services/branding/` | 40277 | service | High |
| `/services/content-creation/` | 40276 | service | High |

## Migration protection rule

For critical routes, do not change the URL or rewrite visible content during migration. Preserve current heading hierarchy, internal links, metadata, canonical behavior, indexability, structured data, FAQ relationships and media/alt relationships unless a verified technical error requires correction.

## Known geo-targeted routes to inventory

The legacy audit identified these routes as part of the existing service footprint and they must be resolved against the live WordPress inventory before launch:

- `/services/seo-service-pune/`
- `/services/seo-services-in-hyderabad/`
- `/services/seo-service-in-banglore/`
- `/services/seo-service-in-gurugram/`
- `/services/dubai-seo/`
- `/services/website-development-pune-page/`
- `/services/ai-production-dubai-page/`

Their exact current content, status, metadata and redirect/canonical behavior must be verified from the authenticated source or a current REST capture before cutover.

## WordPress REST migration client

The Next.js codebase now contains a paginated public REST client capable of listing all pages, services, posts and media. The purpose is inventory/extraction, not permanent dependence on Elementor-rendered HTML.

Final rendering must use normalized semantic Next.js components.

## Authenticated access still required for full parity

Public REST does not give complete access to:

- Rank Math private metadata/settings
- Elementor `_elementor_data`
- Fluent Forms configuration and form IDs
- Envira gallery internals and category relationships
- WordPress navigation/menu configuration
- some redirect/plugin settings

These are migration blockers for complete parity, but not blockers for building the extraction and normalized-content architecture.

## Hostinger/server verification still required

Before cutover, verify server-side behavior that may not live in WordPress REST or Git:

- `.htaccess`
- server/Hostinger redirects
- `functions.php`
- MU plugins
- Code Snippets/custom PHP
- PHP/runtime/cache configuration
- production error logs
- cron jobs
- compression/CDN/cache rules

## Portfolio migration

The new frontend will not depend on Envira. Existing real creative work must be mapped into a custom Next.js portfolio data model and rendered at `/portfolio/`.

Pages that currently use heavy galleries may use a `View Our Portfolio` CTA where approved, while visible page copy otherwise remains unchanged.

## Next inventory tasks

1. Capture complete page/service/post route inventory.
2. Capture current media references for protected routes.
3. Build URL parity matrix.
4. Build internal-link graph.
5. Capture Rank Math metadata/schema once authenticated access exists.
6. Map Fluent Forms without changing the production submission backend.
7. Map Envira creative assets into custom portfolio records.
8. Verify server redirects and production-only custom code through Hostinger access.
