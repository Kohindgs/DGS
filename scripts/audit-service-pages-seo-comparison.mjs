import { chromium } from "playwright";
import fs from "node:fs";

const PAGES_TO_AUDIT = [
  { name: "Non-Ranking: SEO Mumbai", url: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/", targetKws: ["seo agency in mumbai", "seo company in mumbai", "seo services in mumbai"] },
  { name: "Non-Ranking: Web Dev AMC", url: "https://www.dgeniussolutions.com/services/website-development-amc/", targetKws: ["web development agency in mumbai", "website development company in mumbai", "website development services in mumbai"] },
  { name: "Ranking Benchmark: AI Video", url: "https://www.dgeniussolutions.com/services/ai-video-production-agency/", targetKws: ["ai video production agency in mumbai", "ai video production company"] },
  { name: "Ranking Benchmark: AEO Mumbai", url: "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/", targetKws: ["aeo services in mumbai", "answer engine optimization"] },
  { name: "Ranking Benchmark: GEO", url: "https://www.dgeniussolutions.com/services/geo/", targetKws: ["geo services in mumbai", "generative engine optimization"] },
];

async function auditPage(browser, pageInfo) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let response;
  try {
    response = await page.goto(pageInfo.url, { waitUntil: "networkidle", timeout: 30000 });
  } catch (e) {
    return { name: pageInfo.name, url: pageInfo.url, error: e.message };
  }

  const status = response ? response.status() : 0;

  const data = await page.evaluate((targetKws) => {
    const title = document.title || "";
    const metaDesc = document.querySelector('meta[name="description"]')?.content || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.href || "";
    const robots = document.querySelector('meta[name="robots"]')?.content || "";
    
    const h1s = Array.from(document.querySelectorAll("h1")).map(h => h.innerText.trim()).filter(Boolean);
    const h2s = Array.from(document.querySelectorAll("h2")).map(h => h.innerText.trim()).filter(Boolean);
    const h3s = Array.from(document.querySelectorAll("h3")).map(h => h.innerText.trim()).filter(Boolean);

    // Body text and word count
    const bodyText = document.body.innerText || "";
    const words = bodyText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Check keyword occurrences
    const kwAnalysis = {};
    for (const kw of targetKws) {
      const reg = new RegExp(kw.replace(/\s+/g, "\\s+"), "gi");
      const inTitle = (title.match(reg) || []).length;
      const inMetaDesc = (metaDesc.match(reg) || []).length;
      const inH1 = (h1s.join(" ").match(reg) || []).length;
      const inH2 = (h2s.join(" ").match(reg) || []).length;
      const inBody = (bodyText.match(reg) || []).length;
      kwAnalysis[kw] = { inTitle, inMetaDesc, inH1, inH2, inBody };
    }

    // Schema analysis
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const schemas = scripts.map(s => {
      try {
        const parsed = JSON.parse(s.textContent || "{}");
        return parsed["@type"] || (parsed["@graph"] ? parsed["@graph"].map(g => g["@type"]).join(", ") : "unknown");
      } catch {
        return "invalid_json";
      }
    });

    // Links on page
    const internalLinks = Array.from(document.querySelectorAll("a[href]")).filter(a => {
      const href = a.getAttribute("href") || "";
      return href.startsWith("/") || href.includes("dgeniussolutions.com");
    }).length;

    const images = Array.from(document.querySelectorAll("img"));
    const imagesWithoutAlt = images.filter(i => !i.alt || i.alt.trim() === "").length;

    return {
      title,
      metaDesc,
      canonical,
      robots,
      h1Count: h1s.length,
      h1s,
      h2Count: h2s.length,
      h2Sample: h2s.slice(0, 5),
      wordCount,
      kwAnalysis,
      schemas,
      internalLinks,
      totalImages: images.length,
      imagesWithoutAlt,
    };
  }, pageInfo.targetKws);

  await page.close();

  return {
    name: pageInfo.name,
    url: pageInfo.url,
    httpStatus: status,
    ...data,
  };
}

async function checkInternalLinksToPage(browser, targetUrls) {
  const page = await browser.newPage();
  const pagesToCrawl = [
    "https://www.dgeniussolutions.com/",
    "https://www.dgeniussolutions.com/services/",
    "https://www.dgeniussolutions.com/about-us/",
    "https://www.dgeniussolutions.com/blogs/",
  ];

  const incomingLinkCounts = {};
  for (const t of targetUrls) {
    incomingLinkCounts[t] = { headerMenu: 0, footer: 0, bodyContent: 0, total: 0, foundOn: [] };
  }

  for (const sourceUrl of pagesToCrawl) {
    try {
      await page.goto(sourceUrl, { waitUntil: "networkidle", timeout: 25000 });
      for (const target of targetUrls) {
        const linkInfo = await page.evaluate((targetUrl) => {
          const links = Array.from(document.querySelectorAll("a[href]"));
          let inHeader = 0;
          let inFooter = 0;
          let inBody = 0;
          let matched = false;

          for (const a of links) {
            const href = a.href || "";
            // Normalize trailing slashes
            const normHref = href.replace(/\/$/, "");
            const normTarget = targetUrl.replace(/\/$/, "");

            if (normHref === normTarget || href === targetUrl) {
              matched = true;
              if (a.closest("header, nav, .site-header, #masthead, .main-navigation")) {
                inHeader++;
              } else if (a.closest("footer, .site-footer, #colophon")) {
                inFooter++;
              } else {
                inBody++;
              }
            }
          }
          return { matched, inHeader, inFooter, inBody };
        }, target);

        if (linkInfo.matched) {
          incomingLinkCounts[target].headerMenu += linkInfo.inHeader;
          incomingLinkCounts[target].footer += linkInfo.inFooter;
          incomingLinkCounts[target].bodyContent += linkInfo.inBody;
          incomingLinkCounts[target].total += (linkInfo.inHeader + linkInfo.inFooter + linkInfo.inBody);
          incomingLinkCounts[target].foundOn.push(sourceUrl);
        }
      }
    } catch (e) {
      console.error(`Error crawling ${sourceUrl}:`, e.message);
    }
  }

  await page.close();
  return incomingLinkCounts;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  console.log("Auditing pages...");
  const pageResults = [];
  for (const p of PAGES_TO_AUDIT) {
    pageResults.push(await auditPage(browser, p));
  }

  console.log("Checking incoming internal links...");
  const targetUrls = PAGES_TO_AUDIT.map(p => p.url);
  const linkResults = await checkInternalLinksToPage(browser, targetUrls);

  await browser.close();

  const fullReport = {
    pages: pageResults,
    internalLinks: linkResults,
  };

  fs.writeFileSync("scripts/_service_pages_seo_audit.json", JSON.stringify(fullReport, null, 2));
  console.log("Saved report to scripts/_service_pages_seo_audit.json");
}

main().catch(console.error);
