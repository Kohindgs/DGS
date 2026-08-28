# DGS Internal Link Migration Policy

Internal links are migration assets. The redesign may change navigation and visual presentation, but it must not accidentally remove the relationships that help users and crawlers discover important services.

## Baseline evidence

The first live sitemap crawl captured 5,019 internal-link edges across the discovered sitemap set.

The protected service cluster receives substantial internal-link exposure from the current sitewide/service architecture. That means a visually cleaner redesign that removes these links could unintentionally weaken discovery and search signals.

## Tier-0 link protection

Protect the discoverability of:

- `/services/ai-video-production-agency/`
- `/services/aeo-services-in-mumbai/`
- `/services/geo/`
- `/services/llm-seo-service/`
- `/services/seo-services-in-mumbai/`

The baseline crawl showed the service cluster is repeatedly linked across the site. The migration must preserve meaningful relationships between SEO, AEO, GEO, LLM SEO and AI Production where contextually appropriate.

Do not interpret raw edge count as a target. The current Elementor/header/footer implementation may duplicate the same navigation link many times. The new site should instead preserve:

- unique discoverable source pages
- useful contextual links
- clear service navigation
- descriptive anchor text
- breadcrumbs where appropriate

## Growth routes

For non-ranking or weak-ranking pages, the generated link graph will identify routes with few or zero unique inbound sources.

A low inbound count is a review signal, not permission to spam links. Before adding a link verify:

1. the source page is contextually relevant;
2. the destination is a page we actually intend to index/rank;
3. the anchor accurately describes the destination;
4. the link helps a user as well as a crawler;
5. the link does not create repetitive keyword-stuffed navigation.

## Orphan review

The first crawl found 11 sitemap resources with zero inbound links from the crawled set. These are documented in `CURRENT-SITE-TECHNICAL-SEO-FINDINGS.md`.

Some may be genuine opportunities; others may be paid landing pages, utility pages, test pages, thank-you pages or machine-readable resources. Do not automatically link all of them.

## Broken-target policy

Before cutover, every internal link in the Next build must resolve to one of:

- a valid 200 route;
- an explicitly approved one-hop redirect source;
- an intentional fragment on the same valid page.

No production internal link should point to:

- staging/test domains
- accidental HTTP/non-www variants
- 404/410 destinations
- redirect chains
- noindex pages unless the user workflow genuinely requires it
- old Elementor anchors that no longer exist

## Anchor preservation

For ranking-protected pages, capture the source anchor variants before redesign. The new site does not need to reproduce duplicate navigation anchors, but important descriptive anchors must remain represented.

Examples of current service-navigation terminology include SEO, AEO, GEO, LLM SEO and AI Video Production. Exact final placement is a design decision; destination meaning is not.

## Automated output

`scripts/build-link-graph.mjs` generates:

- inbound edge counts
- unique inbound source counts
- outbound edge counts
- unique outbound destination counts
- common anchor variants
- Tier-0 baseline requirements
- low-inbound review candidates

This graph must be regenerated from the final Next preview before cutover and compared against the source baseline.
