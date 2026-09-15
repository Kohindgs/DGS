import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://dimgrey-goat-473970.hostingersite.com';
const VIEWPORTS = [1440, 1280, 1024, 768, 430, 390, 360];

const ROUTES = [
  { formId: 1, route: '/' },
  { formId: 3, route: '/services/seo-services-in-mumbai/' },
  { formId: 4, route: '/services/social-media-marketing/' },
  { formId: 6, route: '/services/website-development-amc/' },
  { formId: 9, route: '/services/ai-video-production-agency/' },
  { formId: 10, route: '/services/branding/' },
  { formId: 11, route: '/services/content-creation/' },
  { formId: 19, route: '/services/aeo-services-in-mumbai/' },
  { formId: 20, route: '/services/llm-seo-service/' },
  { formId: 21, route: '/services/geo/' },
  { formId: 26, route: '/services/performance-marketing/' },
];

const screenshotDir = path.resolve('data/audit/evidence_screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

async function run() {
  console.log('='.repeat(80));
  console.log('PLAYWRIGHT FORM RESPONSIVE VISUAL AUDIT ACROSS 7 VIEWPORTS');
  console.log('Target:', BASE_URL);
  console.log('='.repeat(80));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const matrix = {};

  for (const item of ROUTES) {
    matrix[item.formId] = {};
    console.log(`\nAuditing Form ${item.formId} (${item.route})...`);

    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 900 });
      try {
        await page.goto(`${BASE_URL}${item.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(600);

        const audit = await page.evaluate(() => {
          const form = document.querySelector('form.fluentform, form[id*="fluentform"], .dgs-contact-form, form');
          if (!form) return { found: false };

          const formBox = form.getBoundingClientRect();
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const hasHorizontalScroll = docWidth > winWidth + 1;

          // CAPTCHA containment
          const captcha = form.querySelector('.ff-el-recaptcha, .ff-el-turnstile, [class*="recaptcha"], [class*="turnstile"]');
          let captchaContained = true;
          if (captcha) {
            const cBox = captcha.getBoundingClientRect();
            if (cBox.right > winWidth + 4) captchaContained = false;
          }

          // Button alignment
          const btn = form.querySelector('button[type="submit"], input[type="submit"]');
          let btnOk = true;
          if (btn) {
            const btnBox = btn.getBoundingClientRect();
            if (btnBox.right > winWidth + 4) btnOk = false;
          }

          // Spacing & centering
          const leftSpace = Math.round(formBox.left);
          const rightSpace = Math.round(winWidth - formBox.right);
          const isCentered = Math.abs(leftSpace - rightSpace) < 25 || (leftSpace >= 0 && rightSpace >= 0);

          return {
            found: true,
            hasHorizontalScroll,
            captchaContained,
            btnOk,
            isCentered,
            formWidth: Math.round(formBox.width),
            leftSpace,
            rightSpace,
            winWidth,
          };
        });

        const pass = audit.found && !audit.hasHorizontalScroll && audit.captchaContained && audit.btnOk;
        matrix[item.formId][width] = {
          pass,
          details: audit,
        };

        process.stdout.write(`  ${width}px: ${pass ? 'PASS' : 'FAIL'} | `);

        // Save representative screenshots
        if ((item.formId === 1 || item.formId === 9) && (width === 1440 || width === 390 || width === 360)) {
          const shotPath = path.join(screenshotDir, `form-${item.formId}-${width}px.png`);
          await page.screenshot({ path: shotPath, fullPage: false });
        }
      } catch (err) {
        matrix[item.formId][width] = { pass: false, error: err.message };
        process.stdout.write(`  ${width}px: ERR | `);
      }
    }
    console.log('');
  }

  await browser.close();

  fs.writeFileSync('data/audit/forms_responsive_matrix.json', JSON.stringify(matrix, null, 2), 'utf8');
  console.log('\nAudit completed. Results written to data/audit/forms_responsive_matrix.json');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
