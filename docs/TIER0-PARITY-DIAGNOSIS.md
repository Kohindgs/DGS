# Tier-0 Parity Diagnosis

Checked: 2026-08-29T07:45:49.923Z
Target: http://127.0.0.1:3025
MIGRATION_EXPECT_NOINDEX=1

## Classification Key

- **A** — Expected staging difference
- **B** — Approved technical correction
- **C** — Auditor/normalization artifact
- **D** — Real visible content drift
- **E** — Real internal-link parity defect
- **F** — Needs human decision

## Summary Totals

```json
{
  "A": 5,
  "D": 18,
  "E": 5,
  "B": 1,
  "C": 3
}
```

## /services/ai-video-production-agency/

- HTTP: 200
- Schema types: BreadcrumbList, ImageObject, ListItem, Organization, PostalAddress, Service, WebPage, WebSite
- Content hash match: false
- Noindex: EXPECTED_STAGING_NOINDEX
- Canonical: /services/ai-video-production-agency/ (desired /services/ai-video-production-agency/)
- Content drift: 1 missing headings, 0 extra, 3 missing paragraphs, 30 extra
- Link drift: 6 missing contextual links, 0 extra

### Findings
- **[A] EXPECTED_STAGING_DIFFERENCE**: robots=noindex, nofollow x-robots=noindex, nofollow, noarchive
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 1 missing headings
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: heading order changed
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 3 missing paragraphs
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 76 extra paragraphs
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: image/alt differences detected
- **[E] REAL_INTERNAL_LINK_PARITY_DEFECT**: 6 contextual links missing in Next
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: normalized visible content hash differs from WordPress baseline

## /services/aeo-services-in-mumbai/

- HTTP: 200
- Schema types: BreadcrumbList, ImageObject, ListItem, Organization, PostalAddress, Service, WebPage, WebSite
- Content hash match: false
- Noindex: EXPECTED_STAGING_NOINDEX
- Canonical: /services/aeo-services-in-mumbai/ (desired /services/aeo-services-in-mumbai/)
- Content drift: 0 missing headings, 0 extra, 0 missing paragraphs, 30 extra
- Link drift: 8 missing contextual links, 0 extra

### Findings
- **[A] EXPECTED_STAGING_DIFFERENCE**: robots=noindex, nofollow x-robots=noindex, nofollow, noarchive
- **[B] APPROVED_TECHNICAL_CORRECTION**: WordPress canonical /services/aeo/ vs Next /services/aeo-services-in-mumbai/ (desired /services/aeo-services-in-mumbai/)
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 74 extra paragraphs
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: image/alt differences detected
- **[E] REAL_INTERNAL_LINK_PARITY_DEFECT**: 8 contextual links missing in Next
- **[C] AUDITOR_NORMALIZATION_ARTIFACT**: normalized text hash differs but structured diff shows no major heading/paragraph loss — likely wrapper/normalization artifact

## /services/geo/

- HTTP: 200
- Schema types: BreadcrumbList, ImageObject, ListItem, Organization, PostalAddress, Service, WebPage, WebSite
- Content hash match: false
- Noindex: EXPECTED_STAGING_NOINDEX
- Canonical: /services/geo/ (desired /services/geo/)
- Content drift: 0 missing headings, 0 extra, 0 missing paragraphs, 30 extra
- Link drift: 8 missing contextual links, 0 extra

### Findings
- **[A] EXPECTED_STAGING_DIFFERENCE**: robots=noindex, nofollow x-robots=noindex, nofollow, noarchive
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 51 extra paragraphs
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: image/alt differences detected
- **[E] REAL_INTERNAL_LINK_PARITY_DEFECT**: 8 contextual links missing in Next
- **[C] AUDITOR_NORMALIZATION_ARTIFACT**: normalized text hash differs but structured diff shows no major heading/paragraph loss — likely wrapper/normalization artifact

## /services/llm-seo-service/

- HTTP: 200
- Schema types: BreadcrumbList, ImageObject, ListItem, Organization, PostalAddress, Service, WebPage, WebSite
- Content hash match: false
- Noindex: EXPECTED_STAGING_NOINDEX
- Canonical: /services/llm-seo-service/ (desired /services/llm-seo-service/)
- Content drift: 0 missing headings, 0 extra, 0 missing paragraphs, 30 extra
- Link drift: 0 missing contextual links, 0 extra

### Findings
- **[A] EXPECTED_STAGING_DIFFERENCE**: robots=noindex, nofollow x-robots=noindex, nofollow, noarchive
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 49 extra paragraphs
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: image/alt differences detected
- **[C] AUDITOR_NORMALIZATION_ARTIFACT**: normalized text hash differs but structured diff shows no major heading/paragraph loss — likely wrapper/normalization artifact

## /services/seo-services-in-mumbai/

- HTTP: 200
- Schema types: BreadcrumbList, ImageObject, ListItem, Organization, PostalAddress, Service, WebPage, WebSite
- Content hash match: false
- Noindex: EXPECTED_STAGING_NOINDEX
- Canonical: /services/seo-services-in-mumbai/ (desired /services/seo-services-in-mumbai/)
- Content drift: 4 missing headings, 0 extra, 4 missing paragraphs, 30 extra
- Link drift: 12 missing contextual links, 36 extra

### Findings
- **[A] EXPECTED_STAGING_DIFFERENCE**: robots=noindex, nofollow x-robots=noindex, nofollow, noarchive
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 4 missing headings
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: heading order changed
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 4 missing paragraphs
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: 170 extra paragraphs
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: image/alt differences detected
- **[E] REAL_INTERNAL_LINK_PARITY_DEFECT**: 12 contextual links missing in Next
- **[E] REAL_INTERNAL_LINK_PARITY_DEFECT**: 36 extra contextual links in Next
- **[D] REAL_VISIBLE_CONTENT_DRIFT**: normalized visible content hash differs from WordPress baseline

---

Generated by `npm run diagnose:tier0-parity`. No visible content was modified.
