# DGS Schema Map

The new Next.js site must generate structured data deliberately from verified page facts. Do not copy Rank Math/Elementor/plugin JSON-LD blindly and do not emit duplicate schemas from multiple layers.

## Global entity layer

Use one canonical D'Genius Solutions Organization entity with a stable `@id`.

Recommended stable relationship:

- Organization: `https://www.dgeniussolutions.com/#organization`
- WebSite: `https://www.dgeniussolutions.com/#website`

Only add logo, social profiles, postal address, telephone, founding details or other entity properties after they are verified from the live source/authenticated WordPress/company data.

## Page-level schema

### Standard pages

Use `WebPage` plus `BreadcrumbList` where breadcrumbs are visible/valid.

### About

Use `AboutPage` and connect it to the Organization entity.

### Contact

Use `ContactPage` and connect it to the Organization entity. Do not invent contact facts.

### Service pages

Use `Service` plus the appropriate page/breadcrumb relationship.

Protected service routes include:

- AI Video Production
- SEO Mumbai
- AEO
- GEO
- LLM SEO

Service `areaServed` must be factually supported by the actual page/service scope. Do not add geographic claims merely to increase keyword coverage.

### FAQ

Use `FAQPage` only when the corresponding questions and answers are visibly present on the page and qualify for FAQ structured data. Do not create hidden schema-only FAQs.

### Blog articles

Use `Article` or a more specific appropriate subtype only when author, dates, headline, publisher and other required facts are verified.

### Video

Use `VideoObject` only for real video assets with verified title/description/thumbnail/upload date and a valid content or embed relationship.

### Portfolio/case studies

Do not force every visual into Product/CreativeWork schema. Use schema only when it accurately describes the actual item and has meaningful verified properties.

## De-duplication rules

The new frontend has one schema generation layer. Do not independently emit overlapping schema from:

- page component
- layout
- old WordPress HTML
- Rank Math snapshot
- custom script injection
- gallery plugin data

`lib/schema/jsonld.ts` provides merge/de-duplication helpers. `components/seo/JsonLd.tsx` is the controlled rendering surface.

## Migration parity

For Tier-0 pages, first capture the source schema types and important entity relationships. Then rebuild only valid/useful schema in the new architecture.

Parity does **not** mean reproducing invalid, duplicate or contradictory source JSON-LD.

Before cutover verify:

- JSON parses successfully
- no duplicated Organization entities with conflicting facts
- no duplicate FAQ blocks
- canonical URL matches schema URL/mainEntity relationships
- breadcrumbs match visible navigation
- service names/descriptions reflect visible content
- no fabricated reviews/ratings
- no fabricated location claims
- no hidden schema-only content

## AEO/GEO/LLM considerations

Structured data is supporting context, not a substitute for crawlable visible content. Important answers, service definitions and entity facts must remain present in server-rendered HTML.

The goal is a consistent machine-readable graph that agrees with the visible page, internal links, canonical, sitemap and organization facts.
