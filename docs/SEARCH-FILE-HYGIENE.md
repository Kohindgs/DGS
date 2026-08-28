# DGS Search and File Hygiene Policy

Status: release-blocking migration policy

The Next.js rebuild must preserve verified ranking signals while eliminating duplicate, stale or conflicting implementation paths from the WordPress/legacy stack.

## Core rule

Preserve verified content, URLs, search intent, internal-link equity and valid search metadata. Do not preserve implementation defects merely because they exist on WordPress.

## Markdown files

Every `.md` file must be classified as one of:

- `CURRENT POLICY` — active migration/build rule.
- `CURRENT INVENTORY` — verified snapshot of the current source site.
- `CURRENT PLAN` — work still to be completed.
- `REFERENCE ONLY` — historical/legacy information that must not drive production automatically.
- `ARCHIVE` — superseded material retained only for traceability.

Rules:

- No Markdown document may silently override production code.
- Search/entity facts in Markdown must not be copied into schema, metadata, `llms.txt` or page copy unless verified against the current source of truth.
- Contradictory Markdown files must be resolved before launch.
- Legacy AEO/GEO/LLM/SEO Markdown from the old repository is reference material only until re-verified.
- Ranking-critical visible page copy remains controlled by the WordPress source-of-truth rule unless an explicit content change is approved.

## TypeScript / TSX files

Search behavior must be centralized rather than implemented independently on every page.

Required central responsibilities:

- canonical normalization
- robots/indexability policy
- metadata generation
- JSON-LD/schema generation
- protected-route assertions
- redirect registry
- sitemap inclusion policy
- preview/staging noindex behavior
- URL normalization

Rules:

- No duplicate canonical implementations.
- No duplicate schema implementation for the same entity/page.
- No page may bypass the Tier-0 protected-route policy.
- No hidden client-side-only critical copy.
- No Elementor/Envira/plugin frontend HTML may become a permanent TSX rendering strategy.
- Any temporary migration parser must remain separate from production rendering components.

## Tier-0 ranking protection

Release-blocking protected routes include:

- `/services/ai-video-production-agency/`
- `/services/aeo-services-in-mumbai/`
- `/services/geo/`
- `/services/llm-seo-service/`
- `/services/seo-services-in-mumbai/`

For each Tier-0 route verify before cutover:

- same intended public URL
- HTTP 200
- indexable
- correct self-canonical unless a separately approved canonical strategy exists
- title and description parity or an explicitly approved improvement
- H1 and important heading parity
- visible copy parity
- important internal inbound/outbound link relationships
- FAQ parity where present
- valid breadcrumb relationships
- valid schema without duplicate/conflicting entities
- sitemap inclusion
- image/alt relationships where search-relevant
- no accidental redirect/noindex

Known source defect already identified:

- AEO currently lives at `/services/aeo-services-in-mumbai/` but the source page canonical points to `/services/aeo/`. The migration must not reproduce that mismatch automatically. The desired migration behavior is the verified protected public route with a self-canonical unless later evidence proves a different strategy is required.

## Redirects

There must be one approved redirect registry for the Next.js deployment.

- Never bulk-copy `.htaccess`, Rank Math, plugin, Hostinger or legacy redirect rules.
- Discover legacy rules from all relevant sources.
- De-duplicate conflicts.
- Prefer one-hop permanent redirects for approved historical URLs.
- No redirect loops or chains.
- Tier-0 routes cannot be redirected without explicit approval and supporting search evidence.
- Unknown legacy routes remain `REVIEW`; they are not automatically deleted or redirected.

## Sitemap

The production Next.js sitemap must be generated from the final approved indexability/route registry, not from an incomplete manual list.

Before enabling the Next.js sitemap:

1. compare live WordPress sitemap inventory
2. compare WordPress REST route inventory
3. include protected routes even when the current WordPress sitemap is defective
4. resolve duplicate/canonicalized URLs
5. classify utility/thank-you/test/assessment/paid-only routes
6. verify blogs/services/location pages
7. verify portfolio/case-study behavior
8. validate each sitemap URL returns the intended status and canonical

No partial sitemap replaces the live sitemap during migration.

## robots.txt

The current source robots behavior must be captured before replacement.

The Next.js robots policy must:

- keep production crawlable for intended search engines
- keep preview/staging builds noindex by default
- reference only the final production sitemap
- avoid accidental blocking of CSS/JS/media required for rendering
- preserve or intentionally revise AI crawler directives only after verification
- avoid contradictory rules between platform/CDN/server/app layers

There must be one authoritative production robots implementation at cutover.

## llms.txt / llms-full.txt

These files are discovery aids, not substitutes for crawlable HTML or schema.

Rules:

- generate only from verified DGS facts/routes
- no stale service names, addresses, claims, awards, metrics or URLs
- no contradiction with visible pages/schema
- protected AEO/GEO/LLM/SEO/AI Production routes must use their approved canonical URLs
- do not copy old repository versions blindly
- regenerate only after route/content parity is settled

## Schema

- one authoritative Organization identity
- Service schema only when supported by visible content
- FAQ schema only for qualifying visible FAQs
- BreadcrumbList must match actual navigation hierarchy
- Article/BlogPosting for qualifying editorial pages
- VideoObject/ImageObject only when supported by real media/page relationships
- no invented `areaServed`, offices, ratings, reviews, authors, dates or service facts
- no duplicate Rank Math + custom Next schema after cutover

## Search release blockers

Do not cut over while any of these remains unresolved:

- Tier-0 canonical/indexability/content regression
- unmatched indexable source URL
- unresolved redirect conflict affecting a meaningful route
- partial production sitemap
- conflicting robots rules
- duplicate/conflicting schema
- unverified `llms.txt` facts
- broken important internal links
- production preview accidentally indexable
- missing metadata on an intended indexable page
- production page dependent on legacy Elementor/Envira frontend code

## Final principle

The new repository may contain legacy evidence, parsers and audit snapshots for migration traceability. Production behavior must come only from the clean approved Next.js architecture and verified source data.
