# DGS WordPress → Next.js Migration Master Plan

## Non-negotiables

- WordPress is the migration source of truth for visible content.
- Preserve ranking-critical URLs and search structures before visual redesign.
- Protected routes include AEO, AI Video Production, LLM SEO, SEO Mumbai and GEO, plus any additional routes found to have search visibility.
- Syne is the site-wide typeface.
- Do not transplant Elementor-rendered HTML as the final architecture.
- Do not use Envira on the new public frontend.
- Build a custom `/portfolio/` and route gallery-heavy creative CTAs to `View Our Portfolio` where approved.
- Keep WordPress/Fluent Forms as the form backend until a verified replacement is explicitly approved.
- No production cutover without parity validation and explicit approval.

## Phase 1 — Inventory and baselines

1. Inventory all indexable WordPress URLs from sitemaps and REST.
2. Capture current titles, descriptions, canonicals, robots directives and JSON-LD where accessible.
3. Capture headings, paragraphs, FAQs, internal links, images, alt text and video references.
4. Record response status, redirects and crawl relationships.
5. Establish protected-route baselines.
6. Document current Core Web Vitals and technical errors.

## Phase 2 — Normalize content

Convert WordPress content into a clean content model rather than reusing Elementor DOM. Preserve exact visible wording while removing builder wrappers and plugin presentation markup.

## Phase 3 — Semantic Next.js rendering

Build semantic route templates for pages, services, blog posts, FAQ sections, media, breadcrumbs and internal links. Server-render critical content.

## Phase 4 — SEO / AEO / GEO / LLM parity

Centralize metadata, canonicals, robots, sitemap generation, breadcrumbs and schema. Eliminate duplicates and conflicts. Preserve successful search structures on protected routes.

## Phase 5 — Portfolio migration

Extract verified creative assets and map them to a custom portfolio data model. Build `/portfolio/` without Envira frontend CSS/JS.

## Phase 6 — Forms

Map real Fluent Forms IDs, fields, validation, CAPTCHA, notifications, webhooks and analytics. Build a custom Next.js presentation while preserving the verified backend.

## Phase 7 — Performance

Target excellent Core Web Vitals by reducing JavaScript, CSS, DOM size, render-blocking resources, third-party scripts and image/video weight.

## Phase 8 — Visual system

Only after technical/content parity is proven, build the new DGS visual language on top of the clean architecture.

## Cutover gates

- No unintended 404s.
- No broken internal links.
- Protected-route content parity confirmed.
- Metadata/canonical/schema parity confirmed.
- Redirect map tested.
- Complete sitemap generated.
- Forms verified end-to-end.
- Console/build/type errors at zero.
- Performance and accessibility checks pass.
