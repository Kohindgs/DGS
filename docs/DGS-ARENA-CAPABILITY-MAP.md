# DGS Arena Capability Map

**Author:** Arena agent (remote session)
**Branch (working):** `arena/01a034c2-dgs`
**Date:** 2026-08-24

This document is the authoritative record of what the current Arena session CAN and
CANNOT do for the DGS headless rebuild. It is written before any content extraction or
UI work begins. Where a capability is absent, the item is marked `NOT AVAILABLE IN
CURRENT ENVIRONMENT` and is not assumed or fabricated.

---

## 0. Branch / repository situation (read first)

The operating brief asked to base work on a branch `rebuild/dgs-3d-2026` and create a
dedicated branch `arena/dgs-nextgen-3d-2026`.

**Current verified facts:**

| Item | Status |
| --- | --- |
| Branch `rebuild/dgs-3d-2026` exists on `origin` | **NO** — not present in `git ls-remote --heads origin` |
| Branch `arena/dgs-nextgen-3d-2026` exists | **NO** |
| Arena session branch (the only branch I may work/push on) | `arena/01a034c2-dgs` |
| Existing prototype/audit branches on origin | `cursor/dgs-cinematic-ui-4acd`, `cursor/dgs-wordpress-recreate-4d48`, `ui-redesign`, `bridge/gh-dgs-4-bridge-connected`, `temp/weavings-v12-build`, `weavings-v20-loading-hotfix`, `master`, `main` |

**Constraint (platform):** this Arena session is pinned to `arena/01a034c2-dgs`. I cannot
create/switch to a differently-named branch, and I am instructed to never touch `main`.
So:
- All work lands on `arena/01a034c2-dgs` (a dedicated, non-`main` branch — satisfies the
  "do not work on main" rule).
- If a branch literally named `arena/dgs-nextgen-3d-2026` or `rebuild/dgs-3d-2026` is
  required, that must be created by the repo owner or by a later step — I cannot create it
  from this pinned session.

**Prototype content found (relevant to "old prototype = rejected"):**
- `cursor/dgs-cinematic-ui-4acd` — contains the cinematic UI prototype
  (`app/components/site/CinematicHero.jsx`, `ServiceOrbit.jsx`, `SpinGallery.jsx`,
  `MotionTiles.jsx`, etc.) plus `docs/DGS-REBUILD.md` (the master rebuild document that
  names the Dimgrey working site).
- `ui-redesign` — contains the audit docs: `brand-direction.md`, `content-source-map.md`,
  `logo-inventory.md`, `aeo.md`, `geo.md`, `llm-discovery.md`.
- The **Dimgrey demo** (`https://dimgrey-goat-473970.hostingersite.com/`) is the live
  Hostinger temporary deployment of the cinematic prototype (verified reachable, see §1).

These are READ-ONLY reference/constraint sources. The old visual direction is treated as
rejected per the brief.

---

## 1. Letter-by-letter capability report (brief §20)

### A. Git capabilities
| Capability | Status | Evidence |
| --- | --- | --- |
| Read repository files | YES | local checkout + `git show` on any ref |
| Create branches | PARTIAL — see §0 | session is pinned to `arena/01a034c2-dgs`; cannot create/switch named branches |
| Edit files | YES | workspace writes to `arena/01a034c2-dgs` |
| Commit | YES | |
| Push commits | YES | to `origin arena/01a034c2-dgs` |
| Merge to `main` / deploy | NO (by instruction) | explicitly avoided |

### B. WordPress REST capabilities (unauthenticated)
| Capability | Status |
| --- | --- |
| Read pages | YES (`/wp/v2/pages`) |
| Read posts (blogs) | YES (`/wp/v2/posts`) |
| Read media | YES (`/wp/v2/media`, `source_url` exposed) |
| Read custom post types | YES — list at `/wp/v2/types`; see §2 |
| Read services | YES (`/wp/v2/services`, 18 items) |
| Read page metadata | PARTIAL — only 4 public meta keys exposed (see §3) |
| Read private/protected meta | NO |
| Read Elementor data (`_elementor_data`) | NO (see §C) |
| Read Rank Math metadata | NO (see §E) |
| Read Envira internals | PARTIAL (see §G) |
| Read Fluent Forms configuration | NO (see §F) |
| Read menu items | NO — `/wp/v2/menu-items` returns 401 |
| Read navigation | NO — `/wp/v2/navigation` not accessible unauth |

