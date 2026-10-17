import { chromium } from "playwright";

async function testFullInteraction() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.dgeniussolutions.com/services/website-development-amc/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const result = await page.evaluate(async () => {
    const root = document.querySelector('.dgs-wp-mirror-inner');
    const items = Array.from(root.querySelectorAll('.faq-item'));
    
    // Implementation of updated setAnswerOpen
    function setAnswerOpen(item, open) {
      const answer = item.querySelector('.faq-a');
      item.classList.toggle('active', open);
      const q = item.querySelector('.faq-q, .faq-item button');
      if (q) q.setAttribute('aria-expanded', String(open));
      if (!answer) return;
      const isGrid = window.getComputedStyle(answer).display === 'grid';
      if (isGrid) {
        answer.style.maxHeight = '';
      } else {
        answer.style.maxHeight = open ? `${Math.max(answer.scrollHeight, 1)}px` : '0px';
      }
    }

    function toggle(question) {
      const item = question.closest('.faq-item');
      if (!item) return;
      const container = item.closest('.faq-container, .faq-list, .dgs-faq-container, #faq, #webdev-faqs') || root;
      const willOpen = !item.classList.contains('active');
      for (const other of container.querySelectorAll('.faq-item.active')) {
        if (other !== item) setAnswerOpen(other, false);
      }
      setAnswerOpen(item, willOpen);
    }

    // Attach test click listener directly to emulate InnerMirrorWidgets
    root.addEventListener('click', (e) => {
      const q = e.target.closest('.faq-q, .faq-item button');
      if (q && root.contains(q)) {
        e.preventDefault();
        toggle(q);
      }
    });

    const stepLogs = [];

    // Click 1: First FAQ
    const q0 = items[0].querySelector('.faq-q');
    q0.click();
    await new Promise(r => setTimeout(r, 450));
    stepLogs.push({
      step: 'FAQ 1 clicked',
      active: items[0].classList.contains('active'),
      aria: q0.getAttribute('aria-expanded'),
      height: items[0].querySelector('.faq-a').offsetHeight
    });

    // Click 2: Second FAQ (should close 1, open 2)
    const q1 = items[1].querySelector('.faq-q');
    q1.click();
    await new Promise(r => setTimeout(r, 450));
    stepLogs.push({
      step: 'FAQ 2 clicked',
      faq1_active: items[0].classList.contains('active'),
      faq1_height: items[0].querySelector('.faq-a').offsetHeight,
      faq2_active: items[1].classList.contains('active'),
      faq2_aria: q1.getAttribute('aria-expanded'),
      faq2_height: items[1].querySelector('.faq-a').offsetHeight
    });

    // Click 3: Second FAQ again (should close 2)
    q1.click();
    await new Promise(r => setTimeout(r, 450));
    stepLogs.push({
      step: 'FAQ 2 clicked again to close',
      faq2_active: items[1].classList.contains('active'),
      faq2_aria: q1.getAttribute('aria-expanded'),
      faq2_height: items[1].querySelector('.faq-a').offsetHeight
    });

    return stepLogs;
  });

  console.log("Full interaction results:", JSON.stringify(result, null, 2));
  await browser.close();
}

testFullInteraction().catch(console.error);
