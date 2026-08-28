# DGS Next.js Migration Timeline

Status: planning ranges for active migration work

These are working execution ranges, not a guarantee of a specific ranking outcome or an unattended background completion promise. Search-safe cutover takes priority over an artificial deadline.

## Phase 1 — Search protection and technical baseline

Target planning range: 1–2 working days

Scope:

- WordPress route/content/media inventory
- Tier-0 AI Production/AEO/GEO/LLM/SEO baseline
- canonical/indexability checks
- sitemap/robots capture
- redirect review architecture
- internal-link graph
- schema inventory
- Markdown/TypeScript/search-file hygiene
- preview/staging noindex safeguards
- analytics/performance/accessibility baselines

Exit gate:

- all protected routes have explicit migration policy
- known source defects are quarantined instead of copied
- no unresolved search architecture ambiguity can silently pass to production

## Phase 2 — Authenticated WordPress/Hostinger forensic extraction

Target planning range after access is available: 1–2 working days

Scope:

- current Rank Math metadata/schema/settings
- menus/navigation relationships
- Elementor source data for extraction only
- Fluent Forms configuration without submissions/PII
- Envira gallery/media mappings
- redirect/plugin/server evidence
- Hostinger/server-only routing/config where exposed

Exit gate:

- private configuration required for parity has been captured or explicitly classified as unavailable

## Phase 3 — Clean semantic content and route migration

Target planning range: 3–5 working days

Scope:

- pages
- service routes
- location routes
- blogs
- about/contact/career/case-study routes
- semantic block conversion
- metadata/canonical wiring
- breadcrumbs
- schema
- internal links
- sitemap/indexability registry

Exit gate:

- intended public route set exists in Next.js
- no meaningful indexable WordPress URL is silently missing
- Tier-0 content/search parity passes

## Phase 4 — Media, portfolio and forms

Target planning range: 2–4 working days

Scope:

- media provenance/dimensions/alt relationships
- image optimization migration
- custom `/portfolio/`
- AI Production portfolio separation
- Brand/Creative portfolio separation
- Case Studies separation
- Fluent Forms backend contract integration
- form validation/spam/CAPTCHA/notifications/webhook parity where verified

Exit gate:

- no Envira frontend dependency
- forms are production-verified
- no invented portfolio/client/category metadata

## Phase 5 — New DGS visual system

Target planning range: 4–7 working days

Scope:

- Syne-led design system
- homepage
- service templates
- editorial/blog layouts
- portfolio experience
- controlled Three.js/GSAP/WebGL layers
- mobile/responsive behavior
- accessibility/reduced motion
- performance tuning

Exit gate:

- cinematic layer does not alter crawlable semantic content or protected search behavior

## Phase 6 — Final parity QA and cutover preparation

Target planning range: 1–2 working days

Scope:

- old-vs-new crawl comparison
- redirect validation
- robots/sitemap validation
- schema validation
- internal links
- Tier-0 preview comparison
- form tests
- analytics/conversion tests
- Core Web Vitals/performance checks
- accessibility checks
- final release blockers

Exit gate:

- explicit approval before production cutover

## Overall planning range

For the full clean migration plus the new cinematic frontend, a sensible working range is approximately **12–22 working days**, depending mainly on authenticated WordPress/Hostinger access, portfolio complexity, form configuration, media cleanup and how much visual iteration is requested.

The technical/search-safe migration foundation completes earlier than the final visual website.

## Countdown / reverse-clock policy

A reverse countdown is useful only after a real target go-live date is agreed. Before that, a countdown creates false precision because search defects, access gaps and parity failures can legitimately block launch.

Current recommendation:

- use milestone status during migration
- do not put a public countdown on the DGS website
- once a target go-live date is explicitly set, an internal migration countdown can be added to a private project/status page or tracker
- the countdown must never override a failed SEO/parity release gate

## Current milestone order

1. Search/file hygiene and baseline
2. Authenticated source extraction
3. Semantic route/content migration
4. Portfolio/forms/media
5. Visual system
6. Final parity and cutover