### C. Elementor `_elementor_data` accessibility
**NOT AVAILABLE.** The `meta` object returned for a page contains only
`_acf_changed`, `om_disable_all_campaigns`, `_monsterinsights_skip_tracking`, `footnotes`.
`_elementor_data` is not registered as public REST meta. Elementor's own REST namespace
(`elementor/v1`) requires authentication. Therefore the editable Elementor structure
cannot be read.

**What IS available:** WordPress REST returns `content.rendered` as the **fully rendered
HTML** (Elementor output is baked in — confirmed on the homepage page 63505, which returns
the rendered `<section>`/`<h1>`/stat/portfolio markup). Per brief §5, capture the rendered
content as the temporary migration source and document that it is NOT complete Elementor
internals.

### D. (covered by C) — rendered page content available via REST
YES for pages and posts. Rendered HTML is the migration source. Schema/metadata is NOT in
the REST body.

### E. Rank Math metadata accessibility
**NOT AVAILABLE via REST.** `rankmath/v1/*` endpoints returned 404 / require auth. No
`rank_math_*` keys appear in public `meta`. The `rank_math_schema` CPT exists but is not
readable unauth.
**What IS usable instead:** the repo already contains previously-captured SEO/meta snapshots
(`app/*/_wp_data/meta.json` — title, desc, canonical, JSON-LD schema) for homepage,
about-us, seo-services-in-mumbai, ai-video-production-agency. These were captured in a prior
environment and are marked **PREVIOUSLY CAPTURED — NOT CURRENTLY VERIFIED** in §4/§9.
NOTE: this Arena sandbox cannot fetch the raw `<head>` of the live site (see §H), so live
`<title>`/meta/OG/JSON-LD re-verification is limited to those snapshots + REST.

### F. Fluent Forms accessibility
**NOT AVAILABLE.** `/wp-json/fluentform/v1/forms` returns
`{"code":"rest_forbidden","message":"Sorry, you are not allowed to do that."}` (401).
Fluent Forms configuration, form IDs, and submission backend are therefore
`FLUENT FORMS BACKEND INTEGRATION — ACCESS REQUIRED`. The frontend can be designed around
the existing WP form flow once real form IDs/endpoints are verified (needs admin/app-password
access or a build-time decision). Do NOT invent a fake form backend.

### G. Envira accessibility
**PARTIAL.** An `envira` CPT exists (`rest_base: envira-gallery`). A single gallery item
returned but with empty `title` and no exposed `meta`/images (`/wp/v2/envira-gallery?per_page=3`
→ `[{"id":63155,"title":{"rendered":""}}]`). Envira gallery **internals (image lists,
settings) are NOT reliably exposed**. Gallery IDs/shortcodes inside rendered content can be
used as a reference, but full Envira extraction is `REQUIRES ENVIRA / WORDPRESS ADMIN OR
SERVER ACCESS`. Portfolio CPT `astra-portfolio` returned an empty list (`[]`).

### H. Can public live-page HTML be inspected?
**PARTIAL / LIMITED.**
- The live site IS reachable through the Arena page-fetch tool (returns rendered text of
  pages, e.g. Dimgrey homepage, sitemaps, REST JSON).
- BUT the page-fetch tool returns **markdown/text, not raw HTML** — so `<title>`,
  meta-description, canonical, OpenGraph, Twitter cards, and JSON-LD `<script>` blocks in the
  `<head>` CANNOT be captured from the live page in this session.
- Additionally, the sandbox **bash/curl egress is blocked** for `dgeniussolutions.com`,
  `google.com`, and `raw.githubusercontent.com` (HTTP 000 / SSL_ERROR_SYSCALL). Only
  `github.com` git operations were reliable. So no direct curl of the live WP HTML.
