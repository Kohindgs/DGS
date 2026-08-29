import fs from "node:fs";
import path from "node:path";

export const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "2560x1440", width: 2560, height: 1440 },
  { name: "3440x1440", width: 3440, height: 1440 },
  { name: "3840x2160", width: 3840, height: 2160 },
];

export const PRIORITY_VIEWPORTS = ["1440x900", "390x844", "1920x1080"];

export const WP_URL = "https://www.dgeniussolutions.com/";
export const NEXT_URL =
  process.env.VISUAL_PARITY_NEXT_URL || "https://dimgrey-goat-473970.hostingersite.com/";

export const OUTPUT_ROOT = path.resolve("tooling/visual-parity");

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function settlePage(page, extraMs = 1200) {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(extraMs);
}

export async function scrollToFraction(page, fraction) {
  await page.evaluate((f) => {
    const max = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0,
    );
    window.scrollTo({ top: max * f, behavior: "instant" });
  }, fraction);
  await page.waitForTimeout(800);
}

export async function scrollElementIntoActivation(page, selector) {
  const handle = await page.$(selector);
  if (!handle) return false;
  await handle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const target = window.scrollY + rect.top - window.innerHeight * 0.2;
    window.scrollTo({ top: Math.max(target, 0), behavior: "instant" });
  }, handle);
  await page.waitForTimeout(900);
  return true;
}

export async function captureRegion(page, box, filePath) {
  ensureDir(path.dirname(filePath));
  await page.screenshot({ path: filePath, clip: box });
}

export async function measureElement(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const pick = (keys) =>
      Object.fromEntries(keys.map((k) => [k, cs.getPropertyValue(k) || cs[k] || ""]));
    return {
      selector: sel,
      boundingBox: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      computed: pick([
        "display",
        "position",
        "font-family",
        "font-size",
        "font-weight",
        "line-height",
        "letter-spacing",
        "text-transform",
        "color",
        "background",
        "background-color",
        "background-image",
        "border",
        "border-radius",
        "padding",
        "margin",
        "gap",
        "grid-template-columns",
        "max-width",
        "text-align",
        "align-items",
        "justify-content",
        "z-index",
      ]),
      tagName: el.tagName.toLowerCase(),
      className: el.className?.toString?.() || "",
      textSample: (el.textContent || "").trim().slice(0, 120),
    };
  }, selector);
}

export async function discoverHomepageSections(page) {
  return page.evaluate(() => {
    const sections = [];
    const candidates = [
      ...document.querySelectorAll("main section, main .elementor-section, main [data-id]"),
      ...document.querySelectorAll("body > .elementor > .elementor-section"),
    ];

    const seen = new Set();
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.height < 40 || rect.width < 200) continue;
      const key = `${Math.round(rect.top)}:${Math.round(rect.height)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const heading =
        el.querySelector("h1, h2, h3")?.textContent?.trim().slice(0, 80) || "";
      const id = el.id || el.getAttribute("data-id") || "";
      const cls = (el.className?.toString?.() || "").split(/\s+/).slice(0, 4).join(" ");

      sections.push({
        index: sections.length,
        id,
        className: cls,
        heading,
        top: rect.top + window.scrollY,
        height: rect.height,
        width: rect.width,
      });
    }

    return sections.sort((a, b) => a.top - b.top);
  });
}

export async function extractHeadingOrder(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll("main h1, main h2, main h3")];
    return nodes.map((el, i) => ({
      index: i,
      level: Number(el.tagName.replace("H", "")),
      text: el.textContent?.trim() || "",
      top: el.getBoundingClientRect().top + window.scrollY,
    }));
  });
}

export async function openMenuIfPresent(page) {
  const triggers = [
    "#dgsTrig",
    "#site-menu-trigger",
    'button:has-text("MENU")',
    'button:has-text("Menu")',
    ".menu-toggle",
    '[aria-label*="menu" i]',
  ];

  for (const sel of triggers) {
    const btn = page.locator(sel).first();
    if ((await btn.count()) > 0) {
      await btn.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(900);
      return sel;
    }
  }
  return null;
}

export async function closeMenuIfPresent(page) {
  const closeSelectors = [
    '[aria-label*="close" i]',
    'button:has-text("Close")',
    "#site-menu-panel button",
  ];
  for (const sel of closeSelectors) {
    const btn = page.locator(sel).first();
    if ((await btn.count()) > 0) {
      await btn.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(500);
      return;
    }
  }
  await page.keyboard.press("Escape").catch(() => {});
}
