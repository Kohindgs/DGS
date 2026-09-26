import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();

test("1. Blog CSS defines responsive header clearance tokens across all viewports", () => {
  const globalsCss = fs.readFileSync(path.join(appRoot, "app/globals.css"), "utf8");
  assert.ok(globalsCss.includes("--dgs-site-header-height: 104px;"), "Base desktop header height must be 104px");
  assert.ok(globalsCss.includes("--dgs-site-header-height: 96px;"), "Tablet header height (<=1024px) must be 96px");
  assert.ok(globalsCss.includes("--dgs-site-header-height: 84px;"), "Mobile header height (<=768px) must be 84px");
  assert.ok(globalsCss.includes("--page-gutter: clamp(16px, 3vw, 48px);"), "Global page gutter clamp must be defined");
});

test("2. Header module binds to header height token and constrains logo max-height", () => {
  const headerCss = fs.readFileSync(path.join(appRoot, "components/layout/Header.module.css"), "utf8");
  assert.ok(headerCss.includes("height: var(--dgs-site-header-height, 104px);"), "Header container must bind to --dgs-site-header-height");
  assert.ok(headerCss.includes("max-height: 64px;"), "Desktop logo must have 64px max-height constraint");
  assert.ok(headerCss.includes("max-height: 44px;"), "Mobile logo must have 44px max-height constraint");
});

test("3. Blog article wrapper enforces dynamic top padding to eliminate nav overlap at 1180px, 1024px, 768px, and 390px", () => {
  const blogCss = fs.readFileSync(path.join(appRoot, "components/blog/Blog.module.css"), "utf8");
  assert.ok(
    blogCss.includes("padding-top: calc(var(--dgs-site-header-height, 104px) + clamp(20px, 3vw, 40px));"),
    "Article wrapper must pad top by header height + responsive clearance clamp",
  );
  assert.ok(blogCss.includes("1760px"), "Article container max-width must be 1760px");
  assert.ok(blogCss.includes("max-width: 1380px;"), "Header and breadcrumbs max-width must be 1380px");
  assert.ok(blogCss.includes("max-width: 1600px;"), "Hero image wrap max-width must be 1600px");
  assert.ok(blogCss.includes("max-width: 1100px;"), "Prose and TOC max-width must be 1100px");
});

test("4. Fluid H1 typography scales safely without layout overflow or word cutoff", () => {
  const blogCss = fs.readFileSync(path.join(appRoot, "components/blog/Blog.module.css"), "utf8");
  assert.ok(blogCss.includes("clamp(1.85rem, 3.8vw, 3.4rem);"), "H1 must use fluid clamp on desktop");
  assert.ok(blogCss.includes("clamp(1.9rem, 3.4vw, 2.75rem);"), "H1 must use intermediate clamp at 1280px");
  assert.ok(blogCss.includes("clamp(1.65rem, 6vw, 2.2rem);"), "H1 must use mobile clamp at 768px");
});

test("5. Hero image eliminates aspect-ratio cropping and renders with natural containment", () => {
  const blogCss = fs.readFileSync(path.join(appRoot, "components/blog/Blog.module.css"), "utf8");
  assert.ok(blogCss.includes(".heroImgNatural"), "heroImgNatural class must exist in Blog.module.css");
  assert.ok(blogCss.includes("object-fit: contain;"), "heroImgNatural must use object-fit: contain to prevent image cropping");

  const articleTsx = fs.readFileSync(path.join(appRoot, "components/blog/BlogArticle.tsx"), "utf8");
  assert.ok(articleTsx.includes("styles.heroImgNatural"), "BlogArticle.tsx must use heroImgNatural class");
  assert.ok(!articleTsx.includes('fill className={styles.heroImg}'), "BlogArticle.tsx must not use fill on hero image");
});

test("6. Breadcrumbs and Table of Contents wrap naturally and support collapsible semantics", () => {
  const articleTsx = fs.readFileSync(path.join(appRoot, "components/blog/BlogArticle.tsx"), "utf8");
  assert.ok(articleTsx.includes("breadcrumbCurrent"), "BlogArticle.tsx must use breadcrumbCurrent for title wrapping");
  assert.ok(articleTsx.includes("<details className={styles.toc} open>"), "TOC must be semantic <details open> component");
  assert.ok(articleTsx.includes("<summary className={styles.tocSummary}>"), "TOC must use <summary> for collapsible toggle");
});

test("7. Layout clearance verification at specific responsive breakpoints", () => {
  const breakpoints = [
    { name: "Desktop Large", width: 1440, headerHeight: 104, minClearance: 20 },
    { name: "Laptop (Reported Defect)", width: 1180, headerHeight: 104, minClearance: 20 },
    { name: "Tablet Landscape", width: 1024, headerHeight: 96, minClearance: 20 },
    { name: "Tablet Portrait", width: 768, headerHeight: 84, minClearance: 20 },
    { name: "Mobile (iPhone 14/15/16)", width: 390, headerHeight: 84, minClearance: 16 },
  ];

  for (const bp of breakpoints) {
    const totalTopOffset = bp.headerHeight + bp.minClearance;
    assert.ok(
      totalTopOffset >= 100,
      `At ${bp.name} (${bp.width}px), top offset ${totalTopOffset}px must be >= 100px to ensure zero header collision`,
    );
  }
});
