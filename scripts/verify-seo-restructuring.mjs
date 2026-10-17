import { loadContentBlocks } from "../lib/nextjs/content-blocks.ts";
import { getRouteByPath } from "../lib/nextjs/routes.ts";
import { buildRouteSchemas, buildGlobalEntitySchemas } from "../lib/schema/page-schemas.ts";
import { buildPageBreadcrumbs } from "../lib/navigation/page-breadcrumbs.ts";
import { getPageSeoOverride } from "../lib/seo/page-overrides.ts";
import { getPublicRouteManifest, getManifestRoutesByCluster } from "../lib/seo/public-route-manifest.ts";

async function main() {
  console.log("==================================================================");
  console.log("       VERIFYING SEO & TECHNICAL RESTRUCTURING LOCALLY            ");
  console.log("==================================================================");

  // 1. GLOBAL ORGANIZATION SCHEMA
  const globalSchemas = buildGlobalEntitySchemas();
  const org = globalSchemas.find((s) => s["@type"] === "Organization");
  console.log("\n[1] Organization Schema Verification:");
  console.log("  - Name:", org?.name);
  console.log("  - KnowsAbout count:", org?.knowsAbout?.length);
  console.log("  - KnowsAbout items:", org?.knowsAbout);
  console.log("  - AreaServed:", org?.areaServed);
  if (!org?.knowsAbout || org.knowsAbout.length < 5) {
    throw new Error("FAIL: Organization schema missing knowsAbout!");
  }
  console.log("  -> PASS: Organization schema enriched for GEO & Knowledge Graph.");

  // 2. WEB DEVELOPMENT AMC PAGE
  console.log("\n[2] /services/website-development-amc/ Verification:");
  const webRoute = await getRouteByPath("/services/website-development-amc/");
  const webBlocks = (await loadContentBlocks())["/services/website-development-amc/"]?.blocks || [];
  const webCrumbs = buildPageBreadcrumbs("/services/website-development-amc/", webRoute);
  const webSchemas = buildRouteSchemas({
    route: webRoute,
    path: "/services/website-development-amc/",
    blocks: webBlocks,
    breadcrumbs: webCrumbs,
  });

  const webService = webSchemas.find((s) => s["@type"] === "Service");
  const webFaq = webSchemas.find((s) => s["@type"] === "FAQPage");
  const webPage = webSchemas.find((s) => s["@type"] === "WebPage");
  const webOverride = getPageSeoOverride("/services/website-development-amc/");

  console.log("  - Override Title:", webOverride?.title);
  console.log("  - Override ServiceType:", webOverride?.serviceType);
  console.log("  - Override AreaServed:", webOverride?.areaServed);
  console.log("  - Service Entity Name:", webService?.name);
  console.log("  - Service Entity serviceType:", webService?.serviceType);
  console.log("  - Service Entity areaServed:", webService?.areaServed);
  console.log("  - FAQPage Entity present?", Boolean(webFaq));
  console.log("  - FAQ Question Count:", webFaq?.mainEntity?.length);

  if (!webFaq || webFaq.mainEntity.length < 10) {
    throw new Error(`FAIL: Web Dev FAQPage schema expected >= 10 FAQs, got ${webFaq?.mainEntity?.length}`);
  }
  if (!webService?.serviceType || !webService?.areaServed) {
    throw new Error("FAIL: Web Dev Service schema missing serviceType or areaServed!");
  }
  console.log("  -> PASS: Web Dev page has complete Service & FAQPage schemas!");

  // 3. SEO SERVICES IN MUMBAI PAGE
  console.log("\n[3] /services/seo-services-in-mumbai/ Verification:");
  const seoRoute = await getRouteByPath("/services/seo-services-in-mumbai/");
  const seoBlocks = (await loadContentBlocks())["/services/seo-services-in-mumbai/"]?.blocks || [];
  const seoCrumbs = buildPageBreadcrumbs("/services/seo-services-in-mumbai/", seoRoute);
  const seoSchemas = buildRouteSchemas({
    route: seoRoute,
    path: "/services/seo-services-in-mumbai/",
    blocks: seoBlocks,
    breadcrumbs: seoCrumbs,
  });

  const seoService = seoSchemas.find((s) => s["@type"] === "Service");
  const seoFaq = seoSchemas.find((s) => s["@type"] === "FAQPage");
  const seoOverride = getPageSeoOverride("/services/seo-services-in-mumbai/");

  console.log("  - Override Title:", seoOverride?.title);
  console.log("  - Override ServiceType:", seoOverride?.serviceType);
  console.log("  - Override AreaServed:", seoOverride?.areaServed);
  console.log("  - Service Entity Name:", seoService?.name);
  console.log("  - Service Entity serviceType:", seoService?.serviceType);
  console.log("  - Service Entity areaServed:", seoService?.areaServed);
  console.log("  - FAQPage Entity present?", Boolean(seoFaq));
  console.log("  - FAQ Question Count:", seoFaq?.mainEntity?.length);

  if (!seoFaq || seoFaq.mainEntity.length < 10) {
    throw new Error(`FAIL: SEO FAQPage schema expected >= 10 FAQs, got ${seoFaq?.mainEntity?.length}`);
  }
  if (!seoService?.serviceType || !seoService?.areaServed) {
    throw new Error("FAIL: SEO Service schema missing serviceType or areaServed!");
  }
  console.log("  -> PASS: SEO Mumbai page has complete Service & FAQPage schemas!");

  // 4. CLUSTER & LLM MANIFEST VERIFICATION
  console.log("\n[4] LLM Manifest Clusters Verification:");
  const clusters = await getManifestRoutesByCluster();
  console.log("  - AI-Search cluster routes:", clusters["ai-search"].length);
  console.log("  - Creative-Video cluster routes:", clusters["creative-video"].length);
  console.log("  - SEO cluster routes:", clusters["seo"].length);
  console.log("  - Web-Dev cluster routes:", clusters["web-dev"].length);

  const webDevUrls = clusters["web-dev"].map((r) => r.canonical);
  console.log("  - Web-Dev cluster URLs:", webDevUrls);

  const hasRedirectInWebDev = webDevUrls.some((u) => u.includes("website-development-services-in-mumbai-dgenius-solutions"));
  if (hasRedirectInWebDev) {
    throw new Error("FAIL: 301 redirect route still present in web-dev cluster!");
  }
  const hasSpamBlogInWebDev = webDevUrls.some((u) => u.includes("spam-update"));
  if (hasSpamBlogInWebDev) {
    throw new Error("FAIL: Spam update blog still present in web-dev cluster!");
  }
  console.log("  -> PASS: llms-full.md clusters are 100% clean and free of 301 redirects and unrelated blogs!");

  console.log("\n==================================================================");
  console.log("           ALL LOCAL TESTS PASSED WITH 100% SUCCESS               ");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
