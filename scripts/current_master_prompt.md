<USER_REQUEST>
# DGS — COMBINED WEBSITE CORRECTION MASTER PROMPT
## Original Design Restoration + Interactive Client Previews + Dubai SEO Title + FAQ Schema

**Project:** D'Genius Solutions  
**Website:** https://www.dgeniussolutions.com  
**Repository:** `Kohindgs/DGS`  
**Working branch:** `feature/turbovec-cms-intelligence`

**CONTINUE FROM THE CURRENT PROJECT STATE. DO NOT RESTART THE DEVELOPMENT OR REDESIGN EITHER PAGE.**

There are TWO independent workstreams:

**WORKSTREAM A — WEBSITE DEVELOPMENT & AMC**

Restore the original design, alignment and section presentation. Modify only the existing client website preview placeholders so they display an authentic top-to-bottom website scroll on hover.

**WORKSTREAM B — DUBAI AI VIDEO PRODUCTION**

Correct Google's outdated search-result title signals, validate FAQ structured data, preserve the existing indexed URL and improve metadata consistency.

Both workstreams must be independently tested, committed and verified.

---

# GLOBAL NON-NEGOTIABLE RULES

Before changing anything:

1. Check the latest GitHub HEAD.
2. Check the current active Hostinger VPS production SHA.
3. Check whether any deployment is already running.
4. Preserve a rollback reference.
5. Identify the exact files and selectors affected.
6. Do not remove unrelated changes or untracked files.
7. Do not change global CSS unless absolutely necessary and independently verified.

**DO NOT MODIFY:**

- Homepage design and eight curated AI videos.
- Main Portfolio and its complete work archive.
- AI Production's 56-video portfolio.
- Load More functionality.
- Portfolio filters and lightbox.
- Blog CMS and repaired featured images.
- Other service pages.
- Existing lead forms.
- Shared navigation and footer.
- SEO rankings, canonicals or URLs unrelated to these workstreams.

Do not introduce unsupported claims, fabricated performance statistics or new services.

---

# WORKSTREAM A — RESTORE WEBSITE DEVELOPMENT PAGE

## A1. Exact page

`/services/website-development-amc/`

The page's look and alignment changed when the consolidated redesign was introduced in commit:

`f188b56`

The previous appearance can be inspected using:

`62c3ff7`

The FAQ fixes were subsequently developed in:

`dcda8e7` and `23c4f34`

**IMPORTANT: Restore the previous VISUAL PRESENTATION, not the old page's duplicated content or broken interactions.**

Do not blindly revert the entire Git branch or restore obsolete content.

Use the previous version as a visual reference while retaining validated technical improvements.

## A2. Restore the original appearance

Preserve the previous visual design, including:

- Page canvas and width.
- Section alignment.
- Content alignment.
- Existing colour palette.
- Background effects.
- Heading typography.
- Section spacing.
- Card dimensions.
- Case-study layout.
- Image frame dimensions.
- Border radii.
- Buttons.
- Hover styling.
- Mobile responsiveness.
- Desktop and 4K presentation.

The user did not request a redesign.

**DO NOT create a new card layout, add oversized image frames or reposition content.**

Audit and remove only the unintended CSS overrides introduced during the redesign.

Pay particular attention to:

`lib/wp-exact/inner-mirror-overrides.css`

and:

`data/wordpress/mirrors/pages/services__website-development-amc.json`

If generation scripts are still authoritative, update the correct source so future builds do not overwrite the restoration.

## A3. Preserve existing Website Development content

Keep the existing useful content and genuine case studies.

Do not undertake another SEO rewrite or rearrange the page structure during this task.

Preserve:

- Website Development commercial H1 and title.
- Services and platform information.
- Development process.
- Verified case studies.
- AMC information.
- Existing FAQ answers.
- Form 6.
- Canonical and structured data.
- Internal links.

Only adjust content if required to correct an actual functional defect.

---

# A4. EXACT INTERACTIVE PREVIEW REQUIREMENT

The user wants the **existing website image placeholder to show the actual client website scrolling from its top to its bottom when hovered over**.

