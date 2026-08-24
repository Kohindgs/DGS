# DGS WordPress REST API Audit

**Status:** CURRENTLY VERIFIED BY ARENA — 2026-08-24 (unauthenticated, read-only)
**Base URL:** `https://www.dgeniussolutions.com`
All probes were performed read-only via the public REST API, public sitemaps, and
`robots.txt`. No credentials were used.

---

## 1. API root

`GET /wp-json/`
- Site name: "D'Genius Solutions"
- Site home: `https://www.dgeniussolutions.com`
- `show_on_front: page`, `page_on_front: 63505`, `page_for_posts: 26492`
- Notable namespaces present: `wp/v2`, `fluentform/v1`, `rankmath/v1`, `envira`, `elementor`,
  `elementor-pro`, `wc/v3` (WooCommerce), `jetpack`, `wp-rocket`, `litespeed`, `omapp`,
  `qlwapp` (WhatsApp), `mcp`, `wp-block-editor`, etc.
- Application-password auth endpoint exists: `/wp-admin/authorize-application.php`
  (not used; no credentials).

## 2. Content endpoints (readable unauthenticated)

| Endpoint | Verified result |
| --- | --- |
| `/wp/v2/pages` | returns all public pages (incl. id 63505 home, 38769 about-us, 62460 contact-us, 62421 thank-you, 55736 portfolio, 55355 our-services, 26492 blogs, 39184 sitemap, 3 privacy-policy, 62632 seo-pricing, 64415 case_studies, …) |
| `/wp/v2/posts` | returns dated blog posts (e.g. 65270 "Social Media Conversion…", 65264, 65259, 65256, 65251) |
| `/wp/v2/media` | returns media objects with `source_url` (note: many URLs are Smush-webp rewritten to `/wp-content/smush-webp/…`) |
| `/wp/v2/services` | returns 18 service objects (id, slug, link, modified) — this is the ranking service set |
| `/wp/v2/search` | works |
| `/wp/v2/pages/{id}` | `content.rendered` = **full rendered HTML** (Elementor output baked in) |
| `/wp/v2/posts/{id}` | `content.rendered` full rendered HTML |

## 3. Page metadata exposed (ceiling)

For page 63505 the `meta` object contains exactly:
`_acf_changed`, `om_disable_all_campaigns`, `_monsterinsights_skip_tracking`, `footnotes`.
No `rank_math_*`, no `_elementor_data`, no Yoast/SEO meta.

## 4. Elementor

- `_elementor_data` is NOT exposed via public REST (not in `meta`).
- `elementor/v1` and `elementor-pro/v1` namespaces require authentication.
- `content.rendered` DOES include the rendered Elementor HTML → usable as a temporary
  migration source, but NOT the editable Elementor structure.
- CPT `elementor_library` and `elementor_snippet` exist but are not readable unauth.

## 5. Rank Math

- `rankmath/v1/*` endpoints are auth-gated; `getHead` returned `rest_no_route` (404) as
  probed, and others require auth.
- No `rank_math_*` meta in public responses.
- CPT `rank_math_schema` (schema templates) exists, not readable unauth.
- SEO metadata therefore comes from: previously captured `app/*/_wp_data/meta.json`
  (PREVIOUSLY CAPTURED — not re-verified here) and public `robots.txt`/sitemaps.

## 6. Fluent Forms

- `GET /wp-json/fluentform/v1/forms` → `401 rest_forbidden`.
- No form config, form IDs, or submission route is readable unauth.
- → `FLUENT FORMS BACKEND INTEGRATION — ACCESS REQUIRED`.

## 7. Envira

- CPT `envira` registered; `rest_base: envira-gallery`.
- `GET /wp/v2/envira-gallery?per_page=3` returned `[{"id":63155,"title":{"rendered":""}}]`
  — gallery internals (images/settings) are NOT exposed.
- Envira galleries appear in page content as shortcodes; deeper extraction requires
  `ENVIRA / WORDPRESS ADMIN OR SERVER ACCESS`.
- `astra-portfolio` returned `[]` (empty).

## 8. Navigation / menus

- `GET /wp/v2/menu-items` → `401 rest_cannot_view`.
- `GET /wp/v2/navigation` → not accessible unauth.
- Nav structure must be re-derived from page content/footer/header snapshots (previously
  captured), not from a menu REST endpoint.

## 9. Public files (verified reachable)

- `robots.txt` → generated via `functions.php`; allows all listed AI bots; declares
  `sitemap_index.xml`.
- `sitemap_index.xml` → `post-sitemap.xml`, `page-sitemap.xml`, `services-sitemap.xml`,
  `video-sitemap.xml`, `local-sitemap.xml`.
- `services-sitemap.xml` / `page-sitemap.xml` → contain service routes + a large inline
  media set (client logos, case-study screenshots, award badges). Many URLs rewritten to
  `smush-webp`.

## 10. Known limits to record

- Raw `<head>` HTML (title/meta/OG/Twitter/JSON-LD) is not capturable in this sandbox: the
  page-fetch tool returns markdown (strips tags) and sandbox `curl` egress to
  `dgeniussolutions.com` is blocked (HTTP 000). Use the previously captured
  `_wp_data/meta.json` snapshots as the SEO/schema reference, labelled accordingly.
- No server/SSH/`.htaccess`/PHP access (everything under "server filesystem" is
  `REQUIRES SERVER ACCESS`).
- WooCommerce `product` CPT exists but is not part of the marketing-site ranking scope;
  note it for completeness.

## 11. Extracted route inventory (for next extraction step)

See `docs/DGS-ARENA-CAPABILITY-MAP.md` §5 for the Tier-1 ranking route table. Next step is
to pull each Tier-1 route's full REST record into `data/wordpress/` and produce
`docs/DGS-CONTENT-PARITY.md`.
