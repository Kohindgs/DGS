# Ranking Protection Freeze

Four service routes are **ranking-protected**. WordPress visible content is the source of truth. Migration must not induce SEO, AEO, GEO, or LLM-search ranking regression.

## Protected routes

- `/services/ai-video-production-agency/`
- `/services/aeo-services-in-mumbai/`
- `/services/geo/`
- `/services/llm-seo-service/`

## Policy

Do **not** change without explicit human approval:

- Visible copy, headings, H1, FAQ wording
- Title or meta description
- Contextual internal links or URLs
- Indexability, canonical (except approved AEO correction), schema, breadcrumbs, sitemap inclusion
- Meaningful image alt text

## Approved exception

**AEO canonical (classification B):** `/services/aeo-services-in-mumbai/` must self-canonicalize to  
`https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/`  
Do **not** restore the defective WordPress `/services/aeo/` canonical.

## Release blocker

Before staging or production release:

```bash
npm run build
npm run start
MIGRATION_TARGET_URL=http://127.0.0.1:3000 npm run validate:ranking-protection
```

For local/staging preview with intentional `noindex` middleware:

```bash
MIGRATION_TARGET_URL=http://127.0.0.1:3000 MIGRATION_EXPECT_NOINDEX=1 npm run validate:ranking-protection
```

Production release must **not** set `MIGRATION_EXPECT_NOINDEX=1`. Unexplained `noindex` blocks release.

The blocker fails on unexplained drift in:

- HTTP status and crawlability
- Visible semantic content (headings, H1, FAQ, hash with structural drift)
- Contextual internal links
- Title, meta description, canonical, robots
- Sitemap inclusion, schema types, breadcrumbs
- Meaningful image alt text

Normalization artifacts (classification **C**) such as WP `+title+` template literals or empty-anchor image wraps are documented but do not block when they are the only delta.

Report output: `data/audit/ranking-protection-report.json`

Integrated into: `npm run release:validate:search`

## Configuration

- `data/migration/ranking-protected-routes.json` — frozen route list and policy metadata
- Do **not** update baselines merely to make tests pass
