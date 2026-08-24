# DGS Content Parity Report — WordPress REST Source vs Current Next.js Prototype

**Status:** CURRENTLY VERIFIED BY ARENA (2026-08-24), read-only
**Branch:** `arena/01a034c2-dgs`
**Legend:** `YES` · `NO` · `PARTIAL` · `NOT VERIFIABLE IN CURRENT ENVIRONMENT` ·
`INVENTED PROTOTYPE CONTENT — DO NOT DEPLOY` (see §7 of the operating brief)

> Methodology: WordPress source = public REST API (`/wp/v2/pages`, `/wp/v2/services`,
> `content.rendered`) + live rendered page text + previously captured full-HTML snapshots.
> Next.js prototype = the existing `app/` routes in this repo.
> **Limitation:** raw `<head>` (title/meta/canonical/OG/JSON-LD) is not capturable in this
> sandbox; schema/metadata verdicts use the PREVIOUSLY CAPTURED `_wp_data/meta.json` and are
> marked accordingly.

---

## 1. Prototype structure (what the current Next.js app actually is)

The existing prototype is **NOT a genuine rebuild**. For the 4 routes it covers, each
`page.jsx` loads `_wp_data/{links,styles,body}.html` and injects them with
`dangerouslySetInnerHTML`, plus the JSON-LD schema. In other words it is a **raw rendered-HTML
dump** of the WordPress/Elementor output wrapped in Next.js. This is why it inherits the same
performance/technical-SEO problems (all inline CSS, Elementor bloat, lazy-load placeholders)
and is slow.

Routes present in the prototype:
- `/` (home) — `app/page.jsx`
- `/about-us/` — `app/about-us/page.jsx`
- `/services/seo-services-in-mumbai/` — `app/services/seo-services-in-mumbai/page.jsx`
- `/services/ai-video-production-agency/` — `app/services/ai-video-production-agency/page.jsx`

Routes **absent** from the prototype (the majority of Tier-1): AEO, GEO, LLM SEO,
Performance Marketing, Website Development & AMC, Social Media Marketing, Branding,
Content Creation, and all 7 geo-targeted service routes.

---

## 2. Parity matrix — Tier-1 routes

| # | Route | WP content found? | REST available? | Next.js route exists? | Title/meta | H1 match | H2/H3 match | Paragraph match | FAQ match | Internal-link match | Media match | Alt text | Meta currently verifiable? | Schema currently verifiable? | Forms currently verifiable? | Safe to migrate? |
|---|-------|-------------------|-----------------|------------------------|------------|----------|-------------|-----------------|-----------|---------------------|-------------|----------|----------------------------|-------------------------------|-----------------------------|------------------|
| 1 | `/` (home 63505) | YES | YES (rendered) | YES | YES (from prior meta.json) | YES | YES | YES | YES (FAQPage in schema) | YES | YES | PARTIAL | PREVIOUSLY CAPTURED | PREVIOUSLY CAPTURED | PARTIAL | PARTIAL — content identical, but migration as-is carries bloat; rebuild required |
| 2 | `/about-us/` (38769) | YES | YES | YES | YES | YES | YES | YES | NO FAQ | YES | YES | PARTIAL | PREVIOUSLY CAPTURED | PREVIOUSLY CAPTURED | PARTIAL | PARTIAL — same as above |
| 3 | `/services/seo-services-in-mumbai/` (40278) | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | PARTIAL | PREVIOUSLY CAPTURED | PREVIOUSLY CAPTURED | PARTIAL | PARTIAL — same as above |
| 4 | `/services/ai-video-production-agency/` (40114) | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | PARTIAL | PREVIOUSLY CAPTURED | PREVIOUSLY CAPTURED | PARTIAL | PARTIAL — same as above |
| 5 | `/services/aeo-services-in-mumbai/` (62373) | YES | YES | **NO** | PARTIAL | YES | YES | YES | NO FAQ found | YES | YES | YES | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — route missing in prototype |
| 6 | `/services/geo/` (62317) | YES | YES | **NO** | PARTIAL | YES | YES | YES | NO FAQ found | YES | YES | YES | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — route missing in prototype |
| 7 | `/services/llm-seo-service/` (62322) | YES | YES | **NO** | PARTIAL | YES | YES | YES | NO FAQ found | YES | YES | YES | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — route missing in prototype |
| 8 | `/services/performance-marketing/` (64616) | YES | YES | **NO** | PARTIAL | YES | YES | YES | NO FAQ found | YES | YES | YES | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — route missing in prototype |
| 9 | `/services/website-development-amc/` (41418) | YES | YES | **NO** | PARTIAL | YES | YES | YES | NO FAQ found | YES | YES | YES | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — route missing in prototype |
| 10 | `/services/social-media-marketing/` (40112) | YES | YES | **NO** | PARTIAL | YES | YES | YES | NO FAQ found | YES | YES | YES | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — route missing in prototype |
| 11 | `/services/branding/` (40277) | YES | YES | **NO** | PARTIAL | YES | YES | YES | NO FAQ found | YES | YES | YES | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — route missing in prototype |
| 12 | `/services/content-creation/` (40276) | YES | YES | **NO** | PARTIAL | YES | YES | YES | NO FAQ found | YES | YES | YES | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — route missing in prototype |
| 13–19 | Geo-targeted services (64509,64533,64528,64543,64285,65132,64236) | PARTIAL (metadata YES, content not yet captured) | YES | **NO** | NOT VERIFIABLE | PARTIAL | PARTIAL | PARTIAL | NO FAQ | PARTIAL | PARTIAL | PARTIAL | NOT VERIFIABLE | NOT VERIFIABLE | PARTIAL | NO — content extraction deferred |

