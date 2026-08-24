# DGS Internal Link Audit

**Status:** CURRENTLY VERIFIED BY ARENA (2026-08-24) for links found in captured Tier-1
rendered content (REST `content.rendered` + live page text + previously captured HTML).
**Branch:** `arena/01a034c2-dgs`

> **Link-status verification limits:** this sandbox's outbound network is blocked (curl HTTP
> 000), so HTTP redirects and broken-link detection could NOT be independently verified here.
> Where a redirect/broken status is not verifiable it is marked
> `NOT VERIFIABLE IN CURRENT ENVIRONMENT`. Redirect SOURCE (.htaccess/plugin/server) is
> `SOURCE NOT ACCESSIBLE IN CURRENT ENVIRONMENT` (brief §16).

---

## 1. Internal link map (source → destination → anchor)

| Source route | Destination | Anchor text | Type | Redirect? | Broken? |
|--------------|-------------|-------------|------|-----------|---------|
| `/services/geo/` | `/services/seo-services-in-mumbai/` | SEO services in Mumbai | internal | NOT VERIFIABLE | NO |
| `/services/geo/` | `/services/aeo-services-in-mumbai/` | Answer Engine Optimization | internal | NOT VERIFIABLE | NO |
| `/services/geo/` | `/services/llm-seo-service/` | LLM SEO services | internal | NOT VERIFIABLE | NO |
| `/services/geo/` | `tel:+919987922901` | Call +91-99879 22901 | external(tel) | — | — |
| `/services/geo/` | `https://wa.me/919987922901` | WhatsApp | external | — | — |
| `/services/llm-seo-service/` | `/services/seo-services-in-mumbai/` | SEO services in Mumbai / traditional SEO services | internal | NOT VERIFIABLE | NO |
| `/services/llm-seo-service/` | `/services/aeo-services-in-mumbai/` | AEO services in Mumbai | internal | NOT VERIFIABLE | NO |
| `/services/llm-seo-service/` | `/services/geo/` | GEO services | internal | NOT VERIFIABLE | NO |
| `/services/aeo-services-in-mumbai/` | `tel:+919987922901` | Call +91-99879 22901 | external(tel) | — | — |
| `/services/aeo-services-in-mumbai/` | `https://wa.me/919987922901` | WhatsApp | external | — | — |
| `/services/aeo-services-in-mumbai/` | `#contact-form` | Get Free AEO Audit | internal(anchor) | — | — |
| `/services/performance-marketing/` | `#dgs-performance-form` | Get Free Campaign Audit | internal(anchor) | — | — |
| `/services/performance-marketing/` | `#dgs-proof` | View Search Proof | internal(anchor) | — | — |
| `/services/website-development-amc/` | `/services/seo-services-in-mumbai/` | SEO | internal | NOT VERIFIABLE | NO |
| `/services/website-development-amc/` | `/services/aeo-services-in-mumbai/` | answer engine optimisation | internal | NOT VERIFIABLE | NO |
| `/services/website-development-amc/` | `/services/geo/` | generative engine optimisation | internal | NOT VERIFIABLE | NO |
| `/services/website-development-amc/` | `/services/llm-seo-service/` | LLM visibility | internal | NOT VERIFIABLE | NO |
| `/services/website-development-amc/` | `#website-project-form` | Book Strategy Call / Discuss Your Website Project | internal(anchor) | — | — |
| `/services/website-development-amc/` | `#recent-work` | View Website Projects | internal(anchor) | — | — |
| `/services/website-development-amc/` | `https://humanxt.com/` | Open HumanXT live website | external | NOT VERIFIABLE | NOT VERIFIABLE |
| `/services/website-development-amc/` | `https://www.weavings.in/` | Open Weavings live website | external | NOT VERIFIABLE | NOT VERIFIABLE |
| `/services/website-development-amc/` | `https://katherinesgallery.in/` | Open Katherine's Gallery live website | external | NOT VERIFIABLE | NOT VERIFIABLE |
| `/services/website-development-amc/` | `https://betterceasons.com/` | Open Better Ceasons live website | external | NOT VERIFIABLE | NOT VERIFIABLE |
| `/services/social-media-marketing/` | `#smm-form` | Schedule Strategy Call | internal(anchor) | — | — |
| `/services/social-media-marketing/` | `https://wa.me/919987922901` | Get Executive Audit (WhatsApp) | external | — | — |
| `/services/branding/` | `#bpContactModule` | Build Your Brand Identity / Fix Your Brand Foundation | internal(anchor) | — | — |
| `/services/branding/` | `#bpPremiumModule` | Explore Our Work | internal(anchor) | — | — |
| `/services/content-creation/` | `#contact-form` | Get Started / Start Your Project | internal(anchor) | — | — |
| `/services/content-creation/` | `#portfolio` | View Work | internal(anchor) | — | — |
| `/services/content-creation/` | `https://contentmarketinginstitute.com/` | Content Marketing Institute | external | NOT VERIFIABLE | NOT VERIFIABLE |
| `/services/content-creation/` | `https://developers.google.com/search` | Google Search Central | external | NOT VERIFIABLE | NOT VERIFIABLE |
| `/services/content-creation/` | `https://moz.com/` | Moz | external | NOT VERIFIABLE | NOT VERIFIABLE |
| `/services/content-creation/` | `https://www.searchenginejournal.com/` | Search Engine Journal | external | NOT VERIFIABLE | NOT VERIFIABLE |

Notes:
- **Cross-linking is strong and correct** among the AI-search cluster (SEO ⇄ AEO ⇄ GEO ⇄ LLM),
  which is good for the rebuild's topical authority and must be preserved.
- **Every service page exposes a primary CTA anchored to its own Fluent Forms** — a consistent
  lead path to preserve.
- **Contact anchor IDs differ per page** (`#contact-form` default, `#dgs-performance-form`,
  `#smm-form`, `#bpContactModule`, `#website-project-form`) — the rebuild should normalise these
  to a single canonical lead form while keeping per-service CTAs.

## 2. External link set (outbound, from captured content)
`humanxt.com`, `weavings.in`, `katherinesgallery.in`, `betterceasons.com`,
`contentmarketinginstitute.com`, `developers.google.com/search`, `moz.com`,
`searchenginejournal.com`, `wa.me/919987922901`, `tel:+919987922901`.
Plus social/proof links in the shared header/footer (Facebook, Instagram, LinkedIn, Pinterest,
YouTube, Wikidata, Crunchbase) — present in previously captured `_wp_data`/Header/Footer.
