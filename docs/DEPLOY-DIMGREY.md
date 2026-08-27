# Deploy / status — dimgrey demo (`dimgrey-goat-473970.hostingersite.com`)

**Last verified:** 2026-08-27 (live HTTP + Hostinger SSH)

---

## What is live right now

The demo is **not** the old cinematic 3D prototype and **not** the `Kohindgs/DGS` `cursor/dgs-next-mirror-755d` HTML-mirror branch.

It runs a **separate Next.js 16 rebuild** (`dgs-nextjs`) deployed via **Hostinger Builds**:

| Item | Value |
|---|---|
| Active release | `releases/5c39c859` (Passenger `PassengerAppRoot`) |
| Build date | 2026-08-26 |
| Stack | Next **16.3.3**, React **19**, TypeScript |
| Routes in registry | **105** (81 same-URL, 5 protected, 17 sitemap-review) |
| Tier-0 rebuilt pages | 5 flagship services (SEO, AEO, GEO, LLM, AI Video) |
| Architecture | Semantic content blocks + `app/[...slug]` catch-all (not WP HTML dumps) |
| Staging | `X-Robots-Tag: noindex, nofollow` on entire demo (correct for preview) |

### Verified live URLs (200)

- `/` — custom hero (`page.module.css`), correct WP H1/title
- `/services/seo-services-in-mumbai/`
- `/services/aeo-services-in-mumbai/` — title correct; tier0 data already flags WP canonical bug
- `/services/geo/`
- `/services/llm-seo-service/`
- `/services/ai-video-production-agency/` (tier-0)
- `/blogs/`, `/blogs/what-is-llm-seo/`
- `/our-services/`, `/contact-us/`, `/about-us/`

### Stale folder (ignore)

`domains/.../nodejs/` — old Aug-25 cinematic/wp-dump build. **Not serving traffic.** Passenger points at `releases/5c39c859`.

---

## Relationship to GitHub `Kohindgs/DGS`

| | **dimgrey live** | **GitHub mirror branch** (`cursor/dgs-next-mirror-755d`) |
|---|---|---|
| Source | Hostinger Builds `last-source` / release tarball | GitHub PR #15 |
| Next version | 16 | 14 |
| Content model | Parsed content blocks | Synced WP HTML + CSS |
| Routes | 105 registry-driven | 94 generated static pages |
| SEO fixes | `tier0-routes.json` + `desiredCanonicalPath` | `redirects.json` + canonical overrides |

**Recommendation:** Treat **dimgrey** as the primary Next rebuild target. Merge ideas from PR #15 (redirect list, sync automation) into the dimgrey codebase rather than replacing dimgrey with the GitHub mirror wholesale.

---

## Deploy / update dimgrey

### Latest deploy (2026-08-27)

- **26 SEO redirects** added to `data/migration/redirects.approved.json` (AEO, GEO, LLM, SEO shortcuts, city slug fixes, junk routes)
- **Migration baseline** re-run from live WordPress (`npm run migration:baseline`)
- **91 static pages** built and uploaded to `releases/5c39c859`
- **Verified live:** `/services/aeo/` → AEO service, `/seo-services/` → Mumbai SEO, AEO canonical correct
- **`~/rebuild.sh`** updated to point at `releases/5c39c859` (was stale `nodejs/` path)

### Option A — Hostinger Builds (current method)

1. hPanel → **Websites → dimgrey → Builds**
2. Push source to the connected repo / upload build
3. Build command: `npm run check` or `npm install && npm run build`
4. Startup: `server.js` via Passenger (already configured in `public_html/.htaccess`)

### Option B — Manual rebuild on server

```bash
export PATH=/opt/alt/alt-nodejs22/root/bin:$PATH
cd ~/domains/dimgrey-goat-473970.hostingersite.com/releases/5c39c859
npm install
npm run build
touch tmp/restart.txt   # Passenger restart
```

Or use existing `~/rebuild.sh` (points at old `nodejs/` path — **update it** to `releases/5c39c859`).

---

## After deploy — verify

1. Homepage loads with semantic hero (not Elementor dump)
2. `/services/aeo-services-in-mumbai/` — view-source canonical should be **this URL**, not `/services/aeo/`
3. `/services/geo/`, `/services/llm-seo-service/` — interlink cluster intact
4. Blog post loads with 200
5. Confirm `noindex` header still present until production cutover

---

## Production cutover checklist (when ready)

1. Remove `noindex` from demo `.htaccess` / metadata for production domain only
2. Point `www.dgeniussolutions.com` DNS to this Node app (or export static + CDN)
3. Keep WordPress at `cms.` subdomain for editing only
4. Re-run migration baseline: `npm run migration:baseline` on dimgrey source
5. Fix remaining WP-side issues (AEO sitemap omission, Redirection plugin wrong rules)

