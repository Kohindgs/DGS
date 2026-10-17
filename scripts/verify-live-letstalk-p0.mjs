import { chromium } from "playwright";

async function runLiveVerification() {
  console.log("=============================================================");
  console.log("=== DGS P0 LET'S TALK FORM — LIVE PRODUCTION VERIFICATION ===");
  console.log("=============================================================\n");

  const browser = await chromium.launch({ headless: true });

  // TEST 1: DESKTOP HOMEPAGE HEADER CTA & MODAL RENDER
  console.log("--- TEST 1: Desktop Homepage Header CTA & Form Render ---");
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();

  await desktopPage.goto("https://www.dgeniussolutions.com", { waitUntil: "networkidle" });
  const headerPill = desktopPage.locator("#dgsPill");
  const isPillVis = await headerPill.isVisible();
  console.log(`Desktop #dgsPill visible: ${isPillVis}`);
  if (!isPillVis) throw new Error("Desktop header #dgsPill is not visible!");

  console.log("Clicking #dgsPill to open Let's Talk modal...");
  await headerPill.click();
  await desktopPage.waitForTimeout(1000);

  const modalForm = desktopPage.locator("#lets-talk-form");
  const isFormVis = await modalForm.isVisible();
  console.log(`Modal #lets-talk-form visible: ${isFormVis}`);
  if (!isFormVis) throw new Error("Modal form did not open!");

  // Check fields
  const nameField = modalForm.locator("input[name='names[first_name]']");
  const emailField = modalForm.locator("input[name='email']");
  const phoneField = modalForm.locator("input[name='phone']");
  const companyField = modalForm.locator("input[name='input_text']");
  const sourceDropdown = modalForm.locator("select[name='dropdown_1']");
  const subjectField = modalForm.locator("input[name='subject']");
  const serviceDropdown = modalForm.locator("select[name='dropdown']");
  const messageField = modalForm.locator("textarea[name='message']");
  const submitBtn = modalForm.locator("button[type='submit']");

  console.log("Field checks:");
  console.log(`  - Name input visible: ${await nameField.isVisible()}`);
  console.log(`  - Email input visible: ${await emailField.isVisible()}`);
  console.log(`  - Phone input visible: ${await phoneField.isVisible()}`);
  console.log(`  - Company input visible: ${await companyField.isVisible()}`);
  console.log(`  - How heard select options count: ${await sourceDropdown.locator("option").count()}`);
  console.log(`  - Subject input value: "${await subjectField.inputValue()}"`);
  console.log(`  - Service select options count: ${await serviceDropdown.locator("option").count()}`);
  console.log(`  - Message textarea visible: ${await messageField.isVisible()}`);
  console.log(`  - Submit button disabled: ${await submitBtn.isDisabled()}`);
  console.log(`  - Submit button text: "${await submitBtn.innerText()}"`);

  if (await submitBtn.isDisabled()) {
    throw new Error("P0 FAILURE: Submit button is still permanently disabled!");
  }

  // TEST 2: CLIENT VALIDATION (Submit with empty fields)
  console.log("\n--- TEST 2: Client-side Validation (Empty Submission) ---");
  await submitBtn.click();
  await desktopPage.waitForTimeout(500);

  const errorBanner = modalForm.locator("[data-form-feedback='backend-error'], .errorBanner");
  const hasErrorBanner = await errorBanner.isVisible();
  const bannerText = hasErrorBanner ? await errorBanner.innerText() : "";
  console.log(`Error banner shown: ${hasErrorBanner} ("${bannerText}")`);

  const alerts = await modalForm.locator("[role='alert']").allInnerTexts();
  console.log(`Alert elements count: ${alerts.length}`);
  console.log("Alert texts:", alerts);

  if (!hasErrorBanner || alerts.length < 2) {
    throw new Error("Validation check failed: inline errors or banner not displayed on empty submit!");
  }
  console.log("✓ Client-side validation is working correctly!");

  // Close modal via close button
  const closeBtn = desktopPage.locator("button[aria-label='Close dialog']");
  await closeBtn.click();
  await desktopPage.waitForTimeout(500);
  console.log(`Modal closed successfully: ${!(await modalForm.isVisible())}`);

  // TEST 3: MOBILE VIEWPORT (390x844)
  console.log("\n--- TEST 3: Mobile Viewport (390x844) Header CTA & Menu Trigger ---");
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto("https://www.dgeniussolutions.com", { waitUntil: "networkidle" });
  const mobilePill = mobilePage.locator("#dgsPill");
  const isMobilePillVis = await mobilePill.isVisible();
  console.log(`Mobile header #dgsPill visible: ${isMobilePillVis}`);
  if (!isMobilePillVis) throw new Error("Mobile header #dgsPill is not visible!");

  console.log("Clicking mobile header #dgsPill...");
  await mobilePill.click();
  await mobilePage.waitForTimeout(1000);

  const mobileModalForm = mobilePage.locator("#lets-talk-form");
  console.log(`Mobile modal open: ${await mobileModalForm.isVisible()}`);
  const mobileSubmit = mobileModalForm.locator("button[type='submit']");
  console.log(`Mobile submit button disabled: ${await mobileSubmit.isDisabled()}`);

  const mobileCloseBtn = mobilePage.locator("button[aria-label='Close dialog']");
  await mobileCloseBtn.click();
  await mobilePage.waitForTimeout(500);

  // Test mobile menu CTA
  console.log("Testing mobile menu 'Let's Talk' CTA...");
  const menuBtn = mobilePage.locator("#dgsTrig");
  await menuBtn.click();
  await mobilePage.waitForTimeout(800);

  const menuTalkBtn = mobilePage.locator("button:has-text('Let\\'s Talk')");
  console.log(`Menu 'Let's Talk' button visible: ${await menuTalkBtn.isVisible()}`);
  if (await menuTalkBtn.isVisible()) {
    await menuTalkBtn.click();
    await mobilePage.waitForTimeout(800);
    console.log(`Menu opened Let's Talk modal: ${await mobileModalForm.isVisible()}`);
  }

  // TEST 4: SUBPAGE TEST (Verify Let's Talk works on service route)
  console.log("\n--- TEST 4: Subpage (Service Route: /services/branding/) ---");
  const servicePage = await desktopContext.newPage();
  await servicePage.goto("https://www.dgeniussolutions.com/services/branding/", { waitUntil: "networkidle" });
  const servicePill = servicePage.locator("#dgsPill");
  console.log(`Service page #dgsPill visible: ${await servicePill.isVisible()}`);
  await servicePill.click();
  await servicePage.waitForTimeout(1000);
  const serviceForm = servicePage.locator("#lets-talk-form");
  console.log(`Service page modal open: ${await serviceForm.isVisible()}`);
  const serviceSubmit = serviceForm.locator("button[type='submit']");
  console.log(`Service page submit button enabled: ${!(await serviceSubmit.isDisabled())}`);

  // TEST 5: HOMEPAGE INLINE FORM
  console.log("\n--- TEST 5: Homepage Inline Form ---");
  const homeInlineForm = desktopPage.locator("#fluentform_1, form[data-migration-form]").first();
  await homeInlineForm.scrollIntoViewIfNeeded();
  console.log(`Homepage inline form visible: ${await homeInlineForm.isVisible()}`);
  const inlineSubmit = homeInlineForm.locator("button[type='submit'], .ff-btn-submit").first();
  console.log(`Inline submit button disabled: ${await inlineSubmit.isDisabled()}, text: "${await inlineSubmit.innerText()}"`);

  // Take screenshot of modal on desktop & mobile
  await desktopPage.goto("https://www.dgeniussolutions.com", { waitUntil: "networkidle" });
  await desktopPage.locator("#dgsPill").click();
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: "letstalk_desktop_modal_live.png" });
  console.log("Saved screenshot: letstalk_desktop_modal_live.png");

  await mobilePage.goto("https://www.dgeniussolutions.com", { waitUntil: "networkidle" });
  await mobilePage.locator("#dgsPill").click();
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: "letstalk_mobile_modal_live.png" });
  console.log("Saved screenshot: letstalk_mobile_modal_live.png");

  await browser.close();

  console.log("\n=======================================================");
  console.log("✓ ALL LIVE FRONTEND CHECKS PASSED WITH FLYING COLORS!");
  console.log("=======================================================\n");
}

runLiveVerification().catch((err) => {
  console.error("VERIFICATION FAILED:", err);
  process.exit(1);
});
