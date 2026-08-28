# DGS Next.js

Clean Next.js rebuild of the D'Genius Solutions website.

## Project principles

- WordPress remains the source of truth for migration evidence and the forms backend until an approved replacement exists.
- Preserve ranking-critical URLs, visible content, useful metadata/schema, internal links, and indexability.
- Correct source-site defects instead of copying them.
- Syne is the site-wide typeface.
- Do not carry Elementor or Envira frontend dependencies into the new public site.
- Do not render WordPress/Elementor HTML as the permanent Next.js frontend.
- Final pages render only the structured semantic content model in `lib/content/types.ts`.
- Build a custom `/portfolio/` experience from verified DGS creative assets.
- Protect ranking pages, especially AEO, AI Video Production, LLM SEO, SEO Mumbai, and GEO.
- Optimize for SEO, AEO, GEO, LLM discovery, accessibility, and Core Web Vitals.
- Production cutover requires explicit approval and release-gate validation.

## Repositories

- New clean codebase: `Kohindgs/DGS-NextJS`
- Legacy/reference repo: `Kohindgs/DGS`

The legacy repo is reference material only. Do not merge old experimental UI branches into this repository.

## Active migration branch

`migration/wordpress-to-nextjs`

`main` remains protected from migration work until parity and release checks are approved.

## Tier-0 search protection

Release-blocking routes:

- `/services/ai-video-production-agency/`
- `/services/aeo-services-in-mumbai/`
- `/services/geo/`
- `/services/llm-seo-service/`
- `/services/seo-services-in-mumbai/`

Tier-0 routes must remain 200/indexable, keep their public route, retain required visible content and internal-link relationships, appear in the sitemap, and self-canonicalize unless an explicit exception is approved.

The current WordPress AEO canonical mismatch is recorded as a **source defect** and must not be copied.

## Migration pipeline

Run from a secure working environment with public WordPress access:

```bash
npm run migration:baseline
```

This performs:

1. WordPress REST extraction
2. normalized content evidence generation
3. live-site/sitemap crawl
4. linked/canonical-target audit
5. Tier-0 deep audit
6. Tier-0 content hash baseline
7. route-parity generation
8. indexability manifest generation
9. internal-link graph generation
10. Tier-0 verification
11. redirect validation
12. protected search-architecture validation

Generated audit output is evidence. It is not permission to change URLs, redirects, canonicals or indexability.

## Preview parity

When a Next.js preview is running:

```bash
MIGRATION_TARGET_URL=http://127.0.0.1:3000 npm run verify:tier0-preview
```

The protected preview gate checks status, redirects, robots, title, H1, canonical, semantic article content hash and required internal-link destinations.

## Route decisions

Approved redirect rules live only in:

`data/migration/redirects.approved.json`

Approved non-protected route/indexability decisions live only in:

`data/migration/route-decisions.approved.json`

Tier-0 parity exceptions live only in:

`data/migration/tier0-parity-exceptions.approved.json`

These registries are empty by default. Never add an exception simply to make a validation command pass.

## Source defects

Known current-site defects are recorded in:

- `data/migration/source-defects.json`
- `docs/CURRENT-SITE-TECHNICAL-SEO-FINDINGS.md`
- `docs/LEGACY-ISSUE-QUARANTINE.md`

A defect is not considered resolved until the new implementation has evidence and the resolution is explicitly recorded.

## Structured content only

Production page components use:

- `lib/content/types.ts`
- `components/content/RichText.tsx`
- `components/content/SemanticContent.tsx`
- `components/content/MigratedPage.tsx`

There is intentionally no generic raw-HTML/Elementor renderer in the production page model.

## SEO/schema layer

Central search architecture lives in:

- `lib/seo/metadata.ts`
- `lib/migration/search-policy.ts`
- `lib/schema/builders.ts`
- `lib/schema/jsonld.ts`
- `components/seo/JsonLd.tsx`

Do not create independent page-level canonical/schema systems that conflict with these modules.

## GitHub Actions

Automatic push/PR workflow triggers are disabled. The migration guard is manual-only to avoid automatic process notifications. Normal migration commits should not start GitHub Actions.

## Status

Technical migration and parity foundation in progress. No production deployment and no final visual redesign yet.
