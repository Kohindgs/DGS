import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleMessages = [];
  const networkRequests = [];
  
  page.on("console", (msg) => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
  page.on("pageerror", (err) => consoleMessages.push(`PAGE_ERROR: ${err.message}`));
  page.on("request", (req) => {
    if (req.url().includes("/api/")) {
      networkRequests.push({ url: req.url(), method: req.method() });
    }
  });
  page.on("response", (res) => {
    if (res.url().includes("/api/")) {
      console.log(`[NETWORK RESPONSE] ${res.status()} ${res.url()}`);
    }
  });

  console.log("Navigating to https://www.dgeniussolutions.com...");
  await page.goto("https://www.dgeniussolutions.com", { waitUntil: "networkidle" });

  const ctas = await page.$$eval("button, a", (els) =>
    els
      .filter((e) => /let['’]?s talk|talk to us|contact us|get started/i.test(e.innerText || e.getAttribute("aria-label") || ""))
      .map((e) => ({
        tag: e.tagName,
        text: (e.innerText || "").trim().replace(/\s+/g, " "),
        href: e.getAttribute("href"),
        onclick: e.getAttribute("onclick"),
        classes: e.className,
        id: e.id,
        visible: e.offsetParent !== null,
      }))
  );
  console.log("Found CTAs on Homepage:", JSON.stringify(ctas, null, 2));

  // Find all buttons or links with "Let's Talk"
  const buttons = await page.locator("button, a").filter({ hasText: /let['’]?s talk/i }).all();
  console.log(`Matching 'Let's Talk' locators: ${buttons.length}`);

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const isVis = await btn.isVisible();
    const text = await btn.innerText();
    const href = await btn.getAttribute("href");
    console.log(`[CTA ${i}] Text: "${text}", Tag: ${await btn.evaluate((e) => e.tagName)}, Visible: ${isVis}, Href: ${href}`);
  }

  // Click the first visible one
  const firstVisible = await page.locator("button, a").filter({ hasText: /let['’]?s talk/i }).first();
  if (await firstVisible.isVisible()) {
    console.log("\nAttempting click on first visible CTA...");
    await firstVisible.click();
    await page.waitForTimeout(2000);
  }

  // Check what modal or form elements are now visible
  const formsAndModals = await page.$$eval("form, [role='dialog'], [class*='modal'], [class*='Modal'], [class*='drawer'], [class*='Drawer']", (els) =>
    els.map((e) => {
      const style = window.getComputedStyle(e);
      return {
        tag: e.tagName,
        id: e.id,
        classes: e.className,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        zIndex: style.zIndex,
        rect: e.getBoundingClientRect(),
        visible: e.offsetParent !== null && style.display !== "none" && style.visibility !== "hidden",
      };
    })
  );

  console.log("\nForms / Modals detected after click:", JSON.stringify(formsAndModals, null, 2));

  console.log("\nConsole Messages:", consoleMessages);
  console.log("\nAPI Requests:", networkRequests);

  await browser.close();
}

main().catch(console.error);