Nothing outside the placeholder should change.

The interaction must remain inside the existing `.w-img` preview area.

Four websites:

| Project | Website |
|---|---|
| HumanXT | https://humanxt.com/ |
| Weavings | https://www.weavings.in/ |
| Katherine's Gallery | https://katherinesgallery.in/ |
| Better Ceasons | https://betterceasons.com/ |

## A5. How the preview must work

**Normal state**

Show the authentic first screen of the client website.

The screenshot must show the correct website navigation and hero content.

No distorted proportions, zoomed cropping or missing text.

**On desktop hover**

- Start from the very top of the client website.
- Smoothly scroll down through the real website.
- Continue to the bottom of the captured page.
- Keep the preview inside the existing frame.
- Do not move or resize the surrounding project card.
- Moving the pointer away pauses and resets the preview.
- Re-entering the card starts from the top.
- Keep the existing **OPEN LIVE WEBSITE** link operational.

**On mobile**

- Show a clear play/preview affordance.
- A tap starts the scrolling demonstration.
- Provide a separate link to open the actual website.
- Avoid hijacking the visitor's page scroll.
- Respect reduced-motion preferences.

## A6. Recommended technical implementation

Use Playwright to capture an authentic full-page website screenshot or screen recording for each website.

For a full-page screenshot:

1. Capture the real rendered website at a consistent desktop viewport.
2. Preserve its full vertical content.
3. Display the top of that capture inside the existing `.w-img`.
4. Animate vertical translation through the screenshot inside the fixed viewport.
5. Calculate the scroll distance from the actual rendered dimensions.
6. Do not distort the capture horizontally.
7. Reset on mouse leave.
8. Provide a fallback static preview.

A real browser screen recording with smooth top-to-bottom scrolling is also acceptable if it is more reliable.

Choose the approach that preserves the website's visual fidelity and page performance.

Do not depend on manipulating a third-party iframe across origins.

Do not create an AI-generated approximation of the client's website.

Do not use `object-fit: cover` where it crops navigation or important website text.

## A7. HumanXT specific correction

The user reported that the HumanXT preview is cropped.

The authentic HumanXT website has approximately 7,528px of scrollable content in a tested desktop viewport.

Verify the current rendered site and capture it correctly.

The first frame must show the website's actual top section without horizontal clipping.

Hovering must show later sections as the scroll progresses.

**The surrounding DGS case-study card must remain visually identical to its original design.**

## A8. Restore functional FAQ interaction

The Website Development FAQ must continue functioning after the visual restoration.

Verify all 11 FAQ questions.

Each must:

- Open on click.
- Close on a second click.
- Display the complete answer.
- Expose correct `aria-expanded` state.
- Work with keyboard navigation.
- Work on mobile.

Check that the native fallback and React/client-side event handlers are not toggling the same FAQ twice.

Use one reliable interaction authority.

Do not redesign the FAQ appearance.

## A9. Website Development structured data

Preserve existing valid structured data.

Verify the final rendered page has appropriate:

- Organization
- WebPage
- Service
- BreadcrumbList
- FAQPage, if applicable

Avoid duplicated or conflicting schemas.

Keep FAQ questions and answers consistent with visible content.

Do not expect FAQPage markup to produce Google's discontinued FAQ rich-result display.

---

# WORKSTREAM B — DUBAI AI PRODUCTION SEO CORRECTION

## B1. Exact target

`https://www.dgeniussolutions.com/services/ai-production-dubai-page/`

Google currently displays the outdated search-result title:

**1. AI Production Dubai page**

However, the existing HTML title is already:

**AI Video Production Agency in Dubai | D'Genius Solutions**

The page has:

- HTTP 200.
- Indexing allowed.
- Matching Google-selected and declared canonicals.
- A visible commercial H1.
- Existing portfolio, content and FAQs.

**Do not assume a slug change is necessary.**

## B2. Existing Search Console evidence

Previous Search Console inspection reported:

- Status: Submitted and indexed.
- Last recorded Google crawl: September 10, 2026.
- Google-selected canonical: existing Dubai page URL.
- Indexing permitted.

