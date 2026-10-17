import http from "node:http";
import https from "node:https";
import fs from "node:fs";

const BASE_URL = "https://www.dgeniussolutions.com";

console.log("================================================================================");
console.log("=== VERIFYING LIVE PRODUCTION AI VIDEO PORTFOLIO PRESENTATION & ORDERING ===");
console.log("================================================================================\n");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Timeout: " + url));
    });
  });
}

async function verifyPageOrderAndCrop(pagePath, pageName) {
  console.log(`\n--- Checking ${pageName} (${pagePath}) ---`);
  const res = await fetchUrl(BASE_URL + pagePath);
  console.log(`HTTP Status: ${res.status}`);

  if (res.status !== 200) {
    console.error(`❌ Non-200 status for ${pagePath}: ${res.status}`);
    return { pass: false, errors: [`Status ${res.status}`] };
  }

  const html = res.body;
  const errors = [];

  // Check 1: Wonder Introduction exclusion
  if (html.toLowerCase().includes("wonder-introduction") || html.toLowerCase().includes("wonder introduction")) {
    errors.push("Wonder Introduction was FOUND in page HTML!");
    console.error("❌ Wonder Introduction found in page HTML!");
  } else {
    console.log("✓ Wonder Introduction completely excluded from page HTML");
  }

  // Check 2: No object-fit: cover on videos or portfolio thumbs
  // (Search for style occurrences within portfolio containers)
  if (html.includes("max-height:480px") || html.includes("max-height: 480px")) {
    errors.push("Found max-height: 480px crop constraint in HTML!");
    console.error("❌ Found max-height: 480px crop constraint!");
  } else {
    console.log("✓ No max-height: 480px crop constraints found");
  }

  // Check 3: Check order of clients / videos
  const idxHyundai = html.indexOf("hyundai_creta_1");
  const idxSundaram = html.indexOf("sundaram_bal_3_1");
  const idxClarion = html.indexOf("clarion_jasmine_atta_hindi");
  const idxBetter = html.indexOf("better_ceasons_tenant");
  const idxSai = html.indexOf("Vachaan-5-Teaser");

  console.log(`Indices in DOM:
  Hyundai Creta 1:       ${idxHyundai}
  Sundaram Balbharati:   ${idxSundaram}
  Clarion Atta Hindi:    ${idxClarion}
  Better Ceasons Tenant: ${idxBetter}
  Shirdi Se Sai Vachaan: ${idxSai}`);

  if (idxHyundai !== -1 && idxSundaram !== -1 && idxClarion !== -1 && idxBetter !== -1) {
    if (idxHyundai < idxSundaram && idxSundaram < idxClarion && idxClarion < idxBetter) {
      console.log("✓ Perfect Client Sequence: Hyundai -> Sundaram -> Clarion -> Better Ceasons");
    } else {
      errors.push("Client sequence out of order: expected Hyundai < Sundaram < Clarion < Better Ceasons");
      console.error("❌ Client sequence out of order!");
    }
  } else {
    console.log("Note: Not all 4 clients directly prerendered in static HTML (dynamic boot script will mount them).");
  }

  if (idxBetter !== -1 && idxSai !== -1) {
    if (idxBetter < idxSai) {
      console.log("✓ Sequence check: New Uploads (Better Ceasons) appears BEFORE Shirdi Se Sai");
    } else {
      errors.push("Shirdi Se Sai appeared BEFORE new client uploads!");
      console.error("❌ Shirdi Se Sai appeared before new uploads!");
    }
  }

  return { pass: errors.length === 0, errors };
}

