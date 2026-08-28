# DGS Portfolio Migration

Status: public evidence extraction implemented; authenticated classification still required

## Goal

Replace Envira as a public frontend dependency with a custom Next.js portfolio at `/portfolio/` while preserving real DGS creative work and media relationships.

## Rules

- Do not invent projects, categories, clients or media.
- Public Envira markup may establish gallery/media evidence, but not reliable client/category semantics.
- Keep source WordPress/Envira IDs in migration records for traceability.
- No Envira CSS, JS, filtering or lightbox in the public Next.js frontend.
- Existing pages may use `View Our Portfolio` where approved rather than embedding heavy gallery systems.
- AI Production Portfolio, Brand & Creative Portfolio, and Case Studies & Results remain separate work systems.
- Case studies are not generic portfolio items and must not be flattened into the same gallery collection.

## Public evidence extraction

`scripts/extract-public-envira-evidence.mjs` scans the public WordPress `content.rendered` snapshots and records:

- source WordPress page/service/post
- Envira gallery ID where detectable
- source media/item ID where exposed
- title/caption evidence
- thumbnail URL
- full media URL
- image dimensions where exposed
- alt text where exposed
- source ordering

Every extracted item is marked:

`UNCLASSIFIED_AUTH_REQUIRED`

The extractor intentionally does **not** infer client, campaign, category, work system or year from filenames.

Generated evidence lives under:

`data/portfolio/evidence/`

## Approved production registry

Production portfolio classification lives only in:

`data/portfolio/collections.approved.json`

It is empty by default. Approved item data must come from:

- authenticated WordPress/Envira metadata; or
- explicit human review.

`lib/portfolio/types.ts` requires provenance and one of the portfolio work systems.

`data/work/systems.approved.json` keeps the three higher-level work systems separate:

1. AI Production Portfolio
2. Brand & Creative Portfolio
3. Case Studies & Results

## Validation

`npm run validate:portfolio`

blocks production readiness when:

- no portfolio items have been approved;
- a production item remains public-evidence-only;
- required media/title/thumbnail/alt data is missing;
- duplicate collection/item IDs exist;
- work-system assignment is invalid;
- an authenticated Envira provenance claim does not match captured public evidence without an explicit review override.

Missing source alt text is treated as a review requirement, not something to invent automatically.

## Migration phases

1. Enumerate public Envira gallery occurrences and IDs.
2. Capture public media evidence without inventing metadata.
3. Obtain authenticated Envira/WordPress relationships and category/order data.
4. Reconcile public evidence with authenticated source records.
5. Explicitly classify items into AI Production or Brand/Creative systems.
6. Keep Case Studies as their own data/model flow.
7. Create approved normalized portfolio records.
8. Build `/portfolio/` grid, filters, media cards, video handling and lightbox using Next.js components only.
9. Replace gallery-heavy frontend dependencies with links to the new portfolio where approved.
10. Validate image/video lazy loading, accessibility, media dimensions, alt text and Core Web Vitals.

## Current blocker

Public WordPress evidence is enough to identify many gallery/media relationships, but it is **not** sufficient to approve final client/category/work-system metadata. Complete migration still requires authenticated WordPress/Envira access or a verified export/review.