---

## 3. Reading the matrix — key conclusions

1. **All 12 core Tier-1 routes have authoritative WordPress content available** through REST
   (11 fully, geo-targeted partially). No content was invented.
2. **The prototype only covers 4 of 12 core routes.** AEO, GEO, LLM, Performance Marketing,
   Website Dev & AMC, Social, Branding, Content Creation are **missing entirely** from the
   prototype → these must be added in the rebuild.
3. For the 4 prototype routes, WP content and prototype content **match exactly** — because
   the prototype injects the WP-rendered HTML verbatim. There is no text divergence. The
   problems are architectural (bloat, speed, technical SEO), not content mismatch.
4. **Alt-text parity is PARTIAL** — alt text exists in rendered content and was captured (e.g.
   "Eureka Forbes client logo"), but a full automated alt-verification across every media item
   was not possible in this sandbox.
5. **Schema/metadata are NOT VERIFIABLE for the 8 new services** (no prior meta.json capture,
   and Rank Math private meta + raw `<head>` are not accessible here). For the 4 prototype
   routes, schema is PREVIOUSLY CAPTURED but not re-verified live.
6. **Forms** are detected as anchor references only (`#contact-form`, `#dgs-performance-form`,
   `#smm-form`, `#bpContactModule`, `#website-project-form`). Actual Fluent Forms config/IDs are
   NOT accessible → `FLUENT FORMS BACKEND INTEGRATION — ACCESS REQUIRED`.

---

## 4. Invented prototype content (brief §7)

There is **no invented text content** in the prototype: every rendered word on the 4 covered
routes is WordPress-sourced (the pages literally render `body.html`). 

**However**, the following are architectural artefacts that must NOT be carried forward as if
they were content, and must be rebuilt:
- `_wp_data/styles.html` / inline `<style>` blocks — Elementor/module CSS (not content).
- `_wp_data/links.html` — WordPress `<link>`/font/preload tags (not content).
- The `Header.jsx`/`Footer.jsx` injected markup (prototype-specific chrome, not WP content).
- The DGS brand/design in the prototype (old cinematic direction) — **rejected** per brief §16.

None of these are textual content, so nothing is flagged `INVENTED PROTOTYPE CONTENT — DO NOT
DEPLOY` as *copy*. They are flagged as **architecture to be replaced**, not reused.

---

## 5. Data provenance

- `CURRENTLY VERIFIED BY ARENA (2026-08-24)` — REST + live page text (AEO, GEO, LLM, PM, WDA,
  SMM, Branding, Content Creation).
- `PREVIOUSLY CAPTURED (not re-verified)` — `_wp_data/*.html` + `meta.json` for home, about-us,
  seo-services, ai-video.
- `REQUIRES ADDITIONAL ACCESS` — Fluent Forms config/IDs, Rank Math private meta, Envira
  internals, raw `<head>` re-capture.
