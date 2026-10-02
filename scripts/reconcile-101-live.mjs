import fs from "node:fs";

async function main() {
  const v886 = JSON.parse(fs.readFileSync("data/audit/v8.8.6-before-production-baseline.json", "utf8"));
  const base = JSON.parse(fs.readFileSync("data/audit/sitewide-ranking-recovery-baseline.json", "utf8"));

  const set89 = new Set(base.inventory.map(i => i.url.replace(/\/$/, "").toLowerCase()));

  // Fetch live sitemap to check inSitemap
  const sitemapRes = await fetch("https://www.dgeniussolutions.com/sitemap.xml");
  const sitemapXml = await sitemapRes.text();
  
  console.log(`Auditing exact disposition of all ${v886.pages.length} URLs...`);

  const results = [];
  for (let i = 0; i < v886.pages.length; i++) {
    const p = v886.pages[i];
    const url = p.url;
    const cleanUrl = url.replace(/\/$/, "").toLowerCase();
    const in89 = set89.has(cleanUrl);

    try {
      const res = await fetch(url, { redirect: "manual" });
      const status = res.status;
      let canonical = "";
      let robots = "";
      let location = res.headers.get("location") || "";

      if (status === 200) {
        const html = await res.text();
        const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
        canonical = canonMatch ? canonMatch[1] : "";
        const robotsMatch = html.match(/<meta\s+name=["'](?:robots|googlebot)["']\s+content=["']([^"']+)["']/i);
        robots = robotsMatch ? robotsMatch[1] : "index, follow";
      } else if (status === 301 || status === 302) {
        canonical = location;
        robots = "none";
      }

      const inSitemap = sitemapXml.includes(url.replace(/\/$/, "")) || sitemapXml.includes(url);
      const isIndexable = (status === 200) && (!robots.includes("noindex"));
      const isAuthoritative = isIndexable && (canonical.replace(/\/$/, "") === url.replace(/\/$/, ""));

      let exclusionReason = "";
      if (!in89) {
        if (status === 301) exclusionReason = "301_REDIRECT";
        else if (status === 302) exclusionReason = "302_REDIRECT";
        else if (status === 404) exclusionReason = "404";
        else if (status === 410) exclusionReason = "410";
        else if (robots.includes("noindex")) exclusionReason = "NOINDEX";
        else if (url.includes("?") || (canonical && canonical.replace(/\/$/, "") !== url.replace(/\/$/, ""))) exclusionReason = "CANONICALIZED_PARAMETER";
        else if (url.includes("qa") || url.includes("test")) exclusionReason = "QA_TEST_PAGE";
        else if (!isAuthoritative) exclusionReason = "DUPLICATE_NONAUTHORITATIVE";
        else exclusionReason = "OTHER_WITH_EVIDENCE";
      }

      results.push({
        url,
        httpStatus: status,
        canonical: canonical || url,
        robots: robots || "index, follow",
        inSitemap,
        indexable: isIndexable,
        authoritative: isAuthoritative,
        includedIn89: in89,
        exclusionReason: in89 ? "NONE (INCLUDED)" : exclusionReason
      });
    } catch (e) {
      results.push({
        url,
        httpStatus: "ERROR",
        canonical: "",
        robots: "",
        inSitemap: false,
        indexable: false,
        authoritative: false,
        includedIn89: in89,
        exclusionReason: "OTHER_WITH_EVIDENCE"
      });
    }
  }

  const includedCount = results.filter(r => r.includedIn89).length;
  const excludedCount = results.filter(r => !r.includedIn89).length;

  console.log(`TOTAL URLS = ${results.length}`);
  console.log(`INCLUDED = ${includedCount}`);
  console.log(`EXCLUDED = ${excludedCount}`);

  fs.writeFileSync("data/audit/v8.9.1-101-reconciliation.json", JSON.stringify(results, null, 2));
}

main().catch(console.error);
