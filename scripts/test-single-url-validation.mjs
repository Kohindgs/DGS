import { analyzePage } from "../lib/off-page/lanes/page-analyzer.js";
import { getLane } from "../lib/off-page/lanes/config.js";
import { validateForLane } from "../lib/off-page/lanes/validator.js";

async function main() {
  const url = "https://www.seo.com/basics/";
  console.log(`Analyzing: ${url}`);
  const analysis = await analyzePage(url, 15000);
  console.log("Analysis Title:", analysis.title);
  console.log("Analysis HTTP:", analysis.httpStatus);

  const lane = getLane("AGENCY_DIRECTORIES");
  const verdict = await validateForLane(analysis, lane, { queryRegion: "INDIA" });
  console.log("\nVerdict:");
  console.log(JSON.stringify(verdict, null, 2));
}

main().catch(console.error);
