<USER_REQUEST>
# DGS — WEBSITE DEVELOPMENT PAGE REBUILD + BLOG IMAGE REPAIR
## FINAL ANTIGRAVITY IMPLEMENTATION PROMPT

**PROJECT:** D'Genius Solutions  
**WEBSITE:** https://www.dgeniussolutions.com  
**REPOSITORY:** `Kohindgs/DGS`  
**PRIMARY PAGE:** `/services/website-development-amc/`

**CONTINUE FROM THE CURRENT PROJECT AND PRODUCTION STATE. DO NOT RESTART THE PROJECT.**

This task has TWO priorities:

1. Repair the two confirmed broken blog images.
2. Correct and professionally rebuild the existing Website Development & AMC page.

Complete both workstreams with independent verification.

### CRITICAL PROTECTION RULES

Do not modify or regress:

- Homepage and its eight curated AI videos.
- AI Video Production pages and their 56-video library.
- Main Portfolio and its complete legacy and AI work.
- Portfolio filters, Load More, CTA and video playback.
- Search Console data accuracy.
- Blog CMS publishing functionality.
- Existing website forms and lead storage.
- Global navigation, footer or unrelated pages.

Do not create a new Website Development URL.

Do not introduce new plugins or paid services without approval.

Do not claim success until the active live production release has been tested.

---

# PHASE 1 — FIX TWO BROKEN BLOG IMAGES FIRST

## 1. Confirmed live errors

A live browser audit of:

`https://www.dgeniussolutions.com/blogs/`

found exactly two visible broken images.

Both returned HTTP 404 and had `naturalWidth = 0`.

**BROKEN IMAGE 1**

Article:

`/blogs/google-september-2026-spam-update-what-website-owners-should-know/`

Image:

`/cms-media/uploads/google-september-2026-spam-update-what-website-owners-should-know.webp`

**BROKEN IMAGE 2**

Article:

`/blogs/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads/`

Image:

`/cms-media/uploads/google-ads-for-b2b-lead-generation-how-to-get-better-quality-leads.webp`

These errors have been diagnosed but not yet repaired.

## 2. Identify the real media failure

Inspect:

- Blog CMS records and featured image references.
- Actual files in production persistent media storage.
- `/cms-media/uploads/` URL mappings.
- Nginx/Apache/static serving configuration.
- Next.js media routes, if relevant.
- Filename spelling, extension and case.
- Media migration
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-14T18:30:21+05:30.
</ADDITIONAL_METADATA>