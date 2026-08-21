# DGS Website Rebuild — Master Document

Working site until approval: **Dimgrey**  
`https://dimgrey-goat-473970.hostingersite.com/`

After approval: connect this Next.js frontend to **headless WordPress** on the live domain. WordPress becomes content storage only. The public UI never depends on WordPress plugins.

---

## 1. Operating rules

1. Build and approve the new UI on Dimgrey first. Do not restyle `dgeniussolutions.com` until sign-off.
2. **Content stays.** Copy, facts, services, FAQs, case studies, contact details, and media meaning stay DGS.
3. **UI is new.** Do not clone the current WordPress / Elementor look. Cinematic dark-premium DGS world only.
4. **No plugin runtime.** No Envira, Elementor, Rank Math, Fluent Forms, LiteSpeed, or other WP plugins in the frontend. Galleries, forms, fonts, SEO tags, AEO/LLM schema, and images are hardcoded in this codebase or served from our own files/routes.
5. **Ranking pages keep structure.** URL, heading order, content blocks, internal links, canonical, and schema *shape* stay. Visual restyle only.
6. **Non-ranking pages can be rebuilt** for IA, titles, and on-page SEO.
7. Pull **behaviours** from the inspiration bank. Do not make DGS look like any one reference site.
8. Use **Watermelon UI** wherever it is faster (buttons, bento, FAQ, marquee, cards, dialogs, CTAs). Custom-build only the cinematic moments Watermelon does not cover (cursor, page transitions, gallery spin, motion tiles).

---

## 2. Stack

| Layer | Choice |
| --- | --- |
| Runtime | Next.js App Router on Hostinger Node (Passenger) |
| Styling | Tailwind CSS v4 + DGS tokens (blue → purple → coral/orange on near-black) |
| Components | Watermelon UI (shadcn registry, copy into repo) |
| Motion | Motion (`motion/react`) for microinteractions; GSAP later only if a pinned/story section needs it |
| Media | Hardcoded in `/public` or `lib/content` — never Envira / WP shortcodes |
| SEO / AEO / LLM | Hardcoded `metadata` + JSON-LD in routes |
| Forms | Native Next.js route, not Fluent Forms |
| Headless WP | Later. REST/GraphQL for copy only, after Dimgrey approval |

---

## 3. Identity (not a clone of a reference site)

- Dark premium canvas.
- Brand spectrum: **blue → purple → coral/orange**.
- Display type with editorial presence; UI type with Linear / Vercel / Stripe spacing discipline.
- Glass surfaces, bento grids, cursor language, scroll-linked reveals.
- Memorable moments on portfolio, client wall, service exploration, AI production, case-study transitions.

---

## 4. Ranking policy

Until Search Console / rank lists are attached:

- Treat **homepage** and currently indexed service URLs as **structure-locked** until proven otherwise.
- Locked means: same path, same H1 intent, same primary FAQ/service claims, same canonical host strategy.
- Unlocked means: we may change section order, headings, and internal links to fix why the page does not rank.

A ranking appendix will be filled when the route list is provided.

---

## 5–20. Recovered rebuild inventory (placeholders)

These sections exist so later routes can slot in without renumbering. Fill from the recovered UI inventory as each route is taken.

- **5.** Sitemap & URL lock list
- **6.** Page-by-page content inventory (keep copy)
- **7.** SEO / AEO / LLM schema map (hardcoded)
- **8.** Media inventory (images to `/public`, no plugin galleries)
- **9.** Navigation & footer IA
- **10.** Forms, CTAs, WhatsApp / talk flow
- **11.** Case studies & portfolio behaviours
- **12.** Client wall
- **13.** Service exploration
- **14.** AI production presentation
- **15.** Motion & page-transition spec
- **16.** Accessibility & performance (Hostinger 1-CPU)
- **17.** Headless WordPress contract (post-approval)
- **18.** Dimgrey deploy (SSH + `rebuild.sh`)
- **19.** Ranking vs non-ranking workboard
- **20.** QA / approval checklist

---

## 21. Inspiration & Interaction Reference Bank

Saved DGS creative material points toward **Apple × Awwwards-style cinematic layouts**, Framer-style motion, scroll-linked interactions, glass surfaces, bento structures, cursor effects, and premium editorial presentation.

### 21.1 Benchmark libraries

| Source | URL | Pull from it |
| --- | --- | --- |
| Awwwards | https://www.awwwards.com/ | Premium agency experience, unusual layouts, motion |
| GSAP Showcase | https://gsap.com/showcase/ | Scroll storytelling, pinned sections, reveals, parallax, transitions |
| Codrops | https://tympanus.net/codrops/ | Experimental menus, typography, hover, galleries, WebGL ideas |
| Motion.dev | https://motion.dev/ | Polished interaction and animation behaviour |
| Skiper UI | https://skiper-ui.com/ | Interactive heroes, animated cards, modern premium UI |
| Framer | https://www.framer.com/ | Contemporary layout, microinteraction, responsive |
| Godly | https://godly.website/ | Curated modern website inspiration |
| Land-book | https://land-book.com/ | Landing-page layouts and section composition |
| SiteInspire | https://www.siteinspire.com/ | Agency / editorial art direction |
| Lapa Ninja | https://www.lapa.ninja/ | Landing-page conversion / UI patterns |
| getdesign.md | https://getdesign.md/ | Component and modern UI inspiration |
| **Watermelon UI** | https://ui.watermelon.sh/ | Faster production blocks — use first when a section does not need a custom cinematic moment |

### 21.2 High-end art direction

Useful for page transitions, editorial pacing, spatial compositions, typography, unconventional navigation, and memorable visual moments — **not** for copying identity:

- Poch Studio — https://poch.studio/
- Fra Design — https://fradesign.it/
- Clay Garden — https://claygarden.jp/
- Hyper Dreams — https://hyper-dreams.com/
- WeTransfer Wild Memory Radio — https://wild-memory-radio.wetransfer.com/
- Studio Dialect — https://studiodialect.com/
- Corentin Bernadou — https://corentinbernadou.com/

### 21.3 Product-quality references

**Linear, Vercel, Raycast, Runway, Stripe** — interface discipline, spacing, hierarchy, product polish, and microinteractions. Do not copy their visual identity.

### 21.4 Specific interaction ideas (DGS-relevant)

| Behaviour | Where it belongs |
| --- | --- |
| X-ray hover | Service cards / case-study covers |
| Particle sphere | AI production / LLM SEO moment |
| Gallery Spin | Portfolio (custom, not Envira) |
| 3D Parallax Grid | Case-study index |
| SpectraNoise | Hero atmosphere |
| Vortex Gallery | AI / film stills |
| Circular selection UI | Service exploration |
| Motion Tiles | Client wall |

### 21.5 Hard rule

Pull **individual behaviours** from these references. DGS must remain the dark premium DGS world with its **blue → purple → coral/orange** spectrum. References supply interaction language and art direction only.
