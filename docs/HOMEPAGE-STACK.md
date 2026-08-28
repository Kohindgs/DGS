# Homepage Stack

Native Next.js homepage architecture (no WP HTML mirror on `/`).

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Layout | CSS Modules (`components/home/**/*.module.css`) |
| Scroll motion | GSAP + ScrollTrigger (`ScrollProvider`, `data-reveal`) |
| GPU background | OGL point particles only (`DgsOglParticleBackground`) |
| Portfolio | Native `homepage-gallery.json` — no Envira |
| Chrome | Native `SiteHeader` / `SiteFooter` |

## Excluded

- Tailwind CSS
- Framer Motion
- PixiJS
- tsParticles
- Watermelon UI
- Three.js (particles reproduced with OGL points)
- WP HTML mirror (`HomeWpMirrorPage`) on production homepage

## Key files

```
app/(site)/page.tsx                 → HomePageTemplate
components/templates/HomePage.tsx   → native section composition
components/home/HomeV1215Shell.tsx    → static bg layers + scroll CSS vars
components/background/DgsOglParticleBackground.tsx
components/motion/ScrollProvider.tsx
```

## Validation

```bash
npm run validate:homepage-stack
```

Checks homepage entry, template wiring, and banned dependencies in homepage paths.

## Background behaviour

- **Static:** fallback gradient, grid, vignette (CSS only; no scroll parallax)
- **Animated:** OGL particle field (desktop, fine pointer, no reduced motion)
- **Hero:** pointer-driven robot tilt via `HomeV1215Shell`

## SEO

Homepage JSON-LD uses synced WordPress `@graph` schemas via `buildHomepageMirrorJsonLd`.
