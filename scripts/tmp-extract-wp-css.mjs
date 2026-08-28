import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.dgeniussolutions.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);

const data = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      padding: cs.padding,
      margin: cs.margin,
      gap: cs.gap,
      color: cs.color,
      background: cs.background,
      border: cs.border,
      borderRadius: cs.borderRadius,
      display: cs.display,
      gridTemplateColumns: cs.gridTemplateColumns,
      position: cs.position,
    };
  };

  return {
    kicker: pick(".dgs-v1215-kicker"),
    h1: pick(".dgs-v1215-copy h1"),
    visual: pick(".dgs-v1215-visual"),
    chipOne: pick(".dgs-v1215-chip-one"),
    statline: pick(".dgs-v1215-statline"),
    statItem: pick(".dgs-v1215-statline > div"),
    rail: pick(".dgs-v1215-rail"),
    railSpan: pick(".dgs-v1215-rail-track span"),
    trig: pick("#dgsTrig"),
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
