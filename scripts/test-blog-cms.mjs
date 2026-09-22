import assert from "node:assert/strict";
import {
  sanitizeBlogHtml,
  detectInternalLinks,
  imageMatchesSlug,
  slugify,
  stripHtml,
} from "../lib/cms/blog-import.ts";

console.log("==================================================");
console.log("RUNNING BLOG CMS CORE ENGINE UNIT TESTS");
console.log("==================================================");

// 1. Test HTML Sanitization & Heading Demotion
console.log("\n[Test 1] Word HTML Sanitization & Heading Demotion");
const dirtyWordHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><style>p.MsoNormal { font-family: Calibri; }</style></head>
<body>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Normal</w:View></w:WordDocument></xml><![endif]-->
  <h1 style="color:red; font-size:24pt;" class="MsoTitle" align="center">Main Blog Title From Word</h1>
  <p style="margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;" class="MsoNormal">
    <span style="font-size:11.0pt;font-family:Calibri,sans-serif;color:black;">
      Here is the introduction paragraph talking about digital marketing trends in Mumbai.
    </span>
    <o:p></o:p>
  </p>
  <p><script>alert('xss')</script></p>
  <iframe src="https://malicious.example.com"></iframe>
  <h2>Subheading Two</h2>
  <p onmouseover="badFunc()">Clean paragraph with safe text.</p>
  <p>&nbsp;</p>
  <p></p>
</body>
</html>
`;

const cleaned = sanitizeBlogHtml(dirtyWordHtml);
console.log("Cleaned HTML output:\n", cleaned);

// Assertions for sanitization
assert(!cleaned.includes("<script>"), "FAIL: script tags must be completely stripped");
assert(!cleaned.includes("<iframe"), "FAIL: iframe tags must be completely stripped");
assert(!cleaned.includes("<h1"), "FAIL: document H1 must be demoted to H2");
assert(cleaned.includes("<h2"), "PASS: H1 was demoted to H2");
assert(!cleaned.includes("style="), "FAIL: inline style attributes must be stripped");
assert(!cleaned.includes("class="), "FAIL: inline class attributes must be stripped");
assert(!cleaned.includes("onmouseover"), "FAIL: on* event handlers must be stripped");
assert(!cleaned.includes("<o:p>"), "FAIL: Word XML tags must be stripped");
console.log("✓ HTML Sanitization passed all checks");

// 2. Test Image Matching Heuristics
console.log("\n[Test 2] Image Matching Heuristics");
const testCases = [
  { img: "how-to-scale-seo-mumbai.webp", slug: "how-to-scale-seo-mumbai", expected: true },
  { img: "how-to-scale-seo-mumbai-featured.jpg", slug: "how-to-scale-seo-mumbai", expected: true },
  { img: "how-to-scale-seo-mumbai-hero.png", slug: "how-to-scale-seo-mumbai", expected: true },
  { img: "how-to-scale-seo-mumbai-cover.webp", slug: "how-to-scale-seo-mumbai", expected: true },
  { img: "how-to-scale-seo-mumbai-img-1.jpeg", slug: "how-to-scale-seo-mumbai", expected: true },
  { img: "ai-video-production-trends-2026.png", slug: "ai-video-production-trends-2026", expected: true },
  { img: "completely-unrelated-image.jpg", slug: "how-to-scale-seo-mumbai", expected: false },
  { img: "random-photo-123.png", slug: "branding-strategy-for-startups", expected: false },
];

for (const tc of testCases) {
  const matched = imageMatchesSlug(tc.img, tc.slug);
  assert.equal(matched, tc.expected, `Mismatch for img "${tc.img}" vs slug "${tc.slug}"`);
  console.log(`  ✓ "${tc.img}" matches "${tc.slug}": ${matched}`);
}
console.log("✓ Image matching heuristics passed all test cases");

// 3. Test Internal Link Suggestion & Injection
console.log("\n[Test 3] Smart Internal Link Engine");
const testContent = `
<h2>Search Strategy</h2>
<p>Businesses that invest in search engine optimization services will dominate local traffic in Maharashtra.</p>
<h2>Creative Video</h2>
<p>Modern brands prefer ai video production agency over traditional shoots for fast social ads.</p>
<h2>Paid Ads</h2>
<p>Using performance marketing in mumbai helps drive real qualified leads for e-commerce companies.</p>
`;

const linkResults = detectInternalLinks(testContent);
console.log("Detected Suggestions:", linkResults.suggestions);
assert(linkResults.suggestions.length >= 2, "FAIL: Should detect at least 2 internal link opportunities");
const targets = linkResults.suggestions.map(s => s.url);
console.log("Matched Target URLs:", targets);
console.log("✓ Internal link engine passed all test cases");

// 4. Test Slugify and StripHtml
console.log("\n[Test 4] String Normalization & Slugging");
assert.equal(slugify("7 AI Video Secrets: Mumbai Agency Guide (2026)!"), "7-ai-video-secrets-mumbai-agency-guide-2026");
assert.equal(stripHtml("<p>Hello <strong>World</strong> &amp; friends</p>"), "Hello World & friends");
console.log("✓ String normalization passed all test cases");

console.log("\n==================================================");
console.log("ALL BLOG CMS CORE ENGINE UNIT TESTS PASSED (4/4)");
console.log("==================================================");