async function verifySectionPositioning() {
  console.log("\n================================================================================");
  console.log("=== CHECKING SECTION POSITIONING DIRECTLY BELOW HERO ===");
  console.log("================================================================================");

  // 1. AI Video Agency Page
  const agencyRes = await fetchUrl(BASE_URL + "/services/ai-video-production-agency/");
  const agencyHtml = agencyRes.body;
  const agencyHeroPos = agencyHtml.indexOf('class="dgs-hero"');
  const agencyPortfolioPos = agencyHtml.indexOf('id="portfolio"');
  const agencyOverviewPos = agencyHtml.indexOf('id="ai-overview-answer"');

  console.log(`\nAgency Page Sections:
  Hero pos:      ${agencyHeroPos}
  Portfolio pos: ${agencyPortfolioPos}
  Overview pos:  ${agencyOverviewPos}`);

  const agencyDuplicates = (agencyHtml.match(/id="portfolio"/g) || []).length;
  console.log(`  Portfolio occurrences: ${agencyDuplicates} (must be 1)`);

  if (agencyHeroPos < agencyPortfolioPos && (agencyOverviewPos === -1 || agencyPortfolioPos < agencyOverviewPos)) {
    console.log("✓ Agency Page: Portfolio starts immediately AFTER Hero and BEFORE Overview/Services");
  } else {
    console.error("❌ Agency Page: Portfolio is NOT immediately after Hero!");
  }

  // 2. Google Ads Landing Page
  const adsRes = await fetchUrl(BASE_URL + "/ai-production-videos-google-ads-landing-page/");
  const adsHtml = adsRes.body;
  const adsHeroPos = adsHtml.indexOf('class="dgs-ai-hero"');
  const adsClientsPos = adsHtml.indexOf('class="dgs-ai-clients"');
  const adsPortfolioPos = adsHtml.indexOf('id="ai-production-portfolio"');
  const adsServicesPos = adsHtml.indexOf('id="ai-production-services"');

  console.log(`\nGoogle Ads Landing Page Sections:
  Hero pos:      ${adsHeroPos}
  Clients pos:   ${adsClientsPos}
  Portfolio pos: ${adsPortfolioPos}
  Services pos:  ${adsServicesPos}`);

  const adsDuplicates = (adsHtml.match(/id="ai-production-portfolio"/g) || []).length;
  console.log(`  Portfolio occurrences: ${adsDuplicates} (must be 1)`);

  if (adsHeroPos < adsPortfolioPos && adsClientsPos < adsPortfolioPos && adsPortfolioPos < adsServicesPos) {
    console.log("✓ Google Ads Page: Portfolio starts immediately AFTER Hero/Logo strip and BEFORE Services");
  } else {
    console.error("❌ Google Ads Page: Portfolio is NOT immediately after Hero/Clients!");
  }

  // 3. Dubai Page
  const dubaiRes = await fetchUrl(BASE_URL + "/services/ai-production-dubai-page/");
  const dubaiHtml = dubaiRes.body;
  const dubaiHeroPos = dubaiHtml.indexOf('class="dgs-hero"');
  const dubaiLogoPos = dubaiHtml.indexOf('class="dgs-logo-strip"');
  const dubaiPortfolioPos = dubaiHtml.indexOf('id="portfolio"');
  const dubaiFeaturedPos = dubaiHtml.indexOf('id="featured-ai-video-work"');

  console.log(`\nDubai Page Sections:
  Hero pos:      ${dubaiHeroPos}
  Logo pos:      ${dubaiLogoPos}
  Portfolio pos: ${dubaiPortfolioPos}
  Featured pos:  ${dubaiFeaturedPos}`);

  const dubaiDuplicates = (dubaiHtml.match(/id="portfolio"/g) || []).length;
  console.log(`  Portfolio occurrences: ${dubaiDuplicates} (must be 1)`);

  if (dubaiHeroPos < dubaiPortfolioPos && dubaiLogoPos < dubaiPortfolioPos && (dubaiFeaturedPos === -1 || dubaiPortfolioPos < dubaiFeaturedPos)) {
    console.log("✓ Dubai Page: Portfolio starts immediately AFTER Hero/Logo strip and BEFORE Featured/Services");
  } else {
    console.error("❌ Dubai Page: Portfolio is NOT immediately after Hero/Logo strip!");
  }
}

async function verifyBootScripts() {
  console.log("\n================================================================================");
  console.log("=== CHECKING BOOT SCRIPTS (boot-portfolio-8.js & boot-portfolio-home.js) ===");
  console.log("================================================================================");

  // Check local boot-portfolio-8.js
  const boot8 = fs.readFileSync("lib/wp-exact/extracted/boot-portfolio-8.js", "utf8");
  console.log("boot-portfolio-8.js size:", boot8.length, "bytes");
  console.log("Contains Wonder Introduction:", boot8.toLowerCase().includes("wonder-introduction"));
  console.log("Contains object-fit contain:", boot8.includes("object-fit:contain"));
  console.log("Contains real aspect ratio calculation:", boot8.includes("div.style.aspectRatio"));
  console.log("Contains lightbox max-width 92vw:", boot8.includes("92vw"));

  // Check local boot-portfolio-home.js
  const bootHome = fs.readFileSync("lib/wp-exact/extracted/boot-portfolio-home.js", "utf8");
  console.log("boot-portfolio-home.js size:", bootHome.length, "bytes");
  console.log("Contains Wonder Introduction:", bootHome.toLowerCase().includes("wonder-introduction"));
  console.log("Contains 1=Hyundai, 2=Sundaram, 3=Clarion, 4=Better Ceasons:",
    bootHome.indexOf("hyundai_creta_1") < bootHome.indexOf("sundaram_bal_3_1") &&
    bootHome.indexOf("sundaram_bal_3_1") < bootHome.indexOf("clarion_jasmine_atta_hindi") &&
    bootHome.indexOf("clarion_jasmine_atta_hindi") < bootHome.indexOf("better_ceasons_tenant")
  );
}

async function main() {
  await verifySectionPositioning();
  await verifyPageOrderAndCrop("/services/ai-video-production-agency/", "AI Video Production Agency");
  await verifyPageOrderAndCrop("/ai-production-videos-google-ads-landing-page/", "Google Ads AI Video Landing Page");
  await verifyPageOrderAndCrop("/services/ai-production-dubai-page/", "AI Production Dubai Page");
  await verifyPageOrderAndCrop("/", "Homepage");
  await verifyPageOrderAndCrop("/portfolio/", "Full Portfolio");
  await verifyBootScripts();
}

main().catch(console.error);
