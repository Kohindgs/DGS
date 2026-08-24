# DGS Arena — Visual Directions

**Status:** FOR APPROVAL — no homepage code until a direction is chosen (brief §18).
**Branch:** `arena/01a034c2-dgs` | **Date:** 2026-08-24

This document defines three radically different visual directions for the new D'Genius
Solutions website. All three are built on the **real, verified DGS content and assets** from
Phase 1 (see `data/wordpress/`), not on invented copy or the rejected old prototype.

**Hard constraints inherited from the brief (§16) and Phase 1:**
- No old grey hero, no generic card layout, no black diamond logo, no old cinematic-ui layout,
  no generic agency UI.
- No "card soup", no generic gradients, no robot, no AI brain, no meaningless glowing orb.
- Use actual DGS content: full-service digital marketing (SEO/AEO/GEO/LLM SEO, websites,
  social, performance marketing, branding, content, AI video), 200+ brand client proof,
  proof-of-performance screenshots, awards (Prime Insights / Corporate Connect / GLA), Google &
  Meta partner badges, case studies (HumanXT, Weavings, Katherine's Gallery, Better Ceasons).
- Brand accent in play: DGS coral/red `#FD5C62` (from the current identity), balanced against
  a deliberately original design system (no reuse of old motif).
- Content wording is protected — the new UI *presents* the verified content; it does not rewrite it.

---

## Common ground (all three directions)

These are shared regardless of direction, because they come from verified content and SEO/AEO/
GEO/LLM requirements:

- **Content architecture:** one authoritative service hub + deep service pages, preserving the
  strong SEO⇄AEO⇄GEO⇄LLM internal-link cluster. Answer-ready H1/H2 sections, FAQ blocks,
  FAQPage/Service/Organization/LocalBusiness JSON-LD, `llms.txt`, `sitemap.xml`, `robots.txt`.
- **Forms:** single canonical lead form mapped to the WordPress/Fluent Forms backend (exact
  endpoint REQUIRES ACCESS once verified). Per-service CTA anchors preserved.
- **Performance budget:** static-generation/ISR, WebP/AVIF via Next Image, zero render-blocking
  third-party CSS, ≤ 2.0s LCP. 3D is decorative-and-lazy-loaded, never blocking first paint.
- **Accessibility:** WCAG AA, `prefers-reduced-motion` disables 3D, keyboard + screen-reader
  support, semantic landmarks, real alt text from the media map.
- **3D tech stack option:** React Three Fiber / Three.js for bespoke scenes, or WebGL shaders,
  with a no-JS/CSS fallback poster. Motion via framer-motion + GSAP ScrollTrigger.

---

# A. SPATIAL DGS UNIVERSE

**Concept:** the entire site is a navigable, curated spatial "universe." The hero is not a flat
panel — it's a three-dimensional stage where DGS's services exist as distinct glowing
"worlds/orbits" that the visitor can move between by scrolling and dragging. Feels like
entering a living brand cosmos. Premium, tech-forward, original.

- **Hero composition:** a full-viewport dark 3D space. In the near field, the DGS wordmark
  floats as a dimensional, light-caught object; in the far field, service "satellites"
  (SEO, AEO, GEO, LLM, Web, Social, Performance, Brand, Content, AI Video) orbit in elliptical
  paths. A subtle depth-of-field + starfield dust. Headline sits over the scene, readable, with
  a "Explore the universe" cue.
- **Navigation:** a minimal top bar with the wordmark and a compact menu; a persistent
  space-minimap (small 3D widget) that shows where you are among the service worlds. Scroll or
  drag to travel.
- **Typography:** cinematic display face (Space Grotesk/Syne-style) for headline, crisp
  humanist sans (DM Sans) for body, mono for data/labels. Large fluid type; generous negative
  space.
- **3D system:** one coherent Three.js scene reused/instanced across the site (hero world,
  service worlds, CTA node). Instancing keeps it performant. Camera slowly drifts;
  `prefers-reduced-motion` freezes it to a static render.
- **Motion language:** slow, majestic orbital drift; eased, non-jittery transitions between
  "worlds"; parallax depth on scroll; content fades/slides in with spring easing.
- **Colour:** near-black base (`#07070a`) with the coral `#FD5C62` as the light source/accent;
  cool violet/blue rim light for depth; content on dark glass panels. Accent only where it
  matters (CTAs, highlights).
- **Services treatment:** each service is a distinct "world" with its own micro-constellation;
  selecting one zooms in, then the real service content resolves as editorial panels around the
  3D node. No card soup — content arrives spatially.
- **Client proof treatment:** the 200+ brand logos form a slowly rotating 3D "constellation of
  trust" you can orbit; hover reveals the brand name. Proof screenshots live in a spatial
  gallery.
- **AI portfolio / brand portfolio / case-study treatment:** case studies (HumanXT, Weavings,
  Katherine's Gallery, Better Ceasons) are "mission logs" opened as spatial cards with their
  real imagery and metrics; the AI-video and brand work get the same spatial framing.
- **CTA treatment:** the contact node is a glowing destination ("land to talk"); CTA floats as
  a persistent beacon. Scroll reaches it, or direct drag.
- **First scroll transition:** the camera pushes slightly and the nearest service world comes
  forward; the hero headline parts to reveal the proof constellation below.
- **Mobile adaptation:** 3D scene scales down; touch-drag replaced by scroll; the spatial
  minimap collapses to a horizontal service rail. 3D is a lightweight background, not the input.
- **Accessibility:** full reduced-motion static fallback; all spatial content also reachable as
  normal DOM/editorial sections.
- **Performance:** heavy 3D only on capable devices + after interaction; static poster + ISR for
  content; strict bundle-splitting.
- **Technical approach:** R3F + drei, framer-motion for UI, GSAP ScrollTrigger for camera-choreo,
  all lazy-loaded; content from the Phase-1 data layer.

---

# B. CINEMATIC WORK-FIRST

**Concept:** lead with proof, not promises. The site is structured like an award-winning
creative studio's reel/showcase — large cinematic imagery, sequenced reveals, and the work
first. Content is framed in full-bleed cinematic "chapters" that feel like a film score. Calm,
expensive, editorial.

- **Hero composition:** full-bleed cinematic still (from real DGS case/proof imagery) with a
  slow Ken Burns drift; a large elegant headline and a primary CTA; a thin progress/menu rail.
  Subdued grain. The hero immediately cuts to a proof section — real results first.
- **Navigation:** minimal top rail with wordmark; a full-screen cinematic overlay menu with
  large editorial type and hover-preview imagery per service.
- **Typography:** high-contrast editorial serif for display (e.g. a refined serif) + clean
  grotesk body; strong hierarchy, tight but airy lines; uppercase micro-labels.
- **3D system:** restrained, cinematic 3D — parallax depth layers, subtle dimensional type, a
  dimensional product/showcase moment (e.g. the portfolio reels) rather than an always-on scene.
- **Motion language:** slow cinematic pans, crossfades, sequenced stagger reveals, scroll-linked
  choreography (GSAP). Feels like editing, not animation for its own sake.
- **Colour:** near-black + warm neutral + the coral accent; cinematic contrast, deep shadows,
  filmic grade; editorial whitespace on interior sections.
- **Services treatment:** services presented as a film-strip of "chapters," each with a strong
  visual opener, then scannable answer-ready content beneath. Not cards — full-bleed rows.
- **Client proof treatment:** the client logos become a refined, scrolling "credits" sequence —
  like an end-credits reel — plus a stat block (200+ brands) treated as a film title card.
- **AI portfolio / brand portfolio / case-study treatment:** each case study is its own cinematic
  "short" — real screenshots, real metrics (HumanXT, Weavings, Katherine's Gallery, Better
  Ceasons, plus SEO/AEO/GEO/LLM proof captures and awards) shown as stills with motion.
- **CTA treatment:** a closing cinematic "end card" — bold, single call to action framed like the
  final shot of a film ("Let's make the work that ranks.").
- **First scroll transition:** hero drifts/fades into the proof "credits," establishing
  credibility immediately.
- **Mobile adaptation:** cinematic stills scale; overlays become stacked editorial blocks; motion
  simplified.
- **Accessibility:** full text fallback under every image; reduced-motion stops pans; strong
  contrast.
- **Performance:** heavy imagery is lazy-loaded/Next-Image; smooth but JS-light; very fast LCP.
- **Technical approach:** GSAP ScrollTrigger + framer-motion; occasional R3F moments; content from
  Phase-1 data layer.

---

# C. KINETIC EDITORIAL + 3D

**Concept:** an editorial magazine that moves. Big typographic statements, layered kinetic
layout (words, numbers, marquees), punctuated by deliberate 3D objects (dimensional type, a
logo mark, service glyphs). Feels like a print-punk design annual brought to life — bold,
graphic, confident, distinctive. Highest originality risk/reward.

- **Hero composition:** enormous kinetic display type that assembles itself (letters arrive,
  set, and lock) over a minimal background; oversized service marquee rolling; a single
  dimensional 3D object (e.g. the DGS wordmark or a service glyph) orbiting subtly. Layout is
  asymmetric and grid-punctuated.
- **Navigation:** a pinned editorial masthead; a kinetic menu where oversized type
  intersects/blends on hover.
- **Typography:** THE character of this direction — ultra-large display type, contrasting
  weights/italics, kinetic micro-labels, oversized numerals for stats (178%, 37.8K, ₹3.2Cr).
- **3D system:** sculptural, graphic 3D — dimensional display letterforms and service glyphs,
  not a "scene." Objects are set pieces that rotate on scroll, staying decorative and light.
- **Motion language:** rapid but choreographed kinetic entrances (staggered type, marquees,
  count-up stats), with `prefers-reduced-motion` collapsing everything to static layout.
- **Colour:** bold editorial palette — near-black + off-white + coral accent, with selective
  high-saturation moments. No generic gradients; flat fields with dimensional 3D type.
- **Services treatment:** each service is a bold kinetic "spread" (like a magazine feature) —
  giant numeral, title, marquee tags, then answer-ready paragraphs. Editorial, not card grid.
- **Client proof treatment:** client logos as a kinetic marquee + a "credits" block with big
  counts; proof screenshots shown as bold framed "plates."
- **AI portfolio / brand portfolio / case-study treatment:** case studies as striking editorial
  features with real imagery, headline stats, and 3D glyph accents.
- **CTA treatment:** a full-bleed kinetic closing spread with an oversized CTA and rolling
  marquee (services / phone / email).
- **First scroll transition:** the hero type shears/slides away and the first service "spread"
  slams into place with a marquee.
- **Mobile adaptation:** kinetic type scales to fit; marquees continue but slow; spreads stack
  cleanly.
- **Accessibility:** kinetic type must remain readable at rest; reduced-motion static fallback;
  contrast maintained on accent-on-dark.
- **Performance:** typography-first is cheap; 3D type is limited and lazy; very fast.
- **Technical approach:** GSAP + framer-motion, split-text/SplitType, instanced 3D glyphs in R3F;
  content from Phase-1 data layer.

---

## Comparison summary

| Aspect | A. Spatial DGS Universe | B. Cinematic Work-First | C. Kinetic Editorial + 3D |
|--------|------------------------|-------------------------|---------------------------|
| Core feel | Brand as explorable cosmos | Studio/reel, proof-first | Design-annual magazine |
| Originality | High | Medium (proven pattern) | **Highest** |
| 3D role | Always-on scene (decorative) | Occasional dimensional moments | Dimensional type/glyphs |
| Best at | Immersive "wow" | Credibility & elegance | Distinctive voice |
| Content fit | Great for services + AI cluster | Great for proof/case studies | Great for stats + services |
| Performance risk | Highest (needs discipline) | Low | Low |
| Accessibility risk | Highest (must gate 3D) | Low | Medium (kinetic type) |

---

## RECOMMENDATION

**Recommended: A. SPATIAL DGS UNIVERSE** — *as the hero/homepage experience, gated for
performance and accessibility*, with the editorial strengths of B and C applied to interior
sections.

**Rationale**
1. It delivers the brief's explicit asks most directly: "3D thought process," "out of the box,"
   "award-winning," "premium, original, creative technology." A navigable service universe is a
   genuine differentiator versus every generic agency card site — which is exactly the 
   Awwwards-quality bar requested.
2. It maps cleanly onto the **verified content architecture**: each service world = one of the
   Tier-1 services (SEO, AEO, GEO, LLM, Web, Social, Performance, Brand, Content, AI Video), and
   the orbit literally visualises the SEO⇄AEO⇄GEO⇄LLM interconnected cluster that Phase 1 confirmed.
3. It gives the **200+ brand proof** and **case studies** a premium, unique showcase
   ("constellation of trust"), turning a logo strip into a signature moment.
4. The coral `#FD5C62` becomes the "light source" of the universe — a meaningful way to keep the
   brand accent without the rejected old motif.
5. Risk (performance/accessibility) is manageable with the gates defined above (lazy 3D, static
   fallback, reduced-motion, ISR content). Direction B/C visual language is still used for
   interior sections to keep the site fast and readable.

**Risk controls if A is chosen:** 3D is decorative and interaction-gated; all content is
reachable as plain DOM; LCP uses a static hero poster; `prefers-reduced-motion` returns a fully
static, fast site.

---

## Next step (only after approval of a direction, per brief §18)

Build ONLY: **Header** + **Hero** + **First scroll transition**. Nothing else, then review.