- **Consequence:** live `<head>` re-capture is not possible here. We rely on the previously
  captured `_wp_data/meta.json` snapshots (marked as such) plus REST `content.rendered`, and
  we record schema from those snapshots.

### I. Hostinger / server filesystem
**NOT AVAILABLE.**
- No SSH, no server tools, no Hostinger panel in this session.
- `.htaccess` on production CANNOT be read by me (I can only see the repo copy of a
  `.htaccess`, which is a config for the Node app, not the live WP server's).
- PHP files, theme/plugin source, `functions.php`, MU plugins, server redirects: **NOT
  readable**.
- Per brief §14, any Hostinger finding must be labelled `PREVIOUS AUDIT FINDING` (from the
  git docs / Dimgrey prototype) and clearly separated from `CURRENTLY VERIFIED BY ARENA`.
  I have made no independent server verification.

### J. Can Arena create a preview URL from a git branch?
**PARTIAL.** The sandbox can run the app and expose a **live preview URL** (a dev/start
server bound to the workspace port is surfaced to the user's browser). This is how I can
show the new UI without deploying to production. Caveat:
- The sandbox's own outbound network is restricted, so a **runtime preview here cannot reach
  the live WordPress site** for live fetching. For a pure static/self-contained build this is
  fine; for live-WP ISR it would only work in production.
- Branch-based previews (like Vercel/Hostinger auto-preview per PR) are NOT something this
  session can produce; that would be a repo/hosting feature.
- I will NOT deploy to production to create a preview (brief §18).

### K. What is NOT available in the current environment (consolidated)
1. SSH / Hostinger / server filesystem access.
2. WordPress admin / application passwords (and I do not accept credentials in chat).
3. Fluent Forms configuration & submission endpoints.
4. Rank Math private metadata.
5. Elementor `_elementor_data` (editable structure).
6. Envira gallery internals.
7. Navigation / menu-items REST.
8. Raw `<head>` HTML of the live site (fetch tool returns markdown; curl egress blocked).
9. The named branches `rebuild/dgs-3d-2026` and `arena/dgs-nextgen-3d-2026` (session pinned
   to `arena/01a034c2-dgs`).
10. Live WordPress runtime access from the preview environment (sandbox egress restriction).

---

## 2. WordPress REST endpoints verified accessible (unauthenticated)

| Endpoint | Result |
| --- | --- |
| `GET /wp-json/` | OK — lists namespaces & routes |
| `GET /wp-json/wp/v2/pages` | OK |
| `GET /wp-json/wp/v2/posts` | OK (blog posts, dated 2026) |
| `GET /wp-json/wp/v2/media` | OK |
| `GET /wp-json/wp/v2/types` | OK — CPT list incl. `services`, `envira`, `product` (Woo), `elementor_library`, `elementor_snippet`, `astra-portfolio`, `projects`, `cmsms_profile`, `rank_math_schema` |
| `GET /wp-json/wp/v2/services` | OK — 18 services |
| `GET /wp-json/wp/v2/pages/{id}` | OK — `content.rendered` = full rendered HTML |
| `GET /wp-json/wp/v2/posts/{id}` | OK — `content.rendered` |
| `GET /wp-json/wp/v2/search` | OK |
| `GET /wp-json/wp/v2/menu-items` | **401** forbidden |
| `GET /wp-json/wp/v2/navigation` | not accessible unauth |
| `GET /wp-json/fluentform/v1/forms` | **401** forbidden |
| `GET /wp-json/rankmath/v1/*` | **404 / auth required** |
| `GET /wp-json/wp/v2/envira-gallery` | OK but near-empty (internals not exposed) |
| `GET /wp-json/wp/v2/astra-portfolio` | OK but empty `[]` |
| `GET /robots.txt` | OK — generated via `functions.php`, Rank Math sitemap index |
| `GET /sitemap_index.xml` | OK — post/page/services/video/local sitemaps |
| `GET /page-sitemap.xml`, `/services-sitemap.xml` | OK |

**Auth availability:** WordPress REST is reachable only **unauthenticated (read-only)**.
Application-passwords authorization endpoint exists (`/wp-admin/authorize-application.php`)
but I do not hold credentials and will not request them in chat.

---

## 3. Page metadata actually exposed by REST

For page 63505, `meta` contains only:
`_acf_changed`, `om_disable_all_campaigns`, `_monsterinsights_skip_tracking`, `footnotes`.
No SEO/rank/schema meta. This is the ceiling of what REST gives us for page metadata.

---

## 4. Data provenance markers (used in all later docs)

- **VERIFIED BY ARENA (2026-08-24)** — read directly in this session (REST, sitemaps,
  robots.txt, Dimgrey page text, git refs).
- **PREVIOUSLY CAPTURED (not currently verified)** — e.g. `app/*/_wp_data/meta.json` and
  `_wp_data/*.html` committed by an earlier environment; usable as reference but not
  re-verified here.
- **PREVIOUS AUDIT FINDING** — from git docs (`ui-redesign`, `cursor/dgs-cinematic-ui-4acd`)
  e.g. logo inventory, client lists, schema architecture. Not independently server-verified.
- **REQUIRES ADDITIONAL WORDPRESS/SERVER ACCESS** — Fluent Forms, Elementor internals,
  Rank Math private meta, Envira internals, `.htaccess`/PHP/plugins on production,
  redirects source, menu items.

---

## 5. Ranking-protected route set (Tier 1, from sitemap + services + pages)

| Route | WP source | REST available |
| --- | --- | --- |
| `/` (homepage, id 63505) | page | YES (rendered) |
| `/services/seo-services-in-mumbai/` (SEO) | service 40278 | YES |
| `/services/aeo-services-in-mumbai/` (AEO) | service 62373 | YES |
| `/services/geo/` (GEO) | service 62317 | YES |
| `/services/llm-seo-service/` (LLM SEO) | service 62322 | YES |
| `/services/ai-video-production-agency/` (AI Video) | service 40114 | YES |
| `/about-us/` | page 38769 | YES |
| `/services/performance-marketing/` | service 64616 | YES |
| `/services/website-development-amc/` | service 41418 | YES |
| `/services/social-media-marketing/` | service 40112 | YES |
| `/services/branding/` | service 40277 | YES |
| `/services/content-creation/` | service 40276 | YES |
| Geo-targeted services (`seo-service-pune`, `seo-services-in-hyderabad`, `seo-service-in-banglore`, `seo-service-in-gurugram`, `dubai-seo`, `website-development-pune-page`, `ai-production-dubai-page`) | services | YES |

Other notable pages: `/contact-us/`, `/thank-you/`, `/portfolio/`, `/our-services/`,
`/blogs/`, `/career/`, `/case_studies/`, `/sitemap/`, `/privacy-policy/`, `/seo-pricing/`.

---

## 6. Public / non-REST checks verified

- `robots.txt` — served; allows all AI bots (GPTBot, ClaudeBot, PerplexityBot,
  ChatGPT-User, Google-Extended, Applebot-Extended, OAI-SearchBot); sitemap index declared.
- `sitemap_index.xml` → `post-sitemap.xml`, `page-sitemap.xml`, `services-sitemap.xml`,
  `video-sitemap.xml`, `local-sitemap.xml`.
- Dimgrey demo (`https://dimgrey-goat-473970.hostingersite.com/`) is live and returns the
  cinematic prototype homepage with DGS content (rendered text verified).

---

## 7. Next-step decision needed

Per brief §20, the capability map is now complete. The next audit/extraction step should be
chosen explicitly. Recommended first step: **REST extraction of the Tier-1 ranking routes
into `data/wordpress/`** (id, slug, URL, title, status, parent, dates, rendered content,
excerpt, featured media, links, available meta), stored in Git, followed by the
`docs/DGS-CONTENT-PARITY.md` parity report comparing live WP vs the existing Next.js
prototype, and then `docs/DGS-ARENA-VISUAL-DIRECTIONS.md` (three directions) — no UI code
until that visual-direction doc is approved.

No coding has been performed in this step. This document is the shared project memory for
the capability boundary.
