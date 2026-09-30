import fs from "fs";

export function detectPageEditorialArtifactsFixed(html, routePath = "") {
  const artifacts = [];

  // Strip script and style tags first to avoid false positives in JS bundles/JSON
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 1. Explicit Staging / Internal Labels (isolated badge or with delimiter)
  const stagingPatterns = [
    { name: "Target Keyword Badge", regex: /<(?:small|span|div|p)\b[^>]*>\s*Target\s+Keywords?\s*<\/(?:small|span|div|p)>/i },
    { name: "Target Keyword Delimited", regex: /\bTarget\s+Keyword\s*[:\-\]]/i },
    { name: "AI Overview Answer Badge", regex: /<(?:small|span|div|p)\b[^>]*>\s*AI\s+Overview\s+Answer\s*<\/(?:small|span|div|p)>/i },
    { name: "AI Overview Answer Delimited", regex: /\bAI\s+Overview\s+Answer\s*[:\-\]]/i },
    { name: "Case Signal Badge", regex: /<(?:small|span|div|p)\b[^>]*>\s*Case\s+Signals?\s*<\/(?:small|span|div|p)>/i },
    { name: "Case Signal Delimited", regex: /\bCase\s+Signal\s*[:\-\]]/i },
    { name: "SEO Notes Delimited", regex: /\bSEO\s+Notes?\s*[:\-\]]/i },
    { name: "Editor Note Delimited", regex: /\bEditor(?:'s)?\s+Note\s*[:\-\]]/i },
    { name: "Internal Link Badge", regex: /<small\b[^>]*>\s*Internal\s+Links?\s*<\/small>|<(?:span|div|p)\b[^>]*class=["'][^"']*(?:badge|pill|tag|label|staging|meta|dgs-card)[^"']*["'][^>]*>\s*Internal\s+Links?\s*<\/(?:span|div|p)>|<(?:small|span|div|p)\b[^>]*>\s*Internal\s+Links?\s*<\/(?:small|span|div|p)>(?:\s*<h[1-6]\b)/i },
    { name: "Internal Link Delimited", regex: /\bInternal\s+Link\s*[:\-\]]/i },
    { name: "Editorial Instruction", regex: /\bthe\s+most\s+important\s+internal\s+link\s+for\s+this\s+blog\s+is\b/i },
    { name: "Crawler Notes Delimited", regex: /\bcrawler\s+notes?\s*[:\-\]]/i },
    { name: "CMS Notes Delimited", regex: /\bCMS\s+notes?\s*[:\-\]]/i },
    { name: "Editorial Notes Delimited", regex: /\beditorial\s+notes?\s*[:\-\]]/i },
    { name: "Debug Text Delimited", regex: /\bdebug\s+text\s*[:\-\]]/i },
    { name: "Internal SEO Instructions", regex: /\binternal\s+SEO\s+instructions?\b/i },
    // Strict single-heading bounded pattern for machine signal headings
    {
      name: "Staging Signals Heading",
      regex: /<h[1-6]\b[^>]*>(?:(?!<\/h[1-6]>).)*?\b(?:Mumbai\s+AI\s+Video\s+Studio\s+Signals|Proof\s+And\s+Case\s+Study\s+Signals|Crawlable\s+AI\s+Video\s+Case\s+Study\s+Signals)\b(?:(?!<\/h[1-6]>).)*?<\/h[1-6]>/i,
    },
    // Eyebrow staging signals
    {
      name: "Staging Eyebrow Signals",
      regex: /<p\b[^>]*class=["'][^"']*dgs-eyebrow[^"']*["'][^>]*>\s*(?:Mumbai\s+AI\s+Video\s+Studio\s+Signals|Proof\s+And\s+Case\s+Study\s+Signals)\s*<\/p>/i,
    },
  ];

  for (const p of stagingPatterns) {
    if (p.regex.test(cleanHtml)) {
      artifacts.push(p.name);
    }
  }

  return [...new Set(artifacts)];
}

async function run() {
  const reg = JSON.parse(fs.readFileSync("data/migration/nextjs-route-registry.generated.json", "utf8"));
  const indexable = reg.routes.filter((r) => r.indexable && r.status === 200).map((r) => r.path);
  console.log(`Auditing ${indexable.length} live routes with fixed detector...`);

  let hits = 0;
  for (const p of indexable) {
    try {
      const res = await fetch("https://www.dgeniussolutions.com" + p);
      const html = await res.text();
      const arts = detectPageEditorialArtifactsFixed(html, p);
      if (arts.length > 0) {
        console.log(`[LEAK DETECTED] ${p} ->`, arts);
        hits++;
      }
    } catch (e) {
      console.error(p, e.message);
    }
  }
  console.log(`\n===========================================`);
  console.log(`Total live pages with detected leaked labels: ${hits}`);
  console.log(`PUBLIC_LABEL_COUNT = ${hits}`);
  console.log(`===========================================`);
}

run();
