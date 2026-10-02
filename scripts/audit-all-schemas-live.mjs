import { validatePageJsonLd } from './build-sitewide-ranking-recovery-baseline.mjs';

async function main() {
  const xml = await (await fetch('https://www.dgeniussolutions.com/sitemap.xml')).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`Auditing JSON-LD for ${urls.length} sitemap URLs...`);
  
  let validCount = 0;
  let conflictingCount = 0;
  let parseErrorCount = 0;
  let redundantCount = 0;
  let totalReferences = 0;
  
  const conflictDetails = [];
  const validUrls = [];
  const failedUrls = [];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const report = validatePageJsonLd(html, url);
      
      totalReferences += report.valid_references_count || 0;
      redundantCount += report.redundant_entities_count || 0;
      parseErrorCount += report.parse_errors_count || 0;
      
      if (report.conflicting_entities_count > 0) {
        conflictingCount++;
        failedUrls.push(url);
        conflictDetails.push({
          url,
          schemaTypes: report.schemaTypes,
          errors: report.schema_validation_errors,
        });
      } else if (!report.schema_parse_valid) {
        failedUrls.push(url);
        conflictDetails.push({
          url,
          schemaTypes: report.schemaTypes,
          errors: report.schema_validation_errors,
        });
      } else {
        validCount++;
        validUrls.push(url);
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err.message);
      failedUrls.push(url);
    }
  }

  console.log("\n================ SCHEMA AUDIT SUMMARY ================");
  console.log(`TOTAL SITEMAP URLS: ${urls.length}`);
  console.log(`VALID PAGES: ${validCount}`);
  console.log(`PAGES WITH CONFLICTS: ${conflictingCount}`);
  console.log(`PARSE ERRORS: ${parseErrorCount}`);
  console.log(`REDUNDANT WARNINGS: ${redundantCount}`);
  console.log(`VALID REFERENCES: ${totalReferences}`);
  console.log(`FAILED URL COUNT: ${failedUrls.length}`);
  console.log("====================================================\n");

  console.log(`First 5 Conflicted Pages:`);
  console.log(JSON.stringify(conflictDetails.slice(0, 5), null, 2));

  // Summary of error messages
  const errMap = new Map();
  for (const cd of conflictDetails) {
    for (const e of cd.errors) {
      errMap.set(e, (errMap.get(e) || 0) + 1);
    }
  }
  console.log("\nError Message Breakdown:");
  for (const [msg, cnt] of errMap.entries()) {
    console.log(`Count: ${cnt} | ${msg}`);
  }
}

main();
