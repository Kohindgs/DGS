# DGS URL Parity

Status: in progress

No production URL may disappear unintentionally during the WordPress to Next.js migration.

## Classification

Every current WordPress URL must end in exactly one state:

- `MIGRATED SAME URL`
- `REDIRECT REQUIRED`
- `INTENTIONALLY RETIRED`
- `NOINDEX UTILITY`
- `REQUIRES VERIFICATION`

## Protected routes

| Current URL | Target URL | Status |
| --- | --- | --- |
| `/` | `/` | MIGRATED SAME URL |
| `/about-us/` | `/about-us/` | MIGRATED SAME URL |
| `/services/seo-services-in-mumbai/` | same | MIGRATED SAME URL |
| `/services/aeo-services-in-mumbai/` | same | MIGRATED SAME URL |
| `/services/geo/` | same | MIGRATED SAME URL |
| `/services/llm-seo-service/` | same | MIGRATED SAME URL |
| `/services/ai-video-production-agency/` | same | MIGRATED SAME URL |
| `/services/performance-marketing/` | same | MIGRATED SAME URL |
| `/services/website-development-amc/` | same | MIGRATED SAME URL |
| `/services/social-media-marketing/` | same | MIGRATED SAME URL |
| `/services/branding/` | same | MIGRATED SAME URL |
| `/services/content-creation/` | same | MIGRATED SAME URL |

## New route

| Route | Purpose | Status |
| --- | --- | --- |
| `/portfolio/` | Custom dependency-free DGS portfolio replacing Envira frontend galleries | NEW ROUTE |

## Launch rule

Before DNS/cutover, compare:

1. live WordPress crawl
2. WordPress sitemap inventory
3. Next.js route inventory
4. redirect map
5. canonical targets
6. sitemap output

Any unmatched indexable URL blocks launch until classified.
