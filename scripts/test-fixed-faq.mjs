import { chromium } from "playwright";

async function testFixedFaq() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const test = await page.evaluate(async () => {
    const root = document.querySelector('.dgs-wp-mirror-inner');
    const items = root.querySelectorAll('.faq-item');
    
    // Simulate what happens when InnerMirrorWidgets alone handles .faq-item:
    function setAnswerOpen(item, open) {
      const answer = item.querySelector('.faq-a');
      const q = item.querySelector('.faq-q');
      item.classList.toggle('active', open);
      if (q) q.setAttribute('aria-expanded', String(open));
      if (!answer) return;
      if (open) {
        answer.style.maxHeight = `${Math.max(answer.scrollHeight, 1)}px`;
      } else {
        answer.style.maxHeight = '0px';
      }
    }

    // Click item 0
    const item0 = items[0];
    setAnswerOpen(item0, true);
    await new Promise(r => setTimeout(r, 400));
    
    const h0 = item0.querySelector('.faq-a').offsetHeight;
    const aria0 = item0.querySelector('.faq-q').getAttribute('aria-expanded');

    // Click item 1 (sibling closing)
    const item1 = items[1];
    setAnswerOpen(item0, false);
    setAnswerOpen(item1, true);
    await new Promise(r => setTimeout(r, 400));

    const h0_after = item0.querySelector('.faq-a').offsetHeight;
    const h1_after = item1.querySelector('.faq-a').offsetHeight;

    return {
      item0_init_height: h0,
      item0_init_aria: aria0,
      item0_closed_height: h0_after,
      item1_open_height: h1_after
    };
  });

  console.log("Simulated single-handler FAQ test:", test);
  await browser.close();
}

testFixedFaq().catch(console.error);