Recorded September 15–October 12 performance:

- 18 impressions.
- 2 clicks.
- Average position: 10.83.

These are historical baseline figures, not guaranteed current rankings.

Refresh the actual GSC data before reporting updated metrics.

## B3. Find the old title signal

Investigate why Google still displays:

`1. AI Production Dubai page`

Check:

- WordPress source record `64236`.
- Historical WordPress page title.
- Current Next.js route registry.
- `lib/seo/page-overrides.ts`.
- `<title>` in server-rendered HTML.
- Open Graph and Twitter titles.
- Main H1.
- Breadcrumb labels.
- Structured-data names.
- Internal-link anchor text.
- Services archive card title.
- Sitemap entries.
- Legacy WordPress metadata.
- Any heading, navigation or content containing the old generic title.
- Possible stale Google crawl/index data.

Remove obsolete public-facing generic labels where found, but do not delete data simply because it contains a historical reference.

Do not assume the exact cause without evidence.

## B4. Required final metadata

**Title**

`AI Video Production Agency in Dubai | D'Genius Solutions`

**H1**

`AI Video Production Agency in Dubai for Ads, Reels & Brand Films`

**Canonical**

`https://www.dgeniussolutions.com/services/ai-production-dubai-page/`

**Open Graph and Twitter title**

Keep consistent with the title.

**Meta description**

Review the existing 183-character description and refine it if needed for clarity and commercial relevance.

Do not change the page's visual layout.

Do not change the portfolio or existing video assets.

## B5. Keep the indexed slug

Retain:

`/services/ai-production-dubai-page/`

Google already recognizes this URL as the canonical.

Do not create a competing URL or redirect it merely to influence the displayed title.

A URL migration is a separate decision requiring evidence, a 301 redirect plan and approval.

---

# B6. DUBAI FAQ SCHEMA

The current Dubai AI Production page contains **9 visible FAQ questions and answers**.

The imported page already uses Schema.org microdata for:

- FAQPage
- Question
- Answer

However, the route registry has an empty `faqItems` array, and FAQ JSON-LD generation has not been independently confirmed in the final rendered page.

Check the actual HTML produced by Next.js and the existing schema builder:

`lib/schema/page-schemas.ts`

Do not blindly create duplicate FAQPage entities.

## B7. Required FAQ validation

Verify the nine existing questions and their answers.

Ensure that:

- All nine questions are present in rendered HTML.
- Answers are crawlable.
- The accordions work.
- Schema questions match the visible text.
- `acceptedAnswer.text` matches the corresponding answer.
- The canonical URL is consistent.
- There are no duplicate FAQPage entities.
- There are no contradictory representations.

If JSON-LD is adopted, use one authoritative FAQ dataset rather than maintaining two independently editable sets of answers.

Validate with Schema Markup Validator.

Do not promise Google's former FAQ rich-result display.

## B8. Other Dubai structured data

Audit:

- Organization
- WebSite/WebPage
- Service
- BreadcrumbList
- VideoObject
- FAQPage, if retained

Ensure stable `@id` references.

Verify video URLs, thumbnails and upload dates before publishing VideoObject entries.

Use real existing video assets.

Use:

Dubai and United Arab Emirates

as service areas where appropriate.

Do not invent a Dubai office or local address.

## B9. Dubai SEO relevance

Preserve natural relevance for:

- AI video production agency in Dubai
- AI video production company Dubai
- AI video production services Dubai
- AI video ads Dubai
- AI product videos Dubai
- AI brand films UAE
- AI video production house Dubai
- Generative AI video production Dubai

Use current GSC evidence to prioritize queries.

Do not keyword-stuff headings or replace existing copy unnecessarily.

Check internal linking from relevant Dubai service pages and the primary AI Video Production page.

Avoid cannibalization between these pages.

---

# WORKSTREAM C — TESTING AND RELEASE

## C1. Independent testing

Test both pages separately.

**Website Development**

