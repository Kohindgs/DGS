# DGS Next.js WordPress Mirror — Master Plan

**Branch:** `cursor/dgs-next-mirror-755d`  
**Updated:** 2026-08-27

## Goal

Mirror **www.dgeniussolutions.com** in Next.js with:

- **Exact content** (WordPress REST + live HTML as source of truth)
- **Exact visual parity** (synced Elementor/DGS CSS, no WP plugin JS at runtime)
- **Media from WordPress CDN** (`wp-content/uploads` — images, video, webp)
- **No runtime plugin dependencies** (no Elementor, Rank Math, Fluent Forms, Smush JS)
- **Fast static delivery** (SSG, ~87 kB shared JS shell per route today)
- **SEO fixes baked in** (redirects, canonical overrides, noindex junk, sitemap)

---

## What was built in this iteration

### Automation pipeline

| Command | What it does |
|---|---|
| `npm run sync:wp` | Pulls pages, services, posts from WP REST + live `<head>` → `data/wordpress/content/*.json` |
| `npm run generate:routes` | Generates `app/(mirror)/**/page.jsx` from manifest |
| `npm run mirror` | Both steps |

**Current sync:** 94 routes (home, 15 pages, 18 services, 61 blog posts)

### Generated artifacts

- `data/wordpress/manifest.json` — route index + SEO meta
- `data/wordpress/content/*.json` — body HTML, inline styles, JSON-LD, fonts
- `docs/DGS-SYNC-MANIFEST.md` — auto-generated parity table
- `lib/wordpress/content-loader.ts` — typed loader map (generated)
- `lib/seo/redirects.ts` + `data/seo/redirects.json` — redirect rules
- `lib/seo/canonical-overrides.ts` — fixes AEO canonical loop, meta overrides

### Runtime architecture

```
WordPress (content + media CDN only)
        ↓ build-time sync
data/wordpress/content/*.json
        ↓ generate:routes
app/(mirror)/**/page.jsx  →  WpMirrorPage (no plugin JS)
        ↓ next build
Static HTML per URL + next.config redirects
```

`WpMirrorPage` renders:

1. JSON-LD from synced head (Rank Math output preserved)
2. Google fonts preconnects only
3. Inline CSS extracted from live page (visual parity)
4. Sanitized body HTML (scripts removed, lazy-load images fixed, apex→www)

---

## SEO fixes included in Next (not WP-dependent)

| Issue | Fix |
|---|---|
| AEO canonical ↔ redirect loop | `canonical-overrides.ts` forces `/services/aeo-services-in-mumbai/` |
| Wrong `/seo-services/` → Hyderabad | `redirects.json` → Mumbai SEO |
| Wrong `/services/seo/` → banglore | redirect → Mumbai SEO |
| `/aeo/`, `/llm-seo/` → blogs | redirect → service pages |
| Junk pages indexed | `noindex` for thank-you, indriya-test, wp-file-download |
| Performance Marketing thin meta | description override in sync |
| Contact thin meta | description override in sync |
| Mixed-case URLs | redirects for About-Us, Contact-Us |
| Bangalore typo variants | redirect to live slug until WP slug renamed |

**Still requires WordPress admin** (when you cut over DNS): fix Rank Math canonical on AEO, Redirection plugin wrong rules, remove junk from WP sitemap, regenerate `llms.txt`.

---

## Phase roadmap

### Phase 1 — Mirror + SEO shell ✅ (this PR)

- [x] Automated WP sync
- [x] 94 static routes
- [x] SEO redirects + canonical overrides
- [x] `sitemap.xml` + `robots.txt` in Next
- [x] Production build passes

### Phase 2 — Speed + UI rebuild (Watermelon UI)

Watermelon UI (`ui.watermelon.sh`) is a shadcn-compatible copy-paste registry (Tailwind + Radix + Motion).

**Setup (when starting Phase 2):**

```bash
npx shadcn@latest init --template next
npx shadcn@latest add https://registry.watermelon.sh/r/<component>.json
```

Replace **chrome only** first (header, footer, nav, CTAs, forms shell) with Watermelon components while keeping synced body content. Then rebuild section-by-section for flagship pages (SEO, AEO, GEO, LLM).

### Phase 3 — OriginKit motion layer

[OriginKit](https://www.originkit.dev/) — 298 copy-paste motion components (glass, cursor effects, grids). Use selectively on hero/CTA blocks **after** Watermelon shell is stable. Do not add motion globally (hurts LCP).

### Phase 4 — Forms (WordPress backend, no Fluent plugin in Next)

Options:

1. **Proxy API route** → WordPress `admin-ajax.php` / Fluent REST (needs app password)
2. **Embed** minimal form POST to existing WP endpoint
3. **Hostinger** form handler if migrated

Forms are the only piece that may still call WordPress at runtime.

### Phase 5 — Cutover

1. Deploy Next to Hostinger (Node + `server.js` or static export + CDN)
2. Point `www.dgeniussolutions.com` to Next
3. Keep WordPress at `cms.dgeniussolutions.com` for editing only
4. Re-run `npm run mirror` on publish webhook (CI)

---

## MCP & Hostinger access (rechecked 2026-08-27)

| Integration | This Cloud Agent session |
|---|---|
| WordPress MCP | **Not connected** — not in available MCP namespaces |
| Hostinger MCP | **Not connected** — not in available MCP namespaces |
| WordPress REST (public) | ✅ Used for sync |
| SSH Hostinger | Credentials provided in chat — **not stored in repo**. Enable as Cursor secret / environment variable for future runs |

**To enable MCP in Cursor Desktop:** Settings → MCP → add WordPress + Hostinger servers, then re-run agent.

**Security:** Rotate the SSH password shared in chat; use environment secrets (`HOSTINGER_SSH_*`) never committed to git.

Demo reference: `dimgrey-goat-473970.hostingersite.com` (see `docs/DEPLOY-DIMGREY.md`).

---

## Legacy code archived

| Path | Notes |
|---|---|
| `app/_archive/cinematic-home/` | Old 3D spatial hero prototype |
| `app/_archive/wp-dump/` | Old manual `_wp_data` HTML dump routes |

---

## Daily workflow

```bash
# After WordPress content changes:
npm run mirror
npm run build

# Deploy (Hostinger Git or upload .next + server.js)
git push origin cursor/dgs-next-mirror-755d
```

---

## Known limitations

1. **Visual parity** still ships synced inline CSS (large but accurate). Phase 2 Watermelon rebuild reduces CSS weight.
2. **Forms** not wired — CTAs point to `#contact-form` anchors; Fluent backend needs WP credentials.
3. **Career page** skipped (WP redirects to home); add when WP career page is restored.
4. **Google Ads landing pages** skipped (not in Tier-1 list); add slugs to `TIER1_PAGE_SLUGS` in sync script if needed.
5. **llms.txt** still served by WordPress until cutover; Next can add `/llms.txt` route in Phase 5.
