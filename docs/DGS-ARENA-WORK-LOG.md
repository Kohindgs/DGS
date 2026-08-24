# DGS Arena — Work Log & Session Summary

**Author:** Arena agent (remote session)
**Session branch:** `arena/01a034c2-dgs`
**Last updated:** 2026-08-24
**Repo:** https://github.com/Kohindgs/DGS.git

This document summarises everything done in this session so far, so the full picture lives in
Git (shared project memory) rather than only in conversation.

---

## 1. Context / goal

D'Genius Solutions runs a WordPress site (`www.dgeniussolutions.com`) with all content and a
full SEO / AEO / GEO / LLM setup, but it suffers from technical-SEO errors and slowness (heavy
Elementor + plugin stack), and some pages are not ranking.

Goal (user brief): mirror the content, internal image links, and videos **without dependency**,
fix the SEO / AEO / GEO / LLM issues, and rebuild a **completely new 3D, cinematic, out-of-the-box,
award-winning UI** — with **WordPress remaining the lead/form backend** via a headless
WordPress → Next.js architecture.

---

## 2. Operating constraints (confirmed & respected)

- Work ONLY on branch `arena/01a034c2-dgs`. **Never `main`.** **No deploy.**
- Session is pinned to `arena/01a034c2-dgs` — cannot create/switch to differently-named branches.
- **No SSH / Hostinger server access**, no WordPress admin/app-password credentials, no Fluent
  Forms config, no Rank Math private meta, no Elementor `_elementor_data`, no Envira internals.
  Credentials are not accepted in chat.
- WordPress **public REST API** is the content source of truth (read-only).
- Sandbox `bash`/`curl` outbound network is blocked → raw HTML/JSON not byte-capturable here;
  the page-fetch tool returns markdown and chunks large bodies. This limitation is documented,
  not bypassed or fabricated.

---

## 3. What was done

### Step 0 — Capability verification (no assumptions)
Re-verified the environment and the live site, then recorded it in Git:
- `docs/DGS-ARENA-CAPABILITY-MAP.md` — full letter-by-letter capability map (Git, WordPress REST,
  Elementor, Rank Math, Fluent Forms, Envira, live-HTML, Hostinger, preview), data-provenance
  markers, Tier-1 route set.
- `docs/DGS-WORDPRESS-REST-AUDIT.md` — endpoint-by-endpoint REST audit + a Phase-1 capture
  limitation note appended later.

### Step 1 — Phase 1: Tier-1 WordPress REST extraction (approved phase)
Captured authoritative content/metadata for all Tier-1 / ranking-protected routes and wrote it
to Git. Deliverables:

| Area | Location in repo |
| --- | --- |
| Raw REST snapshots (12 core routes + geo-targeted manifest) | `data/wordpress/raw/*.json` |
| Normalised structured content per route | `data/wordpress/pages/*.json` |
| Tier-1 media map (source_url + alt text) | `data/wordpress/media/tier1-media-map.json` |
| Content parity report (WP vs Next.js prototype) | `docs/DGS-CONTENT-PARITY.md` |
| Internal-link audit | `docs/DGS-INTERNAL-LINK-AUDIT.md` |
| Three visual directions + recommendation | `docs/DGS-ARENA-VISUAL-DIRECTIONS.md` |

**Routes covered (12 core):** `/` (home 63505), `/about-us/` (38769), `/services/seo-services-in-mumbai/`
(40278), `/services/ai-video-production-agency/` (40114), `/services/aeo-services-in-mumbai/`
(62373), `/services/geo/` (62317), `/services/llm-seo-service/` (62322),
`/services/performance-marketing/` (64616), `/services/website-development-amc/` (41418),
`/services/social-media-marketing/` (40112), `/services/branding/` (40277),
`/services/content-creation/` (40276). Plus 7 geo-targeted service routes (metadata only so far).

### Key findings from Phase 1
1. **The current Next.js prototype only covers 4 of 12 core routes** (home, about-us, SEO, AI
   video). AEO, GEO, LLM, Performance Marketing, Website Dev & AMC, Social, Branding, Content
   Creation are **missing**.
2. For the 4 covered routes, prototype content **matches WordPress exactly** — the prototype
   injects the WP rendered HTML verbatim (`_wp_data/body.html`). The problem is **architecture,
   not copy**: it inherits all the Elementor bloat, inline CSS, and lazy-load issues → that is
   why it is slow and has technical-SEO problems.
3. **No invented content** was found in the prototype (all words are WordPress-sourced).
4. Strong cross-linking exists among the SEO ⇄ AEO ⇄ GEO ⇄ LLM cluster — to be preserved in the
   rebuild.
5. Each service page exposes a primary CTA anchored to its own Fluent Forms
   (`#contact-form`, `#dgs-performance-form`, `#smm-form`, `#bpContactModule`,
   `#website-project-form`). Real form config/IDs are NOT accessible → `REQUIRES ACCESS`.

### Step 2 — Three visual directions (presented for approval, NOT yet coded)
`docs/DGS-ARENA-VISUAL-DIRECTIONS.md` defines three radically different directions, each with
hero, nav, typography, 3D system, motion, colour, services/proof/case-study/CTA treatment,
first-scroll transition, mobile, accessibility, performance, and technical approach:

