# SEO Pricing Page Archive & Restoration Guide

## Route Information
- **Original Route**: `/seo-pricing/`
- **WordPress Page ID**: `62632`
- **Form ID**: Form 18
- **Archival Date**: September 27, 2026
- **Status**: HTTP 410 Gone (Retired)

## Why This Route Was Retired
1. **Google Search Console Audit**: Audited on live MySQL production database; recorded 0 clicks and 0 impressions across all active telemetry.
2. **Quality & Thin Content Protection**: Legacy static pricing table obsolete in comparison to modern dynamic custom proposals and core service offerings.
3. **No Internal Backlinks**: Zero inbound links exist across the modernized headless site navigation, footer, and core landing pages.
4. **Clean 410 Deprecation**: Returning HTTP 410 Gone with `X-Robots-Tag: noindex, nofollow, noarchive` instructs Googlebot to immediately de-index without wasting crawl budget or executing soft-404 redirects.

## Legacy Form 18 Handling
- Form 18 is preserved in system records and documented as `ARCHIVED / INACTIVE (SEO PRICING ONLY)`.
- It remains unmigrated into active native form pipelines to avoid exposing obsolete pricing schemas.
- It is NOT deleted from legacy subsystem tracking, ensuring integrity of historical lead records if any exist.

## Restoration Steps (If Ever Required)
1. Remove `/seo-pricing/` from `data/migration/retired-routes.approved.json`.
2. Move `seo-pricing.json` back to `data/wordpress/mirrors/pages/seo-pricing.json` (if removed).
3. In `data/migration/nextjs-route-registry.generated.json`, update the entry for `/seo-pricing/` from `"proposedAction": "RETIRE"` to `"KEEP_SAME_URL"`, `"indexable": true`, `"includeInSitemap": true`.
4. If native lead capture is needed, build a native form definition for Form 18 in `data/forms/definitions.approved.json` and provision the corresponding MySQL table.
5. Run full test suite and redeploy.
