import fs from "node:fs";

console.log("=== VERIFYING DUBAI AI PRODUCTION PAGE SCHEMA & METADATA ===");

// 1. Check Route Registry
const registry = JSON.parse(fs.readFileSync("data/migration/nextjs-route-registry.generated.json", "utf8"));
const dubaiRoute = registry.routes.find(r => r.path === "/services/ai-production-dubai-page/");

if (!dubaiRoute) {
  throw new Error("Dubai route not found in registry!");
}

console.log("Title in Registry:", dubaiRoute.title);
console.log("Canonical in Registry:", dubaiRoute.canonical);
console.log("Description in Registry:", dubaiRoute.description);
console.log("FAQ items count in Registry:", dubaiRoute.faqItems?.length || 0);

if (!dubaiRoute.faqItems || dubaiRoute.faqItems.length !== 9) {
  throw new Error(`Expected 9 FAQ items in route registry, found ${dubaiRoute.faqItems?.length}`);
}

// 2. Check Mirror HTML
const mirror = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/services__ai-production-dubai-page.json", "utf8"));
const html = mirror.body;

const hasMicrodataFaq = html.includes("schema.org/FAQPage");
console.log("Has Microdata FAQPage in HTML (must be false):", hasMicrodataFaq);
if (hasMicrodataFaq) {
  throw new Error("Found duplicate microdata FAQPage in HTML!");
}

// 3. Check visible H1
const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
console.log("Rendered H1 text:", h1Text);
const expectedH1 = "AI Video Production Agency in Dubai for Ads, Reels & Brand Films";
if (!h1Text.toLowerCase().includes("ai video production agency in dubai for ads, reels & brand films")) {
  throw new Error(`H1 mismatch! Found: "${h1Text}"`);
}

// 4. Check visible FAQ questions in HTML
const visibleQuestions = [...html.matchAll(/<button class="faq-q"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/gi)].map(m => m[1].trim());
console.log("Visible FAQ questions in rendered HTML:", visibleQuestions.length);
if (visibleQuestions.length !== 9) {
  throw new Error(`Expected 9 visible FAQ questions in HTML, found ${visibleQuestions.length}`);
}

// 5. Verify 1-to-1 match between FAQ schema items and visible HTML questions
dubaiRoute.faqItems.forEach((faq, idx) => {
  const visible = visibleQuestions[idx];
  const qMatch = faq.question === visible;
  console.log(`Q${idx+1}: Schema: "${faq.question}" === HTML: "${visible}" -> ${qMatch ? "✓ MATCH" : "✗ MISMATCH"}`);
  if (!qMatch) {
    throw new Error(`Mismatch at FAQ ${idx+1}!`);
  }
});

console.log("\n✓ ALL DUBAI METADATA AND SCHEMA CHECKS PASSED PERFECTLY!");