- Previous appearance restored.
- Section and card alignments match the approved original.
- HumanXT preview starts at the website's top.
- HumanXT preview scrolls to the bottom.
- All four project previews work.
- No image cropping.
- No surrounding layout movement.
- Mobile preview controls work.
- All 11 FAQs work.
- Form 6 remains operational.
- Metadata and canonical remain unchanged.

**Dubai AI Production**

- Correct rendered title.
- Correct H1.
- Correct canonical.
- No obsolete generic public-facing title.
- All nine FAQs displayed and functional.
- Schema validated.
- No duplicate FAQ entities.
- Video portfolio preserved.
- Load More preserved.
- Form 9 preserved.
- No page redesign.

## C2. Responsive QA

Test at:

390px, 768px, 1024px, 1440px, 1920px, 2560px and 3840px.

Check:

- Layout alignment.
- Text readability.
- No horizontal overflow.
- No clipped images.
- Consistent card sizes.
- Buttons and form functionality.
- JavaScript console.
- Lazy-loading and performance.
- Keyboard and mobile interaction.

## C3. Build checks

Run a genuine fresh:

`npm run typecheck`

`npm run build`

`git diff --check`

Do not accept an existing `.next/BUILD_ID` as proof that a fresh build passed.

## C4. Separate commits

Create separate commits for:

**Commit A:** Website Development original appearance restoration and website-preview interactions.

**Commit B:** Dubai SEO title-signal and FAQ schema corrections.

Do not mix unrelated site changes into these commits.

## C5. Production deployment

After local QA passes:

1. Verify no deployment is running.
2. Perform the established atomic deployment.
3. Confirm the full active production SHA.
4. Purge affected caches when necessary.
5. Run browser QA against the active live release.
6. Preserve rollback capability.

Do not report successful deployment while the previous release is still active.

---

# C6. EVIDENCE REQUIRED

**Website Development**

- Previous-versus-restored design comparison at 1920px.
- Original card alignment screenshot.
- HumanXT initial preview screenshot.
- HumanXT scrolled preview screenshot.
- Short recording showing actual scroll.
- Other three project preview screenshots/recordings.
- Mobile screenshot.
- FAQ expanded screenshot.

**Dubai AI Production**

- Live metadata verification.
- Rendered schema inventory.
- Nine FAQ validation results.
- Correct H1 and canonical screenshot.
- Search Console URL Inspection results.
- GSC baseline and current available performance.

Note: Google's public search-result title may remain unchanged until a subsequent crawl. Distinguish website corrections from Google's indexing update.

---

# C7. FINAL ACCEPTANCE REPORT

Return a clear table covering:

| Requirement | PASS / FAIL |
|---|---|
| Original Website Development design restored | |
| Original layout and alignment preserved | |
| HumanXT website preview scrolling | |
| Weavings website preview scrolling | |
| Katherine's Gallery preview scrolling | |
| Better Ceasons preview scrolling | |
| All Website Development FAQs functional | |
| Website Development form operational | |
| Dubai HTML title correct | |
| Dubai H1 correct | |
| Dubai canonical retained | |
| Obsolete Dubai title signals reviewed | |
| Nine Dubai FAQs validated | |
| Dubai structured data valid | |
| AI video library preserved | |
| Load More preserved | |
| Homepage and Portfolio regressions | |
| Typecheck | |
| Fresh build | |
| Live Playwright | |
| Production SHA verified | |

Provide commit hashes, changed files, browser evidence, deployment result and outstanding issues.

## NON-NEGOTIABLE FINAL INSTRUCTION

**DO NOT REDESIGN THE WEBSITE.**

The Website Development task is specifically to restore the earlier visual alignment and enable real scrolling client website previews **inside the existing image placeholders only**.

The Dubai task is specifically to correct obsolete Google title signals and validate structured data **without changing the URL or design**.

Complete both tasks with surgical changes and live verification.

**FINAL STATUS MUST BE: VERIFIED WORKING LIVE or NOT READY — WITH EXACT REMAINING FAILURES.**
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-15T10:57:08+05:30.
</ADDITIONAL_METADATA>