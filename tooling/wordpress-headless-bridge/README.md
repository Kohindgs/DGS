# DGS WordPress Headless Bridge

Purpose: keep WordPress available only as the DGS fallback CMS/forms/media backend while the public website remains Next.js at `https://www.dgeniussolutions.com`.

## Public behavior

Normal WordPress frontend requests are permanently redirected to the same path on the Next.js site.

Examples:
- `/` -> `https://www.dgeniussolutions.com/`
- `/blogs/example/` -> `https://www.dgeniussolutions.com/blogs/example/`
- `/services/example/` -> `https://www.dgeniussolutions.com/services/example/`

## Backend paths preserved

- `/wp-login.php`
- `/wp-admin/*`
- `/wp-admin/admin-ajax.php`
- `/wp-json/*`
- `/wp-content/uploads/*`
- WordPress cron/AJAX requests

## Search behavior

- Sends `X-Robots-Tag: noindex, nofollow, noarchive` from WordPress.
- Disables WordPress core sitemaps.
- Disables Rank Math sitemap output.

## Form bridge

`GET /wp-json/dgs/v1/form-context?form_id=<id>&post_id=<id>` renders the Fluent Form server-side and returns its HTML so Next.js can obtain the current Fluent Forms nonce without requesting a WordPress frontend page.

Next.js prefers this endpoint and temporarily retains the legacy page-context lookup as a migration fallback. Once the bridge is installed and verified, the legacy fallback can be removed.

## Install

Upload `dgs-headless-bridge.zip` in WordPress Plugins > Add New > Upload Plugin, activate it, then run the DGS form backend health check before removing the legacy fallback.