- **A. Spatial DGS Universe** — the site as a navigable 3D cosmos; services as orbiting
  "worlds." Recommended.
- **B. Cinematic Work-First** — an award-winning studio reel / proof-first structure.
- **C. Kinetic Editorial + 3D** — a moving editorial magazine with dimensional type.

**Recommendation: A. Spatial DGS Universe** (best matches the "3D thought process / award-winning /
out of the box" brief; its service worlds map directly onto the verified service cluster).

---

## 4. Status & next step

- ✅ Capability map complete and approved.
- ✅ Phase 1 extraction + parity + link/media audits + visual directions complete.
- ⏸ **Waiting for the user to approve a visual direction** (brief §18 — do not code until approval).
- ➡️ **After approval:** build ONLY Header + Hero + first scroll transition, then show a preview.

---

## 4b. BUILD — First Experience (Header + Hero + First Scroll Transition)

**Approved direction (visual language):** A. Spatial DGS Universe + selective Cinematic
Work-First elements.

Built and committed on `arena/01a034c2-dgs` (preview served from the workspace — do not deploy):

| File | Purpose |
| --- | --- |
| `app/page.jsx` | Composes SkipLink + Header + Hero + NextSection (server) |
| `app/layout.jsx` | Global metadata (WP title/desc), Manrope font link |
| `app/globals.css` | Design system: emitted-light palette, editorial Manrope, header, hero, next-section, responsive, reduced-motion |
| `app/lib/dgs-content.js` | Verified WP homepage copy + real DGS asset URLs (source of truth) |
| `app/lib/sceneState.js` | Shared mutable state bridging GSAP scroll → WebGL scene |
| `app/lib/webgl.js` | WebGL support + reduced-motion detection |
| `app/components/dgs3d/Scene3D.jsx` | R3F spatial universe: core light-structure, SEARCH network, CREATIVE colour surfaces, TECHNOLOGY grid, AI particles, connectors, starfield |
| `app/components/dgs3d/HeroScene.jsx` | Canvas wrapper + error boundary + static fallback |
| `app/components/dgs3d/Hero.jsx` | Hero composition + GSAP/ScrollTrigger first-scroll transition |
| `app/components/dgs3d/Header.jsx` | Premium minimal header (real DGS logo, nav, CTA, translucent on scroll) |
| `app/components/dgs3d/NextSection.jsx` | Minimal "Search becomes dominant" landing (WP H2 + four capability tiles) |
| `app/components/dgs3d/SkipLink.jsx` | Accessible skip link (hidden until focus) |

**WordPress content used (WP ID 63505, verbatim):** H1 "Full Service Digital Marketing Agency
In Mumbai"; supporting paragraph; CTAs "Get A Growth Audit" / "View Services"; statline
(200+ Brands Worked With · 20K+ Customers Reached · 4.5 Average User Rating · Mumbai Based
Full Service Team); H2 "One team for search, web, creative, performance and AI production." and
its four H3 items.

**Assets used (verified WP):** DGS logo `DGS-LOGO-3.webp`; DGS proof glimpses — Google AI
Overview screenshot (`SS-1.png.webp`), LLM/ChatGPT proof (`LLM-SEO-1.webp`), Google AI Overview
ranking (`AEO-SEO-1.webp`). Referenced by absolute URL (loads in viewer's browser).

**Three.js architecture:** single procedural R3F scene — CoreStructure (wireframe icosahedron +
glow + orbital rings), SearchSystem (points + line network), CreativeSystem (colour planes),
TechSystem (grid + wireframe boxes), AiSystem (generative particle field), Connectors, Starfield.
No textures, no post-processing, DPR capped `[1,1.75]`, controlled particle counts, camera
approach driven by `sceneState`.

**GSAP/ScrollTrigger architecture:** one scrub timeline on the 200vh `.dgs-hero`; `onUpdate`
writes `progress/separation/searchDominant/rotY` into `sceneState` (read each frame by the
scene); the timeline also moves hero typography/media out and the NextSection slides over the
sticky hero — a spatial "travel through the universe" rather than a fade.

**Behaviour & limits:** SSR 200 with exact WP copy; `npm run build` passes with zero errors;
reduced-motion shows an elegant static state (all content available); WebGL failure falls back
to a static scene. Known limitation: raw live-page HTML/head not capturable in this sandbox, so
JSON-LD re-verification still relies on the PREVIOUSLY CAPTURED snapshots; the first-load JS for
the `/` route is ~347 kB (three/r3f/gsap) — acceptable for the 3D hero, and content is server-
rendered regardless.

---

## 5. Deliverable file index

| File | Purpose |
| --- | --- |
| `docs/DGS-ARENA-CAPABILITY-MAP.md` | What the environment can/cannot do |
| `docs/DGS-WORDPRESS-REST-AUDIT.md` | REST endpoint audit + limitations |
| `docs/DGS-CONTENT-PARITY.md` | WP vs prototype content matrix |
| `docs/DGS-INTERNAL-LINK-AUDIT.md` | Internal link map |
| `docs/DGS-ARENA-VISUAL-DIRECTIONS.md` | 3 visual directions + recommendation |
| `data/wordpress/raw/*.json` | Raw REST metadata + content snapshots |
| `data/wordpress/pages/*.json` | Normalised structured content |
| `data/wordpress/media/tier1-media-map.json` | Referenced media mapping |
