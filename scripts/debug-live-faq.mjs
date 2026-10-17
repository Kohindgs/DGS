import { chromium } from "playwright";

async function testFaq() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log("Loading live webdev page...");
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const initialCheck = await page.evaluate(() => {
    const root = document.querySelector('.dgs-wp-mirror-inner');
    const q1 = document.querySelector('.faq-q');
    const item1 = document.querySelector('.faq-item');
    return {
      hasRoot: !!root,
      q1Role: q1?.getAttribute('role'),
      q1TabIndex: q1?.getAttribute('tabindex'),
      q1Aria: q1?.getAttribute('aria-expanded'),
      itemClasses: item1?.className,
    };
  });
  console.log("Initial FAQ check:", initialCheck);

  // Now click via playwright click()
  console.log("Clicking .faq-q using page.click...");
  await page.click('.faq-q');
  await page.waitForTimeout(500);

  const afterClick = await page.evaluate(() => {
    const q1 = document.querySelector('.faq-q');
    const item1 = document.querySelector('.faq-item');
    const a1 = document.querySelector('.faq-a');
    return {
      itemClasses: item1?.className,
      q1Aria: q1?.getAttribute('aria-expanded'),
      aHeight: a1?.offsetHeight,
      aStyleMaxHeight: a1?.style?.maxHeight,
      computedMaxHeight: window.getComputedStyle(a1).maxHeight,
      computedHeight: window.getComputedStyle(a1).height,
      computedDisplay: window.getComputedStyle(a1).display,
      computedVisibility: window.getComputedStyle(a1).visibility
    };
  });
  console.log("After click:", afterClick);

  // If not working, let's see what scripts exist on the page or what DgsLocationFaqBoot did
  const bootStatus = await page.evaluate(() => {
    const q = document.querySelector('.faq-q');
    return {
      hasClickHandlers: typeof window !== 'undefined',
      buttonType: q?.getAttribute('type'),
    };
  });
  console.log("Boot status:", bootStatus);

  await browser.close();
}

testFaq().catch(console.error);
