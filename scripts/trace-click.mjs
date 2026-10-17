import { chromium } from "playwright";

async function traceClick() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const trace = await page.evaluate(() => {
    const root = document.querySelector('.dgs-wp-mirror-inner');
    const btn = document.querySelector('.faq-q');
    const logs = [];

    // Let's add test listeners at each level
    btn.addEventListener('click', (e) => logs.push({ level: 'btn', target: e.target.tagName, defaultPrevented: e.defaultPrevented }));
    btn.parentElement.addEventListener('click', (e) => logs.push({ level: 'faq-item', target: e.target.tagName }));
    root.addEventListener('click', (e) => logs.push({ level: 'root', target: e.target.tagName, contains: root.contains(btn) }));
    document.body.addEventListener('click', (e) => logs.push({ level: 'body', target: e.target.tagName }));
    document.addEventListener('click', (e) => logs.push({ level: 'document', target: e.target.tagName }));

    // Click the button
    btn.click();

    return {
      logs,
      btnContains: root.contains(btn),
      btnHtml: btn.outerHTML.slice(0, 100)
    };
  });

  console.log("Click trace:", JSON.stringify(trace, null, 2));
  await browser.close();
}

traceClick().catch(console.error);
