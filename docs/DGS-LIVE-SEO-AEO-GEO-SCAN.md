# DGS Live Site Scan — SEO / AEO / GEO / LLM / Interlinking / Redirects

**Target:** https://www.dgeniussolutions.com  
**Scan date:** 2026-08-27  
**Method:** Live HTTP crawl of robots, Rank Math sitemaps, `llms.txt`, 23 deep page head/schema/link scans, 59 URL probes, HTML sitemap link check.  
**Scope note:** Unauthenticated public surface only (no WP admin / Rank Math backend).

---

## Executive verdict

The site has a strong **AI-search topical cluster** (SEO ⇄ AEO ⇄ GEO ⇄ LLM) with good robots allowances for AI bots and a live `llms.txt`. Several **high-severity URL / canonical / sitemap bugs** will blunt that investment: an AEO **canonical↔redirect conflict**, **AEO missing from XML sitemap**, **wrong redirects** (`/seo-services/` → Hyderabad, `/services/seo/` → Bangalore typo slug), indexed junk/test pages, and a `/career/` redirect-to-home still listed in the sitemap.

---

## 1. Crawl & index foundations

### robots.txt — PASS (with notes)
- Apex and www both resolve to the same robots file.
- Allows major AI crawlers: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`.
- Disallows previews, search (`/*?s=`), login, and a WPO JSON file.
- Sitemap pointer: `https://www.dgeniussolutions.com/sitemap_index.xml` (Rank Math).

### Host / HTTPS canonicalization — PASS
| Request | Result |
|---|---|
| `http://dgeniussolutions.com/` | 301 → https apex → 301 → `https://www.../` |
| `https://dgeniussolutions.com/` | 301 → www |
| `http://www.../` | 301 → https www |
| `https://www.../` | 200 |
| `/index.php`, `/home` | 301 → homepage |

### XML sitemaps — PARTIAL FAIL
Rank Math index contains:
- `post-sitemap.xml` — 52 URLs (blog index + posts)
- `page-sitemap.xml` — 18 pages
- `services-sitemap.xml` — 18 service URLs
- `local-sitemap.xml` — `locations.kml` only

**89 page/KML URLs total.** All primary locs return 200 except:
| Sitemap URL | Status | Issue |
|---|---|---|
| `/career/` | **301 → /** | Still listed in sitemap; Redirection plugin |
| `/wp-file-download-search/` | **301 → `https://dgeniussolutions.com/`** (apex, no www) | Junk URL + bad redirect target |

**Critical omission:**  
`/services/aeo-services-in-mumbai/` is **NOT in any XML sitemap** (GEO + LLM + Mumbai SEO are present). AEO Dubai page *is* in the page sitemap.

**Should not be indexable / sitemap-listed:**
- `/indriya-test/` — indexable test/job page
- `/thank-you/` — thank-you page, indexable
- `/wp-file-download-search/` — plugin junk
- `/career/` — redirects to home (dead sitemap entry)
- Case-study CPT living under `/services/shirdi-se-sai-tak-case-study/` (taxonomy pollution)

---

## 2. Critical / high issues (fix first)

### P0 — AEO canonical ↔ redirect conflict
| URL | Behavior |
|---|---|
| `/services/aeo/` | **301 →** `/services/aeo-services-in-mumbai/` |
| `/services/aeo-services-in-mumbai/` | **200**, but `rel=canonical` → `/services/aeo/` |
| `/services/aeo/` | Also **missing from XML sitemap** |

This is a loop signal for Google: redirect says “use long URL”; canonical says “use short URL”; short URL redirects away. Fix by picking **one** public URL (recommend `/services/aeo-services-in-mumbai/`), setting canonical + og:url to it, 301 the short slug *or* make short slug the only URL, and **add the winner to `services-sitemap.xml`**.

### P0 — Wrong redirects (intent mismatch)
| Source | Currently goes to | Expected |
|---|---|---|
| `/seo-services/` | `/services/seo-services-in-hyderabad/` | Hub or Mumbai SEO (not Hyderabad) |
| `/services/seo/` | `/services/seo-service-in-banglore/` | Mumbai SEO or services hub |
| `/seo/` | `/seo-executive-assessment/` | SEO service / pricing (not assessment) |
| `/aeo/` | `/blogs/aeo-business/` | AEO service page |
| `/llm-seo/` | `/blogs/llm-seo-ai-search/` | LLM SEO service page |
| `/case-studies/` | `/` (homepage) | `/case_studies/` or portfolio |
| `/wp-file-download-search/` | apex **without www** | 410/404 or www homepage |

Good redirects worth keeping:
- `/geo/` → `/services/geo/`
- `/services/llm-seo/`, `/services/llm/` → LLM service
- `/services/aeo-services/` → AEO service
- `/dubai-seo/` → `/services/dubai-seo/`
- `/blog/` → `/blogs/`
- `/contact` → `/contact-us/`
- `/seo-services-in-mumbai/` → `/services/seo-services-in-mumbai/`

### P1 — Slug quality / typos (indexed + in sitemap + llms.txt)
| Live slug | Problem |
|---|---|
| `/services/seo-service-in-banglore/` | Typo **banglore**; correct spellings 404 |
| `/services/seo-service-pune/` | Inconsistent vs `seo-services-in-*` pattern |
| `/services/seo-service-in-gurugram/` | Singular `service` vs plural elsewhere |
| `/services/ai-production-dubai-page/` | Literal `-page` suffix |
| `/services/website-development-pune-page/` | Literal `-page` suffix |
| `/australia-page/`, `/us-landing-page/` | Internal naming leaked to public URLs |
| `/case_studies/` | Underscore URL; `/case-studies/` wrongly → home |

Correct Bangalore URLs return **404** — no redirect from the typo.

### P1 — Duplicate / thin / conflicting service hubs
| URL | Issue |
|---|---|
| `/services/` | CPT archive; title/desc thin (`Services Archive`); indexable |
| `/our-services/` | Proper marketing hub; also indexable |
| `/career/` | 301 to home via Redirection; still in sitemap + llms.txt |

Pick one services hub; noindex or consolidate the other. Restore or remove Career.

### P1 — Indexable junk
`/indriya-test/`, `/thank-you/` are `robots: follow, index` and in the page sitemap + `llms.txt`. Noindex + remove from sitemap (thank-you); delete or noindex test page.

---

## 3. On-page SEO (sampled key URLs)

| Page | Title | Meta desc | H1 | OG image | Notes |
|---|---|---|---|---|---|
| Home | OK (55) | **Too long (197)** | 1 | **Missing** | Strong schema set |
| About | OK | OK | 1 | Yes | Good `AboutPage` + Person |
| Contact | OK | **Too short (55)** | **0** | Missing | Needs H1 |
| `/services/` archive | Thin | Thin (37) | “Archives: Services” | Missing | |
| `/our-services/` | OK | OK | 1 | Missing | Prefer as hub |
| SEO Mumbai | Strong | OK | 1 (noisy markup) | Yes | Good Service schema |
| AEO Mumbai | Strong | Long (186) | 1 | Yes | **Canonical bug**; has FAQPage |
| GEO | Strong | OK | 1 | Yes | |
| LLM SEO | Strong | OK | 1 | Yes | FAQPage present |
| Performance Marketing | OK | **Broken (22)** “Trusted By 200+ Brands” | 1 | Yes | Meta scraped from hero |
| Dubai SEO | Thin title | Weak (case-study CTA text) | 1 | Yes | |
| Career | Same as home | Same as home | Same as home | — | Soft duplicate via 301 |
| Portfolio / Privacy | OK | OK | 1 | Missing OG on several | |

**Schema strengths:** Organization, LocalBusiness, WebSite, Service, BreadcrumbList, FAQPage (AEO/LLM/content/AI video), VideoObject (AI video page — heavy but useful).  
**Schema gaps:** No consistent `SpeakableSpecification`; limited HowTo; career/entity pages weak; Performance Marketing schema thin vs flagship SEO pages.

**Case sensitivity:** `/ABOUT-US/` and `/Contact-Us/` return **200** (not 301) with correct lowercase canonical — soft duplicates. Prefer 301 to lowercase.

---

## 4. AEO (Answer Engine Optimization)

### What’s working
- Dedicated AEO service page with answer-led title/H1 and **FAQPage** JSON-LD.
- Blog cluster: `aeo-business`, AI Overview posts, optimize-for-ai-overviews, etc.
- Dubai AEO landing (`/aeo-dubai/`) exists and is sitemap-listed.
- Cross-links from GEO / LLM / SEO pages into AEO (matrix fully connected).

### What’s broken
1. Canonical/redirect conflict (P0 above) — undermines AEO page itself.
2. AEO service URL **absent from XML sitemap** while weaker/junk pages are present.
3. `/aeo/` root shortcut points at a **blog** post, not the service.
4. `/services/answer-engine-optimization/` → **404** (no alias).
5. Contact page has no H1 — weak for “contact DGS” answer surfaces.

---

## 5. GEO (Generative Engine Optimization)

### What’s working
- Strong `/services/geo/` page; `/geo/` and `/services/generative-engine-optimization/` redirect correctly.
- Blog support: `generative-engine-optimization`, `geo-vs-seo-google-ai-search`, brand-mentions / AI visibility posts.
- Entity/local signals: LocalBusiness + Place schema on many templates; `locations.kml` in local sitemap.
- Social entity links in footer (LinkedIn, Facebook, YouTube, Pinterest).

### Issues
1. Instagram handle inconsistency in homepage markup: `instagram.com/dgeniussolutions/` **and** `instagram.com/dgenius_solutions/` — entity dilution.
2. Public slugs with typos (`banglore`) and `-page` suffixes reduce citation cleanliness for LLMs.
3. `llms.txt` ships **HTML entities** (`&#039;`, `&amp;`, `&quot;`) instead of plain text — hurts LLM parse quality.
4. Junk pages (`Indriya test`, `Thank You`, `WP File download search`, `Career`→home) are listed in `llms.txt` **Pages** section — pollutes generative retrieval.
5. Performance Marketing / Dubai SEO meta descriptions are non-descriptive — poor snippet/citation fodder.

---

## 6. LLM discovery

| Signal | Status |
|---|---|
| `llms.txt` | **Present** (Rank Math, ~30KB, 90 links) |
| AI bots in robots.txt | **Allowed** |
| `llm.txt` | 404 (soft WP 404 page) — optional alias |
| `.well-known/ai-plugin.json` | 404 |
| XML sitemap linked from llms.txt | Yes |
| Services SEO/AEO/GEO/LLM listed in llms.txt | Yes (AEO included here even though missing from XML sitemap) |

**llms.txt quality problems:** HTML-entity encoding; includes thank-you, test, career, wp-file-download, `banglore`, `*-page` slugs; Performance Marketing blurb is “Trusted By 200+ Brands”.

---

## 7. Interlinking

### AI-search cluster (verified on live HTML)
| From \ To | SEO | AEO | GEO | LLM |
|---|---|---|---|---|
| SEO Mumbai | ■ | ■ | ■ | ■ |
| AEO Mumbai | ■ | ■ | ■ | ■ |
| GEO | ■ | ■ | ■ | ■ |
| LLM SEO | ■ | ■ | ■ | ■ |

Cluster interlinking is **healthy** and should be preserved.

### Structural gaps
- Two competing hubs: `/services/` (archive) vs `/our-services/` (marketing).
- City SEO pages use inconsistent slug patterns → harder intentional interlink templates.
- `/case-studies/` does not reach `/case_studies/`.
- HTML `/sitemap/` page contains malformed absolute-looking paths that resolve under the DGS host (`//api.whatsapp.com`, `//wa.me`, `//www.googletagmanager.com` → site 404s). Likely protocol-relative or stripped `https:` links in the sitemap builder.

### External
Footer socials present. Homepage samples did not surface Wikidata/Crunchbase in the scanned anchor set (may still exist elsewhere / image links).

---

## 8. Redirect & wrong-URL probe sheet (selected)

| Probe | HTTP | Final |
|---|---|---|
| `/services/seo-service-in-bangalore/` | 404 | — |
| `/services/seo-services-in-bangalore/` | 404 | — |
| `/services/seo-services-in-pune/` | 404 | (live is `seo-service-pune`) |
| `/services/seo-services-in-gurugram/` | 404 | (live is `seo-service-in-gurugram`) |
| `/services/seo-services-in-delhi/` | 404 | — |
| `/services/answer-engine-optimization/` | 404 | — |
| `/service/` | 404 | — |
| `/usa/` | 404 | — |
| `/Home` | 404 | (case) |
| `/seo-services/` | 301 | **Hyderabad SEO** (wrong) |
| `/services/seo/` | 301 | **banglore** slug (wrong) |
| `/aeo/` | 301 | blog post (wrong intent) |
| `/llm-seo/` | 301 | blog post (wrong intent) |
| `/case-studies/` | 301 | homepage (wrong) |
| `/?s=seo` | 200 | noindex (OK; also robots Disallow) |
| `/author/admin/`, `/tag/seo/` | 200 | noindex (OK) |
| `/feed/`, `/comments/feed/` | 200 | exposed |
| `/xmlrpc.php` | 405 | |

---

## 9. Priority fix list

### Immediate (this week)
1. Resolve AEO canonical/redirect to a single URL; submit in services sitemap.
2. Fix wrong redirects: `/seo-services/`, `/services/seo/`, `/seo/`, `/aeo/`, `/llm-seo/`, `/case-studies/`.
3. Remove from sitemap + noindex: `indriya-test`, `thank-you`, `wp-file-download-search`; fix or remove `/career/` redirect + sitemap row.
4. Fix `wp-file-download-search` redirect target to www (or 410).
5. Rewrite Performance Marketing meta description.

### Next
6. 301 typo `banglore` → `bangalore` (create correct slug or redirect after rename).
7. Rename `*-page` and `*_` public slugs; add redirects from old URLs.
8. Normalize city SEO slug pattern (`seo-services-in-{city}`).
9. Consolidate `/services/` vs `/our-services/`; noindex CPT archive if hub wins.
10. Force lowercase 301s for mixed-case URLs.
11. Regenerate `llms.txt` as plain UTF-8 without HTML entities; exclude junk URLs.
12. Fix HTML sitemap protocol-relative / malformed external links.
13. Add missing OG images (home, contact, hubs).
14. Add H1 on Contact; tighten overlong meta descriptions (home, AEO, content).

### GEO / LLM hardening
15. Single Instagram canonical profile everywhere.
16. Keep FAQPage on AEO/LLM; extend to GEO + key city SEO pages.
17. Ensure Organization sameAs includes LinkedIn, YouTube, Wikidata/Crunchbase if claimed in brand entity strategy.
18. Optional: `/.well-known/` LLM hints only if you maintain them; otherwise rely on clean `llms.txt`.

---

## 10. What’s already in good shape

- www + HTTPS enforcement (except one bad apex redirect).
- AI crawler allowances in robots.txt.
- Live Rank Math sitemaps + `llms.txt`.
- Flagship SEO / GEO / LLM / AI Video pages: solid titles, Service schema, internal cluster links.
- Many sensible aliases already 301 correctly (`/geo/`, `/dubai-seo/`, `/blog/`, `/contact`, generative-engine-optimization → GEO).
- Search/tag/author archives largely noindexed.

---

## Appendix — inventory counts (2026-08-27)

| Source | Count |
|---|---|
| XML sitemap page URLs | 89 |
| Blog posts in sitemap | 51 + `/blogs/` |
| Service CPT URLs in sitemap | 18 (AEO Mumbai missing) |
| Deep on-page scans | 22 HTML + llms.txt |
| Wrong/alias URL probes | 59 |
| HTML sitemap bad host-relative externals | 3 |

Raw scan artifacts were generated under the agent environment (`/tmp/dgs-scan/`); this document is the durable record in-repo.
