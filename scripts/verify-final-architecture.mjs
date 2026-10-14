import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://www.dgeniussolutions.com';
const ARTIFACTS_DIR = 'C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7';

const master = JSON.parse(fs.readFileSync('data/portfolio/master-portfolio.json', 'utf8'));

console.log('Target BASE_URL:', BASE_URL);
console.log('Artifacts Directory:', ARTIFACTS_DIR);

const results = {
  dataQa: {
    masterTotal: master.length,
    aiVideoTotal: master.filter(m => m.workType === 'ai-video').length,
    socialMediaTotal: master.filter(m => m.workType === 'social-media').length,
    brandingTotal: master.filter(m => m.workType === 'branding').length,
    creativeDesignTotal: master.filter(m => m.workType === 'creative-design').length,
    otherWorkTotal: master.filter(m => m.workType === 'other-work').length,
    homepageCuratedTotal: master.filter(m => m.homepageFeatured).length
  },
  tests: []
};

function recordTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${details ? '(' + details + ')' : ''}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // ----------------------------------------------------
    // TEST 1: HOMEPAGE AI VIDEO SECTION & CURATED PREVIEW
    // ----------------------------------------------------
    console.log('\n--- Testing Homepage (/) ---');
    let videoRequests = 0;
    page.on('request', req => {
      const url = req.url();
      if (req.resourceType() === 'media' || /\.(mp4|webm)$/i.test(url)) {
        videoRequests++;
      }
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    const portfolioSection = page.locator('#portfolio');
    const isPortfolioVisible = await portfolioSection.isVisible().catch(() => false);
    recordTest('Homepage: #portfolio Section Visible', isPortfolioVisible);

    const cards = page.locator('#portfolio .gallery-item');
    const cardCount = await cards.count();
    recordTest('Homepage: Curated Cards Count 6-9 (Preferred 8)', cardCount === 8, `Found ${cardCount}`);

    recordTest('Homepage: Zero Preload Full-Video Requests', videoRequests === 0, `Video requests: ${videoRequests}`);

    // Verify first client representations (Hyundai, Sundaram, Clarion, Better Ceasons)
    const cardTexts = await cards.allInnerTexts();
    const joinedText = cardTexts.join(' ').toLowerCase();
    const hasHyundai = joinedText.includes('hyundai');
    const hasSundaram = joinedText.includes('sundaram');
    const hasClarion = joinedText.includes('clarion');
    const hasBetterCeasons = joinedText.includes('better ceasons');
    recordTest('Homepage: Key Clients Present', hasHyundai && hasSundaram && hasClarion && hasBetterCeasons,
      `Hyundai: ${hasHyundai}, Sundaram: ${hasSundaram}, Clarion: ${hasClarion}, BetterCeasons: ${hasBetterCeasons}`);

    // Verify section CTA
    const sectionCta = page.locator('#portfolio a:has-text("VIEW ALL AI VIDEO WORK")');
    const hasSectionCta = await sectionCta.isVisible().catch(() => false);
    const ctaHref = hasSectionCta ? await sectionCta.getAttribute('href') : '';
    recordTest('Homepage: Section CTA "VIEW ALL AI VIDEO WORK" Exists', hasSectionCta && ctaHref?.includes('/services/ai-video-production-agency/'), `href: ${ctaHref}`);

    // Verify NO Load More on homepage
    const homeLoadMore = page.locator('#portfolio #load-more-btn');
    const isHomeLoadMoreVisible = await homeLoadMore.isVisible().catch(() => false);
    recordTest('Homepage: NO Load More Button', !isHomeLoadMoreVisible, `Visible: ${isHomeLoadMoreVisible}`);

    // Capture HOMEPAGE_AI_VIDEO_8_ITEMS.png
    await portfolioSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const homeScreenshotPath = path.join(ARTIFACTS_DIR, 'HOMEPAGE_AI_VIDEO_8_ITEMS.png');
    await page.screenshot({ path: homeScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${homeScreenshotPath}`);

    // Verify Card Click Redirect to AI Video Production
    const firstCard = cards.first();
    const [response] = await Promise.all([
      page.waitForNavigation({ timeout: 15000 }).catch(() => null),
      firstCard.click()
    ]);
    const currentUrl = page.url();
    const redirectedToAiProduction = currentUrl.includes('/services/ai-video-production-agency/');
    recordTest('Homepage: Card Click Redirects to AI Video Production', redirectedToAiProduction, `URL: ${currentUrl}`);

    // Capture HOMEPAGE_AI_CARD_REDIRECT.png
    const redirectScreenshotPath = path.join(ARTIFACTS_DIR, 'HOMEPAGE_AI_CARD_REDIRECT.png');
    await page.screenshot({ path: redirectScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${redirectScreenshotPath}`);

    // ----------------------------------------------------
    // TEST 2: AI VIDEO PRODUCTION PAGE
    // ----------------------------------------------------
    console.log('\n--- Testing AI Video Production Page ---');
    await page.goto(`${BASE_URL}/services/ai-video-production-agency/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    const initialAiCount = await page.locator('#portfolio-gallery .gallery-item:not(.is-hidden)').count();
    recordTest('AI Production: Initial Visible Batch = 12', initialAiCount === 12, `Found ${initialAiCount}`);

    const filterTabs = page.locator('#portfolio-filters .portfolio-filter-tab');
    const filterCount = await filterTabs.count();
    recordTest('AI Production: Filter Tabs Exist', filterCount >= 10, `Found ${filterCount}`);

    // Check Load More Button on AI Production
    const loadMoreBtn = page.locator('#load-more-btn');
    const isLoadMoreVisible = await loadMoreBtn.isVisible().catch(() => false);
    const loadMoreText = isLoadMoreVisible ? await loadMoreBtn.innerText() : '';
    recordTest('AI Production: Load More Button Visible with Countdown', isLoadMoreVisible && loadMoreText.includes('44 REMAINING'), `Text: ${loadMoreText}`);

    // Capture AI_PRODUCTION_ALL_AI.png & AI_PRODUCTION_FILTERS.png & AI_PRODUCTION_LOAD_MORE.png
    const aiAllScreenshotPath = path.join(ARTIFACTS_DIR, 'AI_PRODUCTION_ALL_AI.png');
    await page.screenshot({ path: aiAllScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${aiAllScreenshotPath}`);

    const aiFiltersNav = page.locator('#portfolio-filters');
    await aiFiltersNav.scrollIntoViewIfNeeded();
    const aiFiltersScreenshotPath = path.join(ARTIFACTS_DIR, 'AI_PRODUCTION_FILTERS.png');
    await page.screenshot({ path: aiFiltersScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${aiFiltersScreenshotPath}`);

    await loadMoreBtn.scrollIntoViewIfNeeded();
    const aiLoadMoreScreenshotPath = path.join(ARTIFACTS_DIR, 'AI_PRODUCTION_LOAD_MORE.png');
    await page.screenshot({ path: aiLoadMoreScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${aiLoadMoreScreenshotPath}`);

    // ----------------------------------------------------
    // TEST 3: MAIN /PORTFOLIO/ PAGE (TWO-LEVEL FILTERING & MASTER ARCHIVE)
    // ----------------------------------------------------
    console.log('\n--- Testing Main /portfolio/ Page ---');
    await page.goto(`${BASE_URL}/portfolio/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Primary Filters
    const primaryPills = page.locator('button:has-text("ALL WORK"), button:has-text("AI VIDEO"), button:has-text("SOCIAL MEDIA"), button:has-text("BRANDING"), button:has-text("CREATIVE DESIGN")');
    const primaryPillCount = await primaryPills.count();
    recordTest('Main Portfolio: Primary Filters (All, AI, Social, Branding, Creative) Present', primaryPillCount >= 5, `Found ${primaryPillCount}`);

    // Capture PORTFOLIO_ALL_WORK.png
    const portfolioAllScreenshotPath = path.join(ARTIFACTS_DIR, 'PORTFOLIO_ALL_WORK.png');
    await page.screenshot({ path: portfolioAllScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${portfolioAllScreenshotPath}`);

    // Click "AI VIDEO" primary filter
    const aiVideoPill = page.locator('button:has-text("AI VIDEO")').first();
    await aiVideoPill.click();
    await page.waitForTimeout(500);

    // Check if AI Subfilters appear
    const aiSubfilterBar = page.locator('nav[aria-label="AI Video category subfilters"]');
    const isAiSubfilterVisible = await aiSubfilterBar.isVisible().catch(() => false);
    recordTest('Main Portfolio: Secondary AI Subfilter Row Revealed on AI VIDEO', isAiSubfilterVisible);

    const subfilterButtons = aiSubfilterBar.locator('button');
    const subfilterCount = await subfilterButtons.count();
    recordTest('Main Portfolio: AI Subfilters Present & > 0', subfilterCount >= 10, `Found ${subfilterCount} subfilters`);

    // Capture PORTFOLIO_AI_VIDEO.png & PORTFOLIO_AI_SUBFILTERS.png
    const portfolioAiScreenshotPath = path.join(ARTIFACTS_DIR, 'PORTFOLIO_AI_VIDEO.png');
    await page.screenshot({ path: portfolioAiScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${portfolioAiScreenshotPath}`);

    await aiSubfilterBar.scrollIntoViewIfNeeded();
    const portfolioAiSubScreenshotPath = path.join(ARTIFACTS_DIR, 'PORTFOLIO_AI_SUBFILTERS.png');
    await page.screenshot({ path: portfolioAiSubScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${portfolioAiSubScreenshotPath}`);

    // Click "SOCIAL MEDIA" primary filter
    const socialMediaPill = page.locator('button:has-text("SOCIAL MEDIA")').first();
    await socialMediaPill.click();
    await page.waitForTimeout(500);
    const isSubfilterHiddenOnSocial = !(await aiSubfilterBar.isVisible().catch(() => false));
    recordTest('Main Portfolio: Secondary Subfilter Row Auto-Hides on Non-AI Filter', isSubfilterHiddenOnSocial);

    const socialCards = page.locator('article[data-media-kind]');
    const socialCount = await socialCards.count();
    recordTest('Main Portfolio: Social Media Items Displayed', socialCount > 0, `Visible count: ${socialCount}`);

    // Capture PORTFOLIO_SOCIAL_MEDIA.png
    const portfolioSocialScreenshotPath = path.join(ARTIFACTS_DIR, 'PORTFOLIO_SOCIAL_MEDIA.png');
    await page.screenshot({ path: portfolioSocialScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${portfolioSocialScreenshotPath}`);

    // Click "BRANDING" primary filter
    const brandingPill = page.locator('button:has-text("BRANDING")').first();
    await brandingPill.click();
    await page.waitForTimeout(500);
    const brandingCards = page.locator('article[data-media-kind]');
    const brandingCount = await brandingCards.count();
    recordTest('Main Portfolio: Branding Items Displayed', brandingCount > 0, `Visible count: ${brandingCount}`);

    // Capture PORTFOLIO_BRANDING.png
    const portfolioBrandingScreenshotPath = path.join(ARTIFACTS_DIR, 'PORTFOLIO_BRANDING.png');
    await page.screenshot({ path: portfolioBrandingScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${portfolioBrandingScreenshotPath}`);

    // Click "CREATIVE DESIGN" primary filter
    const creativePill = page.locator('button:has-text("CREATIVE DESIGN")').first();
    await creativePill.click();
    await page.waitForTimeout(500);
    const creativeCards = page.locator('article[data-media-kind]');
    const creativeCount = await creativeCards.count();
    recordTest('Main Portfolio: Creative Design Items Displayed', creativeCount > 0, `Visible count: ${creativeCount}`);

    // Capture PORTFOLIO_CREATIVE.png
    const portfolioCreativeScreenshotPath = path.join(ARTIFACTS_DIR, 'PORTFOLIO_CREATIVE.png');
    await page.screenshot({ path: portfolioCreativeScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${portfolioCreativeScreenshotPath}`);

  } catch(err) {
    console.error('Error during QA execution:', err);
    recordTest('Execution Exception', false, err.message);
  } finally {
    await browser.close();
  }

  // Save QA Results Artifact
  const qaResultsPath = path.join(ARTIFACTS_DIR, 'final_architecture_qa_results.json');
  fs.writeFileSync(qaResultsPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved QA results artifact to: ${qaResultsPath}`);

  const passedTests = results.tests.filter(t => t.passed).length;
  const totalTests = results.tests.length;
  console.log(`\n=============================================`);
  console.log(`QA SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`=============================================`);
}

run();
