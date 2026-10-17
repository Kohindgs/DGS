import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function main() {
  console.log("=== APPLYING SERVICE SEO IMPROVEMENTS ===");

  // 1. UPDATE MIRROR PAGE FOR WEB DEVELOPMENT
  const webMirrorPath = path.join(process.cwd(), "data/wordpress/mirrors/pages/services__website-development-amc.json");
  const webMirror = JSON.parse(fs.readFileSync(webMirrorPath, "utf8"));
  let webBody = webMirror.body;

  // Replace Hero Pill
  webBody = webBody.replace(
    '<div class="hero-pill"><span class="dot"></span> Website Development Company in Mumbai</div>',
    '<div class="hero-pill"><span class="dot"></span> Web Development Agency in Mumbai</div>'
  );

  // Replace Hero H1
  webBody = webBody.replace(
    '<h1 class="hero-h1"><span class="outline">Website Development</span> Company in Mumbai <span class="grad">Built for Leads, SEO &amp; Growth</span></h1>',
    '<h1 class="hero-h1"><span class="outline">Web Development</span> Agency in Mumbai <span class="grad">Built for Leads, SEO &amp; Growth</span></h1>'
  );

  // Replace Hero Subtitle
  webBody = webBody.replace(
    "D'Genius Solutions is a website development company in Mumbai creating responsive, conversion-focused and SEO-ready websites with WordPress, HTML, Next.js, React, PHP and SCSS. For businesses comparing website development companies in Mumbai, we bring sitemap planning, UI/UX, development, search readiness, analytics and post-launch website AMC into one coordinated workflow.",
    "D'Genius Solutions is a leading web development agency in Mumbai creating responsive, conversion-focused and SEO-ready websites with Next.js, React, WordPress, Node.js, PHP and modern full-stack frameworks. For businesses comparing the best web development agencies in Mumbai, we bring sitemap planning, custom UI/UX design, full-stack engineering, search readiness, analytics and ongoing website AMC into one coordinated workflow."
  );

  // Replace in text
  webBody = webBody.replace(
    "A top website development company in Mumbai should demonstrate relevant work",
    "A top web development agency in Mumbai should demonstrate relevant work"
  );
  webBody = webBody.replace(
    "seeking an SEO-friendly website development company in Mumbai with ongoing technical accountability",
    "seeking an SEO-friendly web development agency in Mumbai with ongoing technical accountability"
  );

  webMirror.body = webBody;
  webMirror.bodyBytes = Buffer.byteLength(webBody, "utf8");
  fs.writeFileSync(webMirrorPath, JSON.stringify(webMirror, null, 2), "utf8");
  console.log("Updated data/wordpress/mirrors/pages/services__website-development-amc.json");

  // 2. UPDATE CONTENT BLOCKS
  const blocksPath = path.join(process.cwd(), "data/wordpress/blocks/content-blocks.generated.json");
  const blocksJson = JSON.parse(fs.readFileSync(blocksPath, "utf8"));

  // Web Dev blocks
  const webBlocksRecord = blocksJson.blocks["/services/website-development-amc/"];
  if (webBlocksRecord) {
    if (webBlocksRecord.blocks[0]?.type === "paragraph") {
      webBlocksRecord.blocks[0].content = [{ text: "Web Development Agency in Mumbai" }];
    }
    if (webBlocksRecord.blocks[1]?.type === "heading") {
      webBlocksRecord.blocks[1].text = "Web Development Agency in Mumbai Built for Leads, SEO & Growth";
    }
    if (webBlocksRecord.blocks[2]?.type === "paragraph") {
      webBlocksRecord.blocks[2].content = [{
        text: "D'Genius Solutions is a leading web development agency in Mumbai creating responsive, conversion-focused and SEO-ready websites with Next.js, React, WordPress, Node.js, PHP and modern full-stack frameworks. For businesses comparing the best web development agencies in Mumbai, we bring sitemap planning, custom UI/UX design, full-stack engineering, search readiness, analytics and ongoing website AMC into one coordinated workflow."
      }];
    }
  }

  // SEO Mumbai blocks
  const seoBlocksRecord = blocksJson.blocks["/services/seo-services-in-mumbai/"];
  if (seoBlocksRecord) {
    if (seoBlocksRecord.blocks[1]?.type === "paragraph") {
      seoBlocksRecord.blocks[1].content = [{ text: "Leading SEO agency in Mumbai for rankings and revenue growth" }];
    }
    if (seoBlocksRecord.blocks[2]?.type === "heading") {
      seoBlocksRecord.blocks[2].text = "SEO Agency in Mumbai for Rankings, Traffic and Qualified Leads SEO THAT MOVES Rankings. Traffic. Leads. Revenue. In Mumbai ↗";
    }
    if (seoBlocksRecord.blocks[3]?.type === "paragraph") {
      seoBlocksRecord.blocks[3].content = [{
        text: "D'Genius Solutions is a premier SEO agency in Mumbai helping businesses achieve Page 1 Google rankings, local map pack dominance, AI search visibility and qualified enquiries through technical SEO, content optimisation, authority development and revenue-driven search strategy."
      }];
    }
  }

  fs.writeFileSync(blocksPath, JSON.stringify(blocksJson, null, 2), "utf8");
  console.log("Updated data/wordpress/blocks/content-blocks.generated.json");

  // 3. UPDATE SEMANTIC VECTOR METADATA
  const semanticMetaPath = path.join(process.cwd(), "data/semantic/dgs-content.metadata.json");
  if (fs.existsSync(semanticMetaPath)) {
    const semanticMeta = JSON.parse(fs.readFileSync(semanticMetaPath, "utf8"));
    const docs = semanticMeta.documents || {};
    for (const key of Object.keys(docs)) {
      const doc = docs[key];
      if (doc.path === "/services/website-development-amc/") {
        doc.title = "Web Development Agency in Mumbai | Custom Web Design & AMC";
        doc.description = "Leading web development agency in Mumbai building custom Next.js, WordPress and React websites with SEO-ready architecture, UI/UX design and AMC support.";
      }
      if (doc.path === "/services/seo-services-in-mumbai/") {
        doc.title = "SEO Agency in Mumbai | Leading SEO Company & Services | DGS";
        doc.description = "Premier SEO agency in Mumbai providing technical SEO, enterprise search optimization, AI Overviews readiness, local SEO and revenue-driven organic growth.";
      }
    }
    fs.writeFileSync(semanticMetaPath, JSON.stringify(semanticMeta, null, 2), "utf8");
    console.log("Updated data/semantic/dgs-content.metadata.json");
  }

  // 4. UPDATE ROUTE CONTENT HASHES
  const hashPath = path.join(process.cwd(), "data/seo/route-content-hashes.json");
  if (fs.existsSync(hashPath)) {
    const hashes = JSON.parse(fs.readFileSync(hashPath, "utf8"));
    const nowIso = new Date().toISOString();
    const today = nowIso.slice(0, 10);

    if (hashes["/services/website-development-amc/"]) {
      hashes["/services/website-development-amc/"].title = "Web Development Agency in Mumbai | Custom Web Design & AMC | DGS";
      hashes["/services/website-development-amc/"].lastModified = today;
      hashes["/services/website-development-amc/"].updatedAt = nowIso;
      hashes["/services/website-development-amc/"].contentHash = crypto.createHash("sha256").update(webBody).digest("hex").slice(0, 16);
    }

    if (hashes["/services/seo-services-in-mumbai/"]) {
      hashes["/services/seo-services-in-mumbai/"].title = "SEO Agency in Mumbai | Leading SEO Company & Services | DGS";
      hashes["/services/seo-services-in-mumbai/"].lastModified = today;
      hashes["/services/seo-services-in-mumbai/"].updatedAt = nowIso;
    }

    fs.writeFileSync(hashPath, JSON.stringify(hashes, null, 2), "utf8");
    console.log("Updated data/seo/route-content-hashes.json");
  }

  console.log("=== ALL IMPROVEMENTS APPLIED SUCCESSFULLY ===");
}

main();
